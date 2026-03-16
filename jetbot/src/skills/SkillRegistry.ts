import type { Skill } from './types';
import { builtinSkills } from './builtins';
import { logger } from '../lib/logger';

const log = logger.module('skills');

export class SkillRegistry {
  private skills = new Map<string, Skill>();
  private activeSkill: string | null = null;

  constructor() {
    for (const skill of builtinSkills) {
      this.register(skill);
    }
    log.info('skill registry initialized', { count: this.skills.size });
  }

  register(skill: Skill): void {
    this.skills.set(skill.name, skill);
  }

  activate(name: string): boolean {
    const skill = this.skills.get(name);
    if (!skill) return false;
    this.activeSkill = name;
    log.info('skill activated', { name });
    return true;
  }

  deactivate(): void {
    if (this.activeSkill) {
      log.info('skill deactivated', { name: this.activeSkill });
    }
    this.activeSkill = null;
  }

  getActive(): Skill | null {
    return this.activeSkill ? this.skills.get(this.activeSkill) ?? null : null;
  }

  getActiveName(): string | null {
    return this.activeSkill;
  }

  get(name: string): Skill | undefined {
    return this.skills.get(name);
  }

  /** Compact menu text for system prompt (~100 tokens) */
  menuText(): string {
    const lines = [...this.skills.values()].map(s =>
      `- **${s.name}**: ${s.description}`
    );
    return `# Available Skills\nActivate with \`/skill <name>\`. Deactivate with \`/skill off\`.\n${lines.join('\n')}`;
  }

  list(): Array<{ name: string; description: string; active: boolean }> {
    return [...this.skills.values()].map(s => ({
      name: s.name,
      description: s.description,
      active: s.name === this.activeSkill,
    }));
  }
}
