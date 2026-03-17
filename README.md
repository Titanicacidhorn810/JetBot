# JetBot

**Browser-based AI Coding Assistant — Zero Install. Zero Deploy. Zero Config.**

JetBot 是一个完全运行在浏览器中的 AI 编程助手。无需后端服务器、无需部署、无需安装——打开网页即可使用。

```
┌─────────────────────────────────────────────┐
│                  Browser                     │
│                                              │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐ │
│  │  React   │  │  Agentic  │  │  Virtual   │ │
│  │   UI     │←→│   Loop    │←→│   FS       │ │
│  └──────────┘  └─────┬─────┘  │ (IndexedDB)│ │
│                      │        └───────────┘ │
│                      │ fetch()               │
└──────────────────────┼──────────────────────┘
                       ↓
              ┌────────────────┐
              │  LLM Provider  │
              │ OpenAI/DeepSeek│
              │ Ollama/Custom  │
              └────────────────┘
```

## Quick Start

```bash
git clone https://github.com/hongxin/JetBot.git
cd JetBot/jetbot
npm install
npm run dev
```

打开 `http://localhost:5173`，选择 LLM Provider，输入 API Key，即可开始。

**本地 Ollama（完全离线）：**

```bash
ollama serve
ollama pull qwen3.5:27b
# JetBot 中选择 Ollama provider，无需 API Key
```

**生产构建：**

```bash
npm run build
# 产出 dist/，纯静态文件，可部署到任何静态服务器
```

## Features

### Agentic Loop

自主决策的工具调用循环——LLM 自动选择工具、执行操作、分析结果，直到完成任务。最多 100 轮迭代，3 次连续失败触发熔断，重复错误自动警告换方案。

### 10 Built-in Tools

| Tool | Permission | Description |
|------|-----------|-------------|
| `read_file` | safe | 读取虚拟文件系统中的文件 |
| `list_dir` | safe | 列出目录结构 |
| `search_text` | safe | 正则搜索文件内容 |
| `write_file` | risky | 创建或覆盖文件 |
| `edit_file` | risky | 精确文本替换编辑 |
| `http_get` | risky | HTTP 请求（自动 CORS 代理回退）|
| `js_eval` | risky | 沙箱执行 JavaScript（10s 超时）|
| `render_html` | risky | HTML/CSS 渲染到预览面板 |
| `shell_execute` | dangerous | 沙箱 shell 命令 |
| `export_file` | safe | 从 VirtualFS 导出文件到本地 |

### 18 Built-in Skills

通过 `/skill <name>` 激活，注入领域专家知识：

`debug` · `code-review` · `architect` · `explain` · `tdd` · `writing` · `refactor` · `visualize` · `decision` · `security` · `perf`

**ZPower 五行体系：** `zpower` · `z-observe` · `z-design` · `z-build` · `z-verify` · `z-evolve` · `z-diagram`

### Multi-Provider LLM

| Provider | Base URL | Note |
|----------|---------|------|
| **OpenAI** | `api.openai.com/v1` | GPT-4o 等 |
| **DeepSeek** | `api.deepseek.com/v1` | 高性价比 |
| **Ollama** | `localhost:11434/v1` | 本地运行，无需 Key |
| **Custom** | 自定义 | 任何 OpenAI 兼容端点 |

### Cosmos View

对话以力引导星空画布呈现——用户消息、AI 回复、工具调用都是星空中的泡泡节点，连续对话自动连线形成星座群，支持手动拖拽连线触发 LLM 关联分析。

### Permission System

三级权限控制：safe（自动通过）、risky（首次确认后记住）、dangerous（每次确认）。`/auto on` 可切换自主模式。

### More

- **File Bridge** — 拖拽导入本地文件，`export_file` 触发下载导出
- **Scheduler** — 浏览器内定时任务（interval / cron / once），IndexedDB 持久化
- **Bilingual i18n** — 中英双语，一键切换
- **Runtime Detection** — 自动探测 19 项浏览器能力，动态加载工具

## Commands

| Command | Description |
|---------|-------------|
| `/help` | 显示命令帮助 |
| `/clear` | 清除对话历史 |
| `/status` | 显示模型、Token、运行状态 |
| `/model` | 显示当前模型 |
| `/runtime` | 显示运行时环境和能力 |
| `/plan <goal>` | 进入/退出计划模式 |
| `/next` | 推进计划阶段 |
| `/skill <name>\|list\|off` | 激活/列出/关闭技能 |
| `/export <path>` | 从 VirtualFS 下载文件 |
| `/schedule` | 管理定时任务 |
| `/auto on\|off` | 切换自主模式 |

## Documentation

- [Architecture](docs/architecture.md) — 源码结构与技术栈
- [Changelog](docs/changelog.md) — 开发历程与里程碑
- [Design](docs/design.md) — 初始设计方案与可行性分析
- [Idea](docs/idea.md) — 项目缘起

## Design Philosophy

> **道器合一** — 以百家智慧驾驭 AI 工具，思行并进，人机协同。

- **简易**：大道至简，浏览器即 Agent
- **变易**：拥抱变化，模块化架构持续演进
- **不易**：坚守质量，参数校验、熔断保护、重复检测

## Author

**Hongxin Zhang** — [github.com/hongxin](https://github.com/hongxin)

## License

MIT
