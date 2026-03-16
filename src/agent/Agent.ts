import type { LLMClient } from '../types/llm';
import type { AgentEvent } from '../types/message';
import { ContextManager } from './ContextManager';
import { SystemPromptBuilder } from './SystemPromptBuilder';
import { AgenticLoop, type LoopStats } from './AgenticLoop';
import { ToolRegistry } from '../tools/ToolRegistry';
import { PermissionManager } from '../tools/Permission';
import { PlanMode } from '../plan/PlanMode';
import { t } from '../lib/i18n';

export type AgentEventCallback = (event: AgentEvent) => void;

export interface AgentConfig {
  llm: LLMClient;
  permissionConfirmFn: (toolName: string, params: Record<string, unknown>) => Promise<boolean>;
  onEvent: AgentEventCallback;
}

export class Agent {
  private llm: LLMClient;
  private context: ContextManager;
  private promptBuilder: SystemPromptBuilder;
  private loop: AgenticLoop;
  private tools: ToolRegistry;
  private permission: PermissionManager;
  private planMode: PlanMode;
  private onEvent: AgentEventCallback;
  private running = false;

  constructor(config: AgentConfig) {
    this.llm = config.llm;
    this.context = new ContextManager();
    this.promptBuilder = new SystemPromptBuilder();
    this.loop = new AgenticLoop();
    this.tools = new ToolRegistry();
    this.permission = new PermissionManager(config.permissionConfirmFn);
    this.planMode = new PlanMode();
    this.onEvent = config.onEvent;

    this.promptBuilder.setEnvironment();
    this.promptBuilder.setToolDescriptions(
      this.tools.schemas().map(s => ({ name: s.function.name, description: s.function.description }))
    );
  }

  async handle(input: string): Promise<{ response: string; stats?: LoopStats }> {
    // Slash commands
    if (input.startsWith('/')) {
      return this.handleCommand(input);
    }

    this.running = true;
    this.context.addUserMessage(input);

    // Build system prompt with plan mode if active
    let systemPrompt = this.promptBuilder.build();
    if (this.planMode.isActive()) {
      systemPrompt += '\n\n' + this.planMode.getPromptSection();
    }

    try {
      const { finalResponse, stats } = await this.loop.run(
        this.llm,
        this.tools,
        this.context,
        systemPrompt,
        this.onEvent,
        this.permission,
        (chunk) => this.onEvent({ type: 'llm:chunk', data: { chunk }, timestamp: Date.now() }),
      );
      return { response: finalResponse, stats };
    } finally {
      this.running = false;
    }
  }

  private handleCommand(input: string): { response: string } {
    const [cmd, ...args] = input.trim().split(/\s+/);
    switch (cmd) {
      case '/help':
        return { response: this.helpText() };
      case '/clear':
        this.context.clear();
        return { response: t('cmd.cleared') };
      case '/status':
        return { response: `Model: ${this.llm.model()}\nTurns: ${this.context.turnCount()}\nTokens: ~${this.context.currentTokenEstimate()}\nPlan Mode: ${this.planMode.isActive() ? this.planMode.currentPhase() : 'off'}` };
      case '/model':
        return { response: `Current model: ${this.llm.model()}` };
      case '/plan': {
        if (args.length === 0) {
          if (this.planMode.isActive()) {
            this.planMode.deactivate();
            return { response: t('cmd.plan_deactivated') };
          }
          return { response: t('cmd.plan_usage') };
        }
        const goal = args.join(' ');
        this.planMode.activate(goal);
        return { response: `${t('cmd.plan_activated')}\n${t('cmd.goal')}: ${goal}\n${t('cmd.phase')}: ${this.planMode.currentPhase()}\n${t('cmd.use_next')}` };
      }
      case '/next':
        if (!this.planMode.isActive()) {
          return { response: t('cmd.not_in_plan') };
        }
        this.planMode.nextPhase();
        return { response: `${t('cmd.advanced_to')}: ${this.planMode.currentPhase()}` };
      default:
        return { response: `${t('cmd.unknown')}: ${cmd}. ${t('cmd.type_help')}` };
    }
  }

  setLLM(client: LLMClient): void {
    this.llm = client;
  }

  abort(): void {
    this.loop.abort();
  }

  isRunning(): boolean {
    return this.running;
  }

  getToolRegistry(): ToolRegistry {
    return this.tools;
  }

  private helpText(): string {
    return [
      t('cmd.help_title'),
      '',
      `- ${t('cmd.help_help')}`,
      `- ${t('cmd.help_clear')}`,
      `- ${t('cmd.help_status')}`,
      `- ${t('cmd.help_model')}`,
      `- ${t('cmd.help_plan')}`,
      `- ${t('cmd.help_next')}`,
      '',
      t('cmd.help_footer'),
    ].join('\n');
  }
}
