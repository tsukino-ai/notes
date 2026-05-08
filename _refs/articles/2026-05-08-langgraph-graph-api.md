---
title: Graph API overview - Docs by LangChain
author: LangChain
source: https://docs.langchain.com/oss/python/langgraph/graph-api
date: 2026-05-07
---

Documentation Index
Fetch the complete documentation index at: https://docs.langchain.com/llms.txt
Use this file to discover all available pages before exploring further.

## Graphs

At its core, LangGraph models agent workflows as graphs. You define the behavior of your agents using three key components:

- **State**: A shared data structure that represents the current snapshot of your application. It can be any data type, but is typically defined using a shared state schema.
- **Nodes**: Functions that encode the logic of your agents. They receive the current state as input, perform some computation or side-effect, and return an updated state.
- **Edges**: Functions that determine which Node to execute next based on the current state. They can be conditional branches or fixed transitions.

With Nodes and Edges, you can create complex, looping workflows that evolve the state over time. The real power, though, comes from how LangGraph manages that state.

To emphasize: Nodes and Edges are nothing more than functions—they can contain an LLM or just good ol' code.

In short: nodes do the work, edges tell what to do next.

LangGraph's underlying graph algorithm uses message passing to define a general program. When a Node completes its operation, it sends messages along one or more edges to other node(s). These recipient nodes then execute their functions, pass the resulting messages to the next set of nodes, and the process continues. Inspired by Google's Pregel system, the program proceeds in discrete "super-steps."

A super-step can be considered a single iteration over the graph nodes. Nodes that run in parallel are part of the same super-step, while nodes that run sequentially belong to separate super-steps. At the start of graph execution, all nodes begin in an inactive state. A node becomes active when it receives a new message (state) on any of its incoming edges (or "channels"). The active node then runs its function and responds with updates. At the end of each super-step, nodes with no incoming messages vote to halt by marking themselves as inactive. The graph execution terminates when all nodes are inactive and no messages are in transit.

## StateGraph

The StateGraph class is the main graph class to use. This is parameterized by a user defined State object.

## Compiling your graph

To build your graph, you first define the state, you then add nodes and edges, and then you compile it. What exactly is compiling your graph and why is it needed? Compiling is a pretty simple step. It provides a few basic checks on the structure of your graph (no orphaned nodes, etc). It is also where you can specify runtime args like checkpointers and breakpoints. You compile your graph by just calling the .compile method:

## State

The first thing you do when you define a graph is define the State of the graph. The State consists of the schema of the graph as well as reducer functions which specify how to apply updates to the state. The schema of the State will be the input schema to all Nodes and Edges in the graph, and can be either a TypedDict or a Pydantic model. All Nodes will emit updates to the State which are then applied using the specified reducer function.

### Schema

The main documented way to specify the schema of a graph is by using a TypedDict. If you want to provide default values in your state, use a dataclass. We also support using a Pydantic BaseModel as your graph state if you want recursive data validation (though note that Pydantic is less performant than a TypedDict or dataclass).

By default, the graph will have the same input and output schemas. If you want to change this, you can also specify explicit input and output schemas directly. This is useful when you have a lot of keys, and some are explicitly for input and others are output. See the guide for more information.

The higher-level create_agent factory in langchain does not support Pydantic state schemas.

### Multiple schemas

Typically, all graph nodes communicate with a single schema. This means that they will read and write to the same state channels. But, there are cases where we want more control over this:

- Internal nodes can pass information that is not required in the graph's input / output.
- We may also want to use different input / output schemas for the graph. The output might, for example, only contain a single relevant output key.

PrivateState.

It is also possible to define explicit input and output schemas for a graph. In these cases, we define an "internal" schema that contains all keys relevant to graph operations. But, we also define input and output schemas that are sub-sets of the "internal" schema to constrain the input and output of the graph. See Define input and output schemas for more detail.

Let's look at an example:
- We pass state: InputState as the input schema to node_1. But, we write out to foo, a channel in OverallState. How can we write out to a state channel that is not included in the input schema? This is because a node can write to any state channel in the graph state. The graph state is the union of the state channels defined at initialization, which includes OverallState and the filters InputState and OutputState.
- We initialize the graph with:

How can we write to PrivateState in node_2? How does the graph gain access to this schema if it was not passed in the StateGraph initialization? We can do this because _nodes can also declare additional state channels_ as long as the state schema definition exists. In this case, the PrivateState schema is defined, so we can add bar as a new state channel in the graph and write to it.

### Reducers

Reducers are key to understanding how updates from nodes are applied to the State. Each key in the State has its own independent reducer function. If no reducer function is explicitly specified then it is assumed that all updates to that key should override it. There are a few different types of reducers, starting with the default type of reducer:

#### Default reducer

These two examples show how to use the default reducer:

Example A

{"foo": 1, "bar": ["hi"]}. Let's then assume the first Node returns {"foo": 2}. This is treated as an update to the state. Notice that the Node does not need to return the whole State schema - just an update. After applying this update, the State would then be {"foo": 2, "bar": ["hi"]}. If the second node returns {"bar": ["bye"]} then the State would then be {"foo": 2, "bar": ["bye"]}

Example B

Annotated type to specify a reducer function (operator.add) for the second key (bar). Note that the first key remains unchanged. Let's assume the input to the graph is {"foo": 1, "bar": ["hi"]}. Let's then assume the first Node returns {"foo": 2}. This is treated as an update to the state. Notice that the Node does not need to return the whole State schema - just an update. After applying this update, the State would then be {"foo": 2, "bar": ["hi"]}. If the second node returns {"bar": ["bye"]} then the State would then be {"foo": 2, "bar": ["hi", "bye"]}. Notice here that the bar key is updated by adding the two lists together.

#### Overwrite

### Working with messages in graph state

#### Why use messages?

Most modern LLM providers have a chat model interface that accepts a list of messages as input. LangChain's chat model interface in particular accepts a list of message objects as inputs. These messages come in a variety of forms such as HumanMessage (user input) or AIMessage (LLM response).

To read more about what message objects are, please refer to the Messages conceptual guide.

#### Using messages in your graph

In many cases, it is helpful to store prior conversation history as a list of messages in your graph state. To do so, we can add a key (channel) to the graph state that stores a list of Message objects and annotate it with a reducer function (see messages key in the example below). The reducer function is vital to telling the graph how to update the list of Message objects in the state with each state update (for example, when a node sends an update). If you don't specify a reducer, every state update will overwrite the list of messages with the most recently provided value. If you wanted to simply append messages to the existing list, you could use operator.add as a reducer.

However, you might also want to manually update messages in your graph state (e.g. human-in-the-loop). If you were to use operator.add, the manual state updates you send to the graph would be appended to the existing list of messages, instead of updating existing messages. To avoid that, you need a reducer that can keep track of message IDs and overwrite existing messages, if updated. To achieve this, you can use the prebuilt add_messages function. For brand new messages, it will simply append to existing list, but it will also handle the updates for existing messages correctly.

#### Serialization

In addition to keeping track of message IDs, the add_messages function will also try to deserialize messages into LangChain Message objects whenever a state update is received on the messages channel.

For more information, see LangChain serialization/deserialization. This allows sending graph inputs / state updates in the following format:

Messages when using add_messages, you should use dot notation to access message attributes, like state["messages"][-1].content.

Below is an example of a graph that uses add_messages as its reducer function.

#### MessagesState

Since having a list of messages in your state is so common, there exists a prebuilt state called MessagesState which makes it easy to use messages. MessagesState is defined with a single messages key which is a list of AnyMessage objects and uses the add_messages reducer. Typically, there is more state to track than just messages, so we see people subclass this state and add more fields, like:

## Nodes

In LangGraph, nodes are Python functions (either synchronous or asynchronous) that accept the following arguments:

- state — The state of the graph
- config — A RunnableConfig object that contains configuration information like thread_id and tracing information like tags
- runtime — A Runtime object that contains runtime context and other information like store, stream_writer, execution_info, server_info, heartbeat (for idle timeout refresh), and control (for graceful shutdown)

NetworkX, you add these nodes to a graph using the add_node method:

RunnableLambda, which add batch and async support to your function, along with native tracing and debugging.

If you add a node to a graph without specifying a name, it will be given a default name equivalent to the function name.

### START node

The START Node is a special node that represents the node that sends user input to the graph. The main purpose for referencing this node is to determine which nodes should be called first.

### END node

The END Node is a special node that represents a terminal node. This node is referenced when you want to denote which edges have no actions after they are done.

### Node caching

LangGraph supports caching of tasks/nodes based on the input to the node. To use caching:

- Specify a cache when compiling a graph (or specifying an entrypoint)
- Specify a cache policy for nodes. Each cache policy supports:
  - key_func used to generate a cache key based on the input to a node, which defaults to a hash of the input with pickle.
  - ttl, the time to live for the cache in seconds. If not specified, the cache will never expire.
- First run takes two seconds to run (due to mocked expensive computation).
- Second run utilizes cache and returns quickly.

## Edges

Edges define how the logic is routed and how the graph decides to stop. This is a big part of how your agents work and how different nodes communicate with each other. There are a few key types of edges:

- Normal Edges: Go directly from one node to the next.
- Conditional Edges: Call a function to determine which node(s) to go to next.
- Entry Point: Which node to call first when user input arrives.
- Conditional Entry Point: Call a function to determine which node(s) to call first when user input arrives.

### Normal edges

If you always want to go from node A to node B, you can use the add_edge method directly.

### Conditional edges

If you want to optionally route to one or more edges (or optionally terminate), you can use the add_conditional_edges method. This method accepts the name of a node and a "routing function" to call after that node is executed:

routing_function accepts the current state of the graph and returns a value.

By default, the return value routing_function is used as the name of the node (or list of nodes) to send the state to next. All those nodes will be run in parallel as a part of the next superstep.

You can optionally provide a dictionary that maps the routing_function's output to the name of the next node.

### Entry point

The entry point is the first node(s) that are run when the graph starts. You can use the add_edge method from the virtual START node to the first node to execute to specify where to enter the graph.

### Conditional entry point

A conditional entry point lets you start at different nodes depending on custom logic. You can use add_conditional_edges from the virtual START node to accomplish this.

routing_function's output to the name of the next node.

### Send

By default, Nodes and Edges are defined ahead of time and operate on the same shared state. However, there can be cases where the exact edges are not known ahead of time and/or you may want different versions of State to exist at the same time. A common example of this is with map-reduce design patterns. In this design pattern, a first node may generate a list of objects, and you may want to apply some other node to all those objects. The number of objects may be unknown ahead of time (meaning the number of edges may not be known) and the input State to the downstream Node should be different (one for each generated object).

To support this design pattern, LangGraph supports returning Send objects from conditional edges. Send takes two arguments: first is the name of the node, and second is the state to pass to that node.

## Command

Command is a versatile primitive for controlling graph execution. It accepts four parameters:

- update: Apply state updates (similar to returning updates from a node).
- goto: Navigate to specific nodes (similar to conditional edges).
- graph: Target a parent graph when navigating from subgraphs.
- resume: Provide a value to resume execution after an interrupt.

Command is used in three contexts:
- Return from nodes: Use update, goto, and graph to combine state updates with control flow.
- Input to invoke or stream: Use resume to continue execution after an interrupt.
- Return from tools: Similar to return from nodes, combine state updates and control flow from inside a tool.

### Return from nodes

update and goto

Return Command from node functions to update state and route to the next node in a single step:

Command you can also achieve dynamic control flow behavior (identical to conditional edges):

Command when you need to both update state and route to a different node. If you only need to route without updating state, use conditional edges instead.

When returning Command in your node functions, you must add return type annotations with the list of node names the node is routing to, e.g. Command[Literal["my_other_node"]]. This is necessary for the graph rendering and tells LangGraph that my_node can navigate to my_other_node.

Command.

#### graph

If you are using subgraphs, you can navigate from a node within a subgraph to a different node in the parent graph by specifying graph=Command.PARENT in Command:

Setting graph to Command.PARENT will navigate to the closest parent graph.

When you send updates from a subgraph node to a parent graph node for a key that's shared by both parent and subgraph state schemas, you must define a reducer for the key you're updating in the parent graph state. See this example.

### Input to invoke or stream

#### resume

Use Command(resume=...) to provide a value and resume graph execution after an interrupt. The value passed to resume becomes the return value of the interrupt() call inside the paused node:

### Return from tools

You can return Command from tools to update graph state and control flow. Use update to modify state (e.g. saving customer information looked up during a conversation) and goto to route to a specific node after the tool completes.

Refer to Use inside tools for detail.

## Graph migrations

LangGraph can easily handle migrations of graph definitions (nodes, edges, and state) even when using a checkpointer to track state.

- For threads at the end of the graph (i.e. not interrupted) you can change the entire topology of the graph (i.e. all nodes and edges, remove, add, rename, etc)
- For threads currently interrupted, we support all topology changes other than renaming / removing nodes (as that thread could now be about to enter a node that no longer exists) — if this is a blocker please reach out and we can prioritize a solution.
- For modifying state, we have full backwards and forwards compatibility for adding and removing keys
- State keys that are renamed lose their saved state in existing threads
- State keys whose types change in incompatible ways could currently cause issues in threads with state from before the change — if this is a blocker please reach out and we can prioritize a solution.

## Runtime context

When creating a graph, you can specify a context_schema for runtime context passed to nodes. This is useful for passing information to nodes that is not part of the graph state. For example, you might want to pass dependencies such as model name or a database connection.

context parameter of the invoke method.

## Recursion limit

The recursion limit sets the maximum number of super-steps the graph can execute during a single execution. Once the limit is reached, LangGraph will raise GraphRecursionError. Starting in version 1.0.6, the default recursion limit is set to 1000 steps. The recursion limit can be set on any graph at runtime, and is passed to invoke /stream via the config dictionary. Importantly, recursion_limit is a standalone config key and should not be passed inside the configurable key as all other user-defined configuration. See the example below:

### Accessing and handling the recursion counter

The current step counter is accessible in config["metadata"]["langgraph_step"] within any node, allowing for proactive recursion handling before hitting the recursion limit. This enables you to implement graceful degradation strategies within your graph logic.

#### How it works

The step counter is stored in config["metadata"]["langgraph_step"]. The recursion limit check follows the logic: step > stop where stop = step + recursion_limit + 1. When the limit is exceeded, LangGraph raises a GraphRecursionError.

#### Accessing the current step counter

You can access the current step counter within any node to monitor execution progress.

#### Proactive recursion handling

LangGraph provides a RemainingSteps managed value that tracks how many steps remain before hitting the recursion limit. This allows for graceful degradation within your graph.

#### Proactive vs reactive approaches

There are two main approaches to handling recursion limits: proactive (monitoring within the graph) and reactive (catching errors externally).

| Approach | Detection | Handling | Control Flow |
|---|---|---|---|
| Proactive (using RemainingSteps ) | Before limit reached | Inside graph via conditional routing | Graph continues to completion node |
| Reactive (catching GraphRecursionError ) | After limit exceeded | Outside graph in try/catch | Graph execution terminated |

- Graceful degradation within the graph
- Can save intermediate state in checkpoints
- Better user experience with partial results
- Graph completes normally (no exception)
- Simpler implementation
- No need to modify graph logic
- Centralized error handling

### Other available metadata

Along with langgraph_step, the following metadata is also available in config["metadata"]:

## Visualization

It's often nice to be able to visualize graphs, especially as they get more complex. LangGraph comes with several built-in ways to visualize graphs. See Visualize your graph for more info.

## Observability and Tracing

To trace, debug and evaluate your agents, use LangSmith.

Learn more
- How to use the Graph API
- Functional API conceptual overview
- Choosing between Graph API and Functional API
