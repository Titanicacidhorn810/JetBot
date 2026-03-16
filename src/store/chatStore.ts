import { create } from 'zustand';

export interface UIToolCallBlock {
  id: string;
  name: string;
  params: Record<string, unknown>;
  status: 'running' | 'done' | 'error';
  result?: string;
  isError?: boolean;
  collapsed: boolean;
}

export interface UIMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  toolCalls: UIToolCallBlock[];
  isStreaming: boolean;
  timestamp: number;
}

export type AgentStatus = 'idle' | 'thinking' | 'executing_tool' | 'waiting_permission' | 'error';

interface PendingPermission {
  toolName: string;
  params: Record<string, unknown>;
  resolve: (allowed: boolean) => void;
}

interface ChatState {
  messages: UIMessage[];
  status: AgentStatus;
  pendingPermission: PendingPermission | null;
  currentIteration: number;

  addUserMessage: (text: string) => void;
  addAssistantMessage: () => string;
  appendToAssistant: (id: string, chunk: string) => void;
  finalizeAssistant: (id: string) => void;
  addToolCall: (msgId: string, tc: { id: string; name: string; params: Record<string, unknown> }) => void;
  updateToolCall: (tcId: string, update: Partial<UIToolCallBlock>) => void;
  addError: (message: string) => void;
  setStatus: (status: AgentStatus) => void;
  setPendingPermission: (pp: PendingPermission | null) => void;
  setIteration: (n: number) => void;
  clearMessages: () => void;
}

let msgCounter = 0;

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  status: 'idle',
  pendingPermission: null,
  currentIteration: 0,

  addUserMessage: (text) => set(s => ({
    messages: [...s.messages, {
      id: `msg-${++msgCounter}`,
      role: 'user',
      content: text,
      toolCalls: [],
      isStreaming: false,
      timestamp: Date.now(),
    }],
  })),

  addAssistantMessage: () => {
    const id = `msg-${++msgCounter}`;
    set(s => ({
      messages: [...s.messages, {
        id,
        role: 'assistant',
        content: '',
        toolCalls: [],
        isStreaming: true,
        timestamp: Date.now(),
      }],
    }));
    return id;
  },

  appendToAssistant: (id, chunk) => set(s => ({
    messages: s.messages.map(m => m.id === id ? { ...m, content: m.content + chunk } : m),
  })),

  finalizeAssistant: (id) => set(s => ({
    messages: s.messages.map(m => m.id === id ? { ...m, isStreaming: false } : m),
  })),

  addToolCall: (msgId, tc) => set(s => ({
    messages: s.messages.map(m => m.id === msgId ? {
      ...m,
      toolCalls: [...m.toolCalls, { ...tc, status: 'running', collapsed: false }],
    } : m),
  })),

  updateToolCall: (tcId, update) => set(s => ({
    messages: s.messages.map(m => ({
      ...m,
      toolCalls: m.toolCalls.map(tc => tc.id === tcId ? { ...tc, ...update } : tc),
    })),
  })),

  addError: (message) => set(s => ({
    messages: [...s.messages, {
      id: `msg-${++msgCounter}`,
      role: 'error',
      content: message,
      toolCalls: [],
      isStreaming: false,
      timestamp: Date.now(),
    }],
  })),

  setStatus: (status) => set({ status }),
  setPendingPermission: (pendingPermission) => set({ pendingPermission }),
  setIteration: (currentIteration) => set({ currentIteration }),
  clearMessages: () => set({ messages: [], currentIteration: 0 }),
}));
