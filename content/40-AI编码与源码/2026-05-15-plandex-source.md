---
title: Plandex 源码解析
date: 2026-05-15
source: https://github.com/plandex-ai/plandex
tags:
  - AI编码
  - CLI
  - Go
  - Plan-based
  - Client-Server
---

> [📖 中英段落对照阅读](../99-工具与参考/ref-articles/plandex-bilingual.md)

## 项目概览

**Plandex** 是专为大型项目和真实世界任务设计的开源 AI 编码 Agent。与大多数"单文件即时编辑"的 CLI 工具不同，Plandex 采用 **Plan-based** 工作流：先生成任务计划，再逐步执行，适合复杂的跨文件重构。

- **仓库**: https://github.com/plandex-ai/plandex
- **Stars**: 15,363 | **Forks**: 1,133 | **Open Issues**: 58
- **License**: 需查看 LICENSE 文件
- **Go 版本**: 1.23.3

## 技术栈

| 维度 | 技术 |
|---|---|
| 语言 | Go 1.23.3 |
| 架构 | Client-Server（可本地或远程部署） |
| 模块 | `plandex-cli`, `plandex-server`, `plandex-shared` |
| 数据库 | 支持 PostgreSQL（从 migrations/ 推断） |
| 容器 | Docker + docker-compose |
| 代理 | litellm_proxy.py（多模型路由） |

## 目录结构

```
plandex/
├── app/
│   ├── cli/                 # Go CLI 客户端
│   │   ├── main.go          # 入口
│   │   └── go.mod (plandex-cli)
│   ├── server/              # Go 服务端
│   │   ├── main.go          # 入口
│   │   ├── go.mod (plandex-server)
│   │   ├── db/              # 数据库模型与连接
│   │   ├── handlers/        # HTTP API 处理器
│   │   ├── routes/          # 路由定义
│   │   ├── model/           # 业务模型
│   │   ├── migrations/      # 数据库迁移
│   │   ├── syntax/          # 语法分析（代码解析）
│   │   ├── diff/            # Diff 引擎
│   │   ├── hooks/           # 生命周期钩子
│   │   ├── notify/          # 通知系统
│   │   └── email/           # 邮件服务
│   ├── shared/              # 共享库
│   │   └── go.mod (plandex-shared)
│   └── plans/               # 计划模板/示例
├── docs/                    # 文档
├── releases/                # 发布产物
└── scripts/                 # 脚本
```

## 核心入口与公共 API

| 模块 | 入口 | 职责 |
|---|---|---|
| CLI | `app/cli/main.go` | 终端交互、本地文件操作、与服务端通信 |
| Server | `app/server/main.go` | 计划生成、任务编排、模型调用、状态持久化 |
| Shared | `app/shared/` | 数据类型、工具函数、协议定义 |
| Syntax | `app/server/syntax/` | 多语言代码解析和符号提取 |
| Diff | `app/server/diff/` | 代码变更计算与应用 |

## 亮点设计

### 1. Plan-based 工作流
Plandex 的核心差异化设计：
1. **理解**: 分析用户目标和代码库上下文
2. **规划**: 生成详细的执行计划（跨文件修改步骤）
3. **执行**: 按 plan 逐步调用 LLM 生成代码
4. **验证**: 应用变更前展示 diff，用户确认后写入

这种模式比"单轮对话直接改文件"更适合大型重构，降低了幻觉和破坏性修改的风险。

### 2. Client-Server 架构
大多数 CLI Agent 是纯客户端（直接调用 LLM API），而 Plandex 支持分离部署：
- **CLI**: 轻量级客户端，负责文件 I/O 和用户交互
- **Server**: 可独立部署的服务，承载计划生成、状态管理、模型调度

这意味着团队可以共享一个 Plandex Server，统一管理 API Key、使用配额和计划历史。

### 3. 语法感知 (Syntax)
`app/server/syntax/` 目录实现代码解析，支持精确的词法/语法分析。这用于：
- 准确的代码分割和上下文提取
- 避免在字符串/注释中错误匹配代码
- 生成更高质量的 repo map

### 4. 数据库持久化
Server 端使用数据库存储：
- 用户计划历史
- 多步骤任务的中间状态
- 项目配置和上下文缓存

这使得 Plandex 更像一个"有状态的 Agent 服务"而非无状态的 CLI 工具。

### 5. Multi-model Proxy
`litellm_proxy.py` 提供多模型路由，可在不同任务步骤中切换模型（如用轻量模型做计划，用强模型做代码生成）。

## 待深入研究

- [ ] `app/server/syntax/` 的语法解析器设计（是否基于 tree-sitter）
- [ ] `app/server/diff/` 的变更应用引擎（如何处理多文件原子性）
- [ ] Plan 的数据结构和状态机（Plan → Step → Task → Execution）
- [ ] CLI 与 Server 的通信协议（gRPC / REST / WebSocket）
- [ ] `app/server/handlers/` 的 API 设计（是否支持团队协作）

## 与知识库的关联

- [[AI编码/Plan-based Agent 设计]] — Plandex 是这一模式的典型实现
- [[Agent 工程/终端 Agent 架构对比]] — 唯一采用 Client-Server 架构的 CLI Agent
- [[后端/Go 微服务设计]] — Server 端的模块化 Go 架构参考
