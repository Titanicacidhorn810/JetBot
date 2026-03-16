import { create } from 'zustand';
import { Agent } from '../agent/Agent';
import { OpenAICompatibleClient } from '../llm/OpenAICompatibleClient';
import { useConfigStore } from './configStore';
import { useChatStore } from './chatStore';
import type { AgentEvent } from '../types/message';

interface AgentState {
  agent: Agent | null;
  initAgent: () => void;
  destroyAgent: () => void;
  sendMessage: (text: string) => Promise<void>;
  abort: () => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agent: null,

  initAgent: () => {
    const config = useConfigStore.getState();

    const llm = new OpenAICompatibleClient({
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      modelId: config.model,
      proxyUrl: config.proxyUrl,
    });

    let currentMsgId = '';

    const agent = new Agent({
      llm,
      permissionConfirmFn: (toolName, params) => {
        return new Promise<boolean>((resolve) => {
          useChatStore.getState().setStatus('waiting_permission');
          useChatStore.getState().setPendingPermission({ toolName, params, resolve });
        });
      },
      onEvent: (event: AgentEvent) => {
        const store = useChatStore.getState();
        switch (event.type) {
          case 'llm:request':
            currentMsgId = store.addAssistantMessage();
            store.setStatus('thinking');
            store.setIteration(event.data.iteration as number);
            break;
          case 'llm:chunk':
            store.appendToAssistant(currentMsgId, event.data.chunk as string);
            break;
          case 'llm:response': {
            store.finalizeAssistant(currentMsgId);
            const toolCalls = event.data.toolCalls as Array<{ id: string; name: string; arguments: string }>;
            if (toolCalls?.length) {
              for (const tc of toolCalls) {
                let params: Record<string, unknown> = {};
                try { params = JSON.parse(tc.arguments); } catch {}
                store.addToolCall(currentMsgId, { id: tc.id, name: tc.name, params });
              }
            }
            break;
          }
          case 'tool:start':
            store.setStatus('executing_tool');
            break;
          case 'tool:result':
            store.updateToolCall(event.data.id as string, {
              status: event.data.isError ? 'error' : 'done',
              result: event.data.result as string,
              isError: event.data.isError as boolean,
              collapsed: !(event.data.isError as boolean),
            });
            break;
          case 'tool:error':
            store.updateToolCall(event.data.id as string, {
              status: 'error',
              result: event.data.error as string,
              isError: true,
            });
            break;
          case 'error':
            store.addError(event.data.message as string);
            break;
          case 'circuit_breaker':
            store.addError(`Circuit breaker triggered after ${event.data.failures} consecutive failures.`);
            break;
          case 'loop:end':
            store.setStatus('idle');
            break;
        }
      },
    });

    set({ agent });
  },

  destroyAgent: () => {
    const { agent } = get();
    agent?.abort();
    set({ agent: null });
  },

  sendMessage: async (text) => {
    const { agent } = get();
    if (!agent) return;

    const chat = useChatStore.getState();
    chat.addUserMessage(text);
    chat.setStatus('thinking');

    try {
      const result = await agent.handle(text);
      // If it was a command (no stats), add the response as assistant message
      if (!result.stats && result.response) {
        const id = chat.addAssistantMessage();
        chat.appendToAssistant(id, result.response);
        chat.finalizeAssistant(id);
      }
    } catch (err: any) {
      chat.addError(err.message);
    } finally {
      useChatStore.getState().setStatus('idle');
    }
  },

  abort: () => {
    get().agent?.abort();
    useChatStore.getState().setStatus('idle');
  },
}));
