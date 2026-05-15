---
title: "Stateful Agents: The Missing Link in LLM Intelligence"
author: Letta
date: 2025-02-06
source: https://www.letta.com/blog/stateful-agents
tags:
  - Agent
  - Memory
  - Context
  - Letta
---

# Stateful Agents: The Missing Link in LLM Intelligence

Large language models possess vast knowledge, but they're trapped in an eternal present moment. While they can draw from the collected wisdom of the internet, they can't form new memories or learn from experience: beyond their weights, they are completely stateless. Every interaction starts anew, bound by the static knowledge captured in their weights. As a result, most "agents" are more akin to LLM-based workflows, rather than agents in the traditional sense.

> [!note] 译文
> 大语言模型拥有广博的知识，但它们被困在永恒的当下。虽然它们可以从互联网的集体智慧中汲取信息，却无法形成新的记忆或从经验中学习：除了权重中的知识外，它们完全是无状态的。每次交互都重新开始，受限于权重中捕获的静态知识。因此，大多数"Agent"更像是基于 LLM 的工作流，而非传统意义上的 Agent。

---

The next major advancement in AI won't come from larger models or more training data, but from agents that can actually learn from experience. This post introduces "stateful agents": AI systems that maintain persistent memory and actually learn during deployment, not just during training.

> [!note] 译文
> AI 的下一个重大进步不会来自更大的模型或更多的训练数据，而是来自能够真正从经验中学习的 Agent。本文介绍"有状态 Agent（stateful agents）"：在部署期间实际学习、而不仅仅在训练期间学习的 AI 系统。

---

## The Fundamental Limitation of LLMs

The only information an LLM has is what is baked into its weights, and what is in its context window. This is why most "agents" today are essentially stateless workflows: they have no way to persist interactions beyond what fits into the context window.

> [!note] 译文
> LLM 唯一拥有的信息是烘焙进其权重中的知识，以及其上下文窗口中的内容。这就是为什么今天大多数"Agent"本质上都是无状态工作流：它们无法将交互持久化到超出上下文窗口容纳范围之外。

---

## Why Current Memory Approaches Fall Short?

**Context Pollution** Most approaches to memory today rely on rudimentary retrieval mechanisms (e.g. embedding-based RAG) that pollute the context with irrelevant information. "Context pollution" from RAG-based memory is particularly problematic as it can degrade agent performance. Recently released "reasoning models" explicitly discourage developers from adding excessive in-context learning (ICL) examples or data retrieved via RAG. These newer models benefit from simpler, shorter prompts: making stuffing the context window with potentially relevant "memories" even more of an insufficient solution.

> [!note] 译文
> **上下文污染**：今天大多数记忆方法依赖于原始的检索机制（例如基于嵌入的 RAG），这些机制会用无关信息污染上下文。基于 RAG 的记忆造成的"上下文污染"尤其成问题，因为它会降低 Agent 性能。最近发布的"推理模型"明确不鼓励开发者在上下文中添加过多的 ICL 示例或通过 RAG 检索的数据。这些新模型受益于更简单、更短的提示：这使得用可能相关的"记忆"塞满上下文窗口成为一种更加不足的解决方案。

---

**Lack of Memory Consolidation** Forming memory is an iterative process: whether its reviewing lecture notes or thinking back on what we should have said during that argument, our brains spend significant energy deriving new insights from past information. Unlike us, agents don't spend downtime reflecting on their memories.

> [!note] 译文
> **缺乏记忆巩固**：形成记忆是一个迭代过程：无论是复习课堂笔记还是回想我们在那次争论中应该说什么，我们的大脑都会花费大量能量从过去的信息中推导出新见解。与我们不同，Agent 不会利用空闲时间反思它们的记忆。

---

**Stateless Abstractions** LLM APIs and agentic frameworks that are built around the assumption of statelessness. State is assumed to be limited to the duration of ephemeral sessions and threads, baking in the assumption that agents are and always be stateless. "Memory" in these systems is an add-on bandaid, rather than a fundamental part of the system.

> [!note] 译文
> **无状态抽象**：LLM API 和 Agent 框架都是围绕无状态的假设构建的。状态被假定仅限于短暂会话和线程的持续时间内，这固化了"Agent 是无状态的且永远如此"的假设。这些系统中的"记忆"只是一个附加的创可贴，而非系统的根本组成部分。

---

## What makes an agent stateful?

A stateful agent has an inherent concept of experience. Its state represents the accumulation of all past interactions, processed into meaningful memories that persist and evolve over time. This goes far beyond just having access to a message history or knowledge base. Key characteristics include:
- A persistent identity providing continuity across interactions
- Active formation and updating of memories based on experiences
- Learning via accumulating state that influences future behavior

> [!note] 译文
> 有状态 Agent 具有经验的内在概念。它的状态代表所有过去交互的积累，被处理成随时间持续和演化的有意义记忆。这远远超出了仅仅拥有消息历史或知识库的访问权限。关键特征包括：
> - 提供跨交互连续性的持久身份
> - 基于经验主动形成和更新记忆
> - 通过积累影响未来行为的状态来学习

---

## The Technical Challenge: Context Window Management

The performance of stateful agents depends heavily on how we compile accumulated state into the limited context window. This isn't just about token fitting and prompt engineering - it's about meaningful representation of learned experience. We're seeing advances in:

> [!note] 译文
> 有状态 Agent 的性能在很大程度上取决于我们如何将积累的状态编译到有限的上下文窗口中。这不仅仅是关于 token  fitting 和提示工程——而是关于学习经验的有意义表示。我们正在看到以下方面的进展：

---

Tool-based memory management allowing agents to decide what information to retrieve (e.g. MemGPT) to ensure relevant context

> [!note] 译文
> **基于工具的记忆管理**：允许 Agent 决定检索什么信息（例如 MemGPT），以确保上下文的 relevance。

---

Agents specialized for context management Using agents themselves to manage their own context window by writing to in-context memory, or even using an external agent specialized in memory management to do this (via multi-agent)

> [!note] 译文
> **专门用于上下文管理的 Agent**：让 Agent 自己通过写入上下文内记忆来管理自己的上下文窗口，甚至使用专门从事记忆管理的外部 Agent 来做到这一点（通过多 Agent）。

---

Reasoning & inference-time compute Scaling inference time compute and reasoning allows agents to learn more effectively, as they can derive the most important insights from data which they save to context

> [!note] 译文
> **推理与推理时计算**：扩展推理时计算和推理能力使 Agent 能够更有效地学习，因为它们可以从数据中推导出最重要的见解，并将其保存到上下文中。

---

## Introducing Letta: A Framework for Stateful Agents

At Letta, we've built the first comprehensive framework for creating and deploying stateful agents.

> [!note] 译文
> 在 Letta，我们构建了第一个用于创建和部署有状态 Agent 的综合框架。

---

**State Architecture**
Letta manages persistence of state for long running agents, including components for:
In-context memory Persistent memory blocks across LLM requests
External memory Automatic recall memory for interaction history and general-purpose archival memory storage
Multi-agent orchestration Built-in mechanisms for communication and sharing state for multi-agent
In Letta, all state (including memory blocks) is queryable via our REST API.

> [!note] 译文
> **状态架构**
> Letta 管理长期运行 Agent 的状态持久化，包括以下组件：
> - **上下文内记忆（In-context memory）**：跨 LLM 请求的持久记忆块
> - **外部记忆（External memory）**：用于交互历史的自动召回记忆，以及通用归档记忆存储
> - **多 Agent 编排**：用于多 Agent 通信和状态共享的内置机制
> 在 Letta 中，所有状态（包括记忆块）都可通过 REST API 查询。

---

**Automated Context Management**
Letta manages the context window automatically, which is composed of:
- Read-only system prompts for core instructions
- Editable memory blocks for learned information
- Metadata about memories stored externally
- Recent messages for immediate context
- A summary of historical messages not included

> [!note] 译文
> **自动上下文管理**
> Letta 自动管理上下文窗口，它由以下部分组成：
> - 用于核心指令的只读系统提示
> - 用于学习信息的可编辑记忆块
> - 关于外部存储记忆的元数据
> - 用于即时上下文的最近消息
> - 未包含在内的历史消息摘要

---

## The Future of AI is Stateful

The next generation of AI applications won't just access static knowledge - they'll learn continuously, form meaningful memories, and develop deeper understanding through experience. This represents a fundamental shift from treating LLMs as a component of a stateless workflow, to building agentic systems that truly learn from experience.

> [!note] 译文
> AI 的未来是有状态的。下一代 AI 应用将不仅仅是访问静态知识——它们将持续学习、形成有意义的记忆，并通过经验发展更深入的理解。这代表了一个根本性转变：从将 LLM 视为无状态工作流的组件，转向构建真正从经验中学习的 Agent 系统。

---

**What This Enables**
- Personalized interactions that improve over time
- Agents that learn from feedback and adjust behavior
- Long-term relationship building between users and agents
- Continuous improvement without retraining

> [!note] 译文
> **这带来了什么**
> - 随时间改善的个性化交互
> - 从反馈中学习并调整行为的 Agent
> - 用户与 Agent 之间长期关系的建立
> - 无需重新训练的持续改进
