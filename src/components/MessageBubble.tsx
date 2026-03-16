import type { UIMessage } from '../store/chatStore';
import { renderMarkdown } from '../lib/markdown';

interface Props {
  message: UIMessage;
}

export function MessageBubble({ message }: Props) {
  if (message.role === 'error') {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
        {message.content}
      </div>
    );
  }

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-2xl px-4 py-2.5 max-w-[85%] whitespace-pre-wrap text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant
  return (
    <div className="flex justify-start">
      <div className="bg-[hsl(var(--muted))] rounded-2xl px-4 py-3 max-w-[85%] text-sm prose prose-sm dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }} />
        {message.isStreaming && (
          <span className="inline-block w-2 h-4 bg-current animate-pulse ml-0.5" />
        )}
      </div>
    </div>
  );
}
