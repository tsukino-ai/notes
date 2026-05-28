---
title: Testing Your Agent
author: mastra-ai
date: 2026-05-28
source: https://github.com/mastra-ai/mastra/blob/main/docs/src/course/01-first-agent/09-testing-your-agent.md
tags:
  - agent-framework
  - typescript
  - mastra
---

# Testing Your Agent

Now let's test our agent in Mastra Studio:

1. Make sure your development server is running with `npm run dev`
2. Open the studio at http://localhost:4111/
3. You should see your "Financial Assistant Agent" in the list of agents
4. Try sending a message like "Hello, can you help me analyze my spending?"

At this point, your agent can respond to basic questions but doesn't have access to any transaction data. In the next step, we'll create a custom tool to fetch transaction data from a Google Sheet.

Testing your agent in the studio is an important step in the development process. It allows you to see how your agent responds to different inputs and identify any issues that need to be addressed before deploying it to production.
