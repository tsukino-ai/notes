---
title: LangGraph 持久化执行（Durable Execution）
date: 2026-05-08
tags:
  - LangGraph
  - Agent
  - durable-execution
  - checkpoint
  - workflow
---

> [📖 中英段落对照阅读](../99-工具与参考/ref-articles/durable-execution-bilingual.md)

## 核心概念

### 什么是持久化执行（Durable Execution）

持久化执行是一种在关键节点保存进程或工作流进度的技术，使其能够**暂停并在之后从暂停点精确恢复**。LangGraph 通过内置的持久化层（persistence layer）为工作流提供这一能力。

**关键特性：**
- 状态自动保存到持久化存储（durable store）
- 支持长时任务中断后的恢复（即使间隔一周）
- 支持人机协同（human-in-the-loop）场景
- 避免重新处理已完成步骤

### 三要素（Requirements）

1. **Checkpointer**：启用工作流持久化，保存进度
2. **Thread ID**：追踪特定工作流实例的执行历史
3. **Task 封装**：将非确定性操作和副作用操作封装在 task 中

### 确定性与一致性重放（Determinism & Consistent Replay）

> ⚠️ 关键认知：恢复时**不是**从断点继续执行，而是从某个起始点**重放**到断点。

因此需要：
- **避免重复工作**：每个副作用操作单独封装为 task
- **封装非确定性操作**：随机数生成等必须包在 task 中
- **使用幂等操作**：API 调用、文件写入应尽量幂等，使用幂等键（idempotency keys）

### 三种持久化模式

| 模式 | 行为 | 性能 | 恢复能力 |
|------|------|------|---------|
| `exit` | 仅在执行退出时保存 | 最佳 | 无法恢复执行中崩溃 |
| `async` | 下一步执行时异步保存 | 良好 | 极小概率丢失 checkpoint |
| `sync` | 下一步前同步保存 | 有开销 | 最高，每个 checkpoint 都落盘 |

### 恢复场景

1. **人机协同暂停**：`interrupt` + `Command` 恢复
2. **故障恢复**：相同 thread_id + `None` 输入自动从最后一个 checkpoint 恢复
3. **优雅关闭（Drain）**：`langgraph>=1.2`，协作式停止，superstep 边界生效

### 恢复起始点

- **StateGraph (Graph API)**：执行停止的 node 开头
- **Subgraph 调用**：父 node 为起始点，subgraph 内为具体 node
- **Functional API**：执行停止的 entrypoint 开头

## 关键洞察

1. **持久化执行的本质是「状态机 + 事件重放」**：LangGraph 的恢复机制与事件溯源（Event Sourcing）思想高度相似——保存状态 snapshot + 重放后续事件。

2. **Task 是副作用的边界**：LangGraph 用 task 来标记「可缓存/可恢复」的单元。这类似于 React 的纯函数组件与副作用 hook 的区分。

3. **幂等性是兜底保险**：即使 checkpoint 机制完美，网络超时、部分失败等边缘情况仍可能重复执行 task。幂等操作是最后一道防线。

4. **Drain 模式填补了「优雅关闭」的空白**：在容器化/K8s 环境中，SIGTERM 处理是生产级部署的必备能力。LangGraph 的 `request_drain()` 提供了框架级的支持。

## 待深入研究

- [ ] `interrupt` 和 `Command` 的具体 API 与使用示例
- [ ] Checkpointer 的实现：支持哪些后端（SQLite、Postgres、Redis？）
- [ ] LangGraph 的 Functional API 与 Graph API 在持久化上的差异
- [ ] 与其他工作流引擎（Temporal、Cadence、Prefect）的持久化机制对比
- [ ] 在生产环境中 `sync`/`async`/`exit` 模式的实际性能基准
- [ ] `RunControl` 的完整语义和最佳实践（alpha 功能）

## 与已有知识的潜在关联

- **LangGraph 核心概念**：需要建立 LangGraph 的 StateGraph、Node、Edge、Task 等基础概念的联系
- **事件溯源（Event Sourcing）**：持久化执行的 replay 机制与事件溯源模式的相似性
- **K8s 优雅关闭**：SIGTERM 处理与 K8s Pod 生命周期的结合
- **幂等性设计**：与分布式系统中幂等 API 设计的通用原则相通
- **React/函数式编程**：纯函数与副作用分离的思想共鸣
