---
title: 工具与参考
---

# 工具与参考

辅助学习资料：可直接在网站阅读的源码仓库镜像、外文精读中英对照、面试参考等。

---

## 一、源码仓库镜像

从 GitHub 拉取的完整仓库，迁移到 `content/` 后由 Quartz 直接构建为网页。包含代码、文档和资产文件。

| 仓库 | 定位 | 关联学习笔记 |
|------|------|-------------|
| [[repos/how-claude-code-works/index\|how-claude-code-works]] | 从 50 万行源码提炼的 15 篇架构专题 | [[40-AI编码与源码/claude-code-source-learning-ecosystem\|源码学习生态]]、[[40-AI编码与源码/claude-code-source-analysis\|泄露版源码解析]] |
| [[repos/claude-code-from-scratch/index\|claude-code-from-scratch]] | ~4,300 行代码从零复现核心架构（13 章） | [[40-AI编码与源码/claude-code-source-learning-ecosystem\|源码学习生态]] |
| [[repos/claude-code-book/index\|claude-code-book]] | 《御舆：解码 Agent Harness》（42 万字，15 章+4 附录） | [[40-AI编码与源码/claude-code-source-learning-ecosystem\|源码学习生态]] |

> 工作流：新增仓库直接 clone 到 `content/99-工具与参考/repos/<repo>/`，无需 `_refs/` 中间层。

---

## 二、外文精读（中英段落对照）

技术博客与论文的段落级中英对照阅读，保留原文论证流。

### Agent 框架与工程
- [[ref-articles/agent-harness-engineering-survey-bilingual\|Agent Harness Engineering: A Survey]] — [[30-Agent工程/agent-harness-engineering-survey\|我的综述笔记]]
- [[ref-articles/letta-stateful-agents-bilingual\|Letta — Stateful Agents]] — [[30-Agent工程/letta/index\|Letta 学习笔记]]
- [[ref-articles/letta-context-constitution-bilingual\|Letta — Context Constitution]]
- [[ref-articles/letta-memory-blocks-bilingual\|Letta — Memory Blocks]]
- [[ref-articles/memgpt-towards-llms-as-operating-systems-bilingual\|MemGPT: Towards LLMs as Operating Systems]] — [[10-LLM基础/2026-05-15-memgpt-towards-llms-as-operating-systems\|我的 MemGPT 笔记]]

### LangGraph 官方文档
- [[ref-articles/langgraph-overview-bilingual\|LangGraph Overview]] — [[30-Agent工程/langgraph/index\|LangGraph 学习笔记]]
- [[ref-articles/langgraph-graph-api-bilingual\|LangGraph Graph API]]
- [[ref-articles/langgraph-persistence-bilingual\|LangGraph Persistence]]
- [[ref-articles/langgraph-workflows-agents-bilingual\|LangGraph Workflows & Agents]]
- [[ref-articles/langgraph-durable-execution-bilingual\|LangGraph Durable Execution]]

### LLM 基础
- [[ref-articles/why-we-think-test-time-compute-bilingual\|Why We Think — Test-Time Compute]] — [[10-LLM基础/why-we-think-test-time-compute\|我的 Test-Time Compute 笔记]]

---

## 三、面试参考
- [[javaguide-ai-interview-guide\|JavaGuide AI 面试指南]]
