---
title: 'MemGPT: Towards LLMs as Operating Systems'
author: Charles Packer, Sarah Wooders, Kevin Lin, Vivian Fang, Shishir G. Patil, Ion Stoica, Joseph E. Gonzalez
date: 2023-10-12
source: https://arxiv.org/abs/2310.08560
tags:
  - LLM-context
  - agent-memory
  - MemGPT
  - OS-inspired
---

> [📖 中英段落对照阅读](../99-工具与参考/ref-articles/memgpt-towards-llms-as-operating-systems-bilingual.md)
> 原始文献: `_refs/articles/2026-05-15-memgpt-towards-llms-as-operating-systems.md`

---

## 一句话总结

MemGPT 将操作系统虚拟内存的分层内存管理思想引入 LLM，通过函数调用让 LLM 自主管理主上下文（RAM）和外部上下文（Disk）之间的数据分页，从而在固定上下文窗口的限制下实现"无限上下文"的 illusion。

---

## 核心概念

### 1. 虚拟上下文管理（Virtual Context Management）

借鉴 OS 虚拟内存分页：
- **主上下文（Main Context）** = 物理内存/RAM = LLM 提示词 token（系统指令 + 工作上下文 + FIFO 队列）
- **外部上下文（External Context）** = 磁盘存储 = 召回存储（Recall Storage）+ 档案存储（Archival Storage）
- LLM 通过 **函数调用** 自主在两者之间"分页"数据

### 2. 内存层次结构

```
┌─────────────────────────────────────────┐
│           Main Context (RAM)            │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ │
│  │ System  │ │ Working │ │  FIFO    │ │
│  │Instr.   │ │Context  │ │  Queue   │ │
│  │(ReadOnly)│ │(R/W)   │ │(Rolling) │ │
│  └─────────┘ └─────────┘ └──────────┘ │
└─────────────────────────────────────────┘
              ↕ Function Calls
┌─────────────────────────────────────────┐
│        External Context (Disk)          │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │Recall Storage│  │Archival Storage │  │
│  │(Message DB) │  │(Vector Search)  │  │
│  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────┘
```

### 3. 核心组件

| 组件 | 功能 | OS 类比 |
|------|------|---------|
| **Queue Manager** | 管理 FIFO 队列、处理上下文溢出、执行逐出策略 | 内存管理器 |
| **Function Executor** | 解析 LLM 输出的函数调用、执行内存操作 | 系统调用处理 |
| **System Instructions** | 只读提示，告知 LLM 内存层级和可用函数 | 操作系统 API 文档 |
| **Working Context** | 固定大小的读写块，存储用户/角色关键信息 | 进程内存空间 |
| **FIFO Queue** | 滚动消息历史，包含递归摘要 | 消息队列 |

### 4. 控制流机制

- **事件驱动**：用户消息、系统消息（内存压力警告）、用户交互、定时事件
- **函数链（Function Chaining）**：LLM 可以连续调用多个函数（设置 `request_heartbeat=true`）
- **Yield**：函数调用不带心跳标志时，暂停处理器直到下一个外部事件

### 5. 内存压力管理

- **Warning Token Count**（如 70% 上下文窗口）：插入系统警告，让 LLM 主动归档重要信息
- **Flush Token Count**（如 100% 上下文窗口）：强制逐出 FIFO 队列中的消息，生成递归摘要

---

## 关键洞察

1. **不是扩展上下文，而是管理上下文**：MemGPT 的核心洞见是，与其训练更长的模型（计算成本高且效果递减），不如让 LLM 学会像 OS 管理虚拟内存一样管理自己的上下文窗口

2. **自导向内存管理**：LLM 通过函数调用自主决定何时存储、检索、修改内存——无需人类干预。这比静态 RAG 更灵活，因为检索策略是动态的

3. **递归摘要 + 全文召回**：FIFO 队列被逐出时生成递归摘要保留在队列头部，同时完整消息存入召回存储。这提供了压缩视图和详细视图的双重保障

4. **函数调用作为 OS 系统调用**：将 LLM 的函数调用能力视为 OS 的系统调用接口，这是 MemGPT 架构的关键抽象

---

## 实验结果

| 任务 | 基线 | MemGPT | 提升 |
|------|------|--------|------|
| 深度记忆检索（DMR）准确率 | GPT-4: 32.1% | GPT-4 + MemGPT: 92.5% | **+60.4%** |
| 对话开场白 SIM-H | GPT-4: 0.773 | GPT-4 + MemGPT: 0.843 | **+9.1%** |
| 文档 QA（多文档） | 受上下文限制 | 不受文档数量限制 | 突破瓶颈 |
| 嵌套 KV 检索 | GPT-4: ~2 层 | MemGPT: 稳定完成 | 唯一可行方案 |

---

## 与现有知识库的关联

- [[agent-memory-design-references]] — MemGPT 是 agent 记忆架构的重要参考实现
- [[rag-evolution]] — MemGPT 扩展了 RAG 范式：从单次检索到迭代自主检索
- [[Autonomous-Agents]] — 自导向内存管理是自主智能体的核心能力
- [[letta-stateful-agents]] / [[letta-memory-blocks]] / [[letta-context-constitution]] — Letta 是 MemGPT 的后续商业实现，延续了相同的内存层级思想

---

## 待深入的问题

- [ ] MemGPT 的递归摘要策略具体如何实现？摘要质量如何保证？
- [ ] 工作上下文（Working Context）的大小如何选择？太小则信息不足，太大则挤压 FIFO 队列
- [ ] 函数链的无限循环风险：如何防止 LLM 陷入无限检索循环？
- [ ] MemGPT → Letta 的演进：哪些架构改进？哪些取舍？
- [ ] 在实际生产环境中，召回存储和档案存储的延迟和一致性如何保证？

---

## 技术栈/实现参考

- **开源代码**: https://research.memgpt.ai
- **档案存储**: PostgreSQL + pgvector (HNSW 索引)
- **嵌入模型**: OpenAI text-embedding-ada-002
- **支持模型**: GPT-4, GPT-3.5 Turbo, Llama 2, Mistral 7B 等
