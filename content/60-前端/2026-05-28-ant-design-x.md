---
title: Ant Design X — React AI 对话组件库
date: 2026-05-28
tags:
  - react
  - ai-ui
  - ant-design-x
  - component-library
  - chat-ui
  - source-code
---

# Ant Design X — React AI 对话组件库

> [📎 原始仓库](https://github.com/ant-design/x) | ⭐ 4,553 | 🍴 1,091 | 🐛 Open Issues 116
> [📁 本地源码](../99-工具与参考/repos/ant-design-x/index.md)

## 一句话定位

Ant Design X 是蚂蚁集团基于 **RICH 设计范式** 推出的 **React AI 对话组件库**，提供从气泡、输入框到思维链、动态卡片的一整套 AI 交互界面解决方案。

---

## 核心概念

### 1. RICH 设计范式

蚂蚁在支付宝、钉钉等 AI 产品中沉淀的设计方法论：

| 维度 | 含义 |
|------|------|
| **R**ole | AI 角色定义 — 给 AI 设定身份、性格、能力边界 |
| **I**ntention | 用户意图识别 — 理解用户想要什么 |
| **C**onversation | 对话交互 — 自然语言的来回交流 |
| **H**ybrid UI | 混合界面 — GUI 组件与自然对话的融合 |

### 2. 三大子系统

| 子系统 | 包名 | 职责 |
|--------|------|------|
| **UI 组件** | `@ant-design/x` | 可视化组件（Bubble、Sender、ThoughtChain 等）|
| **数据流管理** | `@ant-design/x-sdk` | 状态管理、HTTP 请求、Provider 转换 |
| **内容渲染** | `@ant-design/x-markdown` | 流式 Markdown、Mermaid、代码高亮 |
| **动态界面** | `@ant-design/x-card` | A2UI 协议 — AI 用 JSON 流动态渲染交互卡片 |
| **技能库** | `@ant-design/x-skill` | 预设 Agent 技能 |

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 语言 | TypeScript |
| 框架 | React only（不支持 Vue/Svelte）|
| 包管理 | npm workspaces |
| 构建 | father（阿里前端构建工具）|
| 文档 | dumi（阿里文档站点工具）|
| 样式 | CSS-in-JS（antd 风格）|
| 版本 | v2.7.0 |
| 许可证 | MIT |

---

## 核心组件速查

### 对话类

| 组件 | 功能 | 关键属性 |
|------|------|----------|
| `Bubble` | 对话气泡 | `streaming`、`typing`、`loading`、`editable` |
| `Bubble.List` | 消息列表 | `autoScroll`、`role`（按角色渲染不同样式）|
| `Sender` | 输入发送器 | `loading`、`onCancel`、支持附件 |
| `Conversations` | 会话历史 | 多会话切换、新增、删除 |

### 辅助类

| 组件 | 功能 |
|------|------|
| `ThoughtChain` | 思维链展示（AI 推理过程可视化）|
| `Attachments` | 文件上传/展示（继承 antd Upload）|
| `Prompts` | 提示词推荐卡片 |
| `Suggestion` | 快捷建议标签 |
| `Welcome` | 欢迎页 |
| `Actions` | 消息操作（点赞/点踩/复制）|
| `Sources` | 引用来源展示 |

### 内容渲染类

| 组件 | 功能 |
|------|------|
| `CodeHighlighter` | 代码语法高亮 |
| `Mermaid` | Mermaid 图表渲染 |
| `Think` | 思考内容折叠展示 |

---

## SDK 核心模块

### useXChat — 单对话状态管理

```tsx
const { messages, onRequest, isRequesting, abort, onReload } = useXChat({
  provider: openAIProvider,
  conversationKey: 'conv-1',
  defaultMessages: [...],
  parser: (msg) => [...],        // 一条消息拆成多条气泡
  requestPlaceholder: () => ..., // 请求中占位
  requestFallback: () => ...,    // 请求失败兜底
});
```

### ChatProvider — 数据转换层

内置 Provider：

| Provider | 用途 |
|----------|------|
| `OpenAIChatProvider` | OpenAI 兼容格式（`data: {...}` SSE）|
| `DeepSeekChatProvider` | DeepSeek，支持 `reasoning_content` |
| `DefaultChatProvider` | 通用自定义格式 |

**可自定义**：继承 `AbstractChatProvider` 实现任意后端适配。

### XRequest — 流式 HTTP 请求

通用 SSE 流式请求工具，不依赖特定框架：

```ts
XRequest('https://api.example.com/chat', {
  params: { messages: [...], stream: true },
  callbacks: {
    onUpdate: (chunk) => ...,   // 每 chunk 回调
    onSuccess: (msgs) => ...,   // 完成回调
    onError: (err) => ...,      // 错误回调
  },
});
```

支持：自定义 `fetch`、中间件、`transformStream`、超时、重试。

---

## 目录结构

```
packages/
├── x/               # UI 组件库
│   ├── components/  # 核心组件源码
│   │   ├── bubble/
│   │   ├── sender/
│   │   ├── attachments/
│   │   ├── thought-chain/
│   │   ├── conversations/
│   │   ├── prompts/
│   │   └── ...
│   └── docs/        # 官方文档（dumi）
├── x-sdk/           # 数据流 SDK
│   ├── src/
│   │   ├── x-chat/           # useXChat
│   │   ├── x-conversations/  # useXConversations
│   │   ├── x-request/        # XRequest
│   │   ├── x-stream/         # 流解析
│   │   ├── chat-providers/   # OpenAI / DeepSeek / Default
│   │   └── x-mcp-client/     # MCP 客户端
├── x-markdown/      # Markdown 渲染器
├── x-card/          # A2UI 动态卡片
└── x-skill/         # AI Skill 技能库
```

---

## 接入后端的方式

Ant Design X **不绑定任何后端框架**，只要求后端返回 SSE 流或可通过 Provider 转换的格式：

| 后端类型 | 接入方式 |
|----------|----------|
| OpenAI / 兼容 API | `OpenAIChatProvider` |
| DeepSeek | `DeepSeekChatProvider` |
| 阿里云百炼、百度千帆等 | 自定义 Provider 或 XRequest 直连 |
| **Mastra** | 自定义 `ChatProvider` 转换 Mastra 流格式 |
| 自建任意后端 | `DefaultChatProvider` 或自定义 Provider |

> ⚠️ 安全：前端不应直接暴露 API Key，应通过同域代理或后端转发。

---

## 亮点设计

1. **RICH 范式产品化**：不是零散组件，而是一套从设计理论到代码落地的完整体系
2. **parser 机制**：一条后端消息可拆分渲染为多条气泡（如 DeepSeek 的 reasoning + content）
3. **ChatProvider 抽象层**：统一转换不同厂商的流格式，后端切换不影响前端
4. **A2UI 动态卡片**：AI 可以通过 JSON 流实时构建交互界面，不只是文本对话
5. **MCP 客户端内置**：`x-mcp-client` 提供 MCP 协议支持
6. **流式 Markdown 渲染器**：支持公式、Mermaid、代码高亮的流式逐字渲染

---

## 与知识库的潜在关联

- [Mastra](../30-Agent工程/2026-05-28-mastra.md) — 可作为 Mastra 的前端 UI 层（需自定义 Provider）
- [MCP](../30-Agent工程/MCP.md) — Ant Design X 内置 MCP 客户端
- [Vercel AI SDK](../60-前端/) — 同为 AI 前端方案，可以对比架构差异
- [LangGraph](../30-Agent工程/LangGraph核心概念.md) — 同为 Agent 工程，UI 层可互相替换

---

## 待深入研究

- [ ] `Bubble` 的 `streaming` + `typing` 动画实现原理
- [ ] `useXChat` 的消息状态机（local / loading / updating / success / error / abort）
- [ ] `AbstractChatProvider` 的接口设计，如何为 Mastra 写自定义 Provider
- [ ] `XRequest` 的 `transformStream` 和 Web Streams API 使用
- [ ] A2UI 协议在 `x-card` 中的实现（AI 动态渲染 UI）
- [ ] `x-mcp-client` 的 MCP 协议集成方式
- [ ] 与 Vercel AI SDK 的 `useChat` 对比：状态管理、流式消费、错误处理
- [ ] `parser` 机制在多模态消息中的应用

---

## 参考

- [Ant Design X 官网](https://ant-design-x.antgroup.com)
- [GitHub 仓库](https://github.com/ant-design/x)
- [本地源码索引](../99-工具与参考/repos/ant-design-x/index.md)
