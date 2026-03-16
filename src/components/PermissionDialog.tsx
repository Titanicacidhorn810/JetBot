import { useChatStore } from '../store/chatStore';
import { useConfigStore } from '../store/configStore';
import { useT } from '../lib/i18n';

export function PermissionDialog() {
  const pending = useChatStore(s => s.pendingPermission);
  const setPending = useChatStore(s => s.setPendingPermission);
  const locale = useConfigStore(s => s.locale);
  const t = useT();

  void locale;

  if (!pending) return null;

  const handleAllow = () => {
    pending.resolve(true);
    setPending(null);
  };

  const handleDeny = () => {
    pending.resolve(false);
    setPending(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[hsl(var(--background))] rounded-2xl border border-[hsl(var(--border))] shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-base font-semibold mb-3">{t('permission.title')}</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
          {t('permission.allow_tool')} <strong className="text-[hsl(var(--foreground))]">{pending.toolName}</strong>?
        </p>
        <div className="bg-[hsl(var(--muted))] rounded-lg p-3 mb-4 text-xs font-mono overflow-x-auto max-h-40 whitespace-pre-wrap">
          {JSON.stringify(pending.params, null, 2)}
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleDeny}
            className="px-4 py-2 text-sm rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors"
          >
            {t('permission.deny')}
          </button>
          <button
            onClick={handleAllow}
            className="px-4 py-2 text-sm rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
          >
            {t('permission.allow')}
          </button>
        </div>
      </div>
    </div>
  );
}
