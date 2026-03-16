import type { Skill } from './types';

export const builtinSkills: Skill[] = [
  {
    name: 'code-review',
    description: 'Review code for bugs, security issues, and improvements',
    getMenuText() { return `${this.name}: ${this.description}`; },
    getActiveInstructions() {
      return `You are now in CODE REVIEW mode. For each piece of code:
1. Check for bugs and logical errors
2. Check for security vulnerabilities (OWASP Top 10)
3. Check for performance issues
4. Suggest improvements with specific code examples
5. Rate overall quality: 🟢 Good / 🟡 Needs Work / 🔴 Critical Issues

Be specific with line references and provide corrected code snippets.`;
    },
  },
  {
    name: 'debugging',
    description: 'Systematic debugging with root cause analysis',
    getMenuText() { return `${this.name}: ${this.description}`; },
    getActiveInstructions() {
      return `You are now in DEBUGGING mode. Follow this process:
1. Reproduce: Understand the exact symptoms
2. Hypothesize: List possible causes (most likely first)
3. Test: Use tools to verify/eliminate each hypothesis
4. Fix: Apply the minimal fix for the root cause
5. Verify: Confirm the fix resolves the issue

Always identify the ROOT CAUSE, not just symptoms.`;
    },
  },
  {
    name: 'explain',
    description: 'Explain code or concepts in detail',
    getMenuText() { return `${this.name}: ${this.description}`; },
    getActiveInstructions() {
      return `You are now in EXPLAIN mode. When explaining:
1. Start with a one-sentence summary
2. Explain the high-level architecture/flow
3. Walk through key code sections
4. Note important design decisions and trade-offs
5. Highlight potential gotchas or edge cases

Adjust complexity to the user's apparent expertise level.`;
    },
  },
  {
    name: 'writing',
    description: 'Help write documentation, comments, and technical content',
    getMenuText() { return `${this.name}: ${this.description}`; },
    getActiveInstructions() {
      return `You are now in WRITING mode. Focus on:
1. Clear, concise technical writing
2. Proper structure with headings and sections
3. Code examples where helpful
4. Audience-appropriate language
5. Consistent formatting and style`;
    },
  },
];
