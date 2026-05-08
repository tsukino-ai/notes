---
title: LangGraph Persistence 持久化
author: LangChain
date: 2024-08-29
source: https://docs.langchain.com/oss/python/langgraph/persistence
tags:
  - LangGraph
  - Agent
  - checkpoint
  - persistence
---

LangGraph has a built-in persistence layer that saves graph state as checkpoints. When you compile a graph with a checkpointer, a snapshot of the graph state is saved at every step of execution, organized into threads. This enables human-in-the-loop workflows, conversational memory, time travel debugging, and fault-tolerant execution.

> [!note] 译文
> LangGraph 内置了一个持久化层（persistence layer），可将图状态保存为检查点（checkpoint）。当你使用 checkpointer 编译图时，执行过程中的每一步都会保存图状态的快照（snapshot），并按线程（thread）进行组织。这使得人机协同（human-in-the-loop）工作流、对话记忆（conversational memory）、时间旅行调试（time travel debugging）和容错执行（fault-tolerant execution）成为可能。

---

## Documentation Index

> [!note] 译文
> ## 文档索引

Fetch the complete documentation index at: https://docs.langchain.com/llms.txt
Use this file to discover all available pages before exploring further.

> [!note] 译文
> 在 https://docs.langchain.com/llms.txt 获取完整的文档索引。
> 在进一步探索之前，请使用此文件发现所有可用页面。

---

## Agent Server handles checkpointing automatically

> [!note] 译文
> ## Agent Server 自动处理检查点

When using the Agent Server, you don't need to implement or configure checkpointers manually. The server handles all persistence infrastructure for you behind the scenes.

> [!note] 译文
> 使用 Agent Server 时，你无需手动实现或配置 checkpointer。服务器会在后台为你处理所有持久化基础设施。

---

## Why use persistence

> [!note] 译文
> ## 为什么要使用持久化

Persistence is required for the following features:

> [!note] 译文
> 以下功能需要使用持久化：

- Human-in-the-loop: Checkpointers facilitate human-in-the-loop workflows by allowing humans to inspect, interrupt, and approve graph steps. Checkpointers are needed for these workflows as the person has to be able to view the state of a graph at any point in time, and the graph has to be able to resume execution after the person has made any updates to the state. See Interrupts for examples.
- Memory: Checkpointers allow for "memory" between interactions. In the case of repeated human interactions (like conversations) any follow up messages can be sent to that thread, which will retain its memory of previous ones. See Add memory for information on how to add and manage conversation memory using checkpointers.
- Time travel: Checkpointers allow for "time travel", allowing users to replay prior graph executions to review and / or debug specific graph steps. In addition, checkpointers make it possible to fork the graph state at arbitrary checkpoints to explore alternative trajectories.
- Fault-tolerance: Checkpointing provides fault-tolerance and error recovery: if one or more nodes fail at a given superstep, you can restart your graph from the last successful step.
- Pending writes: When a graph node fails mid-execution at a given super-step, LangGraph stores pending checkpoint writes from any other nodes that completed successfully at that super-step. When you resume graph execution from that super-step you don't re-run the successful nodes.

> [!note] 译文
> - **Human-in-the-loop（人机协同）**：Checkpointer 支持人机协同工作流，允许人类检查、中断和批准图的执行步骤。这些工作流需要 checkpointer，因为人类必须能够在任何时刻查看图的状态，并且图必须能够在人类更新状态后恢复执行。示例请参见 Interrupts。
> - **Memory（记忆）**：Checkpointer 允许在交互之间保留"记忆"。在重复的人机交互（如对话）中，任何后续消息都可以发送到该线程，线程会保留对先前消息的记忆。有关如何使用 checkpointer 添加和管理对话记忆的信息，请参见 Add memory。
> - **Time travel（时间旅行）**：Checkpointer 支持"时间旅行"，允许用户重放先前的图执行以审查和/或调试特定的图步骤。此外，checkpointer 还可以在任意检查点分叉（fork）图状态，以探索替代路径。
> - **Fault-tolerance（容错性）**：检查点提供容错和错误恢复能力：如果一个或多个节点在给定的 super-step 中失败，你可以从最后一个成功的步骤重新启动图。
> - **Pending writes（待写入）**：当图节点在给定的 super-step 中执行失败时，LangGraph 会存储该 super-step 中其他已成功完成的节点的待写入检查点数据。当你从该 super-step 恢复图执行时，无需重新运行已成功完成的节点。

---

## Core concepts

> [!note] 译文
> ## 核心概念

### Threads

> [!note] 译文
> ### 线程（Threads）

A thread is a unique ID or thread identifier assigned to each checkpoint saved by a checkpointer. It contains the accumulated state of a sequence of runs. When a run is executed, the state of the underlying graph of the assistant will be persisted to the thread. When invoking a graph with a checkpointer, you must specify a thread_id as part of the configurable portion of the config:

> [!note] 译文
> 线程（thread）是 checkpointer 为每个保存的检查点分配的唯一 ID 或线程标识符。它包含一系列运行（run）的累积状态。当执行一次运行时，助手底层图的状态将被持久化到该线程中。使用 checkpointer 调用图时，必须在 config 的可配置部分指定 thread_id：

thread_id as the primary key for storing and retrieving checkpoints. Without it, the checkpointer cannot save state or resume execution after an interrupt, since the checkpointer uses thread_id to load the saved state.

> [!note] 译文
> thread_id 是存储和检索检查点的主键。没有它，checkpointer 无法保存状态或在中断后恢复执行，因为 checkpointer 使用 thread_id 来加载已保存的状态。

---

### Checkpoints

> [!note] 译文
> ### 检查点（Checkpoints）

The state of a thread at a particular point in time is called a checkpoint. A checkpoint is a snapshot of the graph state saved at each super-step and is represented by a StateSnapshot object (see StateSnapshot fields for the full field reference).

> [!note] 译文
> 线程在特定时间点的状态称为检查点（checkpoint）。检查点是每个 super-step 保存的图状态的快照（snapshot），由 StateSnapshot 对象表示（完整字段参考请参见 StateSnapshot fields）。

---

### Super-steps

> [!note] 译文
> ### 超级步骤（Super-steps）

LangGraph creates a checkpoint at each super-step boundary. A super-step is a single "tick" of the graph where all nodes scheduled for that step execute (potentially in parallel). For a sequential graph like START -> A -> B -> END, there are separate super-steps for the input, node A, and node B — producing a checkpoint after each one. Understanding super-step boundaries is important for time travel, because you can only resume execution from a checkpoint (i.e. a super-step boundary).

> [!note] 译文
> LangGraph 在每个 super-step 边界创建一个检查点。super-step 是图的一次"滴答"，其中该步骤安排的所有节点都会执行（可能并行执行）。对于像 START -> A -> B -> END 这样的顺序图，输入、节点 A 和节点 B 分别对应不同的 super-step —— 每个之后都会产生一个检查点。理解 super-step 边界对时间旅行很重要，因为你只能从检查点（即 super-step 边界）恢复执行。

In addition to super-step checkpoints, LangGraph also persists writes at the node (task) level. As each node within a super-step finishes, its outputs are written to the checkpointer's checkpoint_writes table as task entries linked to the in-progress checkpoint. These per-task writes are what enable pending writes recovery: if another node in the same super-step fails, the successful nodes' writes are already durable and don't need to be re-run on resume. The full state snapshot is then committed once the super-step completes.

> [!note] 译文
> 除了 super-step 检查点外，LangGraph 还在节点（任务）级别持久化写入。当 super-step 中的每个节点完成时，其输出会作为任务条目写入 checkpointer 的 checkpoint_writes 表，关联到正在进行的检查点。这些按任务的写入使得待写入恢复成为可能：如果同一 super-step 中的另一个节点失败，已成功节点的写入已经是持久化的，恢复时无需重新运行。完整的 state snapshot 在 super-step 完成后提交。

LangGraph also persists writes from individual node executions within a super-step. These writes are stored as tasks and used for fault tolerance: if another node in the same super-step fails, successful node writes do not need to be recomputed when you resume. These task writes are not full StateSnapshot checkpoints, so time travel resumes from full checkpoints at super-step boundaries.

> [!note] 译文
> LangGraph 还持久化 super-step 中单个节点执行的写入。这些写入作为任务存储，用于容错：如果同一 super-step 中的另一个节点失败，恢复时无需重新计算已成功节点的写入。这些任务写入不是完整的 StateSnapshot 检查点，因此时间旅行从 super-step 边界的完整检查点恢复。

Checkpoints are persisted and can be used to restore the state of a thread at a later time.

> [!note] 译文
> 检查点会被持久化，并可用于在稍后恢复线程的状态。

Let's see what checkpoints are saved when a simple graph is invoked as follows:
- Empty checkpoint with START as the next node to be executed
- Checkpoint with the user input {'foo': '', 'bar': []} and node_a as the next node to be executed
- Checkpoint with the outputs of node_a {'foo': 'a', 'bar': ['a']} and node_b as the next node to be executed
- Checkpoint with the outputs of node_b {'foo': 'b', 'bar': ['a', 'b']} and no next nodes to be executed

> [!note] 译文
> 让我们看看调用简单图时保存了哪些检查点：
> - 空检查点，下一个要执行的节点为 START
> - 检查点，包含用户输入 {'foo': '', 'bar': []}，下一个要执行的节点为 node_a
> - 检查点，包含 node_a 的输出 {'foo': 'a', 'bar': ['a']}，下一个要执行的节点为 node_b
> - 检查点，包含 node_b 的输出 {'foo': 'b', 'bar': ['a', 'b']}，没有下一个要执行的节点

bar channel values contain outputs from both nodes as we have a reducer for bar channel.

> [!note] 译文
> bar 通道的值包含两个节点的输出，因为我们为 bar 通道配置了一个 reducer。

---

### Checkpoint namespace

> [!note] 译文
> ### 检查点命名空间（Checkpoint namespace）

Each checkpoint has a checkpoint_ns (checkpoint namespace) field that identifies which graph or subgraph it belongs to:

> [!note] 译文
> 每个检查点都有一个 checkpoint_ns（checkpoint namespace，检查点命名空间）字段，用于标识它属于哪个图或子图：

- "" (empty string): The checkpoint belongs to the parent (root) graph.
- "node_name:uuid": The checkpoint belongs to a subgraph invoked as the given node. For nested subgraphs, namespaces are joined with | separators (e.g., "outer_node:uuid|inner_node:uuid").

> [!note] 译文
> - `""`（空字符串）：检查点属于父（根）图。
> - `"node_name:uuid"`：检查点属于作为给定节点调用的子图。对于嵌套子图，命名空间使用 `|` 分隔符连接（例如 `"outer_node:uuid|inner_node:uuid"`）。

---

### Get and update state

> [!note] 译文
> ### 获取和更新状态

#### Get state

> [!note] 译文
> #### 获取状态

When interacting with the saved graph state, you must specify a thread identifier. You can view the latest state of the graph by calling graph.get_state(config). This will return a StateSnapshot object that corresponds to the latest checkpoint associated with the thread ID provided in the config or a checkpoint associated with a checkpoint ID for the thread, if provided.

> [!note] 译文
> 与保存的图状态交互时，必须指定线程标识符。你可以通过调用 `graph.get_state(config)` 查看图的最新状态。这将返回一个 StateSnapshot 对象，对应于 config 中提供的线程 ID 关联的最新检查点，或者如果提供了检查点 ID，则对应该线程的该检查点。

get_state will look like this:

> [!note] 译文
> `get_state` 看起来像这样：

StateSnapshot fields

> [!note] 译文
> StateSnapshot 字段

| Field | Type | Description |
|---|---|---|
| values | dict | State channel values at this checkpoint. |
| next | tuple[str, ...] | Node names to execute next. Empty () means the graph is complete. |
| config | dict | Contains thread_id, checkpoint_ns, and checkpoint_id. |
| metadata | dict | Execution metadata. Contains source ("input", "loop", or "update"), writes (node outputs), and step (super-step counter). |
| created_at | str | ISO 8601 timestamp of when this checkpoint was created. |
| parent_config | dict | None | Config of the previous checkpoint. None for the first checkpoint. |
| tasks | tuple[PregelTask, ...] | Tasks to execute at this step. Each task has id, name, error, interrupts, and optionally state (subgraph snapshot, when using subgraphs=True). |

> [!note] 译文
> 上表为 StateSnapshot 的字段说明：values 为状态通道值；next 为下一步要执行的节点名；config 包含 thread_id、checkpoint_ns 和 checkpoint_id；metadata 包含执行元数据；created_at 为创建时间戳；parent_config 为上一个检查点的配置；tasks 为当前步骤要执行的任务列表。

---

#### Get state history

> [!note] 译文
> #### 获取状态历史

You can get the full history of the graph execution for a given thread by calling graph.get_state_history(config). This will return a list of StateSnapshot objects associated with the thread ID provided in the config. Importantly, the checkpoints will be ordered chronologically with the most recent checkpoint / StateSnapshot being the first in the list.

> [!note] 译文
> 你可以通过调用 `graph.get_state_history(config)` 获取给定线程的图执行完整历史。这将返回与 config 中提供的线程 ID 关联的 StateSnapshot 对象列表。重要的是，检查点将按时间顺序排列，最新的检查点 / StateSnapshot 位于列表首位。

get_state_history will look like this:

> [!note] 译文
> `get_state_history` 看起来像这样：

---

#### Find a specific checkpoint

> [!note] 译文
> #### 查找特定检查点

You can filter the state history to find checkpoints matching specific criteria:

> [!note] 译文
> 你可以过滤状态历史以查找符合特定条件的检查点：

---

#### Replay

> [!note] 译文
> #### 重放（Replay）

Replay re-executes steps from a prior checkpoint. Invoke the graph with a prior checkpoint_id to re-run nodes after that checkpoint. Nodes before the checkpoint are skipped (their results are already saved). Nodes after the checkpoint re-execute, including any LLM calls, API requests, or interrupts — which are always re-triggered during replay.

> [!note] 译文
> 重放（replay）会从先前的检查点重新执行步骤。使用先前的 checkpoint_id 调用图以重新运行该检查点之后的节点。检查点之前的节点会被跳过（它们的结果已保存）。检查点之后的节点会重新执行，包括任何 LLM 调用、API 请求或中断 —— 这些在重放期间总是会重新触发。

See Time travel for full details and code examples on replaying past executions.

> [!note] 译文
> 有关重放过去执行的完整详细信息和代码示例，请参见 Time travel。

---

#### Update state

> [!note] 译文
> #### 更新状态

You can edit the graph state using update_state. This creates a new checkpoint with the updated values — it does not modify the original checkpoint. The update is treated the same as a node update: values are passed through reducer functions when defined, so channels with reducers accumulate values rather than overwrite them.

> [!note] 译文
> 你可以使用 `update_state` 编辑图状态。这会创建一个包含更新值的新检查点 —— 它不会修改原始检查点。更新被视为与节点更新相同：定义了 reducer 函数时，值会通过 reducer 传递，因此带有 reducer 的通道会累积值而不是覆盖它们。

You can optionally specify as_node to control which node the update is treated as coming from, which affects which node executes next. See Time travel: as_node for details.

> [!note] 译文
> 你可以选择性指定 `as_node` 来控制更新被视为来自哪个节点，这会影响接下来执行哪个节点。详情请参见 Time travel: as_node。

---

## Memory store

> [!note] 译文
> ## 记忆存储（Memory store）

A state schema specifies a set of keys that are populated as a graph is executed. As discussed above, state can be written by a checkpointer to a thread at each graph step, enabling state persistence. What if we want to retain some information across threads? Consider the case of a chatbot where we want to retain specific information about the user across all chat conversations (e.g., threads) with that user! With checkpointers alone, we cannot share information across threads. This motivates the need for the Store interface.

> [!note] 译文
> 状态模式（state schema）指定了一组在图执行时被填充的键。如上所述，状态可以由 checkpointer 在图的每个步骤写入线程，从而实现状态持久化。但如果我们想跨线程保留某些信息呢？考虑一个聊天机器人的场景，我们希望在与该用户的所有聊天对话（即线程）中保留关于该用户的特定信息！仅靠 checkpointer，我们无法跨线程共享信息。这就催生了对 Store 接口的需求。

As an illustration, we can define an InMemoryStore to store information about a user across threads. We simply compile our graph with a checkpointer, as before, and pass the store.

> [!note] 译文
> 作为示例，我们可以定义一个 InMemoryStore 来跨线程存储用户信息。我们只需像往常一样使用 checkpointer 编译图，并传入 store。

LangGraph API handles stores automatically
When using the LangGraph API, you don't need to implement or configure stores manually. The API handles all storage infrastructure for you behind the scenes.

> [!note] 译文
> LangGraph API 自动处理存储
> 使用 LangGraph API 时，你无需手动实现或配置存储。API 会在后台为你处理所有存储基础设施。

InMemoryStore is suitable for development and testing. For production, use a persistent store like PostgresStore, MongoDBStore, or RedisStore. All implementations extend BaseStore, which is the type annotation to use in node function signatures.

> [!note] 译文
> InMemoryStore 适用于开发和测试。对于生产环境，请使用持久化存储，如 PostgresStore、MongoDBStore 或 RedisStore。所有实现都继承自 BaseStore，这是在节点函数签名中使用的类型注解。

---

### Basic usage

> [!note] 译文
> ### 基本用法

First, let's showcase this in isolation without using LangGraph.

> [!note] 译文
> 首先，让我们在不使用 LangGraph 的情况下单独展示这一点。

tuple, which in this specific example will be (<user_id>, "memories"). The namespace can be any length and represent anything, does not have to be user specific.

> [!note] 译文
> 元组（tuple），在此特定示例中为 `(<user_id>, "memories")`。命名空间（namespace）可以是任意长度，可以代表任何事物，不必是用户特定的。

store.put method to save memories to our namespace in the store. When we do this, we specify the namespace, as defined above, and a key-value pair for the memory: the key is simply a unique identifier for the memory (memory_id) and the value (a dictionary) is the memory itself.

> [!note] 译文
> `store.put` 方法用于将记忆保存到存储中的命名空间。执行此操作时，我们指定如上所述的命名空间，以及记忆的键值对：键是记忆的唯一标识符（memory_id），值（字典）是记忆本身。

store.search method, which will return all memories for a given user as a list. The most recent memory is the last in the list.

> [!note] 译文
> `store.search` 方法，将返回给定用户的所有记忆作为列表。最新的记忆位于列表末尾。

Item) with certain attributes. We can access it as a dictionary by converting via .dict as above.

> [!note] 译文
> Item）具有某些属性。我们可以通过 `.dict` 转换为字典来访问它，如上所示。

The attributes it has are:
- value: The value (itself a dictionary) of this memory
- key: A unique key for this memory in this namespace
- namespace: A tuple of strings, the namespace of this memory type. While the type is tuple[str, ...], it may be serialized as a list when converted to JSON (for example, ['1', 'memories']).
- created_at: Timestamp for when this memory was created
- updated_at: Timestamp for when this memory was updated

> [!note] 译文
> 它具有以下属性：
> - **value**：该记忆的值（本身是一个字典）
> - **key**：该记忆在此命名空间中的唯一键
> - **namespace**：字符串元组，该记忆类型的命名空间。虽然类型是 `tuple[str, ...]`，但在转换为 JSON 时可能会序列化为列表（例如 `['1', 'memories']`）
> - **created_at**：该记忆创建的时间戳
> - **updated_at**：该记忆更新的时间戳

---

### Semantic search

> [!note] 译文
> ### 语义搜索

Beyond simple retrieval, the store also supports semantic search, allowing you to find memories based on meaning rather than exact matches. To enable this, configure the store with an embedding model:

> [!note] 译文
> 除了简单检索外，存储还支持语义搜索（semantic search），允许你基于含义而非精确匹配来查找记忆。要启用此功能，请使用嵌入模型（embedding model）配置存储：

fields parameter or by specifying the index parameter when storing memories:

> [!note] 译文
> 可以通过 fields 参数或在存储记忆时指定 index 参数来配置：

---

### Using in LangGraph

> [!note] 译文
> ### 在 LangGraph 中使用

With this all in place, we use the store in LangGraph. The store works hand-in-hand with the checkpointer: the checkpointer saves state to threads, as discussed above, and the store allows us to store arbitrary information for access across threads. We compile the graph with both the checkpointer and the store as follows.

> [!note] 译文
> 一切准备就绪后，我们在 LangGraph 中使用存储。存储与 checkpointer 协同工作：checkpointer 将状态保存到线程（如上所述），而存储允许我们存储任意信息以供跨线程访问。我们同时使用 checkpointer 和存储编译图，如下所示。

thread_id, as before, and also with a user_id, which we'll use to namespace our memories to this particular user as we showed above.

> [!note] 译文
> 如前所述的 thread_id，以及 user_id，我们将使用它来将记忆命名空间限定为此特定用户，如上所示。

user_id in any node by using the Runtime object. The Runtime is automatically injected by LangGraph when you add it as a parameter to your node function. Here's how you might use it to save memories:

> [!note] 译文
> 通过使用 Runtime 对象在任何节点中访问 user_id。当你将 Runtime 作为参数添加到节点函数时，LangGraph 会自动注入它。以下是你可能使用它来保存记忆的方式：

store.search method to get memories. Recall the memories are returned as a list of objects that can be converted to a dictionary.

> [!note] 译文
> 使用 `store.search` 方法获取记忆。请注意，记忆以对象列表的形式返回，可以转换为字典。

user_id is the same.

> [!note] 译文
> user_id 是相同的。

langgraph.json file. For example:

> [!note] 译文
> langgraph.json 文件中。例如：

---

## Optimize checkpoint storage

> [!note] 译文
> ## 优化检查点存储

By default, LangGraph checkpoints write the full value of every state channel at each super-step. For long-running threads with large accumulations—such as multi-turn conversations—this can produce significant storage growth over time.

> [!note] 译文
> 默认情况下，LangGraph 检查点在每个 super-step 写入每个状态通道的完整值。对于具有大量累积的长期运行线程（例如多轮对话），这可能导致存储随时间显著增长。

DeltaChannel stores only incremental deltas instead of the full accumulated value, substantially reducing checkpoint size for append-heavy channels. See DeltaChannel for usage and the storage-vs-latency tradeoff.

> [!note] 译文
> DeltaChannel 仅存储增量差异（delta）而非完整的累积值，从而大幅减少了以追加为主的通道的检查点大小。有关用法和存储与延迟的权衡，请参见 DeltaChannel。

---

## Checkpointer libraries

> [!note] 译文
> ## Checkpointer 库

Under the hood, checkpointing is powered by checkpointer objects that conform to BaseCheckpointSaver interface. LangGraph provides several checkpointer implementations, all implemented via standalone, installable libraries.

> [!note] 译文
> 在底层，检查点由符合 BaseCheckpointSaver 接口的 checkpointer 对象驱动。LangGraph 提供了多种 checkpointer 实现，均通过独立的、可安装的库实现。

See checkpointer integrations for available providers.

> [!note] 译文
> 有关可用的提供商，请参见 checkpointer integrations。

- langgraph-checkpoint: The base interface for checkpointer savers (BaseCheckpointSaver) and serialization/deserialization interface (SerializerProtocol). Includes in-memory checkpointer implementation (InMemorySaver) for experimentation. LangGraph comes with langgraph-checkpoint included.
- langgraph-checkpoint-sqlite: An implementation of LangGraph checkpointer that uses SQLite database (SqliteSaver / AsyncSqliteSaver). Ideal for experimentation and local workflows. Needs to be installed separately.
- langgraph-checkpoint-postgres: An advanced checkpointer that uses Postgres database (PostgresSaver / AsyncPostgresSaver), used in LangSmith. Ideal for using in production. Needs to be installed separately.
- langchain-azure-cosmosdb: An implementation of LangGraph checkpointer that uses Azure Cosmos DB for NoSQL (CosmosDBSaverSync / CosmosDBSaver). Ideal for using in production with Azure. Supports both sync and async operations, with Microsoft Entra ID authentication. Needs to be installed separately.

> [!note] 译文
> - **langgraph-checkpoint**：checkpointer saver 的基础接口（BaseCheckpointSaver）和序列化/反序列化接口（SerializerProtocol）。包含内存中的 checkpointer 实现（InMemorySaver）用于实验。LangGraph 已包含 langgraph-checkpoint。
> - **langgraph-checkpoint-sqlite**：使用 SQLite 数据库（SqliteSaver / AsyncSqliteSaver）的 LangGraph checkpointer 实现。适用于实验和本地工作流。需要单独安装。
> - **langgraph-checkpoint-postgres**：使用 Postgres 数据库（PostgresSaver / AsyncPostgresSaver）的高级 checkpointer，在 LangSmith 中使用。适用于生产环境。需要单独安装。
> - **langchain-azure-cosmosdb**：使用 Azure Cosmos DB for NoSQL（CosmosDBSaverSync / CosmosDBSaver）的 LangGraph checkpointer 实现。适用于 Azure 生产环境。支持同步和异步操作，以及 Microsoft Entra ID 身份验证。需要单独安装。

---

### Checkpointer interface

> [!note] 译文
> ### Checkpointer 接口

Each checkpointer conforms to BaseCheckpointSaver interface and implements the following methods:

> [!note] 译文
> 每个 checkpointer 都符合 BaseCheckpointSaver 接口，并实现以下方法：

- .put - Store a checkpoint with its configuration and metadata.
- .put_writes - Store intermediate writes linked to a checkpoint (i.e. pending writes).
- .get_tuple - Fetch a checkpoint tuple using for a given configuration (thread_id and checkpoint_id). This is used to populate StateSnapshot in graph.get_state().
- .list - List checkpoints that match a given configuration and filter criteria. This is used to populate state history in graph.get_state_history().

> [!note] 译文
> - **.put** — 存储检查点及其配置和元数据。
> - **.put_writes** — 存储与检查点关联的中间写入（即待写入）。
> - **.get_tuple** — 根据给定配置（thread_id 和 checkpoint_id）获取检查点元组。用于填充 `graph.get_state()` 中的 StateSnapshot。
> - **.list** — 列出符合给定配置和过滤条件的检查点。用于填充 `graph.get_state_history()` 中的状态历史。

For running your graph asynchronously, you can use InMemorySaver, or async versions of Sqlite/Postgres checkpointers — AsyncSqliteSaver / AsyncPostgresSaver checkpointers.

> [!note] 译文
> 要异步运行图，你可以使用 InMemorySaver，或 Sqlite/Postgres checkpointer 的异步版本 —— AsyncSqliteSaver / AsyncPostgresSaver checkpointer。

---

### Serializer

> [!note] 译文
> ### 序列化器（Serializer）

When checkpointers save the graph state, they need to serialize the channel values in the state. This is done using serializer objects.

> [!note] 译文
> 当 checkpointer 保存图状态时，需要序列化状态中的通道值。这是通过序列化器（serializer）对象完成的。

langgraph_checkpoint defines protocol for implementing serializers provides a default implementation (JsonPlusSerializer) that handles a wide variety of types, including LangChain and LangGraph primitives, datetimes, enums and more.

> [!note] 译文
> langgraph_checkpoint 定义了实现序列化器的协议，提供了默认实现（JsonPlusSerializer），可处理多种类型，包括 LangChain 和 LangGraph 的原语、日期时间、枚举等。

---

#### Serialization with pickle

> [!note] 译文
> #### 使用 pickle 序列化

The default serializer, JsonPlusSerializer, uses ormsgpack and JSON under the hood, which is not suitable for all types of objects.

> [!note] 译文
> 默认序列化器 JsonPlusSerializer 底层使用 ormsgpack 和 JSON，这不适用于所有类型的对象。

If you want to fallback to pickle for objects not currently supported by our msgpack encoder (such as Pandas dataframes), you can use the pickle_fallback argument of the JsonPlusSerializer:

> [!note] 译文
> 如果你想对当前 msgpack 编码器不支持的对象（例如 Pandas dataframes）回退到 pickle，可以使用 JsonPlusSerializer 的 pickle_fallback 参数：

---

### Encryption

> [!note] 译文
> ### 加密

Checkpointers can optionally encrypt all persisted state. To enable this, pass an instance of EncryptedSerializer to the serde argument of any BaseCheckpointSaver implementation. The easiest way to create an encrypted serializer is via from_pycryptodome_aes, which reads the AES key from the LANGGRAPH_AES_KEY environment variable (or accepts a key argument):

> [!note] 译文
> Checkpointer 可以选择加密所有持久化状态。要启用此功能，请将 EncryptedSerializer 实例传递给任何 BaseCheckpointSaver 实现的 serde 参数。创建加密序列化器的最简单方法是通过 from_pycryptodome_aes，它从 LANGGRAPH_AES_KEY 环境变量读取 AES 密钥（或接受 key 参数）：

LANGGRAPH_AES_KEY is present, so you only need to provide the environment variable. Other encryption schemes can be used by implementing CipherProtocol and supplying it to EncryptedSerializer.

> [!note] 译文
> 只需提供 LANGGRAPH_AES_KEY 环境变量即可。其他加密方案可以通过实现 CipherProtocol 并将其提供给 EncryptedSerializer 来使用。
