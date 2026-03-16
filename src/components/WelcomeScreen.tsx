import { useState } from 'react';
import { useConfigStore } from '../store/configStore';
import { useAgentStore } from '../store/agentStore';
import { useT } from '../lib/i18n';

export function WelcomeScreen() {
  const config = useConfigStore();
  const initAgent = useAgentStore(s => s.initAgent);
  const [showKey, setShowKey] = useState(false);
  const locale = useConfigStore(s => s.locale);
  const t = useT();

  // force re-read of t when locale changes
  void locale;

  const handleStart = () => {
    const { valid, errors } = config.validate();
    if (!valid) {
      alert(errors.join('\n'));
      return;
    }
    initAgent();
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-sm w-full space-y-6">
        {/* Language toggle */}
        <div className="flex justify-end">
          <button
            onClick={() => config.setLocale(locale === 'en' ? 'zh' : 'en')}
            className="text-xs px-2.5 py-1 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
          >
            {locale === 'en' ? '中文' : 'EN'}
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">JetBot</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] whitespace-pre-line">
            {t('welcome.subtitle')}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">{t('welcome.provider')}</label>
            <div className="flex gap-2">
              {['openai', 'deepseek', 'custom'].map(p => (
                <button
                  key={p}
                  onClick={() => config.applyPreset(p)}
                  className={`flex-1 px-3 py-2 text-sm rounded-xl border transition-colors ${
                    config.provider === p
                      ? 'border-[hsl(var(--ring))] bg-[hsl(var(--accent))] font-medium'
                      : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
                  }`}
                >
                  {p === 'openai' ? 'OpenAI' : p === 'deepseek' ? 'DeepSeek' : 'Custom'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{t('welcome.apiKey')}</label>
            <div className="flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={e => config.setApiKey(e.target.value)}
                className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                placeholder="sk-..."
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="text-xs text-[hsl(var(--muted-foreground))]"
              >
                {showKey ? t('welcome.hide') : t('welcome.show')}
              </button>
            </div>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">
              {t('welcome.apiKeyHint')}
            </p>
          </div>

          {config.provider === 'custom' && (
            <>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{t('welcome.baseUrl')}</label>
                <input
                  type="text"
                  value={config.baseUrl}
                  onChange={e => config.setBaseUrl(e.target.value)}
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{t('welcome.model')}</label>
                <input
                  type="text"
                  value={config.model}
                  onChange={e => config.setModel(e.target.value)}
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                />
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleStart}
          disabled={!config.apiKey}
          className="w-full py-3 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-30"
        >
          {t('welcome.start')}
        </button>
      </div>
    </div>
  );
}
