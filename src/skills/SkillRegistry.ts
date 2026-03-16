import type { Skill } from './types';
import { builtinSkills } from './builtins';

export class SkillRegistry {
  private skills = new Map<string, Skill>();
  private activeSkill: string | null = null;

  constructor() {
    for (const skill of builtinSkills) {
      this.skills.set(skill.name, skill);
    }
  }

  activate(name: string): boolean {
    if (!this.skills.has(name)) return false;
    this.activeSkill = name;
    return true;
  }

  deactivate(): void {
    this.activeSkill = null;
  }

  getActive(): Skill | null {
    return this.activeSkill ? this.skills.get(this.activeSkill) ?? null : null;
  }

  getMenuText(): string {
    return [...this.skills.values()].map(s => s.getMenuText()).join('\n');
  }

  list(): Array<{ name: string; description: string; active: boolean }> {
    return [...this.skills.values()].map(s => ({
      name: s.name,
      description: s.description,
      active: s.name === this.activeSkill,
    }));
  }
}
