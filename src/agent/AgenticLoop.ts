import type { LLMClient, CompletionRequest, CompletionResponse } from '../types/llm';
import type { AgentEvent, AgentEventType } from '../types/message';
import type { ContextManager } from './ContextManager';
import type { ToolRegistry } from '../tools/ToolRegistry';
import type { PermissionManager } from '../tools/Permission';

export interface LoopStats {
  iterations: number;
  toolCalls: number;
  totalTokens: number;
  duration: number;
}

type EventCallback = (event: AgentEvent) => void;

export class AgenticLoop {
  private abortController: AbortController | null = null;
  private maxIterations = 100;
  private maxConsecutiveFailures = 3;

  async run(
    llm: LLMClient,
    tools: ToolRegistry,
    context: ContextManager,
    systemPrompt: string,
    onEvent: EventCallback,
    permissionChecker?: PermissionManager,
    onStream?: (chunk: string) => void,
  ): Promise<{ finalResponse: string; stats: LoopStats }> {
    this.abortController = new AbortController();
    const startTime = Date.now();
    let iterations = 0;
    let totalToolCalls = 0;
    let totalTokens = 0;
    let consecutiveFailures = 0;

    this.emit(onEvent, 'loop:start', {});

    while (iterations < this.maxIterations) {
      if (this.abortController.signal.aborted) {
        return this.result('Aborted.', iterations, totalToolCalls, totalTokens, startTime);
      }

      iterations++;
      this.emit(onEvent, 'loop:iteration', { iteration: iterations });
      this.emit(onEvent, 'llm:request', { iteration: iterations });

      let response: CompletionResponse;
      try {
        const req: CompletionRequest = {
          model: llm.model(),
          messages: context.toMessages(systemPrompt),
          tools: tools.schemas(),
          tool_choice: 'auto',
          stream: !!onStream,
        };
        response = await llm.complete(req, onStream);
      } catch (err: any) {
        this.emit(onEvent, 'error', { message: err.message, code: err.code });
        consecutiveFailures++;
        if (consecutiveFailures >= this.maxConsecutiveFailures) {
          this.emit(onEvent, 'circuit_breaker', { failures: consecutiveFailures });
          return this.result(`Circuit breaker: ${consecutiveFailures} consecutive failures. Last error: ${err.message}`, iterations, totalToolCalls, totalTokens, startTime);
        }
        // Add error as assistant message so LLM knows what happened
        context.addAssistantMessage(`Error calling LLM: ${err.message}`);
        continue;
      }

      if (response.usage) {
        totalTokens += (response.usage.prompt_tokens + response.usage.completion_tokens);
      }

      this.emit(onEvent, 'llm:response', {
        content: response.content,
        toolCalls: response.toolCalls,
        finishReason: response.finishReason,
      });

      context.addAssistantMessage(response.content, response.toolCalls.length > 0 ? response.toolCalls : undefined);

      // No tool calls → final response
      if (response.toolCalls.length === 0) {
        this.emit(onEvent, 'loop:end', { reason: 'complete' });
        return this.result(response.content, iterations, totalToolCalls, totalTokens, startTime);
      }

      // Execute tool calls
      for (const tc of response.toolCalls) {
        if (this.abortController.signal.aborted) break;

        totalToolCalls++;
        let params: Record<string, unknown>;
        try {
          params = JSON.parse(tc.arguments);
        } catch {
          params = {};
        }

        this.emit(onEvent, 'tool:start', { id: tc.id, name: tc.name, params });

        // Permission check
        if (permissionChecker) {
          this.emit(onEvent, 'permission:request', { name: tc.name, params });
          const allowed = await permissionChecker.check(tc.name, params);
          if (!allowed) {
            context.addToolResult(tc.id, 'Permission denied by user.', true);
            this.emit(onEvent, 'tool:result', { id: tc.id, name: tc.name, result: 'Permission denied', isError: true });
            consecutiveFailures++;
            continue;
          }
        }

        try {
          let result = await tools.execute(tc.name, params);
          if (result.length > 3072) {
            result = result.slice(0, 3072) + '\n... [truncated]';
          }
          context.addToolResult(tc.id, result);
          this.emit(onEvent, 'tool:result', { id: tc.id, name: tc.name, result, isError: false });
          consecutiveFailures = 0;
        } catch (err: any) {
          const errMsg = `Error: ${err.message}`;
          context.addToolResult(tc.id, errMsg, true);
          this.emit(onEvent, 'tool:error', { id: tc.id, name: tc.name, error: err.message });
          consecutiveFailures++;
          if (consecutiveFailures >= this.maxConsecutiveFailures) {
            this.emit(onEvent, 'circuit_breaker', { failures: consecutiveFailures });
            this.emit(onEvent, 'loop:end', { reason: 'circuit_breaker' });
            return this.result(`Circuit breaker triggered after ${consecutiveFailures} consecutive failures.`, iterations, totalToolCalls, totalTokens, startTime);
          }
        }
      }
    }

    this.emit(onEvent, 'loop:end', { reason: 'max_iterations' });
    return this.result('Reached maximum iterations.', iterations, totalToolCalls, totalTokens, startTime);
  }

  abort(): void {
    this.abortController?.abort();
  }

  private emit(cb: EventCallback, type: AgentEventType, data: Record<string, unknown>): void {
    cb({ type, data, timestamp: Date.now() });
  }

  private result(finalResponse: string, iterations: number, toolCalls: number, totalTokens: number, startTime: number): { finalResponse: string; stats: LoopStats } {
    return {
      finalResponse,
      stats: { iterations, toolCalls, totalTokens, duration: Date.now() - startTime },
    };
  }
}
