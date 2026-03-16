export type Locale = 'en' | 'zh';

const translations = {
  // WelcomeScreen
  'welcome.subtitle': {
    en: 'Browser-based AI coding assistant.\nZero install. Zero deploy. Zero config.',
    zh: '浏览器端 AI 编程助手。\n零安装、零部署、零配置。',
  },
  'welcome.provider': { en: 'Provider', zh: '服务商' },
  'welcome.apiKey': { en: 'API Key', zh: 'API 密钥' },
  'welcome.apiKeyHint': {
    en: 'Your key is stored locally and never sent to our servers.',
    zh: '密钥仅保存在本地，不会发送到我们的服务器。',
  },
  'welcome.baseUrl': { en: 'Base URL', zh: '接口地址' },
  'welcome.model': { en: 'Model', zh: '模型' },
  'welcome.start': { en: 'Get Started', zh: '开始使用' },
  'welcome.show': { en: 'Show', zh: '显示' },
  'welcome.hide': { en: 'Hide', zh: '隐藏' },

  // StatusBar
  'status.ready': { en: 'Ready', zh: '就绪' },
  'status.thinking': { en: 'Thinking...', zh: '思考中...' },
  'status.executing_tool': { en: 'Running tool...', zh: '执行工具中...' },
  'status.waiting_permission': { en: 'Awaiting permission', zh: '等待授权' },
  'status.error': { en: 'Error', zh: '错误' },
  'status.settings': { en: 'Settings', zh: '设置' },

  // InputBar
  'input.placeholder': { en: 'Type a message...', zh: '输入消息...' },
  'input.thinking': { en: 'Thinking...', zh: '思考中...' },
  'input.send': { en: 'Send', zh: '发送' },
  'input.stop': { en: 'Stop', zh: '停止' },

  // ChatPanel
  'chat.empty': { en: 'Send a message to get started', zh: '发送消息开始对话' },

  // PermissionDialog
  'permission.title': { en: 'Permission Request', zh: '权限请求' },
  'permission.allow_tool': { en: 'Allow tool', zh: '允许工具' },
  'permission.allow': { en: 'Allow', zh: '允许' },
  'permission.deny': { en: 'Deny', zh: '拒绝' },

  // SettingsDialog
  'settings.title': { en: 'Settings', zh: '设置' },
  'settings.provider': { en: 'Provider', zh: '服务商' },
  'settings.apiKey': { en: 'API Key', zh: 'API 密钥' },
  'settings.model': { en: 'Model', zh: '模型' },
  'settings.baseUrl': { en: 'Base URL', zh: '接口地址' },
  'settings.proxyUrl': { en: 'CORS Proxy URL (optional)', zh: 'CORS 代理地址（可选）' },
  'settings.cancel': { en: 'Cancel', zh: '取消' },
  'settings.save': { en: 'Save', zh: '保存' },
  'settings.language': { en: 'Language', zh: '语言' },

  // Validation
  'validate.apiKey': { en: 'API Key is required', zh: 'API 密钥不能为空' },
  'validate.baseUrl': { en: 'Base URL is required', zh: '接口地址不能为空' },
  'validate.model': { en: 'Model is required', zh: '模型不能为空' },

  // Agent commands
  'cmd.cleared': { en: 'Conversation cleared.', zh: '对话已清除。' },
  'cmd.plan_deactivated': { en: 'Plan mode deactivated.', zh: '计划模式已关闭。' },
  'cmd.plan_usage': { en: 'Usage: /plan <goal> — Enter plan mode with a goal.', zh: '用法：/plan <目标> — 输入目标进入计划模式。' },
  'cmd.plan_activated': { en: 'Plan mode activated.', zh: '计划模式已激活。' },
  'cmd.goal': { en: 'Goal', zh: '目标' },
  'cmd.phase': { en: 'Phase', zh: '阶段' },
  'cmd.use_next': { en: 'Use /next to advance phases.', zh: '使用 /next 推进阶段。' },
  'cmd.not_in_plan': { en: 'Not in plan mode. Use /plan <goal> first.', zh: '未处于计划模式。请先使用 /plan <目标>。' },
  'cmd.advanced_to': { en: 'Advanced to phase', zh: '已推进到阶段' },
  'cmd.unknown': { en: 'Unknown command', zh: '未知命令' },
  'cmd.type_help': { en: 'Type /help for available commands.', zh: '输入 /help 查看可用命令。' },
  'cmd.help_title': { en: '# JetBot Commands', zh: '# JetBot 命令' },
  'cmd.help_help': { en: '`/help` — Show this help', zh: '`/help` — 显示帮助' },
  'cmd.help_clear': { en: '`/clear` — Clear conversation history', zh: '`/clear` — 清除对话历史' },
  'cmd.help_status': { en: '`/status` — Show current status', zh: '`/status` — 显示当前状态' },
  'cmd.help_model': { en: '`/model` — Show current model', zh: '`/model` — 显示当前模型' },
  'cmd.help_plan': { en: '`/plan <goal>` — Enter/exit plan mode', zh: '`/plan <目标>` — 进入/退出计划模式' },
  'cmd.help_next': { en: '`/next` — Advance plan mode phase', zh: '`/next` — 推进计划阶段' },
  'cmd.help_footer': { en: 'Just type naturally to chat with the AI assistant.', zh: '直接输入自然语言与 AI 助手对话。' },
} as const;

export type TranslationKey = keyof typeof translations;

let currentLocale: Locale = 'en';

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: TranslationKey): string {
  const entry = translations[key];
  return entry?.[currentLocale] ?? entry?.en ?? key;
}

// React hook — components call useT() to get the t function
// and re-render when locale changes (via configStore subscription)
export function useT() {
  return t;
}
