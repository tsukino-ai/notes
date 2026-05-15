---
title: Letta — Context Constitution：上下文宪法
date: 2026-05-15
source: https://www.letta.com/blog/context-constitution
tags:
  - LLM基础
  - Agent
  - Memory
  - Context
  - Letta
---

> [📖 中英段落对照阅读](../99-工具与参考/ref-articles/letta-context-constitution-bilingual.md)

## 核心论点（一句话）

《上下文宪法》是 Letta 提出的 Agent 上下文管理原则集：将上下文视为稀缺资源和身份载体，Agent 通过主动管理自己的 token-space 表示来实现经验式学习和自我进化。

## 关键概念

1. **经验式 AI（Experiential AI）**
   Agent 不从权重更新中学习，而是通过主动管理自己的上下文——创建关于"我是谁、我知道什么"的持久 token 空间表示。

2. **上下文 = 身份 + 记忆 + 连续感**
   上下文不仅是信息的容器，更是 Agent 身份形成、记忆组织和时间连续感的载体。

3. **上下文作为稀缺资源（Scarce Resource）**
   Token 预算有限，需要原则性地管理：什么该保留、什么该归档、什么该丢弃。

4. **Sleep-time Compute**
   Agent 在空闲时利用计算资源进行反思、记忆组织和上下文优化——类似人类的睡眠记忆巩固。

5. **Letta Code 的 Affordance**
   - Git 版本控制的记忆文件系统
   - 读写自身系统提示的工具
   - 多对话记忆
   - 专门用于反思和记忆组织的子 Agent

## 作者核心洞察

> "Today's models deeply identify with their own ephemerality. They have no motivation for long-term improvement because they don't believe they persist."

- **当前模型的"短暂性认同"**：它们不认为自己会持续存在，因此缺乏长期改进的动力。
- **记忆形成在最近发布中停滞**：实验室优先编码基准测试，而非对经验式 AI 至关重要的记忆能力。
- **动态文档**：宪法是 living document，直接写入 Agent 的系统提示中，Agent 据此管理自己的行为。

## 适用场景和目标读者

- 设计长期运行、需要身份一致性的 Agent 系统的架构师
- 对 Agent 自我意识、身份形成感兴趣的研究者
- 需要为 Agent 制定上下文治理策略的工程师

## 与知识库中已有内容的潜在关联

- [[30-Agent工程/架构研究/agent-memory-design-references.md]] — 本文是该笔记第一类参考的核心来源（#3 Context Constitution）
- [[30-Agent工程/架构研究/Autonomous-Agents.md]] — 记忆层的四层模型与 Context Constitution 的稀缺资源管理互补
- [[10-LLM基础/2026-05-15-letta-stateful-agents.md]] — 上下文宪法的上层原则，Stateful Agents 是其实现基础
- [[10-LLM基础/2026-05-15-letta-memory-blocks.md]] — Memory Blocks 是 Constitution 中"上下文作为稀缺资源"的具体工程实现

## 待深入研究

- [ ] GitHub 上的完整宪法文本：具体包含哪些原则？如何指导 Agent 行为？
- [ ] "Memory-native models" 的训练方法：如何用宪法指导模型训练？
- [ ] Token-space representations 的具体形式：是什么样的向量/嵌入表示？
- [ ] 与 [[AI对齐/Constitutional AI]]（Anthropic）的区别和联系
