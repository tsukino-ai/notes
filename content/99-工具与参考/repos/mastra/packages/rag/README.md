---
title: @mastra/rag
author: mastra-ai
date: 2026-05-28
source: https://github.com/mastra-ai/mastra/blob/main/packages/rag/README.md
tags:
  - agent-framework
  - typescript
  - mastra
---

# @mastra/rag

The Retrieval-Augmented Generation (RAG) module contains document processing and embedding utilities.

## Installation

```bash
npm install @mastra/rag
```

## Components

### Document

The `MDocument` class represents text content with associated metadata:

```typescript
import { MDocument } from '@mastra/rag';

const doc = new MDocument({
  text: 'Document content',
  metadata: { source: 'example.txt' },
});
```

[Documentation](https://mastra.ai/reference/rag/document)
