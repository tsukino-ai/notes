---
title: Crush 源码解析
date: 2026-05-15
source: https://github.com/charmbracelet/crush
tags:
  - AI编码
  - CLI
  - Go
  - Charm
  - Bubble Tea
  - MCP
  - LSP
---

## 项目概览

**Crush** 是 Charm 团队（Bubble Tea、Gum 等 TUI 工具的开发者）推出的终端 AI 编码助手，前身为 OpenCode。定位是"Industrial Grade"的终端 Agent，基于 Charm 生态构建，支持多模型、LSP 增强、MCP 扩展和企业级会话管理。

- **仓库**: https://github.com/charmbracelet/crush
- **Stars**: 24,289 | **Forks**: 1,679 | **Open Issues**: 424
- **License**: MIT
- **Go 版本**: 1.26.3
- **前身**: [OpenCode](https://github.com/opencode-ai/opencode)（已归档）

## 技术栈

| 维度 | 技术 |
|---|---|
| 语言 | Go 1.26.3 |
| TUI 框架 | [Bubble Tea v2](https://github.com/charmbracelet/bubbletea) (`charm.land/bubbletea/v2`) |
| UI 组件 | [Bubbles v2](https://github.com/charmbracelet/bubbles) (`charm.land/bubbles/v2`) |
| 样式 | [Lipgloss](https://github.com/charmbracelet/lipgloss) (via `charm.land/catwalk`) |
| CLI 解析 | [Fang](https://github.com/charmbracelet/fang) (`charm.land/fang/v2`) |
| 配置 | TOML / JSON |
| 数据库 | SQLite (通过 `sqlc` 生成类型安全的数据库代码) |
| API | HTTP over Unix Socket / Windows Named Pipe |
| 协议 | MCP (`http`, `stdio`, `sse`), LSP |

## 目录结构

```
crush/
├── main.go                  # 入口：启动 CLI + HTTP API Server
├── internal/
│   ├── agent/               # Agent 核心逻辑（推理、工具调用循环）
│   ├── app/                 # 应用生命周期管理
│   ├── backend/             # LLM 后端抽象（多模型路由）
│   ├── client/              # 客户端通信
│   ├── cmd/                 # 命令注册与分发
│   ├── commands/            # 具体命令实现
│   ├── config/              # 配置管理
│   ├── db/                  # 数据库模型与查询（sqlc 生成）
│   ├── diff/                # Diff 计算与渲染
│   ├── diffdetect/          # Diff 检测与变更识别
│   ├── event/               # 事件系统
│   ├── filetracker/         # 文件追踪（哪些文件在上下文中）
│   ├── history/             # 对话历史管理
│   ├── hooks/               # 生命周期钩子（pre/post action）
│   ├── lsp/                 # LSP 客户端集成（语义分析、诊断）
│   ├── message/             # 消息格式化与转换
│   ├── oauth/               # OAuth 认证
│   ├── permission/          # 权限与审批系统
│   ├── projects/            # 项目管理（多项目切换）
│   ├── proto/               # 内部协议定义
│   ├── pubsub/              # 发布-订阅事件总线
│   ├── server/              # HTTP API Server（Unix Socket/Named Pipe）
│   ├── session/             # 会话管理（上下文隔离）
│   ├── shell/               # Shell 命令执行与环境集成
│   ├── skills/              # 技能系统（可复用的 Agent 能力）
│   ├── ui/                  # 终端 UI 层（Bubble Tea 组件）
│   │   ├── agent.go         # Agent 状态展示
│   │   ├── chat/            # 聊天界面
│   │   ├── completions/     # 命令补全
│   │   ├── diffview/        # Diff 可视化
│   │   ├── dialog/          # 对话框/确认框
│   │   ├── model/           # 模型选择器
│   │   └── styles/          # 主题与样式定义
│   ├── workspace/           # 工作区管理
│   └── ...                  # 其他工具模块
├── docs/                    # 文档
├── scripts/                 # 脚本
├── schema.json              # JSON Schema（可能用于配置验证）
├── crush.json               # Crush 项目配置示例
├── sqlc.yaml                # sqlc 数据库代码生成配置
└── Taskfile.yaml            # 任务运行器配置
```

## 核心入口与公共 API

| 模块 | 入口 | 职责 |
|---|---|---|
| CLI | `main.go` → `internal/cmd/` | 程序启动、命令解析、Server 初始化 |
| Agent | `internal/agent/agent.go` | Agent 主循环（观察 → 思考 → 行动） |
| Backend | `internal/backend/backend.go` | 多模型后端统一接口 |
| Session | `internal/session/session.go` | 会话生命周期与上下文管理 |
| Workspace | `internal/workspace/workspace.go` | 工作区隔离与文件管理 |
| UI | `internal/ui/` | Bubble Tea 组件树与事件处理 |
| Server | `internal/server/` | HTTP API（供外部工具/IDE 调用） |
| LSP | `internal/lsp/` | 语言服务器协议客户端 |
| Skills | `internal/skills/skills.go` | 可插拔技能注册与执行 |

## 亮点设计

### 1. Charm 生态全栈 TUI
Crush 是 Charm 生态的"集大成者"：
- **Bubble Tea v2**: Elm 架构的 TUI 框架（Model → Update → View）
- **Bubbles v2**: 现成组件（list, textarea, spinner, progress, viewport 等）
- **Lipgloss/Catwalk**: 声明式样式系统，支持自适应主题
- **Fang**: 配置解析与 CLI 参数绑定

这使得 Crush 的 UI 在所有平台（macOS, Linux, Windows, Android, BSD）上保持一致且高质量的渲染效果。

### 2. LSP-Enhanced 上下文
`internal/lsp/` 实现了完整的 LSP 客户端：
- 连接项目中的语言服务器（gopls, rust-analyzer, tsserver 等）
- 获取语义分析结果（符号定义、类型信息、诊断错误）
- 将 LSP 诊断作为 Agent 上下文的一部分注入 LLM

这比单纯的"读取文件内容"提供更深入的代码理解，是 Crush 区别于多数 CLI Agent 的核心能力。

### 3. Session-Based 架构
`internal/session/` + `internal/workspace/` 实现了严格的多会话隔离：
- 每个项目可维护多个独立会话
- 会话间上下文不泄漏
- 支持会话持久化（通过 `internal/db/` 的 SQLite）
- 可随时切换 LLM 而保留当前会话上下文

这种设计使 Crush 适合长时间、多任务的专业开发工作流。

### 4. 内置 HTTP API Server
`internal/server/` 提供 HTTP API（通过 Unix Socket / Windows Named Pipe）：
```go
// main.go 中的 Swagger 注释
@title Crush API
@description API over Unix socket / Windows named pipe
@BasePath /v1
```
这意味着：
- IDE 插件可以通过本地 API 与 Crush 交互
- 外部工具可以程序化地创建会话、发送消息、获取结果
- 为未来的团队协作/云端部署留下扩展点

### 5. 工业级工程实践
从目录结构和工具链可见：
- **sqlc**: 类型安全的数据库访问（替代 ORM）
- **pubsub**: 内部事件总线解耦模块
- **hooks**: 生命周期钩子支持自定义扩展
- **permission**: 细粒度权限与审批流程
- **filetracker**: 精确的上下文文件追踪（避免超出 token 限制）
- **diff/diffdetect**: 专业的代码变更处理

## 与 OpenCode 的关系

Crush 是 OpenCode 的正统继任者：
- OpenCode (`opencode-ai/opencode`) 已归档
- Charm 团队接手后完全重写，保留了核心理念但工程实践大幅提升
- 从 OpenCode 的"早期实验"升级为"工业级产品"

## 待深入研究

- [ ] `internal/agent/agent.go` 的 Agent 循环架构（是否有类似 ReAct / Plan-Execute 的模式）
- [ ] `internal/backend/backend.go` 的多模型路由策略（如何在中途切换模型）
- [ ] `internal/lsp/` 的 LSP 客户端实现（如何发现、启动、管理语言服务器）
- [ ] `internal/skills/` 的技能注册与调用协议（是否兼容 MCP）
- [ ] `internal/ui/coordinator.go` 的 Bubble Tea 组件协调机制
- [ ] `internal/db/` 的 sqlc 使用模式和数据模型

## 与知识库的关联

- [[AI编码/终端 Agent 架构对比]] — 与 Gemini CLI、Codex CLI、Kimi CLI 的架构差异
- [[MCP 核心概念]] — Crush 的 MCP 支持实现
- [[60-前端/Bubble Tea TUI 框架]] — Charm 生态的核心技术
- [[AI编码/LSP 与 Agent 结合]] — LSP-Enhanced 的设计理念
