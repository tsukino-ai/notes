---
title: Memory Blocks: The Key to Agentic Context Management
author: Letta
source: https://www.letta.com/blog/memory-blocks
date: 2025-05-14
---

# Memory Blocks: The Key to Agentic Context Management

Large language models (LLMs) face a fundamental constraint: they can only "see" what's in their immediate context window. This limitation creates a critical challenge when building applications that require long-term memory and coherence across interactions. The effectiveness of an LLM agent largely depends on how well its context window is managed - what information is kept, what is discarded, and how it's organized.

Memory blocks offer an elegant abstraction for context window management. By structuring the context into discrete, functional units, we can give LLM agents more consistent, usable memory. This concept, which originated in the MemGPT research paper and Letta agents framework, provides a systematic approach to organizing what information an LLM has access to during inference.

## Memory Blocks: A Powerful Abstraction for Agent Memory

The idea of an agent that could manage its own memory (including its own context window) originated in the MemGPT paper. MemGPT demonstrated the idea of self-editing memory in a simple chat use-case with two in-context memory blocks:
- "Human" memory block: Storing information about the user, their preferences, facts about them, and relevant context.
- "Persona" memory block: Containing the agent's own self-concept, personality traits, and behavioral guidelines.

These blocks were editable by the agent, and also restricted to a certain character limit (to limit context window allocation to those memories). These blocks provided a way to allocate certain parts of the context window to store important information about specific topics.

For example, the agent can edit the "human" block as it learns more about them. And by editing the "persona" block, the agent could make sure to persist certain personality traits or "identity" features. If the agent stated a preference for vanilla ice cream, it could write it to the persona block to make sure it would be consistent in the future when asked about its favorite flavor.

## Why Context Window Management Matters

Before diving deeper into memory blocks, it's important to understand why effective context window management is crucial for LLM applications:
- **Better performance**: LLMs are sensitive to what's in their context window. They can't reason about information they don't "see" at inference time. By carefully managing which information is present in the context (e.g. by having it curated by another agent), we can dramatically improve the performance of agents.
- **Personalization & adaptability**: For agents that serve specific users or functions, maintaining the right information in context is essential for providing tailored experiences. Without proper context management, agents either forget critical user information or must redundantly ask for it in each step of the interaction.
- **Controllability**: By structuring the context window into distinct blocks with specific purposes, developers gain greater control over agent behavior. This structured approach allows for more predictable and consistent agent responses, and defining mechanisms for long-term context management in agents.

## Memory Blocks are Units of Agent Memory

Rather than treating the context window as a monolithic entity, memory blocks break the context window down into manageable, purposeful units that are also persisted. A memory block consists of:
- A label that identifies its purpose (e.g., "human", "persona", "knowledge")
- A value that is the string representation of the block data
- A size limit (e.g. in characters or tokens) that dictates how much of the context window it can occupy
- Optional descriptions that guide how the block should be used

The block value can be edited by the agent via memory tools (or custom tools), unless they are read-only: in which case, only the developer can modify them.

## Editing Memory Blocks via the Letta API

Unlike ephemeral memory in many LLM frameworks, Letta's memory blocks are individually persisted in the DB, with a unique `block_id` to access them via the API and Agent Development Environment (ADE). This provides a way for developers to directly modify parts of their agent's context window.

When Letta makes a request to the LLM, the context window is "compiled" from existing DB state, including current block values. The prompt template (i.e. formatting in the context window) can be customized with Jinja templating.

## Multi-Agent Shared Memory

One of Letta's most powerful features is the ability for multiple agents to share memory blocks:
This enables sophisticated patterns like:
- Shared knowledge bases: Multiple agents accessing the same reference information
- Sleep-time compute: Background agents updating the memory of primary agents
- Collaborative memory: Teams of agents maintaining a shared understanding

## Tool-Based Memory Editing

Memory blocks can be modified through a variety of tools to customize memory management. Below is an example of a custom tool to "rethink" (replace) an entire memory block's value by specifying the new block value and the target block label:
Because memory block values are just strings, you can store more complex data structures like lists or dictionaries in blocks, as long as they can be represented into a string format.

## Practical Applications

The flexibility of Letta's memory block system enables a wide range of powerful applications:

**Personalized Assistants**
By maintaining detailed user information in a human memory block, assistants can remember preferences, past interactions, and important details about each user:

**Sleep-Time Agents**
As we demonstrated in our Sleep-time Compute research, agents can process information during idle periods and update shared memory blocks. For example, a sleep-time agent might reflect on an existing codebase (similar to Cursor's background agents) or previous conversation history to form new memories (referred to as "learned context") in the paper. Learned context is written to a memory block in Letta, and can be shared across multiple agents.

**Long-running Agents (e.g. Deep Research)**
For complex, long-running agents like deep research agents, the context must maintain the state of the task across multiple LLM invocations without derailment. 11x's deep research agent benefitted from writing the "research state" into a memory block to track research progress.

## Conclusion

Building powerful, reliable agents that can learn and improve over time will require developing techniques for context management over time. Memory blocks provide a unit of abstraction for storing and managing sections of the context window. By breaking the context window into purposeful, manageable units, we enable agents that are more capable, personalized, and controllable.
