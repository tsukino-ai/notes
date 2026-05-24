---
title: Claude Code 源码学习生态
author: Windy3f3f3f3f / davidweidawang / lintsinghua
date: 2026-05-24
source:
  - https://github.com/Windy3f3f3f3f/how-claude-code-works
  - https://github.com/Windy3f3f3f3f/claude-code-from-scratch
  - https://github.com/lintsinghua/claude-code-book
tags:
  - AI Coding
  - Claude Code
  - Agent
  - 源码学习
  - MCP
  - TypeScript
---

> 本文档汇总了三个围绕 Claude Code 源码的社区学习项目，构成从"读懂架构"→"动手复现"→"系统书籍"的完整学习路径。
> 
> 配套原始仓库已保存至：
> - `_refs/repos/how-claude-code-works/`
> - `_refs/repos/claude-code-from-scratch/`
> - `_refs/repos/claude-code-book/`

---

## 三个项目速览

| 项目 | 定位 | Stars | Forks | 形式 | 核心价值 |
|------|------|-------|-------|------|----------|
| [how-claude-code-works](https://github.com/Windy3f3f3f3f/how-claude-code-works) | 源码架构深度解析 | 2,442 | 580 | 15 篇专题文档 | 从 50 万行源码中提炼关键设计决策 |
| [claude-code-from-scratch](https://github.com/Windy3f3f3f3f/claude-code-from-scratch) | 从零复现核心架构 | 1,253 | 374 | 13 章分步教程 + ~4,300 行代码 | 用最小代码理解 coding agent 精髓 |
| [claude-code-book](https://github.com/lintsinghua/claude-code-book) | 系统性书籍 | 3,381 | 729 | 42 万字，15 章 + 4 附录 | 建立可迁移到任何 Agent 框架的心智模型 |

> 数据更新时间：2026-05-24，来自 GitHub API 实时查询。

---

## 1. how-claude-code-works — 读懂架构

https://github.com/Windy3f3f3f3f/how-claude-code-works

### 项目定位

从 Claude Code 50 万行 TypeScript 源码中提炼出的 **15 篇专题文档**，覆盖从核心循环到安全防护的每一个关键设计决策。这不是使用教程，而是**面向开发者的源码架构分析**。

### 15 篇专题文档

| # | 专题 | 核心内容 |
|---|------|----------|
| 1 | 概述 | 技术选型（Bun/React/Zod）、6 条设计原则、9 阶段 235ms 启动流程 |
| 2 | 系统主循环 | 双层 Agent 循环、7 种 Continue Sites 故障恢复、工具预执行 |
| 3 | 上下文工程 | 4 级压缩流水线完整细节、压缩后自动恢复 5 个文件 |
| 4 | 工具系统 | 66 个工具注册与并发、MCP 7 种传输、OAuth 2.0 + PKCE |
| 5 | 技能系统 | 6 层来源与优先级、Inline/Fork 双执行模式、Token 预算分配 |
| 6 | 记忆系统 | 4 种记忆类型、Sonnet 语义召回、后台记忆提取 Agent |
| 7 | Hooks 与可扩展性 | 23+ Hook 事件、5 种类型、6 阶段执行管道 |
| 8 | 多 Agent 架构 | 子 Agent / 协调器 / Swarm 三种模式、Git Worktree 隔离 |
| 9 | Plan 模式 | 5 阶段与迭代双工作流、附件节流、计划文件恢复 |
| 10 | 代码编辑策略 | search-and-replace 为什么比整文件重写更好、抗幻觉设计 |
| 11 | 任务管理系统 | 文件级存储与并发锁、三层变更检测、依赖追踪 |
| 12 | 权限与安全 | 5 层纵深防御、tree-sitter AST + 23 项安全检查、200ms 防误触 |
| 13 | 系统提示词设计 | 7 层递进式架构、反模式接种、爆炸半径风险框架 |
| 14 | 用户体验设计 | 自研 Ink 渲染器、Yoga Flexbox、虚拟滚动与对象池 |
| 15 | 最小必要组件 | 7 个最小必要组件框架、从 500 行到 50 万行的演进路线 |

### 关键设计亮点（来自源码分析）

1. **为什么 Claude Code 感觉快？**
   - 全链路流式输出
   - 工具预执行（模型还在输出时就开始解析执行工具调用）
   - 9 阶段并行启动，关键路径压到 ~235ms

2. **4 级渐进式上下文压缩**
   - L1 裁剪 → L2 去重 → L3 折叠 → L4 摘要
   - 压缩后自动恢复最近编辑的 5 个文件内容

3. **5 层纵深安全防御**
   - 权限模式 → 规则匹配 → Bash AST 分析（23 项检查）→ 用户确认（200ms 防抖）→ Hook 校验

4. **66 个工具的协同**
   - 统一接口规范，第三方工具与内置工具走相同流水线
   - 只读工具自动并行，写操作自动串行
   - 输出超 100K 自动落盘，模型只拿到摘要

---

## 2. claude-code-from-scratch — 动手复现

https://github.com/Windy3f3f3f3f/claude-code-from-scratch

### 项目定位

用 **~4,300 行代码**（TypeScript + Python 双版本）从零复现 Claude Code 核心架构的分步教程。每章贴真实代码 + 源码对照。

### 13 章教程

| 阶段 | 章节 | 对应源码文件 |
|------|------|-------------|
| **Phase 1: 构建可用 Agent** | | |
| | 1. Agent Loop | `agent.ts` ↔ `query.ts` |
| | 2. 工具系统 | `tools.ts` ↔ `Tool.ts` + 66 工具 |
| | 3. System Prompt | `prompt.ts` ↔ `prompts.ts` |
| | 4. CLI 与会话 | `cli.ts` ↔ `cli.tsx` |
| | 5. 流式输出 | `agent.ts` ↔ `api/claude.ts` |
| | 6. 权限与安全 | `tools.ts` ↔ `permissions/` |
| | 7. 上下文管理 | `agent.ts` ↔ `compact/` |
| **Phase 2: 进阶能力** | | |
| | 8. 记忆系统 | `memory.ts` ↔ `memory.ts` |
| | 9. 技能系统 | `skills.ts` ↔ `SkillTool/` |
| | 10. Plan Mode | `agent.ts` ↔ `EnterPlanMode` |
| | 11. 多 Agent | `subagent.ts` ↔ `AgentTool/` |
| | 12. MCP 集成 | `mcp.ts` ↔ `mcpClient.ts` |
| | 13. 架构对比 | 全局对比 + 扩展方向 |

### 核心能力一览

- **Agent 循环**：自动调用工具、处理结果、持续迭代
- **13 个工具**：读写编辑、搜索、Shell、WebFetch、ToolSearch、技能、子 Agent、Plan Mode
- **流式输出**：Anthropic + OpenAI 双后端，streaming 工具早期执行
- **并行工具执行**：只读工具自动并发，2-3x 加速
- **4 层上下文压缩**：budget 截断 → stale snip → microcompact → auto-compact
- **权限系统**：5 种模式 + 声明式 allow/deny 规则 + 16 个危险命令正则
- **记忆系统**：4 类型 + 语义召回 + 异步预取
- **技能系统**：`.claude/skills/` 目录加载，inline/fork 双模式
- **多 Agent**：Sub-Agent fork-return 模式
- **MCP 集成**：JSON-RPC over stdio

---

## 3. claude-code-book — 系统书籍

https://github.com/lintsinghua/claude-code-book

### 项目定位

**42 万字系统性书籍**，不从 API 使用角度，而从"为什么这样设计"的架构分析角度，建立可迁移到任何 Agent 框架的心智模型。包含 139 张 Mermaid 架构图。

> 声明：本书基于 Claude Code 公开文档和产品行为的架构分析编写，未引用任何未公开源码。

### 四大部分结构

| Part | 主题 | 章节 | 核心内容 |
|------|------|------|----------|
| **Part 1: 基础篇** | 建立心智模型 | Ch01-04 | 编程范式转移、对话循环、工具系统、权限管线 |
| **Part 2: 核心系统篇** | 深入子系统 | Ch05-08 | 配置、记忆、上下文管理、钩子系统 |
| **Part 3: 高级模式篇** | 组合与扩展 | Ch09-12 | 子智能体 Fork、协调器编排、技能插件、MCP 桥接 |
| **Part 4: 工程实践篇** | 原理到构建 | Ch13-15 | 流式架构优化、Plan 模式、构建自己的 Harness |

### 附录速查

| 附录 | 内容 |
|------|------|
| A | 架构导航地图 — 16 个核心模块、依赖树、6 条数据流路径 |
| B | 工具完整清单 — 50+ 工具 × 12 类 |
| C | 功能标志速查表 — 89 个 Flag × 13 类 |
| D | 术语表 — 100 条中英对照术语 |

### 核心设计洞察

- **对话循环 = Agent 的心跳**：`while(true)` 异步生成器主循环，五种 yield 事件，十种终止原因
- **工具系统 = Agent 的双手**：`Tool<I,O,P>` 五要素协议，`buildTool` 故障安全工厂
- **权限管线 = Agent 的护栏**：四阶段管线，推测性分类器 2 秒 Promise.race
- **上下文管理 = Agent 的工作记忆**：有效窗口公式，断路器模式，四级渐进压缩
- **子智能体 Fork = 上下文继承**：字节级上下文继承，递归 Fork 防护

---

## 推荐学习路径

### 路径 A：快速了解（1-2 天）

1. 读 `how-claude-code-works` 的 [概述](_refs/repos/how-claude-code-works/docs/01-overview.md) + [主循环](_refs/repos/how-claude-code-works/docs/02-agent-loop.md) + [上下文工程](_refs/repos/how-claude-code-works/docs/03-context-engineering.md)
2. 浏览 `claude-code-book` 的 Part 1（Ch01-04）

### 路径 B：动手复现（1-2 周）

1. 先读 `how-claude-code-works` 的对应专题
2. 跟着 `claude-code-from-scratch` 的 13 章教程写代码
3. 每章完成后对照 `claude-code-book` 的相关章节深化理解

### 路径 C：系统研究（2-3 周）

1. 通读 `claude-code-book` 全书
2. 遇到具体实现细节时，翻到 `how-claude-code-works` 对应专题
3. 想动手验证时，参考 `claude-code-from-scratch`

---

## 核心概念对照表

| 概念 | how-claude-code-works | claude-code-from-scratch | claude-code-book |
|------|----------------------|--------------------------|------------------|
| Agent 循环 | 双层架构 + 7 种恢复 | `agent.ts` 核心循环 | 异步生成器 + 五种 yield |
| 上下文压缩 | 4 级渐进式压缩 | 4 层压缩 + 大结果持久化 | Snip→MicroCompact→Collapse→AutoCompact |
| 权限系统 | 5 层纵深防御 | 5 种模式 + 声明式规则 | 四阶段管线 + 推测分类器 |
| 工具系统 | 66 工具统一接口 | 13 工具 + mtime 防护 | 50+ 工具 × 12 类 |
| 记忆系统 | 4 类型 + 语义召回 | 4 类型 + sideQuery | 封闭式分类 + Fork 记忆 |
| 多 Agent | 子/协调器/Swarm | Sub-Agent fork-return | Fork 字节级继承 + 协调器 |
| MCP | 7 种传输 + OAuth | JSON-RPC over stdio | 8 种传输 + Bridge 双向通信 |
| Plan 模式 | 5 阶段 + 迭代 | 只读规划 + 4 选项审批 | "先想后做"哲学 + 三层恢复 |

---

## 与知识库已有内容的关联

- [[claude-code-source-analysis]] — 基于泄露源码的直接目录结构分析（互补：已有笔记侧重"源码长什么样"，这三个项目侧重"为什么这样设计"和"怎么动手复现"）
- [[30-Agent工程/架构研究/agent-memory-design-references|agent-memory-design-references]] — 记忆系统设计可交叉对照
- [[30-Agent工程/架构研究/agents-course-framework-guide|agents-course-framework-guide]] — Agent 框架通用设计模式对照
- [[99-工具与参考/ref-articles/agent-harness-engineering-survey-bilingual|agent-harness-engineering-survey]] — Agent Harness 工程化综述

---

## 待深入研究的问题

1. **Claude Code 的 4 级压缩与 Mini 版的 4 层压缩实现差异**：生产级 vs 教学级的权衡
2. **Bash AST 分析的 23 项安全检查具体实现**：tree-sitter 语法树的遍历策略
3. **MCP 7/8 种传输协议的详细对比**：stdio / SSE / HTTP / WebSocket / 等
4. **子 Agent Fork 的字节级上下文继承机制**：内存复制的具体实现
5. **推测性权限分类器的 2 秒 Promise.race 设计**：误报率与用户体验的权衡
6. **Ink 渲染器的 Yoga Flexbox 实现细节**：终端中的布局计算
7. **System Prompt 的 7 层递进式架构**：每层提示词的具体内容和注入时机
8. **Hooks 系统的 6 阶段执行管道**：事件传播顺序和优先级
9. **Claude Code 与 Mini 版在并发控制上的差异**：生产级的更精细控制策略
10. **从 500 行到 50 万行的演进路径**：哪些设计决策导致了代码量的爆炸

---

## 数据说明

| 指标 | 数值 | 来源 |
|------|------|------|
| how-claude-code-works Stars | 2,442 | GitHub API |
| how-claude-code-works Forks | 580 | GitHub API |
| claude-code-from-scratch Stars | 1,253 | GitHub API |
| claude-code-from-scratch Forks | 374 | GitHub API |
| claude-code-book Stars | 3,381 | GitHub API |
| claude-code-book Forks | 729 | GitHub API |
| claude-code-book Open Issues | 14 | GitHub API |
| Claude Code 源码总行数 | 512,000+ | how-claude-code-works README |
| 复现代码量 | ~4,300 行 (TS) / ~3,800 行 (Python) | claude-code-from-scratch README |
| 书籍字数 | 42 万字 | claude-code-book README |
| 架构图数量 | 139 张 | claude-code-book README |
