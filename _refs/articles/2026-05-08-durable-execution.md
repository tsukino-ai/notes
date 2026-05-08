---
title: Durable execution - Docs by LangChain
author: LangChain
source: https://docs.langchain.com/oss/python/langgraph/durable-execution
date: 2026-05-07
---

Durable execution is a technique in which a process or workflow saves its progress at key points, allowing it to pause and later resume exactly where it left off. This is particularly useful in scenarios that require human-in-the-loop, where users can inspect, validate, or modify the process before continuing, and in long-running tasks that might encounter interruptions or errors (e.g., calls to an LLM timing out). By preserving completed work, durable execution enables a process to resume without reprocessing previous steps — even after a significant delay (e.g., a week later). LangGraph's built-in persistence layer provides durable execution for workflows, ensuring that the state of each execution step is saved to a durable store. This capability guarantees that if a workflow is interrupted — whether by a system failure or for human-in-the-loop interactions — it can be resumed from its last recorded state.

## Documentation Index

Fetch the complete documentation index at: https://docs.langchain.com/llms.txt
Use this file to discover all available pages before exploring further.

## Requirements

To leverage durable execution in LangGraph, you need to:

- Enable persistence in your workflow by specifying a checkpointer that will save workflow progress.
- Specify a thread identifier when executing a workflow. This will track the execution history for a particular instance of the workflow.
- Wrap any non-deterministic operations (e.g., random number generation) or operations with side effects (e.g., file writes, API calls) inside tasks to ensure that when a workflow is resumed, these operations are not repeated for the particular run, and instead their results are retrieved from the persistence layer. For more information, see Determinism and Consistent Replay.

## Determinism and consistent replay

When you resume a workflow run, the code does NOT resume from the same line of code where execution stopped; instead, it will identify an appropriate starting point from which to pick up where it left off. This means that the workflow will replay all steps from the starting point until it reaches the point where it was stopped. As a result, when you are writing a workflow for durable execution, you must wrap any non-deterministic operations (e.g., random number generation) and any operations with side effects (e.g., file writes, API calls) inside tasks or nodes. To ensure that your workflow is deterministic and can be consistently replayed, follow these guidelines:

- Avoid Repeating Work: If a node contains multiple operations with side effects (e.g., logging, file writes, or network calls), wrap each operation in a separate task. This ensures that when the workflow is resumed, the operations are not repeated, and their results are retrieved from the persistence layer.
- Encapsulate Non-Deterministic Operations: Wrap any code that might yield non-deterministic results (e.g., random number generation) inside tasks or nodes. This ensures that, upon resumption, the workflow follows the exact recorded sequence of steps with the same outcomes.
- Use Idempotent Operations: When possible ensure that side effects (e.g., API calls, file writes) are idempotent. This means that if an operation is retried after a failure in the workflow, it will have the same effect as the first time it was executed. This is particularly important for operations that result in data writes. In the event that a task starts but fails to complete successfully, the workflow's resumption will re-run the task, relying on recorded outcomes to maintain consistency. Use idempotency keys or verify existing results to avoid unintended duplication, ensuring a smooth and predictable workflow execution.

## Durability modes

LangGraph supports three durability modes that allow you to balance performance and data consistency based on your application's requirements. A higher durability mode adds more overhead to the workflow execution. You can specify the durability mode when calling any graph execution method:

- "exit": LangGraph persists changes only when graph execution exits either successfully, with an error, or due to a human in the loop interrupt. This provides the best performance for long-running graphs but means intermediate state is not saved, so you cannot recover from system failures (like process crashes) that occur mid-execution.
- "async": LangGraph persists changes asynchronously while the next step executes. This provides good performance and durability, but there's a small risk that LangGraph does not write checkpoints if the process crashes during execution.
- "sync": LangGraph persists changes synchronously before the next step starts. This ensures that LangGraph writes every checkpoint before continuing execution, providing high durability at the cost of some performance overhead.

## Using tasks in nodes

If a node contains multiple operations, you may find it easier to convert each operation into a task rather than refactor the operations into individual nodes.

## Resuming workflows

Once you have enabled durable execution in your workflow, you can resume execution for the following scenarios:

- Pausing and Resuming Workflows: Use the interrupt function to pause a workflow at specific points and the Command primitive to resume it with updated state. See Interrupts for more details.
- Recovering from Failures: Automatically resume workflows from the last successful checkpoint after an exception (e.g., LLM provider outage). This involves executing the workflow with the same thread identifier by providing it with a None as the input value (see this example with the functional API).

## Starting points for resuming workflows

- If you're using a StateGraph (Graph API), the starting point is the beginning of the node where execution stopped.
- If you're making a subgraph call inside a node, the starting point will be the parent node that called the subgraph that was halted. Inside the subgraph, the starting point will be the specific node where execution stopped.
- If you're using the Functional API, the starting point is the beginning of the entrypoint where execution stopped.

## Graceful shutdown

Requires langgraph>=1.2, currently in alpha.

RunControl and pass it as control= to invoke or stream. Call request_drain() from any thread to signal that the run should stop:

## Semantics

Drain is cooperative and operates between supersteps, never preempting work that is already running:

| Scenario | Behavior |
|---|---|
| Node mid-execution | Runs to completion. Drain takes effect on the next superstep. |
| Node with a retry policy currently retrying | Retry loop runs to exhaustion or success. Drain takes effect after. |
| Graph finishes naturally on the same tick as drain | Returns normally. Inspect control.drain_requested to distinguish from a normal run. |
| More supersteps remain | Raises GraphDrained(reason). Checkpoint is saved and resumable. |
| Subgraph requests drain | GraphDrained bubbles up through the parent and stops it at its own next superstep boundary. |

## Resume after drain

Resume a drained run with invoke(None, config) using the same thread_id.

## Read drain state inside a node

Access drain state through the runtime parameter to adjust node behavior before the superstep boundary is reached.

## SIGTERM hook pattern

The recommended pattern for handling process shutdown:

request_drain() does not cancel running asyncio tasks or kill threads. For a hard upper bound, pair drain with a graceful timeout and task cancellation.
