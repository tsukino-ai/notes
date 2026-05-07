# 知识库排版与展示方案设计

> 日期：2026-05-07
> 状态：待实施
> 作者：Kimi Code CLI

---

## 1. 项目背景

当前知识库基于 Obsidian + Quartz + Cloudflare Pages 构建，已部署至 `notes.tsukino.dev`。笔记内容为纯技术学习笔记，覆盖 LLM 基础、RAG 工程、Agent 工程、AI 编码、Java/Spring Boot、React、DevOps 等领域。

现有问题：
- `content/` 目录仅有 `index.md`、`AGENTS.md`、`端到端测试.md`，缺乏系统化组织
- 网站首页和导航结构尚未设计
- 笔记分类体系未建立

---

## 2. 目标

1. **建立清晰的技术栈分层目录结构**，便于个人学习沉淀和对外展示
2. **设计网站首页**，作为知识库总览和学习路线入口
3. **配置 Quartz 导航组件**（Explorer、Graph View、Backlinks），优化阅读体验
4. **制定内容格式规范**，确保笔记风格一致

---

## 3. 目录结构设计

采用 **技术栈分层结构**，按领域分层，用数字前缀控制排序：

```
content/
├── 00-入门与路线图/
│   └── index.md                    ← 知识库首页、学习路线图
├── 10-LLM基础/
│   ├── index.md                    ← LLM 领域入口
│   ├── Transformer.md
│   ├── Attention机制.md
│   └── ...
├── 20-RAG工程/
│   ├── index.md
│   ├── RAG架构概览.md
│   ├── 向量数据库对比.md
│   └── ...
├── 30-Agent工程/
│   ├── index.md
│   ├── Agent设计模式.md
│   ├── LangGraph核心概念.md
│   ├── MCP协议详解.md
│   ├── Tool-Calling模式.md
│   └── ...
├── 40-AI编码与源码/
│   ├── index.md
│   ├── 源码学习方法论.md
│   └── ...
├── 50-后端/
│   ├── index.md
│   ├── Spring-Boot.md
│   └── ...
├── 60-前端/
│   ├── index.md
│   └── React.md
├── 70-DevOps/
│   ├── index.md
│   ├── Docker.md
│   └── Kubernetes.md
└── 99-工具与参考/
    ├── index.md
    └── 常用命令速查.md
```

### 3.1 编号规则

| 编号 | 含义 | 内容示例 |
|---|---|---|
| `00` | 入门与路线图 | 知识库首页、学习路线、阅读指南 |
| `10-70` | 技术栈分层 | 按领域从底层到应用层排列 |
| `99` | 工具与参考 | 速查表、工具链、杂项 |

### 3.2 每层的 `index.md` 职责

每层必须有一个 `index.md`，作为该领域的**入口地图**：
- 列出该领域下的核心笔记
- 提供学习顺序建议
- 用 `[[笔记名]]` 链接到具体笔记

示例（`content/30-Agent工程/index.md`）：
```markdown
---
title: Agent 工程
---

# Agent 工程

本领域覆盖 Agent 的设计、实现与部署。

## 核心主题

1. [[Agent设计模式]] —— ReAct、Plan-and-Execute 等模式
2. [[LangGraph核心概念]] —— 状态图、节点、边
3. [[MCP协议详解]] —— Model Context Protocol
4. [[Tool-Calling模式]] —— 工具调用最佳实践

## 学习顺序

建议按上述顺序阅读。
```

---

## 4. 首页设计（`content/index.md`）

首页是访客的第一印象，需要包含：

```markdown
---
title: Tsukino Dev Notes
---

# Tsukino Dev Notes

这是我的个人技术知识库，记录从全栈开发转向 **Agent 工程师** 的学习沉淀。

## 技术栈导航

- [[10-LLM基础/index|LLM 基础]] —— Transformer、Attention、大模型原理
- [[20-RAG工程/index|RAG 工程]] —— 检索增强生成架构与实践
- [[30-Agent工程/index|Agent 工程]] —— Agent 设计模式、LangGraph、MCP
- [[40-AI编码与源码/index|AI 编码与源码]] —— 源码学习方法、AI 辅助编程
- [[50-后端/index|后端]] —— Java、Spring Boot
- [[60-前端/index|前端]] —— React、前端工程化
- [[70-DevOps/index|DevOps]] —— Docker、Kubernetes、CI/CD
- [[99-工具与参考/index|工具与参考]] —— 速查表、工具链

## 关于

- 构建工具：[Quartz](https://quartz.jzhao.xyz/) + [Obsidian](https://obsidian.md/)
- 部署平台：[Cloudflare Pages](https://pages.cloudflare.com/)
- 域名：[notes.tsukino.dev](https://notes.tsukino.dev)
```

---

## 5. Quartz 导航组件配置

### 5.1 Explorer（侧边栏文件树）

Quartz 默认的 Explorer 会按文件系统层级展示目录，配合数字前缀自然形成有序的技术树。

在 `quartz.layout.ts` 中保持默认 Explorer 配置即可：
```typescript
Component.Explorer(),
```

### 5.2 Graph View（图视图）

Graph View 展示笔记之间的链接关系，适合发现知识关联。

保持默认配置：
```typescript
Component.Graph(),
```

### 5.3 Backlinks（反向链接）

每篇笔记底部自动显示引用该笔记的其他笔记，增强知识网络感。

保持默认配置：
```typescript
Component.Backlinks(),
```

### 5.4 Recent Notes（最近更新）

在首页或侧边栏展示最近更新的笔记，体现知识库的活跃度。

可在首页布局中加入：
```typescript
Component.RecentNotes({
  title: "最近更新",
  limit: 5,
}),
```

### 5.5 Table of Contents（目录）

长笔记的右侧边栏自动显示目录，便于跳转。

保持默认配置：
```typescript
Component.TableOfContents(),
```

---

## 6. 内容格式规范

### 6.1 文件命名

- 使用 **kebab-case**（短横线连接）
- 中文命名优先（因为笔记主要面向中文读者）
- 示例：`LangGraph核心概念.md`、`向量数据库对比.md`

### 6.2 Frontmatter 规范

每篇笔记建议包含：
```markdown
---
title: 笔记标题
date: YYYY-MM-DD
tags:
  - tag1
  - tag2
---
```

### 6.3 标签策略

用标签补充目录分类的不足，建议标签体系：

| 标签类型 | 示例 |
|---|---|
| 领域 | `#llm`, `#rag`, `#agent`, `#devops` |
| 状态 | `#learning`, `#review`, `#mature` |
| 类型 | `#concept`, `#tutorial`, `#cheatsheet`, `#source-code` |

### 6.4 链接策略

- **层级内链接**：用 `[[笔记名]]` 在同一领域内建立关联
- **跨层级链接**：用 `[[目标笔记名]]` 连接相关领域（如 LLM 基础 → Agent 工程）
- **MOC 聚合**：每层 `index.md` 用链接列出该领域核心笔记

---

## 7. 视觉与风格

### 7.1 主题

保持 Quartz 默认主题即可，简洁专业，适合技术文档。

如需调整，可在 `quartz.config.ts` 中修改颜色方案。

### 7.2 响应式布局

Quartz 原生支持桌面/平板/移动端自适应，无需额外配置。

---

## 8. 实施范围

### 8.1 本次实施内容

- [ ] 创建目录结构（`10-` 到 `99-` 的文件夹和 `index.md`）
- [ ] 重写 `content/index.md` 首页
- [ ] 移动现有笔记到对应目录（`AGENTS.md` → `00-入门与路线图/`）
- [ ] 配置 `quartz.layout.ts`（添加 RecentNotes 等组件）
- [ ] 本地构建验证
- [ ] 推送到 GitHub，确认 Cloudflare Pages 自动更新

### 8.2 后续逐步完善

- 逐篇迁移/撰写各领域的具体笔记
- 完善标签体系
- 根据阅读数据调整导航结构

---

## 9. 成功标准

- [ ] `notes.tsukino.dev` 首页展示清晰的技术栈导航
- [ ] Explorer 侧边栏按技术层次有序排列
- [ ] 每层 `index.md` 可作为该领域的入口地图
- [ ] 笔记之间的链接关系在 Graph View 中可见
- [ ] 移动端访问体验良好

---

## 附录：参考案例

- [Jacky Zhao's Garden](https://jzhao.xyz/) —— Quartz 作者本人的数字花园
- [Quartz Showcase](https://quartz.jzhao.xyz/showcase) —— 社区优秀案例合集
- [dusanmitrovic-dev/obsidian-vault-template](https://github.com/dusanmitrovic-dev/obsidian-vault-template) —— PARA 方法论目录结构参考
