import type { PermissionLevel } from '../types/tool';

export class PermissionManager {
  private levels = new Map<string, PermissionLevel>();
  private sessionApproved = new Set<string>();

  private confirmFn: (toolName: string, params: Record<string, unknown>) => Promise<boolean>;

  constructor(confirmFn: (toolName: string, params: Record<string, unknown>) => Promise<boolean>) {
    this.confirmFn = confirmFn;
  }

  setLevel(toolName: string, level: PermissionLevel): void {
    this.levels.set(toolName, level);
  }

  async check(toolName: string, params: Record<string, unknown> = {}): Promise<boolean> {
    const level = this.levels.get(toolName) ?? 'dangerous';
    if (level === 'safe') return true;
    if (level === 'risky' && this.sessionApproved.has(toolName)) return true;

    const ok = await this.confirmFn(toolName, params);
    if (ok && level === 'risky') {
      this.sessionApproved.add(toolName);
    }
    return ok;
  }

  resetSession(): void {
    this.sessionApproved.clear();
  }
}
