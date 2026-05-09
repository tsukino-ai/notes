---
draft: true
date: 2026-05-08
tags:
  - langchain4j
  - java
  - 架构
  - ai-services
  - RAG
---

# LangChain4j 架构解析

> 学习仓库：`langchain4j/langchain4j`
> 克隆路径：`_refs/repos/langchain4j/`
> 学习日期：2026-05-08

---

## 1. 定位与概述

**LangChain4j** 是 Java 生态中最广泛、最成熟的**独立 LLM 应用框架**（~11.9k stars）。

> ⚠️ **不是 Python LangChain 的 Java 移植**，而是从零为 Java 生态设计，充分利用 Java 的类型安全、POJO、注解、接口和依赖注入。

- **始于**：2023 年初
- **目标**：简化 LLM 集成到 Java 应用
- **支持**：20+ LLM 提供商、30+ 向量存储、Quarkus/Spring Boot/Helidon/Micronaut

---

## 2. 两层抽象架构

LangChain4j 在**低层原语**和**高层声明式 API**之间提供了清晰的分层：

```
┌─────────────────────────────────────────┐
│  高层：AI Services（声明式）              │  ← @AiService, @SystemMessage, @Tool
├─────────────────────────────────────────┤
│  高层（legacy）：Chains                  │  ← ConversationalChain
├─────────────────────────────────────────┤
│  低层：ChatModel / EmbeddingModel        │  ← 统一模型 API
│  低层：ChatMemory / EmbeddingStore       │  ← 记忆与向量存储
│  低层：ToolSpecification / ContentRetriever│  ← 工具与 RAG
└─────────────────────────────────────────┘
```

---

## 3. 核心概念

### 3.1 Chat Models

```java
// langchain4j-core/.../model/chat/ChatModel.java
ChatResponse chat(ChatRequest request);

// langchain4j-core/.../model/chat/StreamingChatModel.java
void chat(ChatRequest request, StreamingChatResponseHandler handler);
```

同步 + 流式双支持。`ChatModel` 是最底层的模型交互接口。

### 3.2 AI Services（旗舰高层 API）

```java
// langchain4j/.../service/AiServices.java
```

**Spring Data JPA 风格**的声明式接口：你定义接口，LangChain4j 生成代理实现。

```java
interface Assistant {
    @SystemMessage("You are a polite assistant")
    String chat(String userMessage);
}

Assistant assistant = AiServices.builder(Assistant.class)
    .chatModel(chatModel)
    .build();

String answer = assistant.chat("Hello!");
```

**支持能力**：
- `@SystemMessage`、`@UserMessage`（提示词模板）
- `@MemoryId` + `ChatMemoryProvider`（按用户隔离记忆）
- `@Tool`（函数调用）
- `ContentRetriever` / `RetrievalAugmentor`（RAG）
- 结构化输出（POJO、枚举、布尔值）
- `TokenStream` / `Flux<String>` 流式
- `Result<T>` 包装器（token 用量、来源、工具执行）
- Guardrails、自动审核

### 3.3 工具/函数调用

```java
// 注解方式
@Tool("Searches weather for a given city")
String searchWeather(String city) { ... }
```

LangChain4j 自动生成 `ToolSpecification`，处理执行循环。

**高级特性**：
- `ToolProvider` — 动态工具发现
- `ToolSearchStrategy` — 只向 LLM 暴露相关工具

### 3.4 RAG

```java
// RetrievalAugmentor 接口
```

**默认实现 `DefaultRetrievalAugmentor`** 采用模块化管道：

1. `QueryTransformer` — 查询扩展、压缩
2. `QueryRouter` — 路由到多个检索器
3. `ContentAggregator` — 合并结果
4. `ContentInjector` — 注入到提示词

**便捷 RAG**：`langchain4j-easy-rag` 提供一行配置：
```java
EasyRag.builder()...build()
```

**索引管道**：`EmbeddingStoreIngestor`（load → parse → split → embed → store）

### 3.5 Memory

```java
// ChatMemory 接口
```

实现：
- `MessageWindowChatMemory` — 保留最近 N 条消息
- `TokenWindowChatMemory` — 保留 token 预算内的消息
- `ChatMemoryProvider` — 按用户/会话的内存工厂

### 3.6 Embedding & Vector Stores

- `EmbeddingStore<Embedded>` — 向量数据库接口
- `EmbeddingModel` — 文本向量化
- **In-process ONNX 模型** — `embeddings/` 目录下，无需外部服务即可嵌入

### 3.7 Guardrails（护栏）

- `InputGuardrail` / `OutputGuardrail` — 输入输出验证/过滤

### 3.8 Agentic AI（实验性）

`langchain4j-agentic*` 模块是最新投入方向：
- `Agent` / `AgenticServices`
- `ConditionalAgent`
- 目标导向规划器
- P2P Agent
- A2A 客户端 Agent

---

## 4. 关键源码目录速查

| 路径 | 内容 |
|------|------|
| `langchain4j-core/.../dev/langchain4j/` | 所有核心接口 |
| `langchain4j-core/.../model/chat/` | ChatModel、StreamingChatModel |
| `langchain4j-core/.../agent/tool/` | @Tool、ToolSpecification |
| `langchain4j-core/.../memory/` | ChatMemory |
| `langchain4j-core/.../store/embedding/` | EmbeddingStore |
| `langchain4j-core/.../rag/` | RetrievalAugmentor |
| `langchain4j/.../service/` | **AI Services 实现**（AiServices.java、DefaultAiServices.java）|
| `langchain4j/.../memory/chat/` | ChatMemory 实现 |
| `langchain4j/.../chain/` |  legacy Chains |
| `langchain4j/.../data/document/` | Document、DocumentLoader、Parser、Transformer |
| `langchain4j/.../rag/content/retriever/` | Content retrievers |
| `langchain4j/.../rag/query/` | Query transformers/routers |
| `langchain4j-agentic/.../agentic/` | 实验性 Agent 框架 |
| `langchain4j-agentic-patterns/.../agentic/patterns/` | Agent 模式 |

---

## 5. Spring Boot 集成

LangChain4j 有独立的 Spring Boot 支持：`langchain4j/langchain4j-spring`

- **Starter 命名**：`langchain4j-{integration}-spring-boot-starter`（SB3）/ `-spring-boot4-starter`（SB4）
- **`@AiService` 注解**：Spring 自动扫描并注册实现 bean
- **自动装配**：自动注入 `ChatModel`、`ChatMemory`、`ContentRetriever`、`RetrievalAugmentor`、`ToolProvider`、组件中的 `@Tool` 方法
- **显式装配模式**：`@AiService(wiringMode = EXPLICIT, chatModel = "openAiChatModel")`
- **Flux 支持**：`langchain4j-reactor` 模块
- **可观测性**：`ChatModelListener` bean + Micrometer

示例：
```java
@AiService
interface Assistant {
    @SystemMessage("You are a polite assistant")
    String chat(String userMessage);
}

@RestController
class AssistantController {
    @Autowired
    Assistant assistant;
}
```

---

## 6. 与 Spring AI 的关系

**没有直接引用或依赖**，两者是**竞争 + 互补**关系：

| 维度 | LangChain4j | Spring AI |
|------|-------------|-----------|
| **出身** | 独立开源项目（2023 年初）| 官方 Spring / VMware 项目 |
| **范围** | 更广泛的生态：20+ LLM、30+ 向量存储、多框架支持 | Spring 原生，深度集成 Spring 生态 |
| **设计** | "为 Java 而建，非移植"；注解驱动 AI Services | Spring 范式：AutoConfiguration、ChatClient fluent API、Advisor 模式 |
| **成熟度** | Java AI 领域最成熟、模块最多 | Spring 背书；Spring-native 集成强；成长迅速 |
| **Spring 集成** | 外部 `langchain4j-spring` starter；支持 SB3 和 SB4 | 原生 Spring Boot starter；Spring 组合的一部分 |

**定位**：
- **竞争**：两者都想成为 Java LLM 应用的主要框架
- **互补**：LangChain4j 框架无关（Quarkus、Micronaut、Helidon、纯 Java），提供商矩阵更广；Spring AI 对纯 Spring 商店更"原生"
- 对于多框架 JVM 部署或需要特定集成的场景，LangChain4j 通常领先

---

## 7. Maven 模块组织

**Aggregator POM**：`pom.xml` — `langchain4j-aggregator` v1.15.0-beta25-SNAPSHOT

模块类别：

1. **基础设施**：`langchain4j-parent`、`langchain4j-bom`、`langchain4j-core`、`langchain4j`、`langchain4j-test`、`langchain4j-kotlin`
2. **HTTP 客户端**：JDK、Apache、OkHttp
3. **模型提供商**（~20 个）：OpenAI、Azure OpenAI、Anthropic、Bedrock、Cohere、HuggingFace、Ollama、Vertex AI、Gemini 等
4. **In-process 嵌入模型**：ONNX-based（all-MiniLM、BGE、E5）
5. **向量/记忆存储**（~20 个）：Chroma、Milvus、PGVector、Pinecone、Weaviate、Redis、MongoDB 等
6. **文档管道**：loaders（S3、GitHub、Selenium）、parsers（PDFBox、Tika、Docling）、transformers
7. **Web 搜索**：Google Custom、Tavily、SearchApi
8. **代码执行**：GraalVM Polyglot、Judge0
9. **实验性/Agentic**：easy-rag、MCP、agentic、agentic-a2a、agentic-patterns、skills、guardrails
10. **可观测性**：`langchain4j-observation`、`langchain4j-micrometer-metrics`

---

## 8. 设计哲学

| 原则 | 体现 |
|------|------|
| **Java 优先** | 拥抱 Java 类型系统（POJO、泛型、接口），而非动态 Python 风格抽象 |
| **声明式、注解驱动** | `@AiService`、`@SystemMessage`、`@UserMessage`、`@Tool` 类似 Spring Data JPA |
| **极致模块化** | 每个提供商和存储都是独立 Maven 模块，只导入需要的 |
| **框架无关核心** | 核心零重量级依赖，通过专用集成支持 Spring Boot、Quarkus、Helidon、Micronaut |
| **向 Agentic AI 演进** | `langchain4j-agentic*` 模块展示对多 Agent 系统、A2A 协议、规划模式的投入 |

---

## 9. 学习路径建议

1. **入门**：从 `AiServices` 的声明式接口开始，体验"定义接口即可用 AI"的魔法
2. **进阶**：阅读 `@Tool` 注解和 `ToolProvider`，理解函数调用循环
3. **RAG**：学习 `DefaultRetrievalAugmentor` 的模块化管道
4. **深入**：看 `langchain4j-core` 的接口设计，理解框架的抽象边界
5. **对比**：与 Spring AI 的 `ChatClient` + `Advisor` 模式对比，体会不同设计哲学
