---
title: Letta — Memory Blocks：Agent 上下文管理的关键
date: 2026-05-15
source: https://www.letta.com/blog/memory-blocks
tags:
  - LLM基础
  - Agent
  - Memory
  - Context
  - Letta
---

> [📖 中英段落对照阅读](../99-工具与参考/ref-articles/letta-memory-blocks-bilingual.md)

## 核心论点（一句话）

将上下文窗口分解为离散的、功能性的**记忆块（Memory Blocks）**，是管理 LLM Agent 长期记忆和一致性的优雅抽象——Agent 可以读写自己的记忆块，实现真正的自我编辑记忆。

## 关键概念

1. **记忆块（Memory Block）**
   上下文窗口的离散功能单元，包含：
   - Label：标识用途（如 "human", "persona", "knowledge"）
   - Value：字符串表示的块数据
   - Size limit：上下文窗口占用配额
   - Optional description：使用指导

2. **Human Block vs Persona Block**
   - **Human**：存储用户信息、偏好、事实
   - **Persona**：Agent 的自我概念、个性特征、行为准则
   - 两者都可由 Agent 自编辑，但有大小限制

3. **上下文编译（Context Compilation）**
   Letta 在每次 LLM 请求前，从数据库状态"编译"上下文窗口：系统提示 + 记忆块 + 最近消息 + 历史摘要。

4. **多 Agent 共享记忆**
   - 共享知识库（Shared knowledge bases）
   - Sleep-time 计算（Background agents 更新主 Agent 记忆）
   - 协作记忆（Collaborative memory）

5. **Tool-Based Memory Editing**
   Agent 通过工具（如 `core_memory_replace`）主动编辑记忆块，而非被动接受检索结果。

## 作者核心洞察

> "Rather than treating the context window as a monolithic entity, memory blocks break the context window down into manageable, purposeful units."

- **上下文窗口管理直接影响 Agent 性能**：LLM 只能推理它"看到"的信息。
- **结构化上下文 = 可控性**：将上下文分解为有目的的块，开发者可以精确控制 Agent 行为。
- **记忆块值可以是任意字符串**：列表、字典等复杂数据结构都可存储，只要可序列化。

## 适用场景和目标读者

- 需要构建跨会话记忆、个性化交互的 Agent 开发者
- 对 MemGPT 论文感兴趣、想了解其工程化实现的工程师
- 设计多 Agent 系统、需要共享状态的场景

## 与知识库中已有内容的潜在关联

- [[30-Agent工程/架构研究/agent-memory-design-references.md]] — 本文是该笔记的核心参考来源（#3 Memory Blocks）
- [[30-Agent工程/架构研究/Autonomous-Agents.md]] — Memory 章节中提到的记忆流、反思循环可与 Memory Blocks 互补
- [[30-Agent工程/LangGraph/Deep-Agents.md]] — Deep Agents 的 MemoryMiddleware 与 Letta 记忆块是同一设计趋势的不同实现
- [[40-AI编码与源码/2026-05-15-crush-source.md]] — Crush 的 session/workspace 管理也涉及上下文隔离，可与 Memory Blocks 对比
- [[10-LLM基础/2026-05-15-memgpt-towards-llms-as-operating-systems.md]] — Memory Blocks 的理论源头

## 待深入研究

- [ ] Letta 的 Jinja 模板系统：上下文窗口编译时的格式化逻辑
- [ ] `block_id` 的 REST API：外部系统如何查询和修改记忆块
- [ ] Sleep-time Agent 的具体实现：后台反思Agent 如何决定更新哪些记忆块
- [ ] 与 [[RAG 核心概念]] 的融合：Memory Blocks 是否可以取代或增强 RAG？
