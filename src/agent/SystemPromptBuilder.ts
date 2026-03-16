interface Section {
  key: string;
  priority: number;
  content: string;
}

export class SystemPromptBuilder {
  private sections: Map<string, Section> = new Map();

  constructor() {
    this.setSection('identity', 10,
      'You are JetBot, a browser-based AI coding assistant. You help users with programming tasks by reading, writing, and editing files in a virtual filesystem, searching the web, and executing shell commands.'
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
