---
title: Initializing MCP Tools
author: mastra-ai
date: 2026-05-28
source: https://github.com/mastra-ai/mastra/blob/main/docs/src/course/02-agent-tools-mcp/04-initializing-mcp-tools.md
tags:
  - agent-framework
  - typescript
  - mastra
---

# Initializing MCP Tools

Once you have the configuration set up, you need to initialize the MCP tools:

```typescript
const mcpTools = await mcp.listTools()
```

This asynchronous call fetches all the available tools from the configured MCP servers. The `listTools()` method connects to each server specified in your configuration, retrieves the available tools, and returns them in a format that can be used by your Mastra agent.

The `mcpTools` object will contain all the tools provided by the MCP servers you've configured. We'll add these tools to our agent in the next step.
