---
title: Ant Design X 源码导航
author: ant-design
date: 2026-05-28
source: https://github.com/ant-design/x
tags:
  - react
  - ai-ui
  - ant-design-x
  - component-library
  - source-code
---

# Ant Design X 源码导航

> [📎 GitHub 仓库](https://github.com/ant-design/x) | ⭐ 4,553 | 🍴 1,091 | 📅 创建于 2024-05-09

Ant Design X 是蚂蚁集团推出的 React AI 对话组件库，基于 RICH 设计范式（Role / Intention / Conversation / Hybrid UI）。

## 核心文档

| 文档 | 说明 |
|------|------|
| [README](./README.md) | 项目总览 |
| [README-zh_CN](./README-zh_CN.md) | 中文 README |
| [CHANGELOG](./CHANGELOG.zh-CN.md) | 更新日志 |

## 核心包（packages/）

| 包名 | 说明 |
|------|------|
| [x](./packages/x/) | **核心 UI 组件库** — Bubble、Sender、Attachments、ThoughtChain 等 |
| [x-sdk](./packages/x-sdk/) | **数据流管理** — useXChat、useXConversations、XRequest、ChatProvider |
| [x-markdown](./packages/x-markdown/) | **流式 Markdown 渲染器** |
| [x-card](./packages/x-card/) | **A2UI 动态卡片** — AI 通过 JSON 流渲染交互界面 |
| [x-skill](./packages/x-skill/) | **AI Skill 技能库** — Agent 预设技能 |

## UI 组件列表（packages/x/components/）

| 组件 | 功能 |
|------|------|
| `Bubble` | 对话气泡（流式输入、打字机动画、可编辑）|
| `Bubble.List` | 消息列表（自动滚动、角色配置）|
| `Sender` | 输入发送器（附件、多行、快捷指令）|
| `Attachments` | 文件上传/展示 |
| `ThoughtChain` | 思维链展示（推理过程可视化）|
| `Conversations` | 会话历史管理 |
| `Prompts` | 提示词推荐 |
| `Suggestion` | 快捷建议 |
| `Welcome` | 欢迎页 |
| `Actions` | 消息操作反馈 |
| `Sources` | 引用来源展示 |
| `FileCard` / `Folder` | 文件卡片、文件夹 |
| `CodeHighlighter` | 代码高亮 |
| `Mermaid` | Mermaid 图表渲染 |
| `Think` | 思考内容展示 |
| `XProvider` | 全局配置提供者 |

## SDK 模块（packages/x-sdk/src/）

| 模块 | 功能 |
|------|------|
| `x-chat/` | `useXChat` — 单对话数据管理 |
| `x-conversations/` | `useXConversations` — 多会话管理 |
| `x-request/` | `XRequest` — 通用流式 HTTP 请求工具 |
| `x-stream/` | 流式数据解析 |
| `chat-providers/` | `OpenAIChatProvider`、`DeepSeekChatProvider`、`DefaultChatProvider` |
| `x-mcp-client/` | MCP 客户端支持 |

## 架构概览

```mermaid
graph TD
    UI[UI 组件层 @ant-design/x] --> SDK[@ant-design/x-sdk]
    SDK --> useXChat[useXChat 状态管理]
    SDK --> useXConversations[useXConversations 多会话]
    SDK --> XRequest[XRequest HTTP 流式请求]
    SDK --> ChatProvider[ChatProvider 数据转换]
    ChatProvider --> OpenAI[OpenAIChatProvider]
    ChatProvider --> DeepSeek[DeepSeekChatProvider]
    ChatProvider --> Custom[自定义 Provider]
    XRequest --> Backend[任意后端 API]
    UI --> xmd[@ant-design/x-markdown]
    UI --> xcard[@ant-design/x-card A2UI]
```

## 设计范式

**RICH 设计范式**：
- **R**ole — AI 角色定义
- **I**ntention — 用户意图识别
- **C**onversation — 对话交互
- **H**ybrid UI — GUI + 自然语言混合界面
