---
title: Exporting Your Agent
author: mastra-ai
date: 2026-05-28
source: https://github.com/mastra-ai/mastra/blob/main/docs/src/course/01-first-agent/08-exporting-your-agent.md
tags:
  - agent-framework
  - typescript
  - mastra
---

# Exporting Your Agent

To make your agent available to the playground, you need to export it through the Mastra class in your `src/mastra/index.ts` file.

First, import the necessary dependencies and your agent:

```typescript
import { Mastra } from '@mastra/core'
import { PinoLogger } from '@mastra/loggers'
import { LibSQLStore } from '@mastra/libsql'
import { financialAgent } from './agents/financial-agent'

export const mastra = new Mastra({
  agents: {
    financialAgent,
  },
  storage: new LibSQLStore({
    id: 'learning-memory-storage',
    url: ':memory:',
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
})
```

This creates a new Mastra instance that includes:

- Your financial agent
- In-memory storage for development
- A logger for debugging and monitoring

The Mastra class is the main entry point for your Mastra project. It's responsible for registering your agents and configuring the core services like storage and logging.
