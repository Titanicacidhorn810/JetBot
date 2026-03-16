export interface Skill {
  /** Unique identifier, e.g. 'code-review' */
  name: string;
  /** One-line description for the skill menu */
  description: string;
  /** When to auto-suggest this skill (shown in menu) */
  trigger?: string;
  /** Full instructions injected into system prompt when active */
  instructions: string;
}
