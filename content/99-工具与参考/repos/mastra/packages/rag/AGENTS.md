---
title: AGENTS
author: mastra-ai
date: 2026-05-28
source: https://github.com/mastra-ai/mastra/blob/main/packages/rag/AGENTS.md
tags:
  - agent-framework
  - typescript
  - mastra
---

Build from root: pnpm build:rag
Test from root: pnpm test:rag
Lint from root if needed: pnpm --filter ./packages/rag lint

Most validation is package-scoped Vitest coverage
Retrieval changes should use targeted tests for the exact path that changed

Be careful with chunking and query changes because relevance regressions are easy to miss in static checks
