import type { RuntimeProfile } from '../env/types';
import { profileToPrompt } from '../env/RuntimeDetector';

interface Section {
  key: string;
  priority: number;
  content: string;
}

export class SystemPromptBuilder {
  private sections: Map<string, Section> = new Map();

  constructor() {
    this.setSection('identity', 10,
      'You are JetBot, a browser-based AI coding assistant. You run entirely inside the user\'s browser tab. ' +
      'You help users with programming tasks using a virtual filesystem, browser-native JavaScript execution, ' +
      'HTML rendering, web requests, and more. You should actively leverage browser capabilities like js_eval for computation ' +
      'and render_html for visual output.'
    );
  }

  setSection(key: string, priority: number, content: string): void {
    this.sections.set(key, { key, priority, content });
  }

  removeSection(key: string): void {
    this.sections.delete(key);
  }

  build(): string {
    const sorted = [...this.sections.values()].sort((a, b) => a.priority - b.priority);
    return sorted.map(s => s.content).join('\n\n');
  }

  /**
   * Inject a full runtime environment profile into the prompt.
   * This replaces the old minimal "Environment: Browser" line with
   * a rich, structured description of capabilities and limitations.
   */
  setEnvironmentFromProfile(profile: RuntimeProfile): void {
    this.setSection('environment', 20, profileToPrompt(profile));
  }

  /** Legacy fallback — prefer setEnvironmentFromProfile. */
  setEnvironment(): void {
    const now = new Date().toISOString();
    const info = [
      `Current time: ${now}`,
      `Working directory: /workspace`,
      `Environment: Browser`,
    ];
    this.setSection('environment', 20, `# Environment\n${info.join('\n')}`);
  }

  setToolDescriptions(tools: Array<{ name: string; description: string }>): void {
    if (tools.length === 0) return;
    const list = tools.map(t => `- **${t.name}**: ${t.description}`).join('\n');
    this.setSection('tools', 30, `# Available Tools\n${list}`);
  }

  setSkillMenu(skills: Array<{ name: string; description: string }>): void {
    if (skills.length === 0) return;
    const list = skills.map(s => `- ${s.name}: ${s.description}`).join('\n');
    this.setSection('skills', 40, `<available_skills>\n${list}\n</available_skills>`);
  }
}
