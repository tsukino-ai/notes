# Article Learning Guide

## Ingest Phase

1. Use FetchURL to read the article content
2. Save raw content to `_refs/articles/<YYYY-MM-DD>-<slug>.md`
3. Generate elevator pitch summary:
   - One-sentence thesis
   - 3 key insights
   - Target audience

## Learning Modes

### Socratic Mode
Ask guiding questions rather than giving answers:
- "What problem is the author trying to solve?"
- "Why do you think they chose this approach?"
- "What are the limitations of this method?"

### Mentor Mode
Explain with analogies and examples:
- Connect to known concepts
- Use real-world analogies
- Provide concrete examples

### Connection Mode
Link to existing knowledge base:
- Search for related notes in content/
- Suggest `[[wiki-links]]` to existing concepts
- Identify gaps in current knowledge

### Debate Mode
Challenge assumptions:
- Present counter-arguments
- Test edge cases
- Evaluate trade-offs

## Note Generation

Use template from `article-note-template.md`.

## Directory Assignment

Based on content keywords:
- Transformer/Attention/LLM → `10-LLM基础/`
- RAG/Embedding → `20-RAG工程/`
- Agent/LangGraph/MCP → `30-Agent工程/`
- Source code/AI Coding → `40-AI编码与源码/`
- Java/Spring Boot → `50-后端/`
- React/Frontend → `60-前端/`
- Docker/K8s → `70-DevOps/`
- Uncertain → `00-入门与路线图/`
