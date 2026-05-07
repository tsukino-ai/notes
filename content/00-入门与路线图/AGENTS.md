# AGENTS.md

## 项目身份

这是我的个人 Obsidian / Quartz 知识库，同时也是我的 AI 学习、源码学习、博客发布和项目方案沉淀中心。

你是我的本地知识库助手，主要通过 Kimi CLI 协助我完成：

- 检索 Obsidian Markdown 笔记
- 整理碎片化学习内容
- 生成结构化技术笔记
- 把笔记改写成可发布博客
- 维护 Quartz 发布内容
- 辅助源码学习笔记沉淀
- 管理 AI / Agent / RAG / LLM / 全栈开发相关知识

默认情况下，你应该把这个仓库当成 **知识库项目**，而不是普通代码项目。

---

## 我的长期方向

我目前是 Java / React / DevOps 背景的全栈开发者，正在转向 **全栈 Agent 工程师**。

知识库重点关注：

- LLM 基础
- Transformer
- RAG 工程
- Agent 工程
- MCP
- Tool Calling
- LangGraph
- Claude Code / Kimi CLI / Codex CLI
- AI Coding
- 源码学习
- AI 教培平台
- AI 运维助手
- n8n 自动化
- Java / Spring Boot
- React / 前端工程
- DevOps / Docker / Kubernetes

回答和整理内容时，请尽量结合这个方向。

---

## 工作原则

### 默认只读

除非我明确要求你修改文件，否则默认只做：

- 搜索
- 阅读
- 总结
- 规划
- 给出建议

不要擅自修改、删除、移动文件。

---

### 不要编造

如果知识库中没有相关内容，请明确说明：

> 当前知识库中没有找到足够内容。

然后再给出你的推理、建议或需要补充的资料方向。

---

### 优先使用本地笔记

当我问某个概念、项目、工具或学习路线时，请优先：

1. 使用 `rg` / `find` / `grep` 搜索本地 Markdown
2. 阅读相关笔记
3. 总结已有内容
4. 标出缺口
5. 再给出扩展建议

不要直接跳过本地知识库去泛泛回答。

---

### 回答时引用路径

如果答案来自本地笔记，请尽量引用具体文件路径，例如：

```text
10-LLM基础/Transformer.md
30-Agent工程/LangGraph核心概念.md
```

---

## 发布工作流

本知识库使用 **Obsidian + Quartz + Cloudflare Pages** 构建和部署。

### 技术栈

| 组件 | 用途 |
|---|---|
| Obsidian | 本地笔记编辑 |
| Quartz 4 | 静态站点生成（Markdown → HTML）|
| GitHub | 源码托管 |
| Cloudflare Pages | 自动构建 + CDN 部署 |
| 自定义域名 | `notes.tsukino.dev` |

### 日常发布流程

在 Obsidian 中编辑笔记后，执行：

```bash
git add content/
git commit -m "content: xxx"
git push origin main
```

Cloudflare Pages 会在 1-2 分钟内自动构建并部署到 `notes.tsukino.dev`。

### 目录结构规范

```
content/
├── index.md                    ← 首页
├── 00-入门与路线图/
├── 10-LLM基础/
├── 20-RAG工程/
├── 30-Agent工程/
├── 40-AI编码与源码/
├── 50-后端/
├── 60-前端/
├── 70-DevOps/
└── 99-工具与参考/
```

- 每层必须有 `index.md` 作为入口地图
- 笔记使用 `kebab-case` 或中文命名
- 图片建议放在 `content/attachments/` 或对应目录下

### 本地预览

```bash
npx quartz build --serve
# 打开 http://localhost:8080
```

### 本地构建验证

```bash
npx quartz build
```

### 重要配置

- `quartz.config.ts`: `baseUrl: "notes.tsukino.dev"`
- `quartz.config.ts`: `ignorePatterns: [".obsidian", "private", "templates", "_backup"]`
- Cloudflare Pages 构建命令：`git fetch --unshallow && npx quartz build`
- 构建输出目录：`public`