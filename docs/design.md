# JetBot Design Document

> 2026-03-16 | Author: Hongxin Zhang

## 1. Project Vision

```
"零门槛、零部署、零配置"
→ 打开浏览器即用
→ 微信中也能运行
→ 一键分享传播
```

### Target Users

| User Type | Scenario | Value |
|-----------|----------|-------|
| **Individuals** | Daily AI assistant | No install, open and use |
| **Developers** | Rapid prototyping | Reference TrueConsole logic |
| **Enterprise** | Internal tool sharing | Share a link, done |
| **WeChat Users** | In-app browser | WeChat ecosystem integration |

---

## 2. Feasibility Analysis

### Browser Capabilities

| Capability | API | Support |
|-----------|-----|---------|
| **Storage** | IndexedDB / OPFS | All modern browsers |
| **File Operations** | File System Access API | Chrome/Edge |
| **HTTP Requests** | fetch + CORS | Needs proxy |
| **Background** | Service Worker | Chrome/Edge |
| **Local Inference** | WebLLM / Transformers.js | Chrome/Edge |
| **Crypto** | Web Crypto API | All browsers |

### WeChat Browser Compatibility

Supported: ES6+, IndexedDB, Service Worker (limited), Web Crypto, fetch API

Not supported: File System Access API, WebGPU, WebRTC P2P

**Conclusion**: Core features viable across all platforms; advanced features degrade gracefully.

### Validated by Open Source

| Project | Stars | Proves |
|---------|-------|--------|
| WebLLM | 17.6k | Browser-based LLM inference is viable |
| Transformers.js | 13k+ | Transformers run in browser |
| Cherry Studio | 41.6k | Browser AI Agent is viable |

---

## 3. Key Challenges & Solutions

### CORS Restrictions

LLM APIs don't allow direct browser calls. Solutions:
- **Dev**: CORS proxy (e.g., allorigins)
- **Prod**: Cloudflare Workers reverse proxy
- **Enterprise**: Self-hosted proxy endpoint
- **User config**: Custom proxy URL in settings

### File System

Browser can't access local files directly. Solutions:
- **Primary**: IndexedDB-backed Virtual File System
- **Enhanced**: File System Access API (Chrome/Edge)
- **Fallback**: File upload via `<input type="file">`
- **Export**: Programmatic `<a download>` trigger

### Shell Commands

Browser can't execute real shell commands. Solution:
- Built-in command interpreter mapping `ls`, `cat`, `grep`, etc. to VirtualFS operations
- Sandboxed JavaScript execution for general computation

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    JetBot (Browser)                       │
├─────────────────────────────────────────────────────────┤
│  UI Layer          React + Tailwind CSS                  │
│  ├─ Chat Interface / Cosmos View / Preview Panel         │
│  └─ Settings / Permission / Task Management              │
├─────────────────────────────────────────────────────────┤
│  Agent Layer       (inspired by TrueConsole)             │
│  ├─ Agentic Loop   (circuit breaker + repeat detection)  │
│  ├─ Context Manager (sliding window)                     │
│  ├─ Skill Registry  (18 built-in skills)                 │
│  └─ Plan Mode       (observe → plan → code → verify)     │
├─────────────────────────────────────────────────────────┤
│  Tool Layer        10 built-in tools                     │
│  ├─ VirtualFS      (IndexedDB)                           │
│  ├─ HTTP / Search  (CORS proxy fallback)                 │
│  └─ JS Eval / HTML Render / Shell                        │
├─────────────────────────────────────────────────────────┤
│  LLM Layer         OpenAI-compatible protocol            │
│  ├─ Remote: OpenAI / DeepSeek / Custom                   │
│  └─ Local:  Ollama                                       │
├─────────────────────────────────────────────────────────┤
│  Storage Layer                                           │
│  ├─ IndexedDB      (files + scheduled tasks)             │
│  └─ localStorage   (config + preferences)                │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Tech Stack

```yaml
Frontend:     React 19 + TypeScript
Styling:      Tailwind CSS 4
State:        Zustand 5
Storage:      IndexedDB (idb) + localStorage
LLM:          OpenAI-compatible REST API (fetch)
Build:        Vite 8
Deploy:       Static files → GitHub Pages / Cloudflare / Vercel
```

Total dependencies: ~15 (vs. 70+ in comparable projects)

---

## 6. Comparison with Related Projects

| Dimension | JetBot | ZeroClaw | NanoClaw | TrueConsole |
|-----------|--------|----------|----------|-------------|
| Language | TypeScript | Rust | TypeScript | Rust |
| Runtime | Browser | Native | Node.js | Native |
| Deploy difficulty | Zero | Install required | Install required | Install required |
| File system | Virtual (IndexedDB) | Native | Native | Native |
| WeChat compatible | Yes | No | No | No |
| Share via link | Yes | No | No | No |
| Offline | Partial (Ollama) | Yes | Yes | Yes |

---

## 7. Implementation Phases

### Phase 1: MVP

- Project scaffold (Vite + React + TypeScript + Tailwind)
- Agent core (Agentic Loop, Context Manager, circuit breaker)
- Virtual file system (IndexedDB)
- LLM client (OpenAI-compatible)
- Built-in tools (read/write/search/eval)
- Basic UI (chat, input, settings)

### Phase 2: Feature Complete

- Plan mode (observe → plan → code → verify)
- Skill system (18 built-in skills)
- Multi-provider support (OpenAI, DeepSeek, Ollama)
- Permission system (three-tier)
- Scheduler (interval / cron / once)
- File Bridge (drag import + download export)

### Phase 3: Cosmos & Beyond

- Cosmos View (force-directed conversation visualization)
- Cross-turn linking + break-chain control
- Runtime detection (19 browser capabilities)
- WeChat browser optimization
- Ecosystem expansion

---

*"大道至简，浏览器即 Agent"*
