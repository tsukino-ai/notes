---
title: LangGraph 工作流与 Agent 模式
author: LangChain
date: 2026-05-07
source: https://docs.langchain.com/oss/python/langgraph/workflows-agents
tags:
  - LangGraph
  - Agent
  - workflow
  - design-pattern
---

This guide reviews common workflow and agent patterns.

> [!note] 译文
> 本指南回顾常见的工作流和 Agent 模式。

---

- Workflows have predetermined code paths and are designed to operate in a certain order.
- Agents are dynamic and define their own processes and tool usage.

> [!note] 译文
> - **工作流（Workflows）**有预先确定的代码路径，按特定顺序执行。
> - **Agent**是动态的，自主定义自己的流程和工具使用方式。

---

## Setup

To build a workflow or agent, you can use any chat model that supports structured outputs and tool calling. The following example uses Anthropic:

- Install dependencies:
- Initialize the LLM:

> [!note] 译文
> 要构建工作流或 Agent，你可以使用任何支持结构化输出和工具调用的聊天模型。以下示例使用 Anthropic：
> - 安装依赖：
> - 初始化 LLM：

---

## LLMs and augmentations

Workflows and agentic systems are based on LLMs and the various augmentations you add to them. Tool calling, structured outputs, and short term memory are a few options for tailoring LLMs to your needs.

> [!note] 译文
> 工作流和 Agent 系统基于 LLM 以及你添加的各种增强能力。工具调用（tool calling）、结构化输出（structured outputs）和短期记忆（short term memory）是定制 LLM 的几个选项。

---

## Prompt chaining

Prompt chaining is when each LLM call processes the output of the previous call. It's often used for performing well-defined tasks that can be broken down into smaller, verifiable steps. Some examples include:

- Translating documents into different languages
- Verifying generated content for consistency

> [!note] 译文
> **提示词链（Prompt chaining）**是指每次 LLM 调用处理前一次调用的输出。它常用于执行可以分解为更小、可验证步骤的明确定义任务。例如：
> - 将文档翻译成不同语言
> - 验证生成内容的一致性

---

## Parallelization

With parallelization, LLMs work simultaneously on a task. This is either done by running multiple independent subtasks at the same time, or running the same task multiple times to check for different outputs. Parallelization is commonly used to:

- Split up subtasks and run them in parallel, which increases speed
- Run tasks multiple times to check for different outputs, which increases confidence
- Running one subtask that processes a document for keywords, and a second subtask to check for formatting errors
- Running a task multiple times that scores a document for accuracy based on different criteria, like the number of citations, the number of sources used, and the quality of the sources

> [!note] 译文
> **并行化（Parallelization）**让多个 LLM 同时处理任务。这可以通过同时运行多个独立子任务，或多次运行同一任务以检查不同输出来实现。并行化常用于：
> - 拆分子任务并并行运行，提高速度
> - 多次运行任务以检查不同输出，提高置信度
> - 一个子任务处理文档关键词，另一个子任务检查格式错误
> - 多次运行任务，根据不同标准（如引用数量、来源数量、来源质量）为文档准确性打分

---

## Routing

Routing workflows process inputs and then directs them to context-specific tasks. This allows you to define specialized flows for complex tasks. For example, a workflow built to answer product related questions might process the type of question first, and then route the request to specific processes for pricing, refunds, returns, etc.

> [!note] 译文
> **路由（Routing）**工作流处理输入，然后将其导向特定上下文相关的任务。这允许你为复杂任务定义专门的流程。例如，一个用于回答产品相关问题的工工作流可能先处理问题的类型，然后将请求路由到定价、退款、退货等特定流程。

---

## Orchestrator-worker

In an orchestrator-worker configuration, the orchestrator:

- Breaks down tasks into subtasks
- Delegates subtasks to workers
- Synthesizes worker outputs into a final result

### Creating workers in LangGraph

Orchestrator-worker workflows are common and LangGraph has built-in support for them. The Send API lets you dynamically create worker nodes and send them specific inputs. Each worker has its own state, and all worker outputs are written to a shared state key that is accessible to the orchestrator graph. This gives the orchestrator access to all worker output and allows it to synthesize them into a final output. The example below iterates over a list of sections and uses the Send API to send a section to each worker.

> [!note] 译文
> **编排器-工作者（Orchestrator-worker）**配置中，编排器：
> - 将任务分解为子任务
> - 将子任务委派给工作者
> - 将工作者输出合成为最终结果
>
> **在 LangGraph 中创建工作者**：
> 编排器-工作者工作流很常见，LangGraph 内置了对它们的支持。`Send` API 让你动态创建工作者节点并向它们发送特定输入。每个工作者有自己的状态，所有工作者输出被写入编排器图可访问的共享状态键。这使编排器能访问所有工作者输出并将它们合成为最终输出。下面的示例遍历一组章节，使用 Send API 将每个章节发送给对应的工作者。

---

## Evaluator-optimizer

In evaluator-optimizer workflows, one LLM call creates a response and the other evaluates that response. If the evaluator or a human-in-the-loop determines the response needs refinement, feedback is provided and the response is recreated. This loop continues until an acceptable response is generated. Evaluator-optimizer workflows are commonly used when there's particular success criteria for a task, but iteration is required to meet that criteria. For example, there's not always a perfect match when translating text between two languages. It might take a few iterations to generate a translation with the same meaning across the two languages.

> [!note] 译文
> **评估器-优化器（Evaluator-optimizer）**工作流中，一次 LLM 调用生成响应，另一次评估该响应。如果评估器或人机协同判定响应需要改进，则提供反馈并重新生成响应。这个循环持续进行，直到生成可接受的响应。评估器-优化器工作流常用于任务有特定成功标准，但需要迭代才能达到该标准的情况。例如，两种语言之间的文本翻译并不总能一次完美匹配，可能需要多次迭代才能生成在两种语言中意义相同的译文。

---

## Agents

Agents are typically implemented as an LLM performing actions using tools. They operate in continuous feedback loops, and are used in situations where problems and solutions are unpredictable. Agents have more autonomy than workflows, and can make decisions about the tools they use and how to solve problems. You can still define the available toolset and guidelines for how agents behave.

To get started with agents, see the quickstart or read more about how they work in LangChain.

## Using tools

> [!note] 译文
> **Agent**通常被实现为使用工具执行操作的 LLM。它们在持续反馈循环中运行，用于问题和解决方案不可预测的情况。Agent 比工作流具有更多自主性，可以决定使用哪些工具以及如何解决问题。你仍然可以定义可用的工具集和 Agent 行为准则。
>
> 要开始使用 Agent，请参阅 quickstart 或阅读 LangChain 中关于它们工作原理的更多内容。
>
> ## 使用工具
