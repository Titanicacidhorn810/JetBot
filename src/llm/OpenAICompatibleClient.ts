import type { LLMClient, CompletionRequest, CompletionResponse } from '../types/llm';
import { LLMError } from '../types/llm';
import { resolveProxyUrl } from '../lib/cors';

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    let response: Response;
    let retries = 0;
    const maxRetries = 2;

    while (true) {
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
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
          await this.delay(retries * 1000);
          continue;
        }
        throw new LLMError(`Network error: ${err.message}`, 'NETWORK', true);
      }
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
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
      return this.handleStream(response, onStream);
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

  private async handleStream(response: Response, onStream: (chunk: string) => void): Promise<CompletionResponse> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let content = '';
    const toolCallMap = new Map<number, { id: string; name: string; arguments: string }>();
    let finishReason: string | null = null;
    let usage: { prompt_tokens: number; completion_tokens: number } | undefined;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        let parsed: any;
        try {
          parsed = JSON.parse(trimmed.slice(6));
        } catch {
          continue;
        }

        const delta = parsed.choices?.[0]?.delta;
        if (!delta) continue;

        // Content delta
        if (delta.content) {
          content += delta.content;
          onStream(delta.content);
        }

        // Tool call deltas
        if (delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            const idx = tc.index ?? 0;
            if (!toolCallMap.has(idx)) {
              toolCallMap.set(idx, { id: tc.id ?? '', name: tc.function?.name ?? '', arguments: '' });
            }
            const entry = toolCallMap.get(idx)!;
            if (tc.id) entry.id = tc.id;
            if (tc.function?.name) entry.name = tc.function.name;
            if (tc.function?.arguments) entry.arguments += tc.function.arguments;
          }
        }

        if (parsed.choices?.[0]?.finish_reason) {
          finishReason = parsed.choices[0].finish_reason;
        }
        if (parsed.usage) {
          usage = { prompt_tokens: parsed.usage.prompt_tokens, completion_tokens: parsed.usage.completion_tokens };
        }
      }
    }

    return {
      content,
      toolCalls: [...toolCallMap.values()],
      usage,
      finishReason,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
