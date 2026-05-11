# Deep Agents 官方文档原文

> 来源：https://docs.langchain.com/oss/python/deepagents/overview
> 抓取日期：2026-05-11

## Overview

The easiest way to start building agents and applications powered by LLMs—with built-in capabilities for task planning, file systems for context management, subagent-spawning, and long-term memory. You can use deep agents for any task, including complex, multi-step tasks. We think of deepagents as an "agent harness". It is the same core tool calling loop as other agent frameworks, but with built-in tools and capabilities.

deepagents is a standalone library built on top of LangChain's core building blocks for agents. It uses the LangGraph runtime for durable execution, streaming, human-in-the-loop, and other features.

The deepagents repository contains:
- Deep Agents SDK: A package for building agents that can handle any task
- Deep Agents CLI: A terminal coding agent built on the Deep Agents SDK
- ACP integration: An Agent Client Protocol connector for using deep agents in code editors like Zed

## When to use the Deep Agents

Use the Deep Agents SDK when you want to build agents that can:
- Handle complex, multi-step tasks that require planning and decomposition
- Manage large amounts of context through file system tools and summarization
- Swap filesystem backends to use in-memory state, local disk, durable stores, sandboxes, or your own custom backend
- Execute shell commands via the execute tool when using a sandbox backend
- Delegate work to specialized subagents for context isolation
- Persist memory across conversations and threads
- Control filesystem access with declarative permission rules that restrict which files agents can read or write
- Require human approval for sensitive operations with human-in-the-loop workflows
- Use any model — provider agnostic across frontier and open models

## Core capabilities

### Planning and task decomposition
Deep Agents include a built-in write_todos tool that enables agents to break down complex tasks into discrete steps, track progress, and adapt plans as new information emerges.

### Context management
File system tools (ls, read_file, write_file, edit_file) allow agents to offload large context to in-memory or filesystem storage, preventing context window overflow and enabling work with variable-length tool results. Auto-summarization compacts older conversation messages when the context window grows long, keeping the agent effective across extended sessions.

### Shell execution
When using a sandbox backend, agents get an execute tool to run shell commands for tests, builds, git operations, and system tasks. Sandbox backends provide isolation so agents can execute code without compromising your host system.

### Pluggable filesystem backends
The virtual filesystem is powered by pluggable backends that you can swap to fit your use case. Choose from in-memory state, local disk, LangGraph store for cross-thread persistence, sandboxes for isolated code execution (Modal, Daytona, Deno), or combine multiple backends with composite routing. You can also implement your own custom backend.

### Subagent spawning
A built-in task tool enables agents to spawn specialized subagents for context isolation. This keeps the main agent's context clean while still going deep on specific subtasks.

### Long-term memory
Extend agents with persistent memory across threads using LangGraph's Memory Store. Agents can save and retrieve information from previous conversations.

### Filesystem permissions
Declare permission rules that control which files and directories agents can read or write. Subagents can inherit or override the parent's rules.

### Human-in-the-loop
Configure human approval for sensitive tool operations using LangGraph's interrupt capabilities. Control which tools require confirmation before execution.

### Skills
Extend agents with reusable skills that provide specialized workflows, domain knowledge, and custom instructions.

### Smart defaults
Ships with opinionated system prompts that teach the model how to use its tools effectively — plan before acting, verify work, and manage context. Customize or replace the defaults as needed.
