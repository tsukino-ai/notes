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

### Phase 3: Pre-process

**Article:** Generate elevator pitch summary (thesis + 3 key insights)
**Repository:** Analyze directory structure, read README, identify entry points and core modules

### Phase 4: Dialog Learning

**Article modes:** Socratic / Mentor / Connection / Debate
**Repository perspectives:** Architecture / Feature / Problem

Load the appropriate guide:
- Article: `references/article-learning-guide.md`
- Repository: `references/repo-learning-guide.md`

### Phase 5: Generate Notes

Use the appropriate template:
- Article: `references/article-note-template.md`
- Repository: `references/repo-note-template.md`

Auto-assign directory based on content keywords.

### Phase 6: Commit and Push

```bash
git add content/ _refs/
git commit -m "learn(<type>): <title>"
git push origin main
```

## Note on Mermaid

Quartz natively supports Mermaid diagrams. Embed directly in notes:

```markdown
```mermaid
graph TD
    A --> B
```
```

Generate architecture diagrams, sequence diagrams, and flowcharts in repository notes.
