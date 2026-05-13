---
title: Agent 记忆架构设计 —— 参考来源汇总
date: 2026-05-13
tags:
  - agent
  - memory
  - reference
  - architecture
  - letta
  - langchain
  - anthropic
---

# Agent 记忆架构设计 —— 参考来源汇总

> 本页汇总了 Agent 记忆机制相关的核心参考来源，按主题分类整理。
> 对应设计方案中的记忆层架构决策。

---

## 一、LLM Agent 记忆架构（核心设计来源）

| # | 来源 | 作者/机构 | 日期 | 链接 | 与知识库已有内容的关联 |
|---|------|----------|------|------|----------------------|
| 1 | **Memory for agents** | Harrison Chase, LangChain | 2024-10 | https://www.langchain.com/blog/memory-for-agents | [[核心概念]] 中 Memory Store 跨线程记忆的理论基础；四层记忆模型直接对应设计方案中的记忆分层 |
| 2 | **Stateful Agents: The Missing Link in LLM Intelligence** | Letta (前 MemGPT 团队) | 2025-02 | https://www.letta.com/blog/stateful-agents | 上下文作为稀缺资源的论点；两层记忆系统（上下文内 vs 外部存储）与 [[Autonomous-Agents]] 中的 Short-term / Long-term 记忆映射一致 |
| 3 | **Context Constitution** | Letta | 2026-04 | https://www.letta.com/blog/context-constitution | Token 预算管理、Sleep-time compute 背景反思；与 LangGraph 的 Checkpoint 机制互补的设计视角 |
| 4 | **Memory Blocks: The Key to Agentic Context Management** | Letta | 2025-05 | https://www.letta.com/blog/memory-blocks | Memory Blocks 结构化记忆设计；避免了 [[Autonomous-Agents]] 中提到的 naive RAG 直接灌入上下文的缺陷 |
| 5 | **Building effective agents** | Anthropic | 2024-12 | https://www.anthropic.com/research/building-effective-agents | 简单系统优于复杂编排、路由设计原则；与 [[Router-Specialist实战]] 的架构选择直接相关 |
| 6 | **LangGraph Persistence** | LangChain 官方文档 | 2024-08 | https://docs.langchain.com/oss/python/langgraph/persistence | [[核心概念]] 中 Checkpointer、thread_id 会话管理的官方文档来源 |
| 7 | **Towards LLMs as Operating Systems (MemGPT)** | Packer et al. | 2023-10 | arXiv:2310.08560 | Agent 工具读写记忆优于被动检索；[[Autonomous-Agents]] 中 Memory 组件的扩展阅读 |
| 8 | **Cognitive Architectures for Language Agents (CoALA)** | Sumers et al. | 2023-09 | arXiv:2309.02427 | 程序/语义/情景记忆分类；为记忆层的理论建模提供认知科学基础 |

### 关键引用备忘

| 引用内容 | 来源 |
|---------|------|
| "Context is a scarce resource." | Letta, Context Constitution (Apr 2026) |
| "RAG pollutes the context with irrelevant information." | Letta, Memory Blocks (May 2025) |
| "Long-term memory should be structured and curated, not just vector-retrieved text chunks." | Letta, Stateful Agents (Feb 2025) |
| "Agents should have read/write tools for their own memory blocks." | MemGPT paper (arXiv:2310.08560) |
| "Sleep-time compute: background agents can reflect on prior turns." | Letta, Context Constitution |

---

## 二、Agent 记忆机制经典项目与论文

| # | 来源 | 作者/机构 | 日期 | 链接 | 与知识库已有内容的关联 |
|---|------|----------|------|------|----------------------|
| 9 | **Generative Agents (Park et al.)** | Stanford | 2023-04 | arXiv:2304.03442 | [[Autonomous-Agents]] 已引用；记忆流、反射循环、检索评分（recency/importance/relevance）是记忆检索算法的经典参考 |
| 10 | **Voyager (Minecraft)** | Wang et al., NVIDIA | 2023-05 | arXiv:2305.16291 | 技能库（Skill Library）设计；程序记忆与情景记忆分离的架构，与 DeerFlow 的 Skills System 设计思想同源 |
| 11 | **Reflexion** | Shinn et al. | 2023-03 | arXiv:2303.11366 | [[Autonomous-Agents]] 已引用；语言自我批判、情景记忆缓冲的实现参考 |
| 12 | **Memory for Autonomous LLM Agents (Survey)** | 多机构 | 2026 | 近期综述 | write-manage-read 记忆循环、五类记忆机制的分类框架；Agent 记忆领域的最新综述 |

---

## 三、未纳入整理的参考

以下参考与当前知识库已有内容的直接关联较弱，暂不入库：

| 来源 | 原因 |
|------|------|
| Cicero (Diplomacy AI), Meta AI | 游戏外交场景特定，当前 KB 聚焦 LLM Agent 工程而非游戏 AI |
| AlphaStar (StarCraft II), DeepMind | 游戏 AI 的 LSTM 隐藏状态设计，与当前 LLM Agent 记忆架构关联度低 |
| Richelieu (Diplomacy) | 同上，游戏特定场景 |
| sqlite-vec / SQLite-vec Hybrid Search / Vanna.ai | 当前知识库 `20-RAG工程/` 和 `50-后端/` 尚无向量搜索/RAG 实现相关内容，缺乏挂靠点 |
| OpenAI Function Calling Cookbook | 过于工具化，已在 [[核心概念]] 和 [[Autonomous-Agents]] 中通过其他方式覆盖 |

> 若后续在 `20-RAG工程/` 或 `50-后端/` 中补充了 SQLite 向量搜索、混合检索相关内容，可将 sqlite-vec 系列参考迁移至对应笔记。

---

## 四、与已有笔记的关联

- **[[Autonomous-Agents]]** —— 本文档第一类参考是对该文 Memory 章节的大量补充和更新（尤其是 Letta 系列文章对 2023 年综述的演进）
- **[[核心概念]]** —— LangGraph Persistence 参考直接对应 Checkpointer 和 Memory Store 的官方设计文档
- **[[DeerFlow]]** —— DeerFlow 的 MemoryMiddleware、Skills System 与 Letta Memory Blocks、Voyager Skill Library 是同一设计趋势的不同实现
- **[[Deep-Agents]]** —— Deep Agents 的 StoreBackend 长期记忆与 Letta 的 Stateful Agents 理念一致

---

## 五、待补充方向

- [ ] 若阅读 Letta 系列博客，可提取 Memory Blocks 的 API 设计细节补充到本文档
- [ ] 若实践 sqlite-vec，可创建 `20-RAG工程/` 或 `50-后端/` 下的独立笔记并迁移第三类参考
- [ ] 关注 Letta 开源代码中记忆层的具体实现（SQLite + 向量索引的 hybrid search）
