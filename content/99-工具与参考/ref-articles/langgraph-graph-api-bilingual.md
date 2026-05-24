---
title: LangGraph Graph API 概述
author: LangChain
date: 2026-05-07
source: https://docs.langchain.com/oss/python/langgraph/graph-api
tags:
  - LangGraph
  - Agent
  - Graph-API
---

Documentation Index

> [!note] 译文
> 文档索引

Fetch the complete documentation index at: https://docs.langchain.com/llms.txt
Use this file to discover all available pages before exploring further.

> [!note] 译文
> 获取完整文档索引，请访问：https://docs.langchain.com/llms.txt
> 在进一步探索之前，请使用此文件发现所有可用页面。

---

## Graphs

> [!note] 译文
> ## 图（Graphs）

At its core, LangGraph models agent workflows as graphs. You define the behavior of your agents using three key components:

> [!note] 译文
> LangGraph 的核心是将 Agent 工作流建模为图（Graph）。你可以使用三个关键组件来定义 Agent 的行为：

- **State**: A shared data structure that represents the current snapshot of your application. It can be any data type, but is typically defined using a shared state schema.
- **Nodes**: Functions that encode the logic of your agents. They receive the current state as input, perform some computation or side-effect, and return an updated state.
- **Edges**: Functions that determine which Node to execute next based on the current state. They can be conditional branches or fixed transitions.

> [!note] 译文
> - **State（状态）**：一种共享的数据结构，表示应用程序的当前快照。它可以是任何数据类型，但通常使用共享状态模式（shared state schema）来定义。
> - **Nodes（节点）**：对 Agent 逻辑进行编码的函数。它们接收当前状态作为输入，执行某些计算或副作用，并返回一个更新后的状态。
> - **Edges（边）**：根据当前状态决定接下来执行哪个节点（Node）的函数。它们可以是条件分支，也可以是固定转换。

With Nodes and Edges, you can create complex, looping workflows that evolve the state over time. The real power, though, comes from how LangGraph manages that state.

> [!note] 译文
> 借助节点（Nodes）和边（Edges），你可以创建复杂的循环工作流，使状态随时间演化。然而，真正的威力来自于 LangGraph 管理该状态的方式。

To emphasize: Nodes and Edges are nothing more than functions—they can contain an LLM or just good ol' code.

> [!note] 译文
> 需要强调的是：节点和边只不过是函数——它们可以包含大语言模型（LLM），也可以只是普通的代码。

In short: nodes do the work, edges tell what to do next.

> [!note] 译文
> 简而言之：节点负责干活，边负责告诉接下来该做什么。

LangGraph's underlying graph algorithm uses message passing to define a general program. When a Node completes its operation, it sends messages along one or more edges to other node(s). These recipient nodes then execute their functions, pass the resulting messages to the next set of nodes, and the process continues. Inspired by Google's Pregel system, the program proceeds in discrete "super-steps."

> [!note] 译文
> LangGraph 底层的图算法使用消息传递（message passing）来定义通用程序。当一个节点完成其操作时，它会沿着一条或多条边向其他节点发送消息。这些接收节点随后执行各自的函数，将生成的消息传递给下一组节点，如此往复。受 Google Pregel 系统的启发，程序以离散的"超级步"（super-steps）推进。

A super-step can be considered a single iteration over the graph nodes. Nodes that run in parallel are part of the same super-step, while nodes that run sequentially belong to separate super-steps. At the start of graph execution, all nodes begin in an inactive state. A node becomes active when it receives a new message (state) on any of its incoming edges (or "channels"). The active node then runs its function and responds with updates. At the end of each super-step, nodes with no incoming messages vote to halt by marking themselves as inactive. The graph execution terminates when all nodes are inactive and no messages are in transit.

> [!note] 译文
> 一个超级步可被视为对图节点的一次单轮迭代。并行运行的节点属于同一个超级步，而顺序运行的节点则属于不同的超级步。在图执行开始时，所有节点都处于非活动状态。当节点在其任意一条入边（或"通道"）上接收到新消息（状态）时，它就会变为活动状态。活动节点随后运行其函数并以更新作为响应。在每个超级步结束时，没有收到传入消息的节点通过将自身标记为非活动来投票停止。当所有节点都处于非活动状态且没有消息在传输中时，图执行终止。

---

## StateGraph

> [!note] 译文
> ## StateGraph（状态图）

The StateGraph class is the main graph class to use. This is parameterized by a user defined State object.

> [!note] 译文
> StateGraph 类是主要使用的图类。它由用户定义的 State（状态）对象进行参数化。

---

## Compiling your graph

> [!note] 译文
> ## 编译你的图（Compiling your graph）

To build your graph, you first define the state, you then add nodes and edges, and then you compile it. What exactly is compiling your graph and why is it needed? Compiling is a pretty simple step. It provides a few basic checks on the structure of your graph (no orphaned nodes, etc). It is also where you can specify runtime args like checkpointers and breakpoints. You compile your graph by just calling the .compile method:

> [!note] 译文
> 要构建你的图，首先需要定义状态，然后添加节点和边，最后进行编译。那么究竟什么是编译图，为什么需要它？编译是一个相当简单的步骤。它会对图的结构进行一些基本检查（例如是否存在孤立节点等）。同时，你也可以在此指定运行时参数，如检查点（checkpointers）和断点（breakpoints）。你只需调用 `.compile` 方法来编译图：

---

## State

> [!note] 译文
> ## State（状态）

The first thing you do when you define a graph is define the State of the graph. The State consists of the schema of the graph as well as reducer functions which specify how to apply updates to the state. The schema of the State will be the input schema to all Nodes and Edges in the graph, and can be either a TypedDict or a Pydantic model. All Nodes will emit updates to the State which are then applied using the specified reducer function.

> [!note] 译文
> 定义图时，首先要做的是定义图的 State（状态）。State 由图的 schema（模式）以及 reducer 函数组成，后者指定如何将更新应用到状态上。State 的 schema 将作为图中所有 Nodes 和 Edges 的输入 schema，它可以是 TypedDict 或 Pydantic 模型。所有 Nodes 都会向 State 发出更新，然后使用指定的 reducer 函数来应用这些更新。

---

### Schema

> [!note] 译文
> ### Schema（模式）

The main documented way to specify the schema of a graph is by using a TypedDict. If you want to provide default values in your state, use a dataclass. We also support using a Pydantic BaseModel as your graph state if you want recursive data validation (though note that Pydantic is less performant than a TypedDict or dataclass).

> [!note] 译文
> 指定图 schema 的主要文档化方式是使用 TypedDict。如果你想在状态中提供默认值，请使用 dataclass。如果你需要递归数据验证，我们也支持使用 Pydantic BaseModel 作为图状态（不过请注意，Pydantic 的性能低于 TypedDict 或 dataclass）。

By default, the graph will have the same input and output schemas. If you want to change this, you can also specify explicit input and output schemas directly. This is useful when you have a lot of keys, and some are explicitly for input and others are output. See the guide for more information.

> [!note] 译文
> 默认情况下，图的输入和输出 schema 是相同的。如果你想更改这一点，也可以直接指定明确的输入和输出 schema。当你有很多键，而其中一些专门用于输入、另一些专门用于输出时，这会很有用。更多信息请参阅指南。

The higher-level create_agent factory in langchain does not support Pydantic state schemas.

> [!note] 译文
> langchain 中的高层 `create_agent` 工厂函数不支持 Pydantic 状态 schema。

---

### Multiple schemas

> [!note] 译文
> ### 多 Schema（Multiple schemas）

Typically, all graph nodes communicate with a single schema. This means that they will read and write to the same state channels. But, there are cases where we want more control over this:

> [!note] 译文
> 通常情况下，所有图节点都使用单一的 schema 进行通信。这意味着它们会读取和写入相同的状态通道。但在某些情况下，我们希望对此有更多控制：

- Internal nodes can pass information that is not required in the graph's input / output.
- We may also want to use different input / output schemas for the graph. The output might, for example, only contain a single relevant output key.

> [!note] 译文
> - 内部节点可以传递图输入/输出中不需要的信息。
> - 我们可能还希望为图使用不同的输入/输出 schema。例如，输出可能只包含一个相关的输出键。

PrivateState.

> [!note] 译文
> PrivateState（私有状态）。

It is also possible to define explicit input and output schemas for a graph. In these cases, we define an "internal" schema that contains all keys relevant to graph operations. But, we also define input and output schemas that are sub-sets of the "internal" schema to constrain the input and output of the graph. See Define input and output schemas for more detail.

> [!note] 译文
> 也可以为图定义明确的输入和输出 schema。在这些情况下，我们定义一个"内部" schema，其中包含与图操作相关的所有键。同时，我们还定义输入和输出 schema 作为"内部" schema 的子集，以约束图的输入和输出。更多详情请参阅《定义输入和输出 schema》。

Let's look at an example:
- We pass state: InputState as the input schema to node_1. But, we write out to foo, a channel in OverallState. How can we write out to a state channel that is not included in the input schema? This is because a node can write to any state channel in the graph state. The graph state is the union of the state channels defined at initialization, which includes OverallState and the filters InputState and OutputState.
- We initialize the graph with:

> [!note] 译文
> 让我们来看一个示例：
> - 我们将 `state: InputState` 作为输入 schema 传递给 `node_1`。但是，我们写入到 `foo`，它是 `OverallState` 中的一个通道。我们如何向一个不在输入 schema 中的状态通道写入？这是因为节点可以写入图状态中的任何状态通道。图状态是初始化时定义的状态通道的并集，包括 `OverallState` 以及过滤后的 `InputState` 和 `OutputState`。
> - 我们使用以下方式初始化图：

How can we write to PrivateState in node_2? How does the graph gain access to this schema if it was not passed in the StateGraph initialization? We can do this because _nodes can also declare additional state channels_ as long as the state schema definition exists. In this case, the PrivateState schema is defined, so we can add bar as a new state channel in the graph and write to it.

> [!note] 译文
> 我们如何在 `node_2` 中向 `PrivateState` 写入？如果 `StateGraph` 初始化时没有传入这个 schema，图又是如何获得访问权限的？我们之所以能做到这一点，是因为**节点也可以声明额外的状态通道**，只要状态 schema 定义存在即可。在本例中，`PrivateState` schema 已被定义，因此我们可以将 `bar` 添加为图中的新状态通道并写入它。

---

### Reducers

> [!note] 译文
> ### Reducers（归约器/状态更新函数）

Reducers are key to understanding how updates from nodes are applied to the State. Each key in the State has its own independent reducer function. If no reducer function is explicitly specified then it is assumed that all updates to that key should override it. There are a few different types of reducers, starting with the default type of reducer:

> [!note] 译文
> Reducer（归约器/状态更新函数）是理解节点更新如何应用到 State 的关键。State 中的每个键都有自己独立的 reducer 函数。如果没有显式指定 reducer 函数，则默认假定对该键的所有更新都应覆盖原值。有几种不同类型的 reducer，首先是默认类型：

---

#### Default reducer

> [!note] 译文
> #### 默认 Reducer

These two examples show how to use the default reducer:

> [!note] 译文
> 以下两个示例展示了如何使用默认 reducer：

Example A

> [!note] 译文
> 示例 A

{"foo": 1, "bar": ["hi"]}. Let's then assume the first Node returns {"foo": 2}. This is treated as an update to the state. Notice that the Node does not need to return the whole State schema - just an update. After applying this update, the State would then be {"foo": 2, "bar": ["hi"]}. If the second node returns {"bar": ["bye"]} then the State would then be {"foo": 2, "bar": ["bye"]}

> [!note] 译文
> `{"foo": 1, "bar": ["hi"]}`。假设第一个节点返回 `{"foo": 2}`。这被视为对状态的更新。请注意，节点不需要返回整个 State schema——只需返回更新部分即可。应用此更新后，State 将变为 `{"foo": 2, "bar": ["hi"]}`。如果第二个节点返回 `{"bar": ["bye"]}`，那么 State 将变为 `{"foo": 2, "bar": ["bye"]}`。

Example B

> [!note] 译文
> 示例 B

Annotated type to specify a reducer function (operator.add) for the second key (bar). Note that the first key remains unchanged. Let's assume the input to the graph is {"foo": 1, "bar": ["hi"]}. Let's then assume the first Node returns {"foo": 2}. This is treated as an update to the state. Notice that the Node does not need to return the whole State schema - just an update. After applying this update, the State would then be {"foo": 2, "bar": ["hi"]}. If the second node returns {"bar": ["bye"]} then the State would then be {"foo": 2, "bar": ["hi", "bye"]}. Notice here that the bar key is updated by adding the two lists together.

> [!note] 译文
> 使用 Annotated 类型为第二个键（`bar`）指定一个 reducer 函数（`operator.add`）。请注意，第一个键保持不变。假设图的输入是 `{"foo": 1, "bar": ["hi"]}`。假设第一个节点返回 `{"foo": 2}`。这被视为对状态的更新。请注意，节点不需要返回整个 State schema——只需返回更新部分即可。应用此更新后，State 将变为 `{"foo": 2, "bar": ["hi"]}`。如果第二个节点返回 `{"bar": ["bye"]}`，那么 State 将变为 `{"foo": 2, "bar": ["hi", "bye"]}`。请注意，这里的 `bar` 键是通过将两个列表相加来更新的。

---

#### Overwrite

> [!note] 译文
> #### 覆盖（Overwrite）

---

### Working with messages in graph state

> [!note] 译文
> ### 在图状态中使用消息（Messages）

---

#### Why use messages?

> [!note] 译文
> #### 为什么要使用消息？

Most modern LLM providers have a chat model interface that accepts a list of messages as input. LangChain's chat model interface in particular accepts a list of message objects as inputs. These messages come in a variety of forms such as HumanMessage (user input) or AIMessage (LLM response).

> [!note] 译文
> 大多数现代 LLM 提供商都有一个聊天模型接口，接受消息列表作为输入。特别是 LangChain 的聊天模型接口，接受消息对象列表作为输入。这些消息有多种形式，例如 HumanMessage（用户输入）或 AIMessage（LLM 响应）。

To read more about what message objects are, please refer to the Messages conceptual guide.

> [!note] 译文
> 想了解更多关于消息对象的内容，请参阅 Messages 概念指南。

---

#### Using messages in your graph

> [!note] 译文
> #### 在图中使用消息

In many cases, it is helpful to store prior conversation history as a list of messages in your graph state. To do so, we can add a key (channel) to the graph state that stores a list of Message objects and annotate it with a reducer function (see messages key in the example below). The reducer function is vital to telling the graph how to update the list of Message objects in the state with each state update (for example, when a node sends an update). If you don't specify a reducer, every state update will overwrite the list of messages with the most recently provided value. If you wanted to simply append messages to the existing list, you could use operator.add as a reducer.

> [!note] 译文
> 在很多情况下，将之前的对话历史作为消息列表存储在图状态中会很有帮助。为此，我们可以向图状态添加一个键（通道），用于存储 Message 对象列表，并用 reducer 函数对其进行注解（参见下面示例中的 `messages` 键）。reducer 函数至关重要，它告诉图如何在每次状态更新时更新状态中的 Message 对象列表（例如，当节点发送更新时）。如果你不指定 reducer，每次状态更新都会用最近提供的值覆盖消息列表。如果你只是想将消息追加到现有列表中，可以使用 `operator.add` 作为 reducer。

However, you might also want to manually update messages in your graph state (e.g. human-in-the-loop). If you were to use operator.add, the manual state updates you send to the graph would be appended to the existing list of messages, instead of updating existing messages. To avoid that, you need a reducer that can keep track of message IDs and overwrite existing messages, if updated. To achieve this, you can use the prebuilt add_messages function. For brand new messages, it will simply append to existing list, but it will also handle the updates for existing messages correctly.

> [!note] 译文
> 然而，你可能还想手动更新图状态中的消息（例如，人在回路 human-in-the-loop）。如果你使用 `operator.add`，你手动发送给图的状态更新将被追加到现有消息列表中，而不是更新已有的消息。为了避免这种情况，你需要一个能够跟踪消息 ID 并在更新时覆盖现有消息的 reducer。为了实现这一点，你可以使用预置的 `add_messages` 函数。对于全新的消息，它会简单地追加到现有列表中，但它也能正确处理已有消息的更新。

---

#### Serialization

> [!note] 译文
> #### 序列化（Serialization）

In addition to keeping track of message IDs, the add_messages function will also try to deserialize messages into LangChain Message objects whenever a state update is received on the messages channel.

> [!note] 译文
> 除了跟踪消息 ID 之外，每当在 `messages` 通道上接收到状态更新时，`add_messages` 函数还会尝试将消息反序列化为 LangChain Message 对象。

For more information, see LangChain serialization/deserialization. This allows sending graph inputs / state updates in the following format:

> [!note] 译文
> 更多信息请参阅 LangChain 序列化/反序列化文档。这允许以以下格式发送图输入/状态更新：

Messages when using add_messages, you should use dot notation to access message attributes, like state["messages"][-1].content.

> [!note] 译文
> 使用 `add_messages` 时，你应该使用点符号访问消息属性，例如 `state["messages"][-1].content`。

Below is an example of a graph that uses add_messages as its reducer function.

> [!note] 译文
> 以下是一个使用 `add_messages` 作为其 reducer 函数的图示例。

---

#### MessagesState

> [!note] 译文
> #### MessagesState（消息状态）

Since having a list of messages in your state is so common, there exists a prebuilt state called MessagesState which makes it easy to use messages. MessagesState is defined with a single messages key which is a list of AnyMessage objects and uses the add_messages reducer. Typically, there is more state to track than just messages, so we see people subclass this state and add more fields, like:

> [!note] 译文
> 由于在状态中包含消息列表非常常见，因此存在一个预置的状态 `MessagesState`，它让使用消息变得简单。`MessagesState` 定义了一个单独的 `messages` 键，它是一个 `AnyMessage` 对象列表，并使用 `add_messages` 作为 reducer。通常情况下，需要跟踪的状态不仅仅是消息，所以我们看到人们会继承（subclass）这个状态并添加更多字段，例如：

---

## Nodes

> [!note] 译文
> ## Nodes（节点）

In LangGraph, nodes are Python functions (either synchronous or asynchronous) that accept the following arguments:

> [!note] 译文
> 在 LangGraph 中，节点是 Python 函数（同步或异步），接受以下参数：

- state — The state of the graph
- config — A RunnableConfig object that contains configuration information like thread_id and tracing information like tags
- runtime — A Runtime object that contains runtime context and other information like store, stream_writer, execution_info, server_info, heartbeat (for idle timeout refresh), and control (for graceful shutdown)

> [!note] 译文
> - `state` —— 图的状态
> - `config` —— 一个 `RunnableConfig` 对象，包含配置信息（如 `thread_id`）和跟踪信息（如 `tags`）
> - `runtime` —— 一个 `Runtime` 对象，包含运行时上下文和其他信息，如 `store`、`stream_writer`、`execution_info`、`server_info`、`heartbeat`（用于空闲超时刷新）和 `control`（用于优雅关闭）

NetworkX, you add these nodes to a graph using the add_node method:

> [!note] 译文
> 在 NetworkX 中，你可以使用 `add_node` 方法将这些节点添加到图中：

RunnableLambda, which add batch and async support to your function, along with native tracing and debugging.

> [!note] 译文
> `RunnableLambda`，它为你的函数添加了批处理和异步支持，以及原生的跟踪和调试功能。

If you add a node to a graph without specifying a name, it will be given a default name equivalent to the function name.

> [!note] 译文
> 如果你向图中添加节点时没有指定名称，它将被赋予一个默认名称，等同于函数名。

---

### START node

> [!note] 译文
> ### START 节点

The START Node is a special node that represents the node that sends user input to the graph. The main purpose for referencing this node is to determine which nodes should be called first.

> [!note] 译文
> START 节点是一个特殊节点，代表将用户输入发送到图中的节点。引用此节点的主要目的是确定应该首先调用哪些节点。

---

### END node

> [!note] 译文
> ### END 节点

The END Node is a special node that represents a terminal node. This node is referenced when you want to denote which edges have no actions after they are done.

> [!note] 译文
> END 节点是一个特殊节点，代表终止节点。当你想表示哪些边在执行完毕后没有后续操作时，会引用此节点。

---

### Node caching

> [!note] 译文
> ### 节点缓存（Node caching）

LangGraph supports caching of tasks/nodes based on the input to the node. To use caching:

> [!note] 译文
> LangGraph 支持基于节点输入对任务/节点进行缓存。要使用缓存：

- Specify a cache when compiling a graph (or specifying an entrypoint)
- Specify a cache policy for nodes. Each cache policy supports:
  - key_func used to generate a cache key based on the input to a node, which defaults to a hash of the input with pickle.
  - ttl, the time to live for the cache in seconds. If not specified, the cache will never expire.
- First run takes two seconds to run (due to mocked expensive computation).
- Second run utilizes cache and returns quickly.

> [!note] 译文
> - 在编译图（或指定入口点）时指定缓存
> - 为节点指定缓存策略。每个缓存策略支持：
>   - `key_func`：用于根据节点输入生成缓存键，默认使用 pickle 对输入进行哈希。
>   - `ttl`：缓存的存活时间（秒）。如果未指定，缓存将永不过期。
> - 首次运行需要两秒（由于模拟的昂贵计算）。
> - 第二次运行利用缓存并快速返回。

---

## Edges

> [!note] 译文
> ## Edges（边）

Edges define how the logic is routed and how the graph decides to stop. This is a big part of how your agents work and how different nodes communicate with each other. There are a few key types of edges:

> [!note] 译文
> 边定义了逻辑如何路由以及图如何决定停止。这是 Agent 工作方式以及不同节点如何相互通信的重要组成部分。有几种关键类型的边：

- Normal Edges: Go directly from one node to the next.
- Conditional Edges: Call a function to determine which node(s) to go to next.
- Entry Point: Which node to call first when user input arrives.
- Conditional Entry Point: Call a function to determine which node(s) to call first when user input arrives.

> [!note] 译文
> - **普通边（Normal Edges）**：直接从一个节点转到下一个节点。
> - **条件边（Conditional Edges）**：调用一个函数来决定接下来转到哪个（些）节点。
> - **入口点（Entry Point）**：用户输入到达时首先调用哪个节点。
> - **条件入口点（Conditional Entry Point）**：调用一个函数来决定用户输入到达时首先调用哪个（些）节点。

---

### Normal edges

> [!note] 译文
> ### 普通边（Normal edges）

If you always want to go from node A to node B, you can use the add_edge method directly.

> [!note] 译文
> 如果你总是想从节点 A 转到节点 B，可以直接使用 `add_edge` 方法。

---

### Conditional edges

> [!note] 译文
> ### 条件边（Conditional edges）

If you want to optionally route to one or more edges (or optionally terminate), you can use the add_conditional_edges method. This method accepts the name of a node and a "routing function" to call after that node is executed:

> [!note] 译文
> 如果你想选择性地路由到一条或多条边（或选择性地终止），可以使用 `add_conditional_edges` 方法。此方法接受一个节点名称以及在该节点执行后调用的"路由函数"：

routing_function accepts the current state of the graph and returns a value.

> [!note] 译文
> `routing_function` 接受图的当前状态并返回一个值。

By default, the return value routing_function is used as the name of the node (or list of nodes) to send the state to next. All those nodes will be run in parallel as a part of the next superstep.

> [!note] 译文
> 默认情况下，`routing_function` 的返回值被用作接下来要发送状态的节点名称（或节点列表）。所有这些节点将作为下一个超级步的一部分并行运行。

You can optionally provide a dictionary that maps the routing_function's output to the name of the next node.

> [!note] 译文
> 你可以选择性提供一个字典，将 `routing_function` 的输出映射到下一个节点的名称。

---

### Entry point

> [!note] 译文
> ### 入口点（Entry point）

The entry point is the first node(s) that are run when the graph starts. You can use the add_edge method from the virtual START node to the first node to execute to specify where to enter the graph.

> [!note] 译文
> 入口点是图启动时首先运行的节点。你可以使用从虚拟 START 节点到第一个要执行节点的 `add_edge` 方法来指定从哪里进入图。

---

### Conditional entry point

> [!note] 译文
> ### 条件入口点（Conditional entry point）

A conditional entry point lets you start at different nodes depending on custom logic. You can use add_conditional_edges from the virtual START node to accomplish this.

> [!note] 译文
> 条件入口点允许你根据自定义逻辑从不同节点开始。你可以使用从虚拟 START 节点出发的 `add_conditional_edges` 来实现这一点。

routing_function's output to the name of the next node.

> [!note] 译文
> 将 `routing_function` 的输出映射到下一个节点的名称。

---

### Send

> [!note] 译文
> ### Send（发送）

By default, Nodes and Edges are defined ahead of time and operate on the same shared state. However, there can be cases where the exact edges are not known ahead of time and/or you may want different versions of State to exist at the same time. A common example of this is with map-reduce design patterns. In this design pattern, a first node may generate a list of objects, and you may want to apply some other node to all those objects. The number of objects may be unknown ahead of time (meaning the number of edges may not be known) and the input State to the downstream Node should be different (one for each generated object).

> [!note] 译文
> 默认情况下，节点和边是预先定义的，并在相同的共享状态上运行。然而，在某些情况下，具体的边事先未知，或者你可能希望不同版本的 State 同时存在。一个常见的例子是 map-reduce 设计模式。在该模式中，第一个节点可能生成一个对象列表，而你可能希望将另一个节点应用于所有这些对象。对象的数量可能事先未知（意味着边的数量也可能未知），并且下游节点的输入 State 应该是不同的（每个生成的对象对应一个）。

To support this design pattern, LangGraph supports returning Send objects from conditional edges. Send takes two arguments: first is the name of the node, and second is the state to pass to that node.

> [!note] 译文
> 为了支持这种设计模式，LangGraph 支持从条件边返回 `Send` 对象。`Send` 接受两个参数：第一个是节点名称，第二个是要传递给该节点的状态。

---

## Command

> [!note] 译文
> ## Command（命令）

Command is a versatile primitive for controlling graph execution. It accepts four parameters:

> [!note] 译文
> `Command` 是一个用于控制图执行的多功能原语。它接受四个参数：

- update: Apply state updates (similar to returning updates from a node).
- goto: Navigate to specific nodes (similar to conditional edges).
- graph: Target a parent graph when navigating from subgraphs.
- resume: Provide a value to resume execution after an interrupt.

> [!note] 译文
> - `update`：应用状态更新（类似于从节点返回更新）。
> - `goto`：导航到特定节点（类似于条件边）。
> - `graph`：从子图导航时目标指向父图。
> - `resume`：提供一个值以在中断后恢复执行。

Command is used in three contexts:
- Return from nodes: Use update, goto, and graph to combine state updates with control flow.
- Input to invoke or stream: Use resume to continue execution after an interrupt.
- Return from tools: Similar to return from nodes, combine state updates and control flow from inside a tool.

> [!note] 译文
> `Command` 在三种上下文中使用：
> - **从节点返回**：使用 `update`、`goto` 和 `graph` 将状态更新与控制流结合起来。
> - **作为 invoke 或 stream 的输入**：使用 `resume` 在中断后继续执行。
> - **从工具返回**：类似于从节点返回，从工具内部结合状态更新和控制流。

---

### Return from nodes

> [!note] 译文
> ### 从节点返回（Return from nodes）

update and goto

> [!note] 译文
> `update` 和 `goto`

Return Command from node functions to update state and route to the next node in a single step:

> [!note] 译文
> 从节点函数返回 `Command`，以便在单步中更新状态并路由到下一个节点：

Command you can also achieve dynamic control flow behavior (identical to conditional edges):

> [!note] 译文
> 使用 `Command` 你还可以实现动态控制流行为（与条件边相同）：

Command when you need to both update state and route to a different node. If you only need to route without updating state, use conditional edges instead.

> [!note] 译文
> 当你需要同时更新状态并路由到不同节点时，使用 `Command`。如果你只需要路由而不更新状态，请改用条件边。

When returning Command in your node functions, you must add return type annotations with the list of node names the node is routing to, e.g. Command[Literal["my_other_node"]]. This is necessary for the graph rendering and tells LangGraph that my_node can navigate to my_other_node.

> [!note] 译文
> 在节点函数中返回 `Command` 时，你必须添加返回类型注解，包含节点将要路由到的节点名称列表，例如 `Command[Literal["my_other_node"]]`。这对图渲染是必需的，并告诉 LangGraph `my_node` 可以导航到 `my_other_node`。

Command.

> [!note] 译文
> `Command`。

---

#### graph

> [!note] 译文
> #### graph（图/父图导航）

If you are using subgraphs, you can navigate from a node within a subgraph to a different node in the parent graph by specifying graph=Command.PARENT in Command:

> [!note] 译文
> 如果你正在使用子图（subgraphs），可以通过在 `Command` 中指定 `graph=Command.PARENT`，从子图内的节点导航到父图中的不同节点：

Setting graph to Command.PARENT will navigate to the closest parent graph.

> [!note] 译文
> 将 `graph` 设置为 `Command.PARENT` 将导航到最近的父图。

When you send updates from a subgraph node to a parent graph node for a key that's shared by both parent and subgraph state schemas, you must define a reducer for the key you're updating in the parent graph state. See this example.

> [!note] 译文
> 当你从子图节点向父图节点发送更新时，如果该键被父图和子图状态 schema 共享，则必须在父图状态中为你正在更新的键定义一个 reducer。请参阅此示例。

---

### Input to invoke or stream

> [!note] 译文
> ### 作为 invoke 或 stream 的输入

---

#### resume

> [!note] 译文
> #### resume（恢复）

Use Command(resume=...) to provide a value and resume graph execution after an interrupt. The value passed to resume becomes the return value of the interrupt() call inside the paused node:

> [!note] 译文
> 使用 `Command(resume=...)` 来提供一个值并在中断后恢复图执行。传递给 `resume` 的值将成为暂停节点内部 `interrupt()` 调用的返回值：

---

### Return from tools

> [!note] 译文
> ### 从工具返回（Return from tools）

You can return Command from tools to update graph state and control flow. Use update to modify state (e.g. saving customer information looked up during a conversation) and goto to route to a specific node after the tool completes.

> [!note] 译文
> 你可以从工具返回 `Command` 以更新图状态和控制流。使用 `update` 修改状态（例如，保存在对话中查询到的客户信息），并使用 `goto` 在工具完成后路由到特定节点。

Refer to Use inside tools for detail.

> [!note] 译文
> 更多详情请参阅《在工具内部使用》。

---

## Graph migrations

> [!note] 译文
> ## 图迁移（Graph migrations）

LangGraph can easily handle migrations of graph definitions (nodes, edges, and state) even when using a checkpointer to track state.

> [!note] 译文
> 即使使用检查点（checkpointer）来跟踪状态，LangGraph 也能轻松处理图定义（节点、边和状态）的迁移。

- For threads at the end of the graph (i.e. not interrupted) you can change the entire topology of the graph (i.e. all nodes and edges, remove, add, rename, etc)
- For threads currently interrupted, we support all topology changes other than renaming / removing nodes (as that thread could now be about to enter a node that no longer exists) — if this is a blocker please reach out and we can prioritize a solution.
- For modifying state, we have full backwards and forwards compatibility for adding and removing keys
- State keys that are renamed lose their saved state in existing threads
- State keys whose types change in incompatible ways could currently cause issues in threads with state from before the change — if this is a blocker please reach out and we can prioritize a solution.

> [!note] 译文
> - 对于处于图末尾的线程（即未中断的线程），你可以更改整个图的拓扑结构（即所有节点和边，删除、添加、重命名等）。
> - 对于当前处于中断状态的线程，我们支持除重命名/删除节点之外的所有拓扑更改（因为该线程可能即将进入一个已不存在的节点）——如果这是阻碍，请联系我们，我们可以优先解决。
> - 对于修改状态，添加和删除键完全向后和向前兼容。
> - 被重命名的状态键将在现有线程中丢失其已保存的状态。
> - 类型以不兼容方式更改的状态键可能会在当前线程中导致问题（如果该线程包含更改前的状态）——如果这是阻碍，请联系我们，我们可以优先解决。

---

## Runtime context

> [!note] 译文
> ## 运行时上下文（Runtime context）

When creating a graph, you can specify a context_schema for runtime context passed to nodes. This is useful for passing information to nodes that is not part of the graph state. For example, you might want to pass dependencies such as model name or a database connection.

> [!note] 译文
> 创建图时，你可以为传递给节点的运行时上下文指定 `context_schema`。这对于向节点传递不属于图状态的信息非常有用。例如，你可能想传递依赖项，如模型名称或数据库连接。

context parameter of the invoke method.

> [!note] 译文
> `invoke` 方法的 `context` 参数。

---

## Recursion limit

> [!note] 译文
> ## 递归限制（Recursion limit）

The recursion limit sets the maximum number of super-steps the graph can execute during a single execution. Once the limit is reached, LangGraph will raise GraphRecursionError. Starting in version 1.0.6, the default recursion limit is set to 1000 steps. The recursion limit can be set on any graph at runtime, and is passed to invoke /stream via the config dictionary. Importantly, recursion_limit is a standalone config key and should not be passed inside the configurable key as all other user-defined configuration. See the example below:

> [!note] 译文
> 递归限制设置了图在单次执行期间可以执行的最大超级步数。一旦达到限制，LangGraph 将抛出 `GraphRecursionError`。从 1.0.6 版本开始，默认递归限制设置为 1000 步。递归限制可以在运行时对任何图进行设置，并通过 `config` 字典传递给 `invoke` / `stream`。重要的是，`recursion_limit` 是一个独立的配置键，不应像其他用户定义配置那样放在 `configurable` 键内部传递。请参见下面的示例：

---

### Accessing and handling the recursion counter

> [!note] 译文
> ### 访问和处理递归计数器

The current step counter is accessible in config["metadata"]["langgraph_step"] within any node, allowing for proactive recursion handling before hitting the recursion limit. This enables you to implement graceful degradation strategies within your graph logic.

> [!note] 译文
> 当前步数计数器可以在任何节点中通过 `config["metadata"]["langgraph_step"]` 访问，从而允许在达到递归限制之前主动处理递归。这使你可以在你的图逻辑中实现优雅降级策略。

---

#### How it works

> [!note] 译文
> #### 工作原理

The step counter is stored in config["metadata"]["langgraph_step"]. The recursion limit check follows the logic: step > stop where stop = step + recursion_limit + 1. When the limit is exceeded, LangGraph raises a GraphRecursionError.

> [!note] 译文
> 步数计数器存储在 `config["metadata"]["langgraph_step"]` 中。递归限制检查遵循以下逻辑：`step > stop`，其中 `stop = step + recursion_limit + 1`。当超过限制时，LangGraph 抛出 `GraphRecursionError`。

---

#### Accessing the current step counter

> [!note] 译文
> #### 访问当前步数计数器

You can access the current step counter within any node to monitor execution progress.

> [!note] 译文
> 你可以在任何节点中访问当前步数计数器，以监控执行进度。

---

#### Proactive recursion handling

> [!note] 译文
> #### 主动递归处理

LangGraph provides a RemainingSteps managed value that tracks how many steps remain before hitting the recursion limit. This allows for graceful degradation within your graph.

> [!note] 译文
> LangGraph 提供了一个 `RemainingSteps` 托管值，用于跟踪在达到递归限制之前还剩多少步。这允许在你的图中实现优雅降级。

---

#### Proactive vs reactive approaches

> [!note] 译文
> #### 主动方式 vs 响应式方式

There are two main approaches to handling recursion limits: proactive (monitoring within the graph) and reactive (catching errors externally).

> [!note] 译文
> 处理递归限制有两种主要方法：主动式（在图内部监控）和响应式（在外部捕获错误）。

| Approach | Detection | Handling | Control Flow |
|---|---|---|---|
| Proactive (using RemainingSteps ) | Before limit reached | Inside graph via conditional routing | Graph continues to completion node |
| Reactive (catching GraphRecursionError ) | After limit exceeded | Outside graph in try/catch | Graph execution terminated |

> [!note] 译文
> 下表对比了两种处理递归限制的方法：

| Approach | Detection | Handling | Control Flow |
|---|---|---|---|
| Proactive (using RemainingSteps ) | Before limit reached | Inside graph via conditional routing | Graph continues to completion node |
| Reactive (catching GraphRecursionError ) | After limit exceeded | Outside graph in try/catch | Graph execution terminated |

> [!note] 译文
> | 方法 | 检测时机 | 处理方式 | 控制流 |
> |---|---|---|---|
> | 主动式（使用 RemainingSteps） | 达到限制前 | 通过条件路由在图内部处理 | 图继续运行到完成节点 |
> | 响应式（捕获 GraphRecursionError） | 超过限制后 | 在图外部的 try/catch 中处理 | 图执行终止 |

- Graceful degradation within the graph
- Can save intermediate state in checkpoints
- Better user experience with partial results
- Graph completes normally (no exception)
- Simpler implementation
- No need to modify graph logic
- Centralized error handling

> [!note] 译文
> - 在图内部实现优雅降级
> - 可以在检查点中保存中间状态
> - 通过部分结果提供更好的用户体验
> - 图正常完成（无异常）
> - 实现更简单
> - 无需修改图逻辑
> - 集中式错误处理

---

### Other available metadata

> [!note] 译文
> ### 其他可用元数据

Along with langgraph_step, the following metadata is also available in config["metadata"]:

> [!note] 译文
> 除了 `langgraph_step`，`config["metadata"]` 中还提供以下元数据：

---

## Visualization

> [!note] 译文
> ## 可视化（Visualization）

It's often nice to be able to visualize graphs, especially as they get more complex. LangGraph comes with several built-in ways to visualize graphs. See Visualize your graph for more info.

> [!note] 译文
> 能够对图进行可视化通常很有帮助，尤其是在图变得越来越复杂时。LangGraph 内置了几种可视化图的方法。更多信息请参阅《可视化你的图》。

---

## Observability and Tracing

> [!note] 译文
> ## 可观察性与追踪（Observability and Tracing）

To trace, debug and evaluate your agents, use LangSmith.

> [!note] 译文
> 要追踪、调试和评估你的 Agent，请使用 LangSmith。

Learn more
- How to use the Graph API
- Functional API conceptual overview
- Choosing between Graph API and Functional API

> [!note] 译文
> 了解更多
> - 如何使用 Graph API
> - Functional API 概念概述
> - 在 Graph API 和 Functional API 之间做出选择
