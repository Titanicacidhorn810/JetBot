import type { LLMClient, CompletionRequest, CompletionResponse } from '../types/llm';
import { LLMError } from '../types/llm';
import { resolveProxyUrl } from '../lib/cors';
import { logger } from '../lib/logger';

const log = logger.module('llm');

export interface ClientConfig {
  baseUrl: string;
  apiKey: string;
  modelId: string;
  timeout?: number;
  proxyUrl?: string;
}

export class OpenAICompatibleClient implements LLMClient {
  private config: Required<ClientConfig>;

  constructor(config: ClientConfig) {
    this.config = {
      ...config,
      timeout: config.timeout ?? 60000,
      proxyUrl: config.proxyUrl ?? '',
    };
  }

  model(): string {
    return this.config.modelId;
  }

  async complete(req: CompletionRequest, onStream?: (chunk: string) => void): Promise<CompletionResponse> {
    const url = resolveProxyUrl(`${this.config.baseUrl}/chat/completions`, this.config.proxyUrl);
    const body: Record<string, unknown> = {
      model: this.config.modelId,
      messages: req.messages,
      stream: !!onStream,
    };
    if (req.tools && req.tools.length > 0) {
      body.tools = req.tools;
      body.tool_choice = req.tool_choice ?? 'auto';
    }

    log.debug('request', { model: this.config.modelId, messages: req.messages.length, tools: req.tools?.length ?? 0, stream: !!onStream });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    let response: Response;
    let retries = 0;
    const maxRetries = 2;

    while (true) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (this.config.apiKey) {
          headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }
        response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        break;
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          throw new LLMError('Request timed out', 'TIMEOUT', true);
        }
        if (retries < maxRetries) {
          retries++;
          log.warn('retrying request', { attempt: retries, error: err.message });
          await this.delay(retries * 1000);
          continue;
        }
        throw new LLMError(`Network error: ${err.message}`, 'NETWORK', true);
      }
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      log.error('http error', { status: response.status, body: errorBody.slice(0, 200) });
      if (response.status === 401 || response.status === 403) {
        throw new LLMError(`Authentication failed: ${errorBody}`, 'AUTH');
      }
      if (response.status === 429) {
        throw new LLMError(`Rate limited: ${errorBody}`, 'RATE_LIMIT', true);
      }
      if (response.status >= 500) {
        throw new LLMError(`Server error ${response.status}: ${errorBody}`, 'SERVER', true);
      }
      throw new LLMError(`HTTP ${response.status}: ${errorBody}`, 'SERVER');
    }

    if (onStream && body.stream) {
      return this.handleStream(response, onStream, controller.signal);
    }

    const json = await response.json();
    return this.parseResponse(json);
  }

  private parseResponse(json: any): CompletionResponse {
    const choice = json.choices?.[0];
    if (!choice) {
      throw new LLMError('No choices in response', 'SERVER');
    }
    const msg = choice.message;
    return {
      content: msg?.content ?? '',
      toolCalls: (msg?.tool_calls ?? []).map((tc: any) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: tc.function.arguments,
      })),
      usage: json.usage ? {
        prompt_tokens: json.usage.prompt_tokens,
        completion_tokens: json.usage.completion_tokens,
      } : undefined,
      finishReason: choice.finish_reason ?? null,
    };
  }

  private async handleStream(response: Response, onStream: (chunk: string) => void, _signal?: AbortSignal): Promise<CompletionResponse> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const contentChunks: string[] = []; // Array-based to avoid O(n²) string concat
    const toolCallMap = new Map<number, { id: string; name: string; argChunks: string[] }>();
    let finishReason: string | null = null;
    let usage: { prompt_tokens: number; completion_tokens: number } | undefined;

    // Racing idle timeout: if reader.read() blocks longer than this, we abort.
    // Unlike the old synchronous check, this uses Promise.race so it actually
    // interrupts a blocking read.
    const STREAM_IDLE_TIMEOUT = 30_000;

    const readWithTimeout = (): Promise<ReadableStreamReadResult<Uint8Array>> => {
      return Promise.race([
        reader.read(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('stream_idle_timeout')), STREAM_IDLE_TIMEOUT);
        }),
      ]);
    };

    try {
      while (true) {
        let readResult: ReadableStreamReadResult<Uint8Array>;
        try {
          readResult = await readWithTimeout();
        } catch (err: any) {
          if (err.message === 'stream_idle_timeout') {
            log.warn('stream idle timeout — aborting read', { chunks: contentChunks.length });
          } else {
            log.warn('stream read interrupted', { error: err.message, chunks: contentChunks.length });
          }
          reader.cancel().catch(() => {});
          break;
        }

        const { done, value } = readResult;
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        let streamDone = false;
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed === 'data: [DONE]') {
            streamDone = true;
            break;
          }
          if (!trimmed.startsWith('data: ')) continue;

          let parsed: any;
          try {
            parsed = JSON.parse(trimmed.slice(6));
          } catch {
            continue;
          }

          const delta = parsed.choices?.[0]?.delta;

          // Content delta
          if (delta?.content) {
            contentChunks.push(delta.content);
            onStream(delta.content);
          }

          // Tool call deltas
          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index ?? 0;
              if (!toolCallMap.has(idx)) {
                toolCallMap.set(idx, { id: tc.id ?? '', name: tc.function?.name ?? '', argChunks: [] });
              }
              const entry = toolCallMap.get(idx)!;
              if (tc.id) entry.id = tc.id;
              if (tc.function?.name) entry.name = tc.function.name;
              if (tc.function?.arguments) entry.argChunks.push(tc.function.arguments);
            }
          }

          if (parsed.choices?.[0]?.finish_reason) {
            finishReason = parsed.choices[0].finish_reason;
          }
          if (parsed.usage) {
            usage = { prompt_tokens: parsed.usage.prompt_tokens, completion_tokens: parsed.usage.completion_tokens };
          }

          // Ollama and some providers don't send "data: [DONE]" — they just
          // set finish_reason on the last chunk. Treat that as stream end.
          if (finishReason) {
            streamDone = true;
            break;
          }
        }
        if (streamDone) break;
      }
    } finally {
      // Ensure reader is always released, even on unexpected errors
      reader.cancel().catch(() => {});
    }

    const content = contentChunks.join(''); // Single join at end — O(n) total
    log.debug('stream complete', { contentLength: content.length, toolCalls: toolCallMap.size, finishReason });

    return {
      content,
      toolCalls: [...toolCallMap.values()].map(tc => ({ id: tc.id, name: tc.name, arguments: tc.argChunks.join('') })),
      usage,
      finishReason,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
