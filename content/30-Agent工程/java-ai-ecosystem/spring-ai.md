---
date: 2026-05-08
tags:
  - spring-ai
  - java
  - 架构
  - RAG
  - MCP
---

# Spring AI 架构解析

> 学习仓库：`spring-projects/spring-ai`
> 克隆路径：`_refs/repos/spring-ai/`
> 学习日期：2026-05-08

---

## 1. 定位与概述

**Spring AI** 是 Spring 官方推出的 AI 应用开发框架（类比 Python 生态中的 LangChain/LlamaIndex），目标是把 Spring 生态的设计哲学——**可移植性、模块化、POJO 优先**——带入 AI 领域。

它不是 LangChain 的 Java 移植，而是从零开始为 Java 和 Spring 生态设计的。核心理念是：

> "连接你的企业 **数据** 和 **API** 与 **AI 模型**。"

- **版本**：`main` 分支对应 Spring AI 2.x → Spring Boot 4.x
- **Java 要求**：17+
- **模块数**：~228 个 Maven 模块

---

## 2. 架构分层

Spring AI 采用清晰的分层抽象，从底层模型到高层应用 API：

```
┌─────────────────────────────────────────┐
│  Starters / Auto-Configuration          │  ← Spring Boot 集成层
├─────────────────────────────────────────┤
│  ChatClient API + Advisors              │  ← 高层 fluent API
├─────────────────────────────────────────┤
│  ChatModel / EmbeddingModel / VectorStore│  ← 可移植抽象层
├─────────────────────────────────────────┤
│  OpenAI / Anthropic / Ollama / ...      │  ← 供应商具体实现
└─────────────────────────────────────────┘
```

### 核心模块依赖关系

| 模块 | 定位 | 依赖 |
|------|------|------|
| `spring-ai-model` | 最底层契约 | 无 |
| `spring-ai-commons` | 共享类型 | `spring-ai-model` |
| `spring-ai-client-chat` | ChatClient + Advisors | `spring-ai-model` |
| `spring-ai-vector-store` | VectorStore API | `spring-ai-commons` |
| `spring-ai-rag` | RAG 原语 | `spring-ai-commons` |

---

## 3. 核心概念

### 3.1 Model 抽象

```java
// spring-ai-model/.../model/Model.java
public interface Model<TReq extends ModelRequest<?>, TRes extends ModelResponse<?>> {
    TRes call(TReq request);
}
```

所有 AI 模型类型都继承这个泛型契约，`ChatModel`、`EmbeddingModel` 均基于此。

### 3.2 ChatModel

```java
// spring-ai-model/.../chat/model/ChatModel.java
public interface ChatModel extends Model<Prompt, ChatResponse>, StreamingChatModel {
    @Nullable String call(String message);          // 便捷方法
    ChatResponse call(Prompt prompt);                // 完整调用
    default Flux<ChatResponse> stream(Prompt prompt) { ... }  // 流式
}
```

同步 + 流式双支持，是底层与模型交互的核心接口。

### 3.3 ChatClient（主要用户 API）

```java
// spring-ai-client-chat/.../chat/client/ChatClient.java
ChatClient chatClient = ChatClient.builder(chatModel).build();

String answer = chatClient.prompt()
    .system("You are a helpful assistant")
    .user("What is Spring AI?")
    .call()
    .content();
```

类比 `WebClient` / `RestClient` 的 fluent API：

- `.call()` / `.stream()` — 同步/异步
- `.advisors(Advisor...)` — 附加拦截器
- `.tools(Object...)` — 函数调用
- `.entity(Class<T>)` — 结构化输出映射到 POJO

### 3.4 Advisors（拦截器模式）

```java
// spring-ai-client-chat/.../chat/client/advisor/api/Advisor.java
```

用**责任链模式**封装重复的 GenAI 模式（记忆、RAG、日志、重试）。

**层级**：
- `Advisor`（基接口，继承 `Ordered`）
  - `CallAdvisor` → `adviseCall(request, chain)`
  - `StreamAdvisor` → `adviseStream(request, chain)`
  - `BaseAdvisor` — 提供 `before()` / `after()` 钩子

**内置 Advisor 示例**：`QuestionAnswerAdvisor`

1. `before()`: 用用户消息查询 `VectorStore` → 检索 `Document` → 增强用户提示
2. `after()`: 把检索到的文档保留在响应元数据中

### 3.5 工具/函数调用

```java
// spring-ai-model/.../tool/ToolCallback.java
public interface ToolCallback {
    ToolDefinition getToolDefinition();
    String call(String toolInput);
}
```

Spring AI 支持用注解（`@Tool`）自动暴露 Java 方法为工具。`ToolCallingManager` 协调模型 ↔ 工具的执行循环。

### 3.6 Vector Store

```java
// spring-ai-vector-store/.../vectorstore/VectorStore.java
public interface VectorStore extends DocumentWriter, VectorStoreRetriever {
    void add(List<Document> documents);
    void delete(List<String> idList);
    void delete(Filter.Expression filterExpression);
    List<Document> similaritySearch(SearchRequest request);
}
```

- **可移植 API**，支持 20+ 供应商
- **SQL-like 元数据过滤 API**（`Filter.Expression`）
- `SearchRequest` 支持 `query`、`topK`、`similarityThreshold`、`filterExpression`

### 3.7 MCP（Model Context Protocol）

Spring AI 2.x 原生支持 MCP，有 client/server 两种角色，支持 WebFlux/WebMVC 传输。这是与外部工具服务器互操作的标准协议。

---

## 4. 关键源码目录速查

| 概念 | 主源码路径 |
|------|-----------|
| 核心模型契约 | `spring-ai-model/.../model/` |
| ChatModel 接口 | `spring-ai-model/.../chat/model/ChatModel.java` |
| 工具系统 | `spring-ai-model/.../tool/` |
| ChatClient + Advisors | `spring-ai-client-chat/.../chat/client/` |
| Document / Media | `spring-ai-commons/.../document/` |
| VectorStore API | `spring-ai-vector-store/.../vectorstore/` |
| RAG 原语 | `spring-ai-rag/.../rag/` |
| 记忆 API | `spring-ai-model/.../chat/memory/` |
| 记忆仓库实现 | `memory/repository/spring-ai-model-chat-memory-repository-*/` |
| OpenAI 实现 | `models/spring-ai-openai/.../openai/` |
| QuestionAnswerAdvisor | `advisors/spring-ai-advisors-vector-store/.../QuestionAnswerAdvisor.java` |
| MCP client/server | `mcp/common/.../mcp/` |
| 自动配置 | `auto-configurations/models/spring-ai-autoconfigure-model-openai/.../OpenAiChatAutoConfiguration.java` |

---

## 5. Spring Boot 深度集成

### Auto-Configuration

每个模型和向量存储都有独立的 auto-configuration 模块：

```java
@AutoConfiguration
@EnableConfigurationProperties({ OpenAiCommonProperties.class, OpenAiChatProperties.class })
@ConditionalOnProperty(name = SpringAIModelProperties.CHAT_MODEL, ...)
public class OpenAiChatAutoConfiguration {
    @Bean @ConditionalOnMissingBean
    public OpenAiChatModel openAiChatModel(...) { ... }
}
```

### Starters

60+ starter POM，遵循 Spring Boot 惯例：
- `spring-ai-starter-model-openai`
- `spring-ai-starter-vector-store-pgvector`
- `spring-ai-starter-mcp-client`

### 属性驱动配置

所有 auto-configuration 暴露 `spring.ai.*` 属性，如 `spring.ai.openai.api-key`。

### 可观测性

所有主要组件集成 **Micrometer Observation Registry**。

---

## 6. 设计哲学总结

| 原则 | 体现 |
|------|------|
| **可移植性优先** | 换 OpenAI 到 Ollama 只需改依赖+属性，ChatClient 代码不变 |
| **POJO 优先** | 结构化输出直接映射到 Java 类 |
| **Spring 范式** | Auto-configuration、starters、PropertySource、ObservationRegistry |
| **Advisor 组合** | RAG、记忆、日志等横切关注点通过有序拦截器链插入 |
| **显式优于魔法** | RAG 不隐藏，QuestionAnswerAdvisor 明确展示文档如何被检索和注入 |
| **MCP 原生** | 一等公民的 Model Context Protocol 支持 |

---

## 7. 学习路径建议

1. **入门**：从 `ChatClient` 的 fluent API 开始，理解 Spring AI 的调用范式
2. **进阶**：阅读 `Advisor` 接口和 `QuestionAnswerAdvisor` 源码，理解拦截器链
3. **深入**：看 `ToolCallback` 和 `ToolCallingManager`，理解函数调用循环
4. **实战**：通过 auto-configuration 和 starter 看 Spring Boot 如何零配置集成

---

## 8. 与生态关系

- **与 Spring AI Alibaba**：阿里在 Spring AI 之上构建了完整的 Agent OS（ReAct Agent、Graph Engine、A2A、可视化平台）
- **与 LangChain4j**：LangChain4j 是更广泛的 JVM 框架（支持 Quarkus/Micronaut/Helidon），Spring AI 则是 Spring 原生深度集成
- **与 LangGraph**：Spring AI 本身不提供图引擎，这是 Spring AI Alibaba graph-core 的定位
