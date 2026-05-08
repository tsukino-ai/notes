---
title: Persistence - Docs by LangChain
author: LangChain
source: https://docs.langchain.com/oss/python/langgraph/persistence
date: 2024-08-29
---

LangGraph has a built-in persistence layer that saves graph state as checkpoints. When you compile a graph with a checkpointer, a snapshot of the graph state is saved at every step of execution, organized into threads. This enables human-in-the-loop workflows, conversational memory, time travel debugging, and fault-tolerant execution.

## Documentation Index

Fetch the complete documentation index at: https://docs.langchain.com/llms.txt
Use this file to discover all available pages before exploring further.

## Agent Server handles checkpointing automatically

When using the Agent Server, you don't need to implement or configure checkpointers manually. The server handles all persistence infrastructure for you behind the scenes.

## Why use persistence

Persistence is required for the following features:

- Human-in-the-loop: Checkpointers facilitate human-in-the-loop workflows by allowing humans to inspect, interrupt, and approve graph steps. Checkpointers are needed for these workflows as the person has to be able to view the state of a graph at any point in time, and the graph has to be able to resume execution after the person has made any updates to the state. See Interrupts for examples.
- Memory: Checkpointers allow for "memory" between interactions. In the case of repeated human interactions (like conversations) any follow up messages can be sent to that thread, which will retain its memory of previous ones. See Add memory for information on how to add and manage conversation memory using checkpointers.
- Time travel: Checkpointers allow for "time travel", allowing users to replay prior graph executions to review and / or debug specific graph steps. In addition, checkpointers make it possible to fork the graph state at arbitrary checkpoints to explore alternative trajectories.
- Fault-tolerance: Checkpointing provides fault-tolerance and error recovery: if one or more nodes fail at a given superstep, you can restart your graph from the last successful step.
- Pending writes: When a graph node fails mid-execution at a given super-step, LangGraph stores pending checkpoint writes from any other nodes that completed successfully at that super-step. When you resume graph execution from that super-step you don't re-run the successful nodes.

## Core concepts

### Threads

A thread is a unique ID or thread identifier assigned to each checkpoint saved by a checkpointer. It contains the accumulated state of a sequence of runs. When a run is executed, the state of the underlying graph of the assistant will be persisted to the thread. When invoking a graph with a checkpointer, you must specify a thread_id as part of the configurable portion of the config:

thread_id as the primary key for storing and retrieving checkpoints. Without it, the checkpointer cannot save state or resume execution after an interrupt, since the checkpointer uses thread_id to load the saved state.

### Checkpoints

The state of a thread at a particular point in time is called a checkpoint. A checkpoint is a snapshot of the graph state saved at each super-step and is represented by a StateSnapshot object (see StateSnapshot fields for the full field reference).

### Super-steps

LangGraph creates a checkpoint at each super-step boundary. A super-step is a single "tick" of the graph where all nodes scheduled for that step execute (potentially in parallel). For a sequential graph like START -> A -> B -> END, there are separate super-steps for the input, node A, and node B — producing a checkpoint after each one. Understanding super-step boundaries is important for time travel, because you can only resume execution from a checkpoint (i.e. a super-step boundary).

In addition to super-step checkpoints, LangGraph also persists writes at the node (task) level. As each node within a super-step finishes, its outputs are written to the checkpointer's checkpoint_writes table as task entries linked to the in-progress checkpoint. These per-task writes are what enable pending writes recovery: if another node in the same super-step fails, the successful nodes' writes are already durable and don't need to be re-run on resume. The full state snapshot is then committed once the super-step completes.

LangGraph also persists writes from individual node executions within a super-step. These writes are stored as tasks and used for fault tolerance: if another node in the same super-step fails, successful node writes do not need to be recomputed when you resume. These task writes are not full StateSnapshot checkpoints, so time travel resumes from full checkpoints at super-step boundaries.

Checkpoints are persisted and can be used to restore the state of a thread at a later time.

Let's see what checkpoints are saved when a simple graph is invoked as follows:
- Empty checkpoint with START as the next node to be executed
- Checkpoint with the user input {'foo': '', 'bar': []} and node_a as the next node to be executed
- Checkpoint with the outputs of node_a {'foo': 'a', 'bar': ['a']} and node_b as the next node to be executed
- Checkpoint with the outputs of node_b {'foo': 'b', 'bar': ['a', 'b']} and no next nodes to be executed

bar channel values contain outputs from both nodes as we have a reducer for bar channel.

### Checkpoint namespace

Each checkpoint has a checkpoint_ns (checkpoint namespace) field that identifies which graph or subgraph it belongs to:

- "" (empty string): The checkpoint belongs to the parent (root) graph.
- "node_name:uuid": The checkpoint belongs to a subgraph invoked as the given node. For nested subgraphs, namespaces are joined with | separators (e.g., "outer_node:uuid|inner_node:uuid").

### Get and update state

#### Get state

When interacting with the saved graph state, you must specify a thread identifier. You can view the latest state of the graph by calling graph.get_state(config). This will return a StateSnapshot object that corresponds to the latest checkpoint associated with the thread ID provided in the config or a checkpoint associated with a checkpoint ID for the thread, if provided.

get_state will look like this:

StateSnapshot fields

| Field | Type | Description |
|---|---|---|
| values | dict | State channel values at this checkpoint. |
| next | tuple[str, ...] | Node names to execute next. Empty () means the graph is complete. |
| config | dict | Contains thread_id, checkpoint_ns, and checkpoint_id. |
| metadata | dict | Execution metadata. Contains source ("input", "loop", or "update"), writes (node outputs), and step (super-step counter). |
| created_at | str | ISO 8601 timestamp of when this checkpoint was created. |
| parent_config | dict | None | Config of the previous checkpoint. None for the first checkpoint. |
| tasks | tuple[PregelTask, ...] | Tasks to execute at this step. Each task has id, name, error, interrupts, and optionally state (subgraph snapshot, when using subgraphs=True). |

#### Get state history

You can get the full history of the graph execution for a given thread by calling graph.get_state_history(config). This will return a list of StateSnapshot objects associated with the thread ID provided in the config. Importantly, the checkpoints will be ordered chronologically with the most recent checkpoint / StateSnapshot being the first in the list.

get_state_history will look like this:

#### Find a specific checkpoint

You can filter the state history to find checkpoints matching specific criteria:

#### Replay

Replay re-executes steps from a prior checkpoint. Invoke the graph with a prior checkpoint_id to re-run nodes after that checkpoint. Nodes before the checkpoint are skipped (their results are already saved). Nodes after the checkpoint re-execute, including any LLM calls, API requests, or interrupts — which are always re-triggered during replay.

See Time travel for full details and code examples on replaying past executions.

#### Update state

You can edit the graph state using update_state. This creates a new checkpoint with the updated values — it does not modify the original checkpoint. The update is treated the same as a node update: values are passed through reducer functions when defined, so channels with reducers accumulate values rather than overwrite them.

You can optionally specify as_node to control which node the update is treated as coming from, which affects which node executes next. See Time travel: as_node for details.

## Memory store

A state schema specifies a set of keys that are populated as a graph is executed. As discussed above, state can be written by a checkpointer to a thread at each graph step, enabling state persistence. What if we want to retain some information across threads? Consider the case of a chatbot where we want to retain specific information about the user across all chat conversations (e.g., threads) with that user! With checkpointers alone, we cannot share information across threads. This motivates the need for the Store interface.

As an illustration, we can define an InMemoryStore to store information about a user across threads. We simply compile our graph with a checkpointer, as before, and pass the store.

LangGraph API handles stores automatically
When using the LangGraph API, you don't need to implement or configure stores manually. The API handles all storage infrastructure for you behind the scenes.

InMemoryStore is suitable for development and testing. For production, use a persistent store like PostgresStore, MongoDBStore, or RedisStore. All implementations extend BaseStore, which is the type annotation to use in node function signatures.

### Basic usage

First, let's showcase this in isolation without using LangGraph.

tuple, which in this specific example will be (<user_id>, "memories"). The namespace can be any length and represent anything, does not have to be user specific.

store.put method to save memories to our namespace in the store. When we do this, we specify the namespace, as defined above, and a key-value pair for the memory: the key is simply a unique identifier for the memory (memory_id) and the value (a dictionary) is the memory itself.

store.search method, which will return all memories for a given user as a list. The most recent memory is the last in the list.

Item) with certain attributes. We can access it as a dictionary by converting via .dict as above.

The attributes it has are:
- value: The value (itself a dictionary) of this memory
- key: A unique key for this memory in this namespace
- namespace: A tuple of strings, the namespace of this memory type. While the type is tuple[str, ...], it may be serialized as a list when converted to JSON (for example, ['1', 'memories']).
- created_at: Timestamp for when this memory was created
- updated_at: Timestamp for when this memory was updated

### Semantic search

Beyond simple retrieval, the store also supports semantic search, allowing you to find memories based on meaning rather than exact matches. To enable this, configure the store with an embedding model:

fields parameter or by specifying the index parameter when storing memories:

### Using in LangGraph

With this all in place, we use the store in LangGraph. The store works hand-in-hand with the checkpointer: the checkpointer saves state to threads, as discussed above, and the store allows us to store arbitrary information for access across threads. We compile the graph with both the checkpointer and the store as follows.

thread_id, as before, and also with a user_id, which we'll use to namespace our memories to this particular user as we showed above.

user_id in any node by using the Runtime object. The Runtime is automatically injected by LangGraph when you add it as a parameter to your node function. Here's how you might use it to save memories:

store.search method to get memories. Recall the memories are returned as a list of objects that can be converted to a dictionary.

user_id is the same.

langgraph.json file. For example:

## Optimize checkpoint storage

By default, LangGraph checkpoints write the full value of every state channel at each super-step. For long-running threads with large accumulations—such as multi-turn conversations—this can produce significant storage growth over time.

DeltaChannel stores only incremental deltas instead of the full accumulated value, substantially reducing checkpoint size for append-heavy channels. See DeltaChannel for usage and the storage-vs-latency tradeoff.

## Checkpointer libraries

Under the hood, checkpointing is powered by checkpointer objects that conform to BaseCheckpointSaver interface. LangGraph provides several checkpointer implementations, all implemented via standalone, installable libraries.

See checkpointer integrations for available providers.

- langgraph-checkpoint: The base interface for checkpointer savers (BaseCheckpointSaver) and serialization/deserialization interface (SerializerProtocol). Includes in-memory checkpointer implementation (InMemorySaver) for experimentation. LangGraph comes with langgraph-checkpoint included.
- langgraph-checkpoint-sqlite: An implementation of LangGraph checkpointer that uses SQLite database (SqliteSaver / AsyncSqliteSaver). Ideal for experimentation and local workflows. Needs to be installed separately.
- langgraph-checkpoint-postgres: An advanced checkpointer that uses Postgres database (PostgresSaver / AsyncPostgresSaver), used in LangSmith. Ideal for using in production. Needs to be installed separately.
- langchain-azure-cosmosdb: An implementation of LangGraph checkpointer that uses Azure Cosmos DB for NoSQL (CosmosDBSaverSync / CosmosDBSaver). Ideal for using in production with Azure. Supports both sync and async operations, with Microsoft Entra ID authentication. Needs to be installed separately.

### Checkpointer interface

Each checkpointer conforms to BaseCheckpointSaver interface and implements the following methods:

- .put - Store a checkpoint with its configuration and metadata.
- .put_writes - Store intermediate writes linked to a checkpoint (i.e. pending writes).
- .get_tuple - Fetch a checkpoint tuple using for a given configuration (thread_id and checkpoint_id). This is used to populate StateSnapshot in graph.get_state().
- .list - List checkpoints that match a given configuration and filter criteria. This is used to populate state history in graph.get_state_history().

For running your graph asynchronously, you can use InMemorySaver, or async versions of Sqlite/Postgres checkpointers — AsyncSqliteSaver / AsyncPostgresSaver checkpointers.

### Serializer

When checkpointers save the graph state, they need to serialize the channel values in the state. This is done using serializer objects.

langgraph_checkpoint defines protocol for implementing serializers provides a default implementation (JsonPlusSerializer) that handles a wide variety of types, including LangChain and LangGraph primitives, datetimes, enums and more.

#### Serialization with pickle

The default serializer, JsonPlusSerializer, uses ormsgpack and JSON under the hood, which is not suitable for all types of objects.

If you want to fallback to pickle for objects not currently supported by our msgpack encoder (such as Pandas dataframes), you can use the pickle_fallback argument of the JsonPlusSerializer:

### Encryption

Checkpointers can optionally encrypt all persisted state. To enable this, pass an instance of EncryptedSerializer to the serde argument of any BaseCheckpointSaver implementation. The easiest way to create an encrypted serializer is via from_pycryptodome_aes, which reads the AES key from the LANGGRAPH_AES_KEY environment variable (or accepts a key argument):

LANGGRAPH_AES_KEY is present, so you only need to provide the environment variable. Other encryption schemes can be used by implementing CipherProtocol and supplying it to EncryptedSerializer.
