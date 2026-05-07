---
name: ai-assisted-learning
description: Use when user wants to learn from any URL — article, paper, blog post, documentation, or GitHub repository. Automatically detects content type, ingests the source, engages in dialog-based learning, and generates structured notes into the Obsidian knowledge base. Triggered by sharing a URL with phrases like 'learn this', 'read this', 'help me understand this', or simply pasting a link.
---

# AI-Assisted Learning

## Overview

Unified skill for learning from web content and GitHub repositories. Automatically detects URL type and branches into appropriate learning path.

## Workflow

### Phase 1: Detect Content Type

Analyze the URL:
- `github.com/{user}/{repo}` or `github.com/{user}/{repo}/...` → **Repository path**
- All other URLs → **Article path**

### Phase 2: Ingest

**Article path:**
1. FetchURL to read content
2. Save to `_refs/articles/<YYYY-MM-DD>-<slug>.md`

**Repository path:**
1. `git clone --depth 1 <url> .temp/repos/<repo-name>/`
2. `rm -rf .temp/repos/<repo-name>/.git/`
3. `mv .temp/repos/<repo-name>/ _refs/repos/<repo-name>/`

### Phase 3: Summarize & Present

**Goal:** 给用户一个完整的内容概览，让他知道

## Note on Mermaid

Quartz natively supports Mermaid diagrams. Embed directly in notes:

```markdown
```mermaid
graph TD
    A --> B
```
```

Generate architecture diagrams, sequence diagrams, and flowcharts in repository notes.
