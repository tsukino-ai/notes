---
title: Updating Your Mastra Export
author: mastra-ai
date: 2026-05-28
source: https://github.com/mastra-ai/mastra/blob/main/docs/src/course/03-agent-memory/05-updating-mastra-export.md
tags:
  - agent-framework
  - typescript
  - mastra
---

# Updating Your Mastra Export

Make sure to update your `src/mastra/index.ts` file to include your new memory agent:

```typescript
import { Mastra } from '@mastra/core'
import { memoryAgent } from './agents'

export const mastra: Mastra = new Mastra({
  agents: {
    memoryAgent,
  },
})
```

This step is essential for making your agent available in the Mastra playground. The `mastra` export is the main entry point for your Mastra application, and it needs to include all the agents you want to use.

By adding your `memoryAgent` to the `agents` object in the Mastra configuration, you're registering it with the Mastra system, making it available for use in the playground and other parts of your application.
