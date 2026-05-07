# 知识库排版与展示方案实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 Quartz 知识库中建立技术栈分层目录结构，设计首页导航，配置 Quartz 展示组件，实现从 Obsidian 到 Cloudflare Pages 的完整展示链路。

**Architecture:** 在 `content/` 下创建带数字前缀的层级目录（`00-` 到 `99-`），每层包含 `index.md` 作为入口地图；重写 `content/index.md` 作为知识库总览首页；通过 `quartz.layout.ts` 配置 RecentNotes 等组件增强导航体验。

**Tech Stack:** Obsidian, Quartz 4, Git, Cloudflare Pages

---

## 文件结构映射

初始化完成后，`content/` 目录结构如下：

| 文件/目录 | 来源 | 职责 |
|---|---|---|
| `content/index.md` | 重写 | 知识库首页，技术栈总览导航 |
| `content/00-入门与路线图/index.md` | 新建 | 入门指南、学习路线图 |
| `content/00-入门与路线图/AGENTS.md` | 从 `content/AGENTS.md` 移动 | 项目背景与 Agent 说明 |
| `content/10-LLM基础/index.md` | 新建 | LLM 领域入口地图 |
| `content/20-RAG工程/index.md` | 新建 | RAG 领域入口地图 |
| `content/30-Agent工程/index.md` | 新建 | Agent 领域入口地图 |
| `content/40-AI编码与源码/index.md` | 新建 | AI 编码领域入口地图 |
| `content/50-后端/index.md` | 新建 | 后端领域入口地图 |
| `content/60-前端/index.md` | 新建 | 前端领域入口地图 |
| `content/70-DevOps/index.md` | 新建 | DevOps 领域入口地图 |
| `content/99-工具与参考/index.md` | 新建 | 工具与参考入口地图 |
| `quartz.layout.ts` | 修改 | 添加 RecentNotes 组件到首页布局 |

---

### Task 1: 移动现有笔记到目标目录

**Files:**
- Move: `content/AGENTS.md` → `content/00-入门与路线图/AGENTS.md`
- Delete: `content/端到端测试.md`

- [ ] **Step 1: 创建目标目录**

Run:
```bash
mkdir -p content/00-入门与路线图
```

Expected: `content/00-入门与路线图/` directory created.

- [ ] **Step 2: 移动 AGENTS.md**

Run:
```bash
git mv content/AGENTS.md content/00-入门与路线图/AGENTS.md
```

Expected: `content/AGENTS.md` no longer exists at root; now at `content/00-入门与路线图/AGENTS.md`.

- [ ] **Step 3: 删除测试笔记**

Run:
```bash
git rm content/端到端测试.md
```

Expected: `content/端到端测试.md` removed.

- [ ] **Step 4: Commit**

Run:
```bash
git commit -m "refactor: move AGENTS.md to 00-入门与路线图, remove test note"
```

---

### Task 2: 创建技术栈分层目录结构

**Files:**
- Create: `content/00-入门与路线图/index.md`
- Create: `content/10-LLM基础/index.md`
- Create: `content/20-RAG工程/index.md`
- Create: `content/30-Agent工程/index.md`
- Create: `content/40-AI编码与源码/index.md`
- Create: `content/50-后端/index.md`
- Create: `content/60-前端/index.md`
- Create: `content/70-DevOps/index.md`
- Create: `content/99-工具与参考/index.md`

- [ ] **Step 1: 创建所有目录**

Run:
```bash
mkdir -p content/10-LLM基础
mkdir -p content/20-RAG工程
mkdir -p content/30-Agent工程
mkdir -p content/40-AI编码与源码
mkdir -p content/50-后端
mkdir -p content/60-前端
mkdir -p content/70-DevOps
mkdir -p content/99-工具与参考
```

Expected: All directories exist under `content/`.

- [ ] **Step 2: 创建 00-入门与路线图/index.md**

Write to `content/00-入门与路线图/index.md`:

```markdown
---
title: 入门与路线图
---

# 入门与路线图

欢迎来到 Tsukino Dev Notes！

## 关于本知识库

本知识库记录从全栈开发转向 **Agent 工程师** 的学习沉淀。

## 学习路线

1. [[10-LLM基础/index|LLM 基础]] —— 理解 Transformer、Attention 等大模型核心原理
2. [[20-RAG工程/index|RAG 工程]] —— 掌握检索增强生成的架构与实践
3. [[30-Agent工程/index|Agent 工程]] —— 学习 Agent 设计模式、LangGraph、MCP
4. [[40-AI编码与源码/index|AI 编码与源码]] —— 源码学习方法论与 AI 辅助编程

## 项目背景

- [[AGENTS]] —— 本项目的背景、技术选型与工作原则
```

- [ ] **Step 3: 创建 10-LLM基础/index.md**

Write to `content/10-LLM基础/index.md`:

```markdown
---
title: LLM 基础
---

# LLM 基础

本领域覆盖大语言模型的核心原理与基础技术。

## 核心主题

- Transformer 架构
- Attention 机制
- 预训练与微调
- Tokenization

## 待补充笔记

> 随着学习深入，逐步补充具体笔记内容。
```

- [ ] **Step 4: 创建 20-RAG工程/index.md**

Write to `content/20-RAG工程/index.md`:

```markdown
---
title: RAG 工程
---

# RAG 工程

本领域覆盖检索增强生成（Retrieval-Augmented Generation）的架构设计与工程实践。

## 核心主题

- RAG 架构概览
- 向量数据库对比
- Embedding 模型选择
- 检索策略优化
- 重排序（Rerank）
```

- [ ] **Step 5: 创建 30-Agent工程/index.md**

Write to `content/30-Agent工程/index.md`:

```markdown
---
title: Agent 工程
---

# Agent 工程

本领域覆盖 AI Agent 的设计、实现与部署。

## 核心主题

- [[Agent设计模式]] —— ReAct、Plan-and-Execute 等模式
- [[LangGraph核心概念]] —— 状态图、节点、边
- [[MCP协议详解]] —— Model Context Protocol
- [[Tool-Calling模式]] —— 工具调用最佳实践

## 学习顺序

建议按上述顺序阅读。
```

- [ ] **Step 6: 创建 40-AI编码与源码/index.md**

Write to `content/40-AI编码与源码/index.md`:

```markdown
---
title: AI 编码与源码
---

# AI 编码与源码

本领域覆盖 AI 辅助编程与开源项目源码学习。

## 核心主题

- 源码学习方法论
- AI Coding 工具链
- 源码阅读笔记
```

- [ ] **Step 7: 创建 50-后端/index.md**

Write to `content/50-后端/index.md`:

```markdown
---
title: 后端
---

# 后端

本领域覆盖 Java / Spring Boot 及后端工程实践。

## 核心主题

- Spring Boot
- 微服务架构
- 数据库设计
```

- [ ] **Step 8: 创建 60-前端/index.md**

Write to `content/60-前端/index.md`:

```markdown
---
title: 前端
---

# 前端

本领域覆盖 React 及前端工程化。

## 核心主题

- React
- 前端工程化
- TypeScript
```

- [ ] **Step 9: 创建 70-DevOps/index.md**

Write to `content/70-DevOps/index.md`:

```markdown
---
title: DevOps
---

# DevOps

本领域覆盖 Docker、Kubernetes、CI/CD 等运维技术。

## 核心主题

- Docker
- Kubernetes
- CI/CD 流水线
```

- [ ] **Step 10: 创建 99-工具与参考/index.md**

Write to `content/99-工具与参考/index.md`:

```markdown
---
title: 工具与参考
---

# 工具与参考

速查表、工具链、常用命令等参考材料。

## 内容

- 常用命令速查
- 工具链配置
- 参考资料
```

- [ ] **Step 11: Commit**

Run:
```bash
git add content/
git commit -m "feat: create tech-stack layer directory structure with index.md maps"
```

---

### Task 3: 重写知识库首页

**Files:**
- Modify: `content/index.md`

- [ ] **Step 1: 重写首页内容**

Write to `content/index.md`:

```markdown
---
title: Tsukino Dev Notes
---

# Tsukino Dev Notes

这是我的个人技术知识库，记录从全栈开发转向 **Agent 工程师** 的学习沉淀。

## 技术栈导航

| 领域 | 描述 |
|---|---|
| [[00-入门与路线图/index|入门与路线图]] | 知识库导读、学习路线、项目背景 |
| [[10-LLM基础/index|LLM 基础]] | Transformer、Attention、大模型原理 |
| [[20-RAG工程/index|RAG 工程]] | 检索增强生成架构与实践 |
| [[30-Agent工程/index|Agent 工程]] | Agent 设计模式、LangGraph、MCP |
| [[40-AI编码与源码/index|AI 编码与源码]] | 源码学习方法、AI 辅助编程 |
| [[50-后端/index|后端]] | Java、Spring Boot |
| [[60-前端/index|前端]] | React、前端工程化 |
| [[70-DevOps/index|DevOps]] | Docker、Kubernetes、CI/CD |
| [[99-工具与参考/index|工具与参考]] | 速查表、工具链 |

## 最近更新

<!-- Quartz 的 RecentNotes 组件将在此处渲染 -->

## 关于

- 构建工具：[Quartz](https://quartz.jzhao.xyz/) + [Obsidian](https://obsidian.md/)
- 部署平台：[Cloudflare Pages](https://pages.cloudflare.com/)
- 域名：[notes.tsukino.dev](https://notes.tsukino.dev)
```

- [ ] **Step 2: Commit**

Run:
```bash
git add content/index.md
git commit -m "feat: rewrite homepage with tech-stack navigation"
```

---

### Task 4: 配置 quartz.layout.ts（添加 RecentNotes）

**Files:**
- Modify: `quartz.layout.ts`

- [ ] **Step 1: 读取当前 quartz.layout.ts**

Use ReadFile to inspect `quartz.layout.ts` and identify the page layout for `Plugin.ContentPage()`.

- [ ] **Step 2: 在首页布局中添加 RecentNotes**

Locate the `pageLayout` used for content pages (usually inside `Plugin.ContentPage()` configuration or the default page layout). Add `Component.RecentNotes()` to the `afterBody` or `left` section.

For Quartz 4, the typical modification is in the shared page layout (affects all pages):

```typescript
// In quartz.layout.ts, find the page layout configuration
// Add to the appropriate section:
Component.RecentNotes({
  title: "最近更新",
  limit: 5,
}),
```

> **Note:** If you want RecentNotes only on the homepage, you may need to conditionally render it. For simplicity, placing it in the shared `afterBody` section shows it on all pages, which is acceptable for a knowledge base.

- [ ] **Step 3: 验证修改后的布局文件**

Run:
```bash
grep -n "RecentNotes" quartz.layout.ts
```

Expected: Shows `Component.RecentNotes` in the output.

- [ ] **Step 4: Commit**

Run:
```bash
git add quartz.layout.ts
git commit -m "config: add RecentNotes component to page layout"
```

---

### Task 5: 本地构建验证

**Files:**
- No file changes (build artifacts are gitignored)

- [ ] **Step 1: 执行本地构建**

Run:
```bash
npx quartz build
```

Expected:
- Build completes successfully
- Shows all created `index.md` files in the input count
- No errors

- [ ] **Step 2: 验证目录结构输出**

Run:
```bash
ls public/
```

Expected: `index.html`, `00-入门与路线图/`, `10-LLM基础/`, `20-RAG工程/`, etc.

- [ ] **Step 3: 验证首页渲染**

Run:
```bash
ls public/index.html
```

Expected: `public/index.html` exists.

- [ ] **Step 4: （可选）本地预览检查**

Run:
```bash
npx quartz build --serve
```

Open browser to `http://localhost:8080/` and verify:
- [ ] 首页显示技术栈导航表格
- [ ] Explorer 侧边栏按数字前缀排序
- [ ] 各层 `index.md` 可正常访问

Stop preview with Ctrl+C.

---

### Task 6: 推送到 GitHub 并验证 Cloudflare Pages 更新

**Files:**
- No local file changes

- [ ] **Step 1: 推送到 GitHub**

Run:
```bash
git push origin main
```

Expected: Push successful, all commits uploaded.

- [ ] **Step 2: 观察 Cloudflare Pages 构建**

1. Go to Cloudflare Dashboard → your `notes` project → Deployments
2. Wait for new build to complete (triggered by the push)

Expected: Build status shows **Success**.

- [ ] **Step 3: 验证网站更新**

Open `https://notes.tsukino.dev` and verify:
- [ ] 首页展示技术栈导航表格
- [ ] Explorer 侧边栏显示 `00-入门与路线图`、`10-LLM基础` 等层级
- [ ] `https://notes.tsukino.dev/00-入门与路线图` 可访问
- [ ] `https://notes.tsukino.dev/30-Agent工程` 可访问
- [ ] 移动端侧边栏可正常展开

- [ ] **Step 4: 验证 Graph View**

On the homepage, scroll down to the Graph View section and verify:
- [ ] Nodes exist for each `index.md`
- [ ] Links between index pages are visible

---

## Spec Coverage Check

| 设计文档要求 | 对应任务 |
|---|---|
| 创建目录结构（`00-` 到 `99-`） | Task 2 |
| 每层 `index.md` 作为入口地图 | Task 2 |
| 重写 `content/index.md` 首页 | Task 3 |
| 移动现有笔记（`AGENTS.md`） | Task 1 |
| 配置 `quartz.layout.ts`（RecentNotes） | Task 4 |
| 本地构建验证 | Task 5 |
| 推送到 GitHub / Cloudflare Pages 验证 | Task 6 |

---

## Placeholder Scan

- [x] 无 "TBD"、"TODO"、"implement later"
- [x] 所有文件路径具体
- [x] 每个步骤包含完整代码和命令
- [x] 无 "Similar to Task N" 引用

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-07-knowledge-base-layout.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
