---
name: ai-assisted-learning
description: Use when user wants to learn from any URL — article, paper, blog post, documentation, or GitHub repository. Automatically detects content type, ingests the source, generates a baseline note first, then engages in dialog-based learning, and finally updates the note with conversation insights. Triggered by sharing a URL with phrases like 'learn this', 'read this', 'help me understand this', or simply pasting a link.
---

# AI-Assisted Learning

## Overview

Unified skill for learning from web content and GitHub repositories.

**核心设计原则：先保底，再深化。**
- 下载/clone 内容后，**先生成一份基础笔记**（draft），保存到知识库
- 然后引导用户进入对话学习
- 用户随时说"生成笔记"，再基于对话内容更新/重写
- 如果用户中途退出，至少有一份基础笔记不会丢失

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

### Phase 3: Summarize & Generate Draft Note

**两个并行动作：**

**A. 向用户呈现摘要**

给用户一个完整的内容概览，用清晰的结构化输出展示。

**Article 摘要包含：**
1. 核心论点（一句话）
2. 3-5 个关键概念
3. 作者的核心洞察/创新点
4. 适用场景和目标读者
5. 与知识库中已有内容的潜在关联

**Repository 摘要包含：**
1. 项目定位（一句话）
2. 技术栈和核心依赖
3. 目录结构概览（顶层模块职责）
4. 关键入口文件和公共 API
5. 亮点设计或值得关注的地方

**B. 自动生成基础笔记草稿（保底机制）**

在展示摘要的同时，基于原文自动生成一份**基础笔记草稿**，保存到 `content/<tier>/<YYYY-MM-DD>-<slug>.md`。

这份草稿包含：
- 核心概念整理（AI 的初步理解）
- 关键洞察（原文提炼）
- 待深入研究的问题（AI 认为值得深挖的点）
- 与已有知识的潜在关联（自动搜索知识库后建议）

**不包含（留待对话后补充）：**
- 用户的个人思考
- 对话中产生的新理解
- 最终确认的知识连接

**告知用户：** "已保存一份基础笔记到 `content/...`，继续对话会让它更丰富。"

### Phase 4: Guide Learning

**目标：** 基于总结，引导用户选择学习深度和角度，然后进入对话。

**步骤：**
1. **推荐模式**：基于内容特征，主动推荐 1-2 个最适合的学习模式
2. **让用户选择**：
   - 文章：Socratic / Mentor / Connection / Debate
   - 仓库：Architecture / Feature / Problem
   - 或让用户直接说想关注什么
3. **确认起点**：用户可能说：
   - "我想先看懂 XXX 概念"
   - "这个架构图我没看懂"
   - "直接开始 Socratic 模式"
   - "给我讲讲和 [[已有笔记]] 的区别"
4. **进入对话**：加载对应 guide，开始结构化对话

**对话结构（每轮）：**
- **Open**：抛出一个核心问题或观点
- **Respond**：用户回应（提问、确认、质疑、延伸）
- **Deepen**：基于用户回应，追问、补充、换角度、举例子
- **Capture**：把本轮关键洞察记录到临时草稿（内存中累积，不写入文件）

**结束条件（满足任一）：**
- 用户明确说"够了""生成笔记""结束"
- 用户要求"更新笔记"
- 核心内容已充分覆盖，且连续两轮用户没有新问题
- 用户要求切换模式（回到步骤 2，保留当前对话草稿）

### Phase 5: Finalize Notes

当用户说"生成笔记""更新笔记""够了"时：

1. 读取 Phase 3 保存的 draft note
2. 将对话中累积的洞察补充进去：
   - 用户的个人思考
   - 对话中形成的新理解
   - 确认有效的知识连接
   - 更新"待深入研究"列表（去掉已解决的，补充新产生的）
3. 使用对应模板格式化：
   - Article: `references/article-note-template.md`
   - Repository: `references/repo-note-template.md`
4. 保存覆盖原 draft

**如果用户中途退出**（没有触发 Phase 5）：Phase 3 的 draft 已包含基础内容，不会空手而归。

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
