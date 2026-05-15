---
title: "Memory Blocks: The Key to Agentic Context Management"
author: Letta
date: 2025-05-14
source: https://www.letta.com/blog/memory-blocks
tags:
  - Agent
  - Memory
  - Context
  - Letta
---

# Memory Blocks: The Key to Agentic Context Management

Large language models (LLMs) face a fundamental constraint: they can only "see" what's in their immediate context window. This limitation creates a critical challenge when building applications that require long-term memory and coherence across interactions. The effectiveness of an LLM agent largely depends on how well its context window is managed - what information is kept, what is discarded, and how it's organized.

> [!note] 译文
> 大语言模型（LLM）面临一个根本性约束：它们只能"看到"其即时上下文窗口中的内容。这一限制给构建需要长期记忆和跨交互一致性的应用带来了严峻挑战。LLM Agent 的有效性在很大程度上取决于其上下文窗口的管理质量——保留什么信息、丢弃什么信息、以及如何组织这些信息。

---

Memory blocks offer an elegant abstraction for context window management. By structuring the context into discrete, functional units, we can give LLM agents more consistent, usable memory. This concept, which originated in the MemGPT research paper and Letta agents framework, provides a systematic approach to organizing what information an LLM has access to during inference.

> [!note] 译文
> 记忆块（Memory Blocks）为上下文窗口管理提供了一种优雅的抽象。通过将上下文结构化为离散的、功能性的单元，我们可以让 LLM Agent 拥有更一致、更可用的记忆。这一概念起源于 MemGPT 研究论文和 Letta Agent 框架，为系统化管理 LLM 在推理期间可访问的信息提供了方法论。

---

## Memory Blocks: A Powerful Abstraction for Agent Memory

The idea of an agent that could manage its own memory (including its own context window) originated in the MemGPT paper. MemGPT demonstrated the idea of self-editing memory in a simple chat use-case with two in-context memory blocks:
- "Human" memory block: Storing information about the user, their preferences, facts about them, and relevant context.
- "Persona" memory block: Containing the agent's own self-concept, personality traits, and behavioral guidelines.

> [!note] 译文
> Agent 可以管理自己的记忆（包括自己的上下文窗口）这一想法起源于 MemGPT 论文。MemGPT 在一个简单的聊天用例中展示了自编辑记忆的概念，使用了两个上下文内记忆块：
> - **"Human" 记忆块**：存储关于用户的信息、他们的偏好、关于他们的事实以及相关上下文。
> - **"Persona" 记忆块**：包含 Agent 自己的自我概念、个性特征和行为准则。

---

These blocks were editable by the agent, and also restricted to a certain character limit (to limit context window allocation to those memories). These blocks provided a way to allocate certain parts of the context window to store important information about specific topics.

> [!note] 译文
> 这些块可以由 Agent 编辑，并且被限制在一定的字符长度内（以限制上下文窗口分配给这些记忆的空间）。这些块提供了一种方式，将上下文窗口的特定部分分配给存储关于特定主题的重要信息。

---

For example, the agent can edit the "human" block as it learns more about them. And by editing the "persona" block, the agent could make sure to persist certain personality traits or "identity" features. If the agent stated a preference for vanilla ice cream, it could write it to the persona block to make sure it would be consistent in the future when asked about its favorite flavor.

> [!note] 译文
> 例如，Agent 可以在了解更多关于用户的信息时编辑 "human" 块。通过编辑 "persona" 块，Agent 可以确保持续某些个性特征或"身份"特征。如果 Agent 表示喜欢香草冰淇淋，它可以将其写入 persona 块，以确保将来被问及最喜欢的口味时保持一致。

---

## Why Context Window Management Matters

Before diving deeper into memory blocks, it's important to understand why effective context window management is crucial for LLM applications:
- **Better performance**: LLMs are sensitive to what's in their context window. They can't reason about information they don't "see" at inference time. By carefully managing which information is present in the context (e.g. by having it curated by another agent), we can dramatically improve the performance of agents.
- **Personalization & adaptability**: For agents that serve specific users or functions, maintaining the right information in context is essential for providing tailored experiences. Without proper context management, agents either forget critical user information or must redundantly ask for it in each step of the interaction.
- **Controllability**: By structuring the context window into distinct blocks with specific purposes, developers gain greater control over agent behavior. This structured approach allows for more predictable and consistent agent responses, and defining mechanisms for long-term context management in agents.

> [!note] 译文
> 在深入探讨记忆块之前，理解为什么有效的上下文窗口管理对 LLM 应用至关重要是很有必要的：
> - **更好的性能**：LLM 对上下文窗口中的内容非常敏感。它们无法推理在推理时"看不到"的信息。通过仔细管理上下文中存在哪些信息（例如让另一个 Agent 来策划），我们可以显著改善 Agent 的性能。
> - **个性化与适应性**：对于服务特定用户或功能的 Agent，在上下文中维护正确的信息对于提供定制体验至关重要。如果没有适当的上下文管理，Agent 要么忘记关键的用户信息，要么必须在交互的每一步中冗余地询问。
> - **可控性**：通过将上下文窗口结构化为具有特定目的的独立块，开发者可以更好地控制 Agent 的行为。这种结构化方法允许更可预测和一致的 Agent 响应，并定义 Agent 中长期上下文管理的机制。

---

## Memory Blocks are Units of Agent Memory

Rather than treating the context window as a monolithic entity, memory blocks break the context window down into manageable, purposeful units that are also persisted. A memory block consists of:
- A label that identifies its purpose (e.g., "human", "persona", "knowledge")
- A value that is the string representation of the block data
- A size limit (e.g. in characters or tokens) that dictates how much of the context window it can occupy
- Optional descriptions that guide how the block should be used

> [!note] 译文
> 与其将上下文窗口视为一个单一的实体，记忆块将其分解为可管理的、有目的的单元，这些单元也会被持久化。一个记忆块由以下部分组成：
> - 标识其用途的标签（例如，"human"、"persona"、"knowledge"）
> - 块数据的字符串表示形式的值
> - 大小限制（例如以字符或 token 计），决定它可以占用多少上下文窗口空间
> - 可选的描述，指导如何使用该块

---

The block value can be edited by the agent via memory tools (or custom tools), unless they are read-only: in which case, only the developer can modify them.

> [!note] 译文
> 块值可以由 Agent 通过记忆工具（或自定义工具）编辑，除非它们是只读的：在这种情况下，只有开发者可以修改它们。

---

## Editing Memory Blocks via the Letta API

Unlike ephemeral memory in many LLM frameworks, Letta's memory blocks are individually persisted in the DB, with a unique `block_id` to access them via the API and Agent Development Environment (ADE). This provides a way for developers to directly modify parts of their agent's context window.

> [!note] 译文
> 与许多 LLM 框架中短暂的记忆不同，Letta 的记忆块被单独持久化在数据库中，具有唯一的 `block_id`，可通过 API 和 Agent 开发环境（ADE）访问。这为开发者提供了一种直接修改其 Agent 上下文窗口部分内容的途径。

---

When Letta makes a request to the LLM, the context window is "compiled" from existing DB state, including current block values. The prompt template (i.e. formatting in the context window) can be customized with Jinja templating.

> [!note] 译文
> 当 Letta 向 LLM 发出请求时，上下文窗口是从现有的数据库状态"编译"而来的，包括当前的块值。提示模板（即上下文窗口中的格式化）可以使用 Jinja 模板进行自定义。

---

## Multi-Agent Shared Memory

One of Letta's most powerful features is the ability for multiple agents to share memory blocks:
This enables sophisticated patterns like:
- Shared knowledge bases: Multiple agents accessing the same reference information
- Sleep-time compute: Background agents updating the memory of primary agents
- Collaborative memory: Teams of agents maintaining a shared understanding

> [!note] 译文
> Letta 最强大的功能之一是让多个 Agent 共享记忆块的能力。这实现了复杂模式，例如：
> - **共享知识库**：多个 Agent 访问相同的参考信息
> - **Sleep-time 计算**：后台 Agent 更新主 Agent 的记忆
> - **协作记忆**：Agent 团队维护共享的理解

---

## Tool-Based Memory Editing

Memory blocks can be modified through a variety of tools to customize memory management. Below is an example of a custom tool to "rethink" (replace) an entire memory block's value by specifying the new block value and the target block label:
Because memory block values are just strings, you can store more complex data structures like lists or dictionaries in blocks, as long as they can be represented into a string format.

> [!note] 译文
> 记忆块可以通过各种工具进行修改，以定制记忆管理。下面是一个自定义工具的示例，通过指定新的块值和目标块标签来"重新思考"（替换）整个记忆块的值：
> 因为记忆块值只是字符串，所以你可以在块中存储更复杂的数据结构，如列表或字典，只要它们可以被表示为字符串格式。

---

## Practical Applications

The flexibility of Letta's memory block system enables a wide range of powerful applications:

> [!note] 译文
> Letta 记忆块系统的灵活性实现了广泛的强大应用：

---

**Personalized Assistants**
By maintaining detailed user information in a human memory block, assistants can remember preferences, past interactions, and important details about each user:

> [!note] 译文
> **个性化助手**
> 通过在 human 记忆块中维护详细的用户信息，助手可以记住偏好、过去的交互以及关于每个用户的重要细节。

---

**Sleep-Time Agents**
As we demonstrated in our Sleep-time Compute research, agents can process information during idle periods and update shared memory blocks. For example, a sleep-time agent might reflect on an existing codebase (similar to Cursor's background agents) or previous conversation history to form new memories (referred to as "learned context") in the paper. Learned context is written to a memory block in Letta, and can be shared across multiple agents.

> [!note] 译文
> **Sleep-time Agent**
> 正如我们在 Sleep-time Compute 研究中所展示的，Agent 可以在空闲期间处理信息并更新共享记忆块。例如，sleep-time Agent 可能会反思现有代码库（类似于 Cursor 的后台 Agent）或之前的对话历史，以形成新的记忆（论文中称为"learned context"）。学习到的上下文被写入 Letta 中的记忆块，并可以在多个 Agent 之间共享。

---

**Long-running Agents (e.g. Deep Research)**
For complex, long-running agents like deep research agents, the context must maintain the state of the task across multiple LLM invocations without derailment. 11x's deep research agent benefitted from writing the "research state" into a memory block to track research progress.

> [!note] 译文
> **长期运行 Agent（例如深度研究）**
> 对于复杂的、长期运行的 Agent（如深度研究 Agent），上下文必须在多次 LLM 调用中保持任务状态而不偏离轨道。11x 的深度研究 Agent 受益于将"研究状态"写入记忆块以跟踪研究进展。

---

## Conclusion

Building powerful, reliable agents that can learn and improve over time will require developing techniques for context management over time. Memory blocks provide a unit of abstraction for storing and managing sections of the context window. By breaking the context window into purposeful, manageable units, we enable agents that are more capable, personalized, and controllable.

> [!note] 译文
> 构建能够随时间学习和改进的强大、可靠的 Agent，需要开发随时间推移的上下文管理技术。记忆块为存储和管理上下文窗口的各个部分提供了一种抽象单元。通过将上下文窗口分解为有目的的、可管理的单元，我们使 Agent 变得更有能力、更个性化、更可控。
