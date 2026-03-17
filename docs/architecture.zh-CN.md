# 架构

[English](architecture.md)

## 源码结构

```
jetbot/src/
├── agent/                 # Agent 核心引擎
│   ├── Agent.ts           # 命令路由、技能注入、消息注入
│   ├── AgenticLoop.ts     # 工具调用循环（熔断器、重复检测）
│   ├── ContextManager.ts  # 对话上下文滑动窗口
│   └── SystemPromptBuilder.ts  # 系统提示词组装
│
├── components/            # React 界面
│   ├── cosmos/            # 宇宙视图（力引导画布）
│   │   ├── CosmosCanvas.ts    # 2D Canvas 渲染 + 力模拟
│   │   ├── CosmosView.tsx     # React 封装 + 交互处理
│   │   └── types.ts           # 节点、边、视口类型
│   ├── ChatPanel.tsx      # 对话面板
│   ├── MessageBubble.tsx  # 消息气泡（Markdown 渲染）
│   ├── ToolCallBlock.tsx  # 工具调用展示（可折叠）
│   ├── InputBar.tsx       # 输入栏 + 断链切换
│   ├── StatusBar.tsx      # 顶部状态栏 + 视图切换
│   ├── WelcomeScreen.tsx  # 首次配置向导
│   ├── SettingsDialog.tsx # 设置面板
│   ├── PermissionDialog.tsx # 权限确认对话框
│   ├── TaskPanel.tsx      # 定时任务面板
│   ├── RenderPreview.tsx  # HTML 预览面板
│   ├── LogPanel.tsx       # 系统日志面板
│   ├── FileBridge.tsx     # 文件桥接（导入/导出/拖拽）
│   └── shared/            # Modal、Spinner 共享组件
│
├── tools/                 # 工具系统
│   ├── ToolRegistry.ts    # 工具注册 + 能力过滤
│   ├── Permission.ts      # 三级权限管理
│   ├── VirtualFS.ts       # IndexedDB 虚拟文件系统
│   └── builtins/          # 10 个内置工具
│
├── skills/                # 技能系统
│   ├── SkillRegistry.ts   # 技能注册 + 激活管理
│   └── builtins.ts        # 18 个内置技能定义
│
├── llm/                   # LLM 客户端
│   └── OpenAICompatibleClient.ts  # 统一 OpenAI 兼容协议
│
├── scheduler/             # 定时调度
│   ├── Scheduler.ts       # 调度引擎（心跳 + 补执行）
│   ├── TaskStore.ts       # IndexedDB 任务持久化
│   └── types.ts
│
├── store/                 # Zustand 状态管理
│   ├── agentStore.ts      # Agent 生命周期
│   ├── chatStore.ts       # 对话消息 + 界面状态
│   ├── configStore.ts     # LLM 配置 + 持久化
│   └── cosmosStore.ts     # 宇宙视图状态 + 跨轮次连线
│
├── env/                   # 运行时检测
│   ├── RuntimeDetector.ts # 19 项能力自动探测
│   └── types.ts
│
├── lib/                   # 通用库
│   ├── i18n.ts            # 中英双语 + useT() Hook
│   └── logger.ts          # 模块化日志系统
│
└── types/                 # TypeScript 类型
    ├── llm.ts             # LLM 请求/响应类型
    ├── message.ts         # Agent 事件类型
    └── tool.ts            # 工具定义类型
```

## 技术栈

| 层级 | 技术 |
|------|-----|
| 界面 | React 19 + Tailwind CSS 4 |
| 状态 | Zustand 5 |
| 构建 | Vite 8 + TypeScript 5.9 |
| 存储 | IndexedDB (idb) + localStorage |
| Markdown | marked + highlight.js |
| LLM | OpenAI 兼容 REST API |

**零后端依赖。** `npm run build` 产出纯静态文件，可部署于任何位置。

## 关键设计决策

### 纯浏览器架构

所有代码在浏览器中运行。LLM 调用通过 `fetch()` 直连 API 服务商。文件操作基于 IndexedDB 虚拟文件系统。Shell 命令在沙箱 JavaScript 解释器中执行。

### 自主工具循环

受 TrueConsole（Rust 实现）启发，以 TypeScript 重新实现。支持最多 100 轮迭代，内置熔断保护（连续 3 次失败）和重复错误检测。

### 力引导宇宙视图

基于 HTML Canvas 的自定义 2D 力模拟，用于对话可视化。节点代表消息与工具调用；边分为同轮自动连线和跨轮次弱弹簧连线。手动拖拽连线触发 LLM 关联分析。

### 三级权限体系

工具分为安全、风险、危险三级。安全工具自动通过；风险工具首次确认后记住；危险工具每次确认。`/auto on` 为高级用户放宽限制。
