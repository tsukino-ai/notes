---
draft: true
date: 2026-05-08
tags:
  - yu-ai-agent
  - java
  - 教程
  - react
  - manus
  - mcp
---

# yu-ai-agent（鱼皮 AI 智能体）架构解析

> 学习仓库：`liyupi/yu-ai-agent`
> 克隆路径：`_refs/repos/yu-ai-agent/`
> 学习日期：2026-05-08

---

## 1. 定位与概述

**yu-ai-agent**（鱼皮 AI 超级智能体）是程序员鱼皮（CodeFather）出品的**实战教程项目**，目标是通过一个完整的项目教会 Java 开发者从零构建 AI 应用。

项目包含两个主要应用：

1. **AI 恋爱大师** — 情感咨询聊天机器人，支持多轮对话、RAG 知识库、工具调用、MCP 集成
2. **YuManus** — 受 Manus/OpenManus 启发的**自主规划 Agent**，能完成复杂任务（如"策划约会并生成 PDF 报告"）

**定位**：最佳 Java AI 实战入门项目，适合从全栈开发转向 Agent 工程师的学习者。

---

## 2. 技术栈

### 后端

| 技术 | 版本/用途 |
|------|----------|
| Java | 21 |
| Spring Boot | 3.4.4 |
| Spring AI | 1.0.0（核心框架）|
| Spring AI Alibaba | 1.0.0.2（DashScope/阿里云百炼）|
| LangChain4j | `langchain4j-community-dashscope`（对比 demo）|
| Ollama | `spring-ai-starter-model-ollama`（本地模型）|
| Hutool | HTTP、JSON、文件工具 |
| Jsoup | 网页抓取 |
| iText | PDF 生成 |
| Kryo | 聊天记录序列化 |
| Knife4j | API 文档 |

### 前端
- Vue 3 + Vite + Vue Router
- Axios + EventSource（SSE 流式）

### 基础设施（默认注释掉，渐进启用）
- PgVector（PostgreSQL 向量扩展）
- MCP Client / Server

---

## 3. 架构总览

```
_refs/repos/yu-ai-agent/
├── src/main/java/com/yupi/yuaiagent/
│   ├── advisor/          # 自定义 Spring AI Advisors
│   ├── agent/            # Agent 框架核心（BaseAgent → ReActAgent → ToolCallAgent → YuManus）
│   ├── app/              # 应用层（LoveApp 封装所有聊天模式）
│   ├── chatmemory/       # 自定义持久化聊天记忆
│   ├── controller/       # REST API（AiController, HealthController）
│   ├── demo/             # 学习 demo（5 种 AI 调用方式 + RAG 实验）
│   ├── rag/              # RAG 管道配置
│   └── tools/            # 工具定义
├── src/main/resources/
│   ├── document/         # Markdown 知识库（恋爱常见问题）
│   └── mcp-servers.json  # MCP 服务器配置
├── yu-ai-agent-frontend/ # Vue 3 前端
└── yu-image-search-mcp-server/  # 独立 MCP 服务器（Pexels 图片搜索）
```

---

## 4. Spring AI 集成点

Spring AI 是整个项目的**中央抽象层**：

| 文件 | Spring AI 特性 | 用途 |
|------|---------------|------|
| `demo/invoke/SpringAiAiInvoke.java` | `ChatModel` 直接调用 | 基础框架调用 demo |
| `app/LoveApp.java` | `ChatClient.Builder`、`MessageChatMemoryAdvisor`、`QuestionAnswerAdvisor` | 恋爱大师应用 |
| `agent/YuManus.java` | `ChatClient.builder(chatModel)`、`.tools()`、自定义 `Advisor` | 超级 Agent |
| `agent/ToolCallAgent.java` | `ToolCallingManager`、`ChatResponse`、`AssistantMessage.ToolCall` | 手动工具调用循环 |
| `rag/LoveAppVectorStoreConfig.java` | `SimpleVectorStore`、`EmbeddingModel` | 内存向量存储 |
| `rag/PgVectorVectorStoreConfig.java` | `PgVectorStore.builder()` | 生产向量 DB |
| `rag/LoveAppRagCloudAdvisorConfig.java` | `DashScopeDocumentRetriever` | 阿里云 RAG |
| `rag/QueryRewriter.java` | `RewriteQueryTransformer` | 查询重写 |
| `tools/ToolRegistration.java` | `ToolCallbacks.from(...)` | 工具注册 |
| `chatmemory/FileBasedChatMemory.java` | `ChatMemory` 接口 | 自定义持久化记忆 |

**默认模型**：`qwen-plus`（通过 DashScope），也支持本地 `gemma3:1b`（Ollama）。

---

## 5. Agent 框架实现

项目从零实现了一个**自定义 ReAct Agent**，受 OpenManus 启发：

```
BaseAgent（状态机 + 运行循环 + 记忆）
  └── ReActAgent（抽象 think() + act()）
        └── ToolCallAgent（具体 think/act，使用 Spring AI 工具调用）
              └── YuManus（最终 Agent，系统提示词 + MyLoggerAdvisor）
```

### 5.1 BaseAgent

- 核心循环：`run()` / `runStream()`
- 最大步数控制（默认 10-20 步）
- 消息列表记忆 + SSE 流式输出
- 状态枚举：`IDLE`、`RUNNING`、`FINISHED`、`ERROR`

### 5.2 ToolCallAgent（关键实现）

```java
// think(): 发送消息给 LLM（附带 availableTools），解析 AssistantMessage.ToolCall 列表
// act(): 使用 ToolCallingManager.executeToolCalls() 执行工具
//        检查 TerminateTool 判断是否结束
// 关键：禁用 Spring AI 内部工具执行（withInternalToolExecutionEnabled(false)）
//        手动管理 ReAct 循环
```

### 5.3 YuManus

具体 Agent 实例，包含：
- 系统提示词 + next-step 提示词
- `MyLoggerAdvisor`（自定义日志 Advisor）
- 完整的工具集：WebSearch、WebScraping、FileOperation、Terminal、ResourceDownload、PDFGeneration、Terminate

---

## 6. RAG 实现

`LoveApp.doChatWithRag()` 展示了**多种 RAG 策略**：

1. `QuestionAnswerAdvisor` + `SimpleVectorStore`（内存）
2. `DashScopeDocumentRetriever`（阿里云知识库）
3. `PgVectorStore`（自托管向量 DB）
4. 自定义 `RetrievalAugmentationAdvisor` + `VectorStoreDocumentRetriever` + filter + `ContextualQueryAugmenter`

**Query Rewriting**：使用 `RewriteQueryTransformer` 做检索前查询增强。

---

## 7. MCP 集成

- **Client**：通过 `mcp-servers.json` 配置 stdio 传输的 MCP 服务器（高德地图、图片搜索）
- **Server**：`yu-image-search-mcp-server/` 是一个独立的 Spring AI MCP Server，提供 Pexels 图片搜索工具

---

## 8. 前端架构

- `LoveMaster.vue` — 恋爱大师聊天 UI
- `SuperAgent.vue` — 超级 Agent 聊天 UI
- `src/api/index.js` — Axios + SSE 客户端

---

## 9. 学习价值总结

这个项目最大的价值在于**循序渐进的学习路径**：

| 阶段 | 内容 | 文件 |
|------|------|------|
| **5 种 LLM 调用方式** | HTTP 原始、DashScope SDK、LangChain4j、Ollama、Spring AI | `demo/invoke/` |
| **Spring AI 核心模式** | ChatClient、Advisors、ChatMemory、Prompt 模板、结构化输出、流式 | `app/LoveApp.java` |
| **RAG 完整管道** | 加载 → 元数据增强 → 分词 → 向量存储 → 查询重写 → 检索 → 增强 | `rag/` |
| **工具调用** | `@Tool` 注解、`ToolCallbacks` 注册、手动编排工具循环 | `tools/`、`agent/ToolCallAgent.java` |
| **MCP** | Client 配置 + 独立 Server 构建 | `mcp-servers.json`、`yu-image-search-mcp-server/` |
| **ReAct Agent 从零实现** | 状态机、think-act 循环、消息历史维护 | `agent/` |
| **SSE 流式** | 后端 `SseEmitter` + `Flux`，前端 `EventSource` | `controller/`、`frontend/` |
| **部署** | Dockerfile、profile 配置、前端构建 | `Dockerfile`、`application*.yml` |

**值得注意的设计选择**：
- 复杂基础设施（DB、MCP、PgVector）默认注释掉，学习者可以逐步启用
- `LoveApp.java` 是"毕业设计"级文件：在一个类中展示了 5 种聊天模式
- `demo/` 包纯粹是教学用的，生产环境可以删除

---

## 10. 与生态关系

- **与 Spring AI**：项目的核心依赖，几乎所有 AI 功能都通过 Spring AI 实现
- **与 Spring AI Alibaba**：使用其 DashScope 集成，但**没有使用** graph-core 和 agent-framework（项目自身实现了更轻量的 Agent 框架）
- **与 LangChain4j**：仅在 demo 中使用做对比，生产代码全部基于 Spring AI
- **与 OpenManus**：YuManus 的设计灵感来源
