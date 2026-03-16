export interface Skill {
  name: string;
  description: string;
  getMenuText(): string;
  getActiveInstructions(): string;
}
