import type { PermissionLevel } from '../types/tool';
import type { PermissionResponse } from '../store/chatStore';

export class PermissionManager {
  private levels = new Map<string, PermissionLevel>();
  private sessionApproved = new Set<string>();

  private confirmFn: (toolName: string, params: Record<string, unknown>, isDangerous: boolean) => Promise<PermissionResponse>;

  constructor(confirmFn: (toolName: string, params: Record<string, unknown>, isDangerous: boolean) => Promise<PermissionResponse>) {
    this.confirmFn = confirmFn;
  }

  setLevel(toolName: string, level: PermissionLevel): void {
    this.levels.set(toolName, level);
  }

  getLevel(toolName: string): PermissionLevel {
    return this.levels.get(toolName) ?? 'dangerous';
  }

  async check(toolName: string, params: Record<string, unknown> = {}): Promise<boolean> {
    const level = this.levels.get(toolName) ?? 'dangerous';
    if (level === 'safe') return true;
    if (this.sessionApproved.has(toolName)) return true;

    const isDangerous = level === 'dangerous';
    const response = await this.confirmFn(toolName, params, isDangerous);

    if (response === 'always') {
      this.sessionApproved.add(toolName);
      return true;
    }
    if (response === 'allow') {
      // For risky tools, a single "allow" also remembers for session (backward compat)
      if (level === 'risky') {
        this.sessionApproved.add(toolName);
      }
      return true;
    }
    return false;
  }

  resetSession(): void {
    this.sessionApproved.clear();
  }
}
