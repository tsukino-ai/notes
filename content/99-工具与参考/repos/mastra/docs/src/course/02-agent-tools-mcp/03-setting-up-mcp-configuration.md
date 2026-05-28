---
title: Setting Up MCP Configuration
author: mastra-ai
date: 2026-05-28
source: https://github.com/mastra-ai/mastra/blob/main/docs/src/course/02-agent-tools-mcp/03-setting-up-mcp-configuration.md
tags:
  - agent-framework
  - typescript
  - mastra
---

# Setting Up MCP Configuration

Now, let's create a basic MCP configuration in your agent file. Open your `src/mastra/agents/index.ts` file and add the following imports:

```typescript
import { MCPClient } from '@mastra/mcp'
```

Then, create a basic MCP configuration object:

```typescript
const mcp = new MCPClient({
  servers: {
    // We'll add servers in the next steps
  },
})
```

This configuration object will be used to specify which MCP servers your agent should connect to. The `servers` property is an object where each key is a unique identifier for a server, and the value contains the configuration for that server.

In the upcoming steps, we'll add various MCP servers to this configuration, giving your agent access to a wide range of tools and services.
