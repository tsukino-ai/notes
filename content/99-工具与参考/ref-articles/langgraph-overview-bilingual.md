---
title: LangGraph 概述
author: LangChain
date: 2026-05-05
source: https://docs.langchain.com/oss/python/langgraph/overview
tags:
  - LangGraph
  - Agent
---

Trusted by companies shaping the future of agents— including Klarna, Uber, J.P. Morgan, and more— LangGraph is a low-level orchestration framework and runtime for building, managing, and deploying long-running, stateful agents. LangGraph is very low-level, and focused entirely on agent orchestration. Before using LangGraph, we recommend you familiarize yourself with some of the components used to build agents, starting with models and tools. We will commonly use LangChain components throughout the documentation to integrate models and tools, but you don't need to use LangChain to use LangGraph. If you are just getting started with agents or want a higher-level abstraction, we recommend you use LangChain's agents that provide prebuilt architectures for common LLM and tool-calling loops. LangGraph is focused on the underlying capabilities important for agent orchestration: durable execution, streaming, human-in-the-loop, and more.

> [!note] 译文
> LangGraph 受到 Klarna、Uber、J.P. Morgan 等塑造 Agent 未来的公司信赖，是一个用于构建、管理和部署长时运行、有状态 Agent 的**底层编排框架和运行时**。LangGraph 非常底层，完全专注于 Agent 编排。在使用 LangGraph 之前，我们建议你先熟悉构建 Agent 所需的一些组件，从模型（models）和工具（tools）开始。我们在整个文档中通常会使用 LangChain 组件来集成模型和工具，但你**不需要**使用 LangChain 也能使用 LangGraph。如果你刚接触 Agent 或想要更高层次的抽象，我们建议你使用 LangChain 的 Agent，它们为常见的 LLM 和工具调用循环提供了预构建的架构。LangGraph 专注于 Agent 编排的底层能力：**持久化执行（durable execution）、流式输出（streaming）、人机协同（human-in-the-loop）**等。

---

## Install

## Core benefits

LangGraph provides low-level supporting infrastructure for any long-running, stateful workflow or agent. LangGraph does not abstract prompts or architecture, and provides the following central benefits:

- Durable execution: Build agents that persist through failures and can run for extended periods, resuming from where they left off.
- Human-in-the-loop: Incorporate human oversight by inspecting and modifying agent state at any point.
- Comprehensive memory: Create stateful agents with both short-term working memory for ongoing reasoning and long-term memory across sessions.
- Debugging with LangSmith: Gain deep visibility into complex agent behavior with visualization tools that trace execution paths, capture state transitions, and provide detailed runtime metrics.
- Production-ready deployment: Deploy sophisticated agent systems confidently with scalable infrastructure designed to handle the unique challenges of stateful, long-running workflows.

> [!note] 译文
> LangGraph 为任何长时运行、有状态的工作流或 Agent 提供底层支撑基础设施。LangGraph 不抽象提示词（prompts）或架构，而是提供以下核心优势：
> - **持久化执行**：构建能够经受故障、长时间运行并从断点恢复的 Agent。
> - **人机协同**：通过在任何时刻检查 and 修改 Agent 状态来引入人类监督。
> - **全面记忆**：创建具有短期工作记忆（用于持续推理）和跨会话长期记忆的有状态 Agent。
> - **LangSmith 调试**：通过可视化工具深入洞察复杂 Agent 行为，追踪执行路径、捕获状态转换并提供详细的运行时指标。
> - **生产级部署**：通过专为有状态、长时运行工作流的独特挑战设计的可扩展基础设施，自信地部署复杂的 Agent 系统。

---

## LangGraph ecosystem

While LangGraph can be used standalone, it also integrates seamlessly with any LangChain product, giving developers a full suite of tools for building agents. To improve your LLM application development, pair LangGraph with:

### LangSmith Observability

Trace requests, evaluate outputs, and monitor deployments in one place. Prototype locally with LangGraph, then move to production with integrated observability and evaluation to build more reliable agent systems.

### LangSmith Deployment

Deploy and scale agents effortlessly with a purpose-built deployment platform for long running, stateful workflows. Discover, reuse, configure, and share agents across teams — and iterate quickly with visual prototyping in Studio.

### LangChain

Provides integrations and composable components to streamline LLM application development. Contains agent abstractions built on top of LangGraph.

> [!note] 译文
> LangGraph 可以独立使用，也可以与任何 LangChain 产品无缝集成，为开发者提供构建 Agent 的完整工具套件。为了提升你的 LLM 应用开发体验，可以将 LangGraph 与以下产品搭配使用：
> - **LangSmith 可观测性**：在一个地方追踪请求、评估输出和监控部署。使用 LangGraph 在本地原型化，然后借助集成的可观测性和评估能力迁移到生产环境，构建更可靠的 Agent 系统。
> - **LangSmith 部署**：通过专为长时运行、有状态工作流打造的部署平台，轻松部署和扩展 Agent。跨团队发现、复用、配置和共享 Agent —— 并通过 Studio 中的可视化原型快速迭代。
> - **LangChain**：提供集成和可组合组件，简化 LLM 应用开发。包含构建在 LangGraph 之上的 Agent 抽象。

---

## Acknowledgements

LangGraph is inspired by Pregel and Apache Beam. The public interface draws inspiration from NetworkX. LangGraph is built by LangChain Inc, the creators of LangChain, but can be used without LangChain.

> [!note] 译文
> LangGraph 的灵感来自 Pregel 和 Apache Beam。公开接口的设计借鉴了 NetworkX。LangGraph 由 LangChain Inc（LangChain 的创造者）构建，但可以在不使用 LangChain 的情况下独立使用。
