---
title: Adding the Filesystem MCP Server
author: mastra-ai
date: 2026-05-28
source: https://github.com/mastra-ai/mastra/blob/main/docs/src/course/02-agent-tools-mcp/24-what-is-filesystem-mcp.md
tags:
  - agent-framework
  - typescript
  - mastra
---

# Adding the Filesystem MCP Server

In this final step, we'll add the Filesystem MCP server to our agent, which will give it the ability to read and write files on your local system. This is particularly useful for creating and managing notes, to-do lists, and other persistent data.

## What is the Filesystem MCP Server?

The Filesystem MCP server provides tools for interacting with your local file system, including:

- Reading files
- Writing to files
- Creating directories
- Listing files and directories
- Managing persistent data like notes and to-do lists

By integrating the Filesystem MCP server with your Mastra agent, you can create an assistant that can maintain persistent information across sessions. This allows your agent to create and manage notes, to-do lists, and other documents that persist even after you close the application.
