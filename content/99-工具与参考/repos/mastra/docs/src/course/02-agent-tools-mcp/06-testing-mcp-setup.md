---
title: Testing Your Setup
author: mastra-ai
date: 2026-05-28
source: https://github.com/mastra-ai/mastra/blob/main/docs/src/course/02-agent-tools-mcp/06-testing-mcp-setup.md
tags:
  - agent-framework
  - typescript
  - mastra
---

# Testing Your Setup

At this point, your agent doesn't have any MCP servers configured yet, but the basic setup is in place. Let's test that everything is working:

1. Make sure your development server is running with `npm run dev`
2. Open the playground at http://localhost:4111/
3. You should see your "Personal Assistant" agent in the list of agents
4. Try sending a message like "Hello, what can you help me with?"

The agent should respond, but it won't have any special capabilities yet. In the next steps, we'll add various MCP servers to give your agent powerful new abilities.

In the next step, we'll add the Zapier MCP server to give your agent access to email and social media tools.
