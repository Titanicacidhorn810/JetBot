import type { ToolDefinition } from './llm';

export type PermissionLevel = 'safe' | 'risky' | 'dangerous';

export interface Tool {
  definition: ToolDefinition;
  permission: PermissionLevel;
  execute: (params: Record<string, unknown>) => Promise<string>;
}
