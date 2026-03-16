import type { Tool, PermissionLevel } from '../types/tool';
import type { ToolDefinition } from '../types/llm';
import { VirtualFS } from './VirtualFS';
import { registerBuiltins } from './builtins';

export class ToolRegistry {
  private tools = new Map<string, Tool>();
  readonly fs: VirtualFS;

  constructor() {
    this.fs = new VirtualFS();
    registerBuiltins(this);
  }

  register(tool: Tool): void {
    this.tools.set(tool.definition.function.name, tool);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  schemas(): ToolDefinition[] {
    return [...this.tools.values()].map(t => t.definition);
  }

  async execute(name: string, params: Record<string, unknown>): Promise<string> {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Unknown tool: ${name}`);
    return tool.execute(params);
  }

  getPermissionLevel(name: string): PermissionLevel {
    return this.tools.get(name)?.permission ?? 'dangerous';
  }

  list(): Array<{ name: string; description: string; permission: PermissionLevel }> {
    return [...this.tools.values()].map(t => ({
      name: t.definition.function.name,
      description: t.definition.function.description,
      permission: t.permission,
    }));
  }
}
