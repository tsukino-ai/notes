---
title: Creating a Second Step
author: mastra-ai
date: 2026-05-28
source: https://github.com/mastra-ai/mastra/blob/main/docs/src/course/04-workflows/04-creating-a-second-step.md
tags:
  - agent-framework
  - typescript
  - mastra
---

# Creating a Second Step

Now let's create a second step that enhances the validated content with metadata.

## The Enhancement Step

Add this step to your workflow file:

```typescript
const enhanceContentStep = createStep({
  id: 'enhance-content',
  description: 'Adds metadata to validated content',
  inputSchema: z.object({
    content: z.string(),
    type: z.string(),
    wordCount: z.number(),
    isValid: z.boolean(),
  }),
  outputSchema: z.object({
    content: z.string(),
    type: z.string(),
    wordCount: z.number(),
    metadata: z.object({
      readingTime: z.number(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      processedAt: z.string(),
    }),
  }),
  execute: async ({ inputData }) => {
    const { content, type, wordCount } = inputData

    // Calculate reading time (200 words per minute)
    const readingTime = Math.ceil(wordCount / 200)

    // Determine difficulty based on word count
    let difficulty: 'easy' | 'medium' | 'hard' = 'easy'
    if (wordCount > 100) difficulty = 'medium'
    if (wordCount > 300) difficulty = 'hard'

    return {
      content,
      type,
      wordCount,
      metadata: {
        readingTime,
        difficulty,
        processedAt: new Date().toISOString(),
      },
    }
  },
})
```

## Notice the Input Schema

The input schema of this step matches the output schema of the previous step. This is important for chaining steps together!

Your second step is ready! Next, you'll learn how to chain these steps together into a complete workflow.
