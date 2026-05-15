---
title: OpenAI Codex CLI 源码解析
date: 2026-05-15
source: https://github.com/openai/codex
tags:
  - AI编码
  - CLI
  - TypeScript
  - Rust
  - Sandboxing
  - MCP
---

> [📖 中英段落对照阅读](../99-工具与参�?ref-articles/codex-cli-bilingual.md)

## 项目概览

**Codex CLI** �?OpenAI 官方开源的终端编码 Agent，支持本地运行，强调安全沙箱和深�?IDE 集成�?
- **仓库**: https://github.com/openai/codex
- **Stars**: 82,702 | **Forks**: 11,968 | **Open Issues**: 4,318
- **License**: 需查看 LICENSE 文件（OpenAI 通常�?MIT/Apache 变体�?- **包名**: `@openai/codex` (npm), `codex` (Homebrew)

## 技术栈

| 维度 | 技�?|
|---|---|
| 主语言 | TypeScript + Rust |
| 构建 | Bazel (monorepo), Cargo (Rust), pnpm |
| 架构 | Monorepo：codex-cli (TS) + codex-rs (Rust) + SDK |
| 安全 | bwrap (Bubblewrap), Linux Sandbox (Rust), execpolicy |
| 协议 | MCP (rmcp-client), Responses API Proxy |

## 目录结构

```
codex/
├── codex-cli/               # TypeScript CLI 主程�?�?  ├── bin/codex.js         # 入口脚本
�?  ├── cli/                 # 命令行解析与交互
�?  ├── tui/                 # 终端 UI
�?  ├── core/                # 核心逻辑
�?  ├── core-api/            # 核心 API �?�?  ├── core-plugins/        # 插件系统
�?  ├── core-skills/         # 技�?能力定义
�?  ├── tools/               # 工具实现
�?  ├── mcp-server/          # MCP 服务�?�?  ├── sandboxing/          # 沙箱逻辑
�?  ├── shell-command/       # Shell 命令执行
�?  ├── apply-patch/         # 代码补丁应用
�?  ├── file-watcher/        # 文件监听
�?  └── models-manager/      # 模型管理
├── codex-rs/                # Rust 高性能模块
�?  └── (sandbox, exec server)
├── sdk/                     # 对外 SDK
├── app-server/              # 应用服务端（桌面�?云端支持�?├── exec-server/             # 代码执行服务�?├── tools/                   # 工具脚本
├── third_party/             # 第三方依�?└── docs/                    # 文档
```

## 核心入口与公�?API

| 模块 | 入口 | 职责 |
|---|---|---|
| CLI | `codex-cli/bin/codex.js` | 终端启动入口 |
| Core | `codex-cli/core/` | Agent 循环、推理、工具编�?|
| Sandboxing | `codex-cli/sandboxing/` + `codex-rs/` | 命令沙箱、权限控�?|
| Apply Patch | `codex-cli/apply-patch/` | 智能代码 diff 应用 |
| MCP | `codex-cli/mcp-server/`, `rmcp-client/` | 外部工具接入 |

## 亮点设计

### 1. 多层安全沙箱
Codex CLI 的安全架构是其最突出的设计：
- **execpolicy / execpolicy-legacy**: 命令执行策略引擎
- **bwrap (Bubblewrap)**: Linux 命名空间隔离
- **linux-sandbox-rs / windows-sandbox-rs**: 平台原生沙箱
- **process-hardening**: 进程加固

这是所�?CLI Agent 中安全设计最全面的实现�?
### 2. Apply Patch 系统
`apply-patch/` 模块实现了智能代码补丁应用，解决 LLM 生成代码与实际文件合并的冲突问题。支持多�?diff 格式和容错匹配�?
### 3. Responses API Proxy
`responses-api-proxy/` 提供�?OpenAI Responses API 的代理和适配，支持流式处理和工具调用�?
### 4. Agent Graph Store
`agent-graph-store/` 实现 Agent 执行状态的有向图存储，支持复杂多步任务的回溯和恢复�?
### 5. 实时协作 (Realtime WebRTC)
`realtime-webrtc/` 模块支持实时语音/视频协作，这�?Codex 区别于纯文本 CLI 的特色�?
## 待深入研�?
- [ ] `sandboxing/` �?`codex-rs/` 的跨语言沙箱通信机制
- [ ] `apply-patch/` 的模糊匹配算法（如何处理 LLM 生成的错误行号）
- [ ] `agent-graph-store/` 的图遍历和状态恢复策�?- [ ] `exec-server/` 的远程执行架构（是否支持容器化）
- [ ] Bazel monorepo 的构建配置和跨语言链接

## 与知识库的关�?
- [[AI编码/代码沙箱技术]] �?Codex 的沙箱实现是业界标杆
- [[MCP 核心概念]] �?内置 MCP Server �?Client
- [[Agent 工程/终端 Agent 架构对比]] �?�?Gemini CLI、Kimi CLI 的安全模型对�?