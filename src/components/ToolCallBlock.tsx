import { useState } from 'react';
import type { UIToolCallBlock } from '../store/chatStore';

interface Props {
  block: UIToolCallBlock;
}

const STATUS_ICON: Record<string, string> = {
  running: '⏳',
  done: '✅',
  error: '❌',
};

export function ToolCallBlock({ block }: Props) {
  const [expanded, setExpanded] = useState(!block.collapsed);

  return (
    <div className="border-l-2 border-[hsl(var(--border))] pl-3 ml-4 my-2 text-xs font-mono">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors w-full text-left"
      >
        <span>{STATUS_ICON[block.status] ?? '⏳'}</span>
        <span className="font-semibold">{block.name}</span>
        <span className="ml-auto text-[10px]">{expanded ? '▼' : '▶'}</span>
      </button>
      {expanded && (
        <div className="mt-1 space-y-1">
          <div className="bg-[hsl(var(--muted))] rounded p-2 overflow-x-auto text-[11px] whitespace-pre-wrap">
            {JSON.stringify(block.params, null, 2)}
          </div>
          {block.result && (
            <div className={`rounded p-2 overflow-x-auto text-[11px] whitespace-pre-wrap ${
              block.isError
                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                : 'bg-green-500/10 text-green-700 dark:text-green-400'
            }`}>
              {block.result.length > 500 ? block.result.slice(0, 500) + '... [show more]' : block.result}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
