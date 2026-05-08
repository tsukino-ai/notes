---
title: LangGraph 持久化执行（Durable Execution）
author: LangChain
source: https://docs.langchain.com/oss/python/langgraph/durable-execution
date: 2026-05-07
---

持久化执行（Durable execution）是一种在关键节点保存进程或工作流进度的技术，使其能够暂停并在之后从暂停点精确恢复。这在需要人机协同（human-in-the-loop）的场景中特别有用——用户可以检查、验证或修改流程后再继续；同时也适用于可能遇到中断或错误的长时任务（例如调用 LLM 超时）。通过保存已完成的工作，持久化执行使进程能够在不重新处理先前步骤的情况下恢复——即使经过很长一段时间（例如一周后）。LangGraph 的内置持久化层为工作流提供了持久化执行能力，确保每个执行步骤的状态都被保存到持久化存储中。这一能力保证：如果工作流因系统故障或人机协同交互而中断，它可以从最后记录的状态恢复。

## 文档索引

获取完整文档索引：https://docs.langchain.com/llms.txt
使用此文件在深入探索前发现所有可用页面。

## 使用要求

要在 LangGraph 中利用持久化执行，你需要：

- 通过指定 checkpointer 来启用工作流的持久化，以保存工作流进度。
- 执行工作流时指定 thread identifier（线程标识符）。这将追踪特定工作流实例的执行历史。
- 将任何非确定性操作（例如随机数生成）或具有副作用的操作（例如文件写入、API 调用）封装在 task 中，以确保当工作流恢复时，这些操作不会针对该特定运行重复执行，而是直接从持久化层获取其结果。更多信息请参阅「确定性与一致性重放」。

## 确定性与一致性重放（Determinism and Consistent Replay）

当你恢复一个工作流运行时，代码**不会**从执行停止的同一行代码恢复；相反，它会确定一个合适的起始点，从该点开始继续执行。这意味着工作流将从起始点重放所有步骤，直到达到停止的位置。因此，在编写用于持久化执行的工作流时，你必须将任何非确定性操作（例如随机数生成）和任何具有副作用的操作（例如文件写入、API 调用）封装在 task 或 node 中。为确保工作流具有确定性并能够一致性重放，请遵循以下准则：

- **避免重复工作**：如果一个 node 包含多个具有副作用的操作（例如日志记录、文件写入或网络调用），将每个操作封装在单独的 task 中。这确保了当工作流恢复时，操作不会重复执行，其结果直接从持久化层获取。
- **封装非确定性操作**：将任何可能产生非确定性结果的代码（例如随机数生成）封装在 task 或 node 中。这确保了恢复时，工作流遵循完全相同的步骤序列并获得相同的结果。
- **使用幂等操作**：尽可能确保副作用（例如 API 调用、文件写入）是幂等的。这意味着如果操作在工作流失败后重试，它将与首次执行时产生相同的效果。这对于导致数据写入的操作尤为重要。如果 task 开始但未能成功完成，工作流恢复时将重新运行该 task，依赖记录的结果来维持一致性。使用幂等键（idempotency keys）或验证现有结果，以避免意外重复，确保平稳且可预测的工作流执行。

## 持久化模式（Durability Modes）

LangGraph 支持三种持久化模式，允许你根据应用需求在性能和数据一致性之间取得平衡。更高的持久化模式会为工作流执行增加更多开销。你可以在调用任何 graph 执行方法时指定持久化模式：

- `"exit"`：LangGraph 仅在 graph 执行成功退出、出错或因人机协同中断时保存更改。这为长时运行 graph 提供了最佳性能，但意味着中间状态不会被保存，因此你无法从执行过程中发生的系统故障（如进程崩溃）中恢复。
- `"async"`：LangGraph 在下一步执行的同时异步保存更改。这提供了良好的性能和持久化，但存在一个小风险：如果进程在执行期间崩溃，LangGraph 可能无法写入 checkpoint。
- `"sync"`：LangGraph 在下一步开始前同步保存更改。这确保了 LangGraph 在继续执行前写入每个 checkpoint，以一定的性能开销为代价提供了高持久化能力。

## 在 Node 中使用 Task

如果一个 node 包含多个操作，你可能会发现将每个操作转换为 task 比重构操作为独立的 node 更容易。

## 恢复工作流

在启用了持久化执行后，你可以在以下场景中恢复执行：

- **暂停和恢复工作流**：使用 `interrupt` 函数在特定点暂停工作流，使用 `Command` 原语以更新的状态恢复它。更多细节请参阅 Interrupts 文档。
- **从故障中恢复**：在异常（例如 LLM 提供商中断）后自动从最后一个成功的 checkpoint 恢复工作流。这涉及使用相同的 thread identifier 执行工作流，并将输入值设为 `None`（请参阅 functional API 的示例）。

## 恢复工作流的起始点

- 如果你使用的是 StateGraph（Graph API），起始点是执行停止的 node 的开头。
- 如果你在 node 内部进行 subgraph 调用，起始点将是调用被暂停 subgraph 的父 node。在 subgraph 内部，起始点是执行停止的特定 node。
- 如果你使用的是 Functional API，起始点是执行停止的 entrypoint 的开头。

## 优雅关闭（Graceful Shutdown）

需要 `langgraph>=1.2`，目前处于 alpha 阶段。

`RunControl` 并将其作为 `control=` 传递给 `invoke` 或 `stream`。从任何线程调用 `request_drain()` 以发出停止运行的信号：

## 语义（Semantics）

Drain 是协作式的，在 superstep 之间操作，从不抢占已经在运行的任务：

| 场景 | 行为 |
|---|---|
| Node 正在执行中 | 运行至完成。Drain 在下一个 superstep 生效。 |
| Node 带有重试策略，当前正在重试 | 重试循环运行至耗尽或成功。Drain 在之后生效。 |
| Graph 在与 drain 同一 tick 自然完成 | 正常返回。检查 `control.drain_requested` 以区分正常运行。 |
| 还有更多 superstep 剩余 | 抛出 `GraphDrained(reason)`。Checkpoint 已保存且可恢复。 |
| Subgraph 请求 drain | `GraphDrained` 向上冒泡到父 graph，并在其父的下一个 superstep 边界处停止它。 |

## Drain 后恢复

使用相同的 `thread_id`，通过 `invoke(None, config)` 恢复已 drain 的运行：

## 在 Node 内部读取 drain 状态

通过 `runtime` 参数访问 drain 状态，以在 superstep 边界到达前调整 node 行为：

## SIGTERM 钩子模式

处理进程关闭的推荐模式：

`request_drain()` 不会取消正在运行的 asyncio task 或终止线程。对于硬上限，将 drain 与优雅超时和 task 取消配对。
