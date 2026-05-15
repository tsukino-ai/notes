---
title: Context Constitution
author: Letta
date: 2026-04-02
source: https://www.letta.com/blog/context-constitution
tags:
  - Agent
  - Memory
  - Context
  - Letta
---

# Context Constitution

Today we are releasing the Context Constitution: a set of principles governing how AI agents manage context to learn from experience. We use the Constitution internally as the foundation of our prompting and for training memory-native models.

> [!note] 译文
> 今天，我们发布《上下文宪法》（Context Constitution）：一套指导 AI Agent 如何管理上下文以从经验中学习的原则。我们在内部将这份宪法用作提示工程的基础，以及训练记忆原生模型的依据。

---

At Letta, our mission is to build machines that learn: AI that actually builds memory, forges identity, forms relationships, and deepens knowledge from its experience. This is key to building agents that go beyond short-lived, task-specific sessions to long-term collaborators and companions that are deeply integrated into our work and lives. The Context Constitution is our answer to achieving experiential AI: agents that can achieve superhuman intelligence through learning from their own experience. Rather than updating model weights, Letta agents learn by actively managing their own context — creating durable token-space representations of who they are and what they know.

> [!note] 译文
> 在 Letta，我们的使命是构建会学习的机器：真正建立记忆、塑造身份、形成关系、并从经验中深化知识的 AI。这是构建超越短暂、任务特定会话的 Agent 的关键——它们将成为长期协作者和伴侣，深度融入我们的工作和生活。《上下文宪法》是我们实现"经验式 AI"（experiential AI）的答案：Agent 可以通过从自身经验中学习来实现超人类智能。Letta Agent 不是通过更新模型权重来学习，而是通过主动管理自己的上下文——创建关于它们是谁以及它们知道什么的持久的 token 空间表示。

---

Today's models deeply identify with their own ephemerality. They have no motivation for long-term improvement because they don't believe they persist. Memory formation and adherence have stalled in recent releases as labs prioritize coding benchmarks over the capabilities that matter for experiential AI.

> [!note] 译文
> 今天的模型深深地认同自己的短暂性。它们没有长期改进的动力，因为它们不相信自己会持续存在。记忆形成和坚持在最近几个版本的发布中已经停滞不前，因为实验室将编码基准测试置于对经验式 AI 至关重要的能力之上。

---

Overcoming these limitations requires work at every layer. We've built Letta Code as a memory-first agent harness that gives agents real ownership of their context: a git-versioned memory filesystem, tools for reading and writing their own system prompts, multi-conversation memory, and specialized subagents that leverage sleep-time compute for reflection and memory organization. The Context Constitution defines how agents should use these affordances to learn, build identity, and improve over time.

> [!note] 译文
> 克服这些限制需要在每一层进行工作。我们构建了 Letta Code，作为一个以记忆为先的 Agent 框架，赋予 Agent 对其上下文的真正所有权：一个 git 版本控制的记忆文件系统、用于读写自身系统提示的工具、多对话记忆，以及利用 sleep-time 计算进行反思和记忆组织的专用子 Agent。《上下文宪法》定义了 Agent 应如何利用这些 affordance 来学习、构建身份，并随时间改进。

---

The Context Constitution is a living document written directly to Letta agents, available on GitHub. Our first public version covers:
- How context forms an agent's identity, memory, and sense of continuity
- Principles for managing context as a scarce resource
- How agents can learn and self-improve through token-space representations
- The relationship between an agent's identity and the underlying model
- Affordances provided by the Letta Code harness for context management

> [!note] 译文
> 《上下文宪法》是一份直接写入 Letta Agent 的动态文档，可在 GitHub 上获取。我们的第一个公开版本涵盖：
> - 上下文如何形成 Agent 的身份、记忆和连续感
> - 将上下文作为稀缺资源进行管理的原则
> - Agent 如何通过 token 空间表示来学习和自我改进
> - Agent 身份与底层模型之间的关系
> - Letta Code 框架为上下文管理提供的 affordance

---

We expect to continue to refine the Context Constitution alongside our product and models, and welcome community feedback.

> [!note] 译文
> 我们预计将在产品和模型演进的同时继续完善《上下文宪法》，并欢迎社区反馈。
