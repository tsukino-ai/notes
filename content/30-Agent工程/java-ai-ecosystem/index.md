---
title: Java AI 生态
---

# Java AI 生态

Java 侧 AI 应用开发框架与实战项目研究。与 Python 生态不同，Java AI 更侧重企业级集成、Spring 生态和类型安全。

## 目录

- [[spring-ai]] —— Spring 官方 AI 框架，ChatClient + Advisor + Tool + VectorStore
- [[spring-ai-alibaba]] —— 阿里 Agent OS，ReAct Agent + StateGraph + A2A + 可视化平台
- [[langchain4j]] —— Java 最成熟独立 LLM 框架，AiServices 声明式接口
- [[yu-ai-agent]] —— 鱼皮实战教程，从零手写 ReAct Agent + RAG + MCP
- [[yu-ai-code-mother]] —— 鱼皮 AI 代码生成平台，Spring Boot + LangChain4j + LangGraph4j 完整工程实践

## 关系速览

| 框架 | 定位 | 与 Spring 关系 |
|------|------|---------------|
| Spring AI | 原子层（模型/工具/向量存储） | 原生 Spring |
| Spring AI Alibaba | Agent OS（在 Spring AI 之上） | 构建于 Spring AI |
| LangChain4j | 独立全栈框架 | 外部 starter 集成 |
| yu-ai-agent | 学习/参考实现 | 基于 Spring AI |
