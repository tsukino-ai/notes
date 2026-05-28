---
title: Environment Variables Reference
author: mastra-ai
date: 2026-05-28
source: https://github.com/mastra-ai/mastra/blob/main/.claude/skills/mastra-smoke-test/references/environment-variables.md
tags:
  - agent-framework
  - typescript
  - mastra
---

# Environment Variables Reference

For detailed internal infrastructure variables, see the Notion page:
**[Environment Variables Reference](https://www.notion.so/33bebffbc9f881e694f5f8af9df85a4a)**

## Variables You Need to Set

### For Smoke Testing

| Variable                  | Purpose                      | When to Set                |
| ------------------------- | ---------------------------- | -------------------------- |
| `MASTRA_PLATFORM_API_URL` | Target staging vs production | Before `mastra auth login` |
| `OPENAI_API_KEY`          | LLM API access               | Before running agents      |
| `ANTHROPIC_API_KEY`       | Alternative LLM              | If using Anthropic         |

### Environment Values

**Staging:**

```bash
export MASTRA_PLATFORM_API_URL=https://platform.staging.mastra.ai
```

**Production (default):**

```bash
export MASTRA_PLATFORM_API_URL=https://platform.mastra.ai
# Or just don't set it â€?production is the default
```

## Variables Set Automatically

These are injected by the platform during deployment â€?you don't need to set them:

- `MASTRA_CLOUD_ACCESS_TOKEN` â€?JWT for trace authentication
- `MASTRA_CLOUD_TRACES_ENDPOINT` â€?Where traces are sent

## Checking Your Environment

```bash
# Verify which environment you're targeting
echo $MASTRA_PLATFORM_API_URL

# Check if you're authenticated
mastra auth status
```
