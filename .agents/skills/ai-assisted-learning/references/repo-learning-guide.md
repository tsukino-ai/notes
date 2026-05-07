# Repository Learning Guide

## Ingest Phase

1. Run `git clone --depth 1 <url> .temp/repos/<repo-name>/`
2. Remove `.git/` directory: `rm -rf .temp/repos/<repo-name>/.git/`
3. Move to archive: `mv .temp/repos/<repo-name>/ _refs/repos/<repo-name>/`
4. Analyze structure:
   - Read README.md
   - List top-level directories
   - Identify entry points (main.py, index.js, etc.)
   - Find configuration files (pyproject.toml, package.json, etc.)

## Learning Perspectives

### Architecture Perspective
Goal: Understand overall design

Path:
1. README → project overview
2. Top-level directories → module boundaries
3. Core interfaces → public APIs
4. Dependency graph → module relationships

Output: Mermaid architecture diagram + module responsibility table

### Feature Perspective
Goal: Understand how a specific feature works

Path:
1. Identify feature entry point
2. Trace call chain using grep/file reading
3. Identify key implementations
4. Map data flow

Output: Mermaid sequence diagram + key code snippets

### Problem Perspective
Goal: Solve a specific question/bug

Path:
1. Search for relevant code using keywords
2. Analyze context around found code
3. Trace related execution paths
4. Form hypothesis and verify

Output: Analysis notes + fix/implementation ideas

## Note Generation

Use template from `repo-note-template.md`.

## Directory Assignment

- AI/ML libraries → `30-Agent工程/` or `40-AI编码与源码/`
- Backend frameworks → `50-后端/`
- Frontend libraries → `60-前端/`
- DevOps tools → `70-DevOps/`
- General utilities → `99-工具与参考/`
