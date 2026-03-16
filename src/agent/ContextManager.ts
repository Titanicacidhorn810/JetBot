import type { Turn, LLMMessage, ContentPart, Role } from '../types/message';

export class ContextManager {
  private turns: Turn[] = [];
  private maxTurns: number;
  private maxTokenBudget: number;
  private compactThreshold: number;
  private recentToolResults: number;

  constructor(maxTurns = 20, maxTokenBudget = 30000, compactThreshold = 0.80, recentToolResults = 4) {
    this.maxTurns = maxTurns;
    this.maxTokenBudget = maxTokenBudget;
    this.compactThreshold = compactThreshold;
    this.recentToolResults = recentToolResults;
  }

  addUserMessage(text: string): void {
    this.pushTurn('user', [{ type: 'text', text }]);
  }

  addAssistantMessage(text: string, toolCalls?: Array<{ id: string; name: string; arguments: string }>): void {
    const parts: ContentPart[] = [];
    if (text) parts.push({ type: 'text', text });
    if (toolCalls) {
      for (const tc of toolCalls) {
        parts.push({ type: 'tool_call', id: tc.id, name: tc.name, arguments: tc.arguments });
      }
    }
    this.pushTurn('assistant', parts);
  }

  addToolResult(toolCallId: string, content: string, isError = false): void {
    this.pushTurn('tool', [{ type: 'tool_result', toolCallId, content, isError }]);
  }

  clear(): void { this.turns = []; }
  turnCount(): number { return this.turns.length; }

  currentTokenEstimate(): number {
    return this.turns.reduce((sum, t) => sum + t.tokenEstimate, 0);
  }

  toMessages(systemPrompt: string): LLMMessage[] {
    const msgs: LLMMessage[] = [{ role: 'system', content: systemPrompt }];

    // Count tool result turns from the end for masking
    let toolResultCount = 0;
    const toolResultIndices = new Map<number, number>(); // turn index -> count from end
    for (let i = this.turns.length - 1; i >= 0; i--) {
      if (this.turns[i].role === 'tool') {
        toolResultIndices.set(i, toolResultCount);
        toolResultCount++;
      }
    }

    for (let i = 0; i < this.turns.length; i++) {
      const turn = this.turns[i];
      if (turn.role === 'user') {
        const text = turn.content.filter(c => c.type === 'text').map(c => (c as any).text).join('\n');
        msgs.push({ role: 'user', content: text });
      } else if (turn.role === 'assistant') {
        const textParts = turn.content.filter(c => c.type === 'text');
        const tcParts = turn.content.filter(c => c.type === 'tool_call');
        const msg: LLMMessage = { role: 'assistant' };
        if (textParts.length) msg.content = textParts.map(c => (c as any).text).join('');
        if (tcParts.length) {
          msg.tool_calls = tcParts.map(c => {
            const tc = c as any;
            return { id: tc.id, type: 'function' as const, function: { name: tc.name, arguments: tc.arguments } };
          });
        }
        msgs.push(msg);
      } else if (turn.role === 'tool') {
        const result = turn.content[0] as any;
        const idx = toolResultIndices.get(i) ?? 999;
        let content = result.content;
        // Mask older tool results
        if (idx >= this.recentToolResults && !result.isError) {
          content = `[Result masked - ${result.content.length} bytes]`;
        }
        msgs.push({ role: 'tool', content, tool_call_id: result.toolCallId });
      }
    }
    return msgs;
  }

  private pushTurn(role: Role, content: ContentPart[]): void {
    const text = content.map(c => {
      if (c.type === 'text') return c.text;
      if (c.type === 'tool_call') return c.arguments;
      if (c.type === 'tool_result') return c.content;
      return '';
    }).join('');

    this.turns.push({
      role,
      content,
      timestamp: Date.now(),
      tokenEstimate: Math.ceil(text.length / 4),
      masked: false,
    });

    // Trim old turns
    while (this.turns.length > this.maxTurns) {
      this.turns.shift();
    }

    // Auto-compact
    if (this.currentTokenEstimate() > this.maxTokenBudget * this.compactThreshold) {
      this.compact();
    }
  }

  private compact(): void {
    const half = Math.floor(this.turns.length / 2);
    for (let i = 0; i < half; i++) {
      const turn = this.turns[i];
      turn.content = turn.content.map(c => {
        if (c.type === 'text' && c.text.length > 200) {
          return { ...c, text: c.text.slice(0, 200) + '... [compacted]' };
        }
        if (c.type === 'tool_result' && c.content.length > 200) {
          return { ...c, content: c.content.slice(0, 200) + '... [compacted]' };
        }
        return c;
      });
      // Recalculate token estimate
      const text = turn.content.map(p => {
        if (p.type === 'text') return p.text;
        if (p.type === 'tool_result') return p.content;
        if (p.type === 'tool_call') return p.arguments;
        return '';
      }).join('');
      turn.tokenEstimate = Math.ceil(text.length / 4);
    }
  }
}
