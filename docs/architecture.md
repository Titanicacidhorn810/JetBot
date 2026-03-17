# Architecture

[中文版](architecture.zh-CN.md)

## Source Structure

```
jetbot/src/
├── agent/                 # Core Agent Engine
│   ├── Agent.ts           # Command routing, skill injection, message injection
│   ├── AgenticLoop.ts     # Tool call loop (circuit breaker, repeat detection)
│   ├── ContextManager.ts  # Sliding window for conversation context
│   └── SystemPromptBuilder.ts  # System prompt assembly
│
├── components/            # React UI
│   ├── cosmos/            # Cosmos View (force-directed canvas)
│   │   ├── CosmosCanvas.ts    # 2D canvas rendering + force simulation
│   │   ├── CosmosView.tsx     # React wrapper + interaction handling
│   │   └── types.ts           # Node, Edge, Viewport types
│   ├── ChatPanel.tsx      # Chat conversation panel
│   ├── MessageBubble.tsx  # Message bubble (Markdown rendering)
│   ├── ToolCallBlock.tsx  # Tool call display (collapsible)
│   ├── InputBar.tsx       # Input bar + break-chain toggle
│   ├── StatusBar.tsx      # Top status bar + view toggle
│   ├── WelcomeScreen.tsx  # First-time configuration wizard
│   ├── SettingsDialog.tsx # Settings panel
│   ├── PermissionDialog.tsx # Permission confirmation dialog
│   ├── TaskPanel.tsx      # Scheduled tasks panel
│   ├── RenderPreview.tsx  # HTML preview panel
│   ├── LogPanel.tsx       # System log panel
│   ├── FileBridge.tsx     # File bridge (import/export/drag-drop)
│   └── shared/            # Modal, Spinner shared components
│
├── tools/                 # Tool System
│   ├── ToolRegistry.ts    # Tool registration + capability filtering
│   ├── Permission.ts      # Three-tier permission management
│   ├── VirtualFS.ts       # IndexedDB virtual file system
│   └── builtins/          # 10 built-in tools
│
├── skills/                # Skill System
│   ├── SkillRegistry.ts   # Skill registration + activation
│   └── builtins.ts        # 18 built-in skill definitions
│
├── llm/                   # LLM Client
│   └── OpenAICompatibleClient.ts  # Unified OpenAI-compatible protocol
│
├── scheduler/             # Scheduled Tasks
│   ├── Scheduler.ts       # Scheduler engine (tick + heartbeat + catch-up)
│   ├── TaskStore.ts       # IndexedDB task persistence
│   └── types.ts
│
├── store/                 # Zustand State Management
│   ├── agentStore.ts      # Agent lifecycle
│   ├── chatStore.ts       # Chat messages + UI state
│   ├── configStore.ts     # LLM config + persistence
│   └── cosmosStore.ts     # Cosmos view state + cross-turn linking
│
├── env/                   # Runtime Detection
│   ├── RuntimeDetector.ts # 19-capability auto-detection
│   └── types.ts
│
├── lib/                   # Utilities
│   ├── i18n.ts            # Bilingual i18n + useT() hook
│   └── logger.ts          # Modular logging system
│
└── types/                 # TypeScript Types
    ├── llm.ts             # LLM request/response types
    ├── message.ts         # Agent event types
    └── tool.ts            # Tool definition types
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19 + Tailwind CSS 4 |
| State | Zustand 5 |
| Build | Vite 8 + TypeScript 5.9 |
| Storage | IndexedDB (idb) + localStorage |
| Markdown | marked + highlight.js |
| LLM | OpenAI-compatible REST API |

**Zero backend dependency.** `npm run build` produces pure static files (HTML/JS/CSS) deployable anywhere.

## Key Design Decisions

### Browser-Only Architecture

All code runs in the browser. LLM calls go directly from `fetch()` to API providers. File operations use an IndexedDB-backed virtual file system. Shell commands run in a sandboxed JavaScript interpreter.

### Agentic Loop

Inspired by TrueConsole's Rust implementation, reimplemented in TypeScript. The loop supports up to 100 iterations with circuit breaker protection (3 consecutive failures) and duplicate error detection.

### Force-Directed Cosmos View

Conversation visualization using a custom 2D force simulation on HTML Canvas. Nodes represent messages and tool calls; edges show flow within turns (auto) and across turns (cross-turn, weaker spring force). Manual drag-connect triggers LLM relationship analysis.

### Three-Tier Permission System

Tools are classified as safe, risky, or dangerous. Safe tools auto-approve. Risky tools prompt once then remember the decision. Dangerous tools prompt every time. `/auto on` relaxes these constraints for power users.
