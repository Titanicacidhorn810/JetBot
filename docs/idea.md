# JetBot — Project Origin

> 2026-03-16

## The Idea

基于 TrueConsole（Rust 实现的 AI Agent）的成功经验，启动 JetBot 项目：

- **核心思路**：将 TrueConsole 的 Agent 执行逻辑用 TypeScript 重新实现，编译为 JavaScript，直接在浏览器中运行
- **关键突破**：无需安装、无需部署——打开网页即用，甚至可在微信浏览器中运行
- **战略价值**：零门槛使用，便于快速扩展影响力

## Design References

| Project | What to Learn |
|---------|---------------|
| **TrueConsole** | Agent 核心逻辑：Agentic Loop、熔断器、Context Manager、Skill 系统 |
| **ZeroClaw** | 架构分层思想 |
| **NanoClaw** | TypeScript 实现参考 |

## Core Bet

> 浏览器的能力已经足够承载一个完整的 AI Agent——
> IndexedDB 做文件系统，fetch 调 LLM API，Canvas 做可视化。
> 唯一需要的外部依赖是一个 LLM API endpoint。

See [design.md](design.md) for the full feasibility analysis and architecture design.
