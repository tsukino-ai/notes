---
title: Gemini CLI 源码解析
date: 2026-05-15
source: https://github.com/google-gemini/gemini-cli
tags:
  - AI编码
  - CLI
  - TypeScript
  - MCP
  - A2A
---

> [📖 中英段落对照阅读](../99-工具与参�?ref-articles/gemini-cli-bilingual.md)

## 项目概览

**Gemini CLI** �?Google 官方开源的终端 AI Agent，将 Gemini 模型能力直接带入命令行。定位是轻量级、可扩展的终端开发助手�?
- **仓库**: https://github.com/google-gemini/gemini-cli
- **Stars**: 103,989 | **Forks**: 13,654 | **Open Issues**: 1,836
- **License**: Apache-2.0
- **版本**: `0.44.0-nightly.20260512.g022e8baef` (npm `@google/gemini-cli`)

## 技术栈

| 维度 | 技�?|
|---|---|
| 语言 | TypeScript (ES Module) |
| 包管�?| npm (monorepo) |
| 构建 | esbuild |
| 运行�?| Node.js |
| 协议 | MCP (Model Context Protocol), A2A (Agent-to-Agent) |

## 目录结构

```
gemini-cli/
├── packages/
�?  ├── a2a-server/          # A2A (Agent-to-Agent) 协议服务�?�?  ├── cli/                 # CLI 主入口，终端交互逻辑
�?  ├── core/                # 核心引擎：工具调用、上下文管理、模型交�?�?  ├── devtools/            # 开发者工具集�?�?  ├── sdk/                 # 对外 SDK
�?  ├── test-utils/          # 测试工具
�?  └── vscode-ide-companion/# VS Code 插件伴侣
├── schemas/                 # JSON Schema 定义
├── tools/                   # 内置工具实现
├── evals/                   # 评估/评测脚本
├── integration-tests/       # 集成测试
├── memory-tests/            # 长上下文/记忆测试
└── sea/                     # Single Executable App (单文件可执行)
```

## 核心入口与公�?API

| 模块 | 入口 | 职责 |
|---|---|---|
| CLI | `packages/cli/dist/index.js` (`gemini` 命令) | 终端 UI、用户输入处理、会话管�?|
| Core | `packages/core/dist/index.js` | 工具编排、LLM 调用、上下文构建 |
| A2A Server | `packages/a2a-server/` | �?Agent 协作协议实现 |
| SDK | `packages/sdk/` | 第三方集成接�?|

## 亮点设计

### 1. A2A (Agent-to-Agent) 协议支持
`packages/a2a-server/` �?Gemini CLI 区别于其�?CLI 工具的关键。它实现�?Google 提出�?Agent 间通信标准，允许多�?Agent 协作完成任务�?
### 2. MCP (Model Context Protocol) 扩展
内置 MCP 支持，可接入自定义工具集成。这是当�?Agent 工具生态的事实标准�?
### 3. 单文件可执行 (SEA)
`sea/` 目录下实现将 Node.js 应用打包为单二进制文件，便于分发和安装�?
### 4. 内置工具�?- Google Search grounding
- 文件操作
- Shell 命令执行
- Web 内容获取

## 待深入研�?
- [ ] `packages/core/` 中的工具调用编排逻辑（Tool Use �?Execution �?Observation 循环�?- [ ] A2A 协议的具体消息格式和状态机实现
- [ ] 长上下文�?M token）的窗口管理和记忆策�?- [ ] SEA 打包技术的实现细节
- [ ] 与已有笔�?[[MCP 核心概念]] 的关�?
## 与知识库的关�?
- [[MCP 核心概念]] �?Gemini CLI �?MCP 生态的重要实现�?- [[Agent 工程/终端 Agent 架构对比]] �?可与 Codex CLI、Kimi CLI 对比架构差异
