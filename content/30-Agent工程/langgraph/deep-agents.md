---
date: 2026-05-11
tags:
  - langgraph
  - deep-agents
  - agent-harness
  - 子智能体
  - 架构
---

# Deep Agents — LangChain 官方 Agent Harness

> 学习来源：LangChain 官方 Deep Agents 文档
> 原文存档：`_refs/articles/deep-agents/`
> 学习日期：2026-05-11

---

## 1. 定位与概述

**Deep Agents** 是 LangChain 官方推出的 **Agent Harness**（Agent 马鞍/框架），构建在 LangGraph 运行时之上。

> 官方自述：deepagents 是一个独立的库，构建在 LangChain 核心构建块之上，使用 LangGraph 运行时进行持久执行、流式、人工介入等。

它不是一个简单的 Agent 工厂函数，而是一个**完整的 Agent 操作系统**，自带规划、文件系统、子 Agent 委派、权限控制、沙箱执行等能力。

### 与 create_react_agent 的本质区别

| 维度 | create_react_agent | Deep Agents |
|------|-------------------|-------------|
| 定位 | 预置模板（简单 ReAct 循环） | Agent Harness（完整操作系统） |
| 核心循环 | LLM 工具，直到无 tool_calls | LLM 规划 文件系统 子 Agent 工具 |
| 规划能力 | 无内置规划 | write_todos 工具分解复杂任务 |
| 上下文管理 | 纯消息列表 | 虚拟文件系统 + 自动摘要压缩 |
| 子 Agent | 无 | task 工具动态创建子 Agent |
| 持久化 | 可选 checkpointer | LangGraph store + 多后端 |
| 权限控制 | 无 | 声明式文件系统权限规则 |
| 沙箱执行 | 无 | Modal / Daytona / Runloop / LangSmith |
| 当前状态 | 已 deprecated | 活跃开发中 |

---

## 2. 核心能力速览

### 2.1 规划与任务分解

内置 write_todos 工具，Agent 可以：
- 将复杂任务拆分为离散步骤
- 跟踪进度
- 根据新信息动态调整计划

这是 Deep Agents 与简单 ReAct Agent 的**第一道分水岭**——不是盲目循环调用工具，而是先规划、后执行。

### 2.2 上下文管理

文件系统工具集：ls、read_file、write_file、edit_file、glob、grep

- Agent 可以把大量上下文**卸载到虚拟文件系统**，防止上下文窗口溢出
- 自动摘要压缩（SummarizationMiddleware）在对话变长时压缩旧消息
- 支持读取图片文件作为多模态输入

### 2.3 可插拔文件系统后端

Deep Agents 的**核心差异化设计**：虚拟文件系统由可插拔后端驱动。

| 后端 | 描述 | 适用场景 |
|------|------|----------|
| StateBackend（默认）| LangGraph state 中的临时文件系统 | 单线程草稿/中间结果 |
| FilesystemBackend | 本地磁盘，可配置 root_dir | 本地项目操作 |
| StoreBackend | LangGraph BaseStore（Redis/Postgres） | 跨线程长期记忆 |
| LocalShellBackend | 本地磁盘 + execute 工具 | 开发环境（无隔离，慎用）|
| CompositeBackend | 按路径前缀路由到不同后端 | /workspace/ 临时 + /memories/ 持久 |
| Sandbox | Modal / Daytona / Runloop / LangSmith | 隔离代码执行 |

### 2.4 子 Agent 委派

内置 task 工具，Agent 可以动态创建专门的子 Agent：
- 主 Agent 上下文保持干净
- 子 Agent 在隔离上下文中深入处理子任务
- 子 Agent 继承父 Agent 的权限（可覆盖）

这与 DeerFlow 的 task 工具委派、以及 langgraph-supervisor 的 handoff 是同一类设计模式。

### 2.5 声明式权限

```python
from deepagents import FilesystemPermission, create_deep_agent

agent = create_deep_agent(
    model=model,
    backend=backend,
    permissions=[
        FilesystemPermission(
            operations=["write"], paths=["/**"], mode="deny"
        ),
    ],
)
```

- 规则按声明顺序评估，first-match-wins
- 默认允许（permissive default），无匹配规则时放行
- 子 Agent 可继承或覆盖父权限

### 2.6 长期记忆

通过 LangGraph Memory Store，Agent 可以跨线程保存和检索信息，使用 AGENTS.md 文件注入记忆上下文。

### 2.7 Human-in-the-Loop

利用 LangGraph 的 interrupt 能力，为敏感操作配置人工审批。

---

## 3. 架构设计亮点

### 3.1 System Prompt 四层结构

Deep Agents 将系统提示词拆分为**四个命名槽位**：

```
USER -> (BASE 或 CUSTOM) -> SUFFIX
```

| 槽位 | 来源 | 角色 |
|------|------|------|
| USER | system_prompt= 参数 | 用户自定义指令，始终在最前 |
| BASE | SDK 默认 BASE_AGENT_PROMPT | 教授模型如何使用工具框架 |
| CUSTOM | Profile 的 base_system_prompt | 替换 BASE |
| SUFFIX | Profile 的 system_prompt_suffix | 模型调优指导 |

**关键不变量**：
- USER 永远在最前 -> 用户 persona/指令优先级最高
- SUFFIX 永远在最后 -> profile 调优指导最接近对话历史

子 Agent 遵循同样的叠加规则，但没有 USER 段。

### 3.2 内置 Middleware

| Middleware | 职责 |
|-----------|------|
| TodoListMiddleware | 任务列表管理（规划） |
| FilesystemMiddleware | 文件系统操作 |
| SubAgentMiddleware | 子 Agent 创建与协调 |
| SummarizationMiddleware | 消息历史自动压缩 |

### 3.3 入口 API

```python
from deepagents import create_deep_agent

agent = create_deep_agent(
    model="openai:gpt-5.4",
    tools=[internet_search],
    system_prompt=research_instructions,
    backend=CompositeBackend(
        default=StateBackend(),
        routes={"/memories/": StoreBackend()}
    ),
    middleware=[log_tool_calls],
    permissions=[...],
    memory=["/AGENTS.md"],
    response_format=WeatherReport,
    checkpointer=MemorySaver(),
)
```

---

## 4. 与知识库已有内容的对比

### vs DeerFlow（字节跳动）

| 维度 | DeerFlow | Deep Agents |
|------|----------|-------------|
| 出身 | 字节跳动内部框架开源 | LangChain 官方 |
| Harness 概念 | Agent Harness | Agent Harness |
| Lead Agent + task 委派 | Lead Agent -> task_tool | Deep Agent -> task |
| Middleware 链 | 18 层 | 4 层内置 + 自定义 |
| 文件系统 | Sandbox 环境 | 可插拔后端 |
| 可视化平台 | Admin + Studio | LangSmith Studio |
| Skills | 24+ 内置技能 | Skills 系统 |
| 权限控制 | GuardrailMiddleware | 声明式 FilesystemPermission |
| 云集成 | DashScope / Tongyi / Nacos | 模型无关 |

**共同点**：两者都代表了 Agent 框架的演进方向——从简单的工具循环进化为具备规划、上下文管理、子 Agent 委派、权限控制的完整 Harness。

### vs Spring AI Alibaba

| 维度 | Spring AI Alibaba | Deep Agents |
|------|-------------------|-------------|
| 语言 | Java | Python |
| Graph 引擎 | 自研 StateGraph（类 LangGraph）| LangGraph 原生 |
| 子 Agent | task 工具 + 后台线程池 | task 工具 |
| 持久化 | PG / MySQL / Oracle / Mongo / Redis / Memory | LangGraph store |
| 可视化 | Admin + Studio（自建）| LangSmith |
| 权限 | 无明确文件系统权限 | 声明式 FilesystemPermission |

### vs LangGraph create_react_agent

create_react_agent 已被 deprecated，官方推荐迁移到：
- 简单场景：langchain.agents.create_agent（等价的灵活 middleware 系统）
- 复杂场景：Deep Agents

---

## 5. 设计哲学总结

Deep Agents 的设计体现了 Agent 框架的几个关键趋势：

1. **从工具循环到任务操作系统** — 不止调用工具，还要规划、管理上下文、委派子任务
2. **虚拟文件系统作为上下文边界** — 用文件系统抽象替代纯消息列表，防止上下文溢出
3. **可插拔后端作为部署边界** — 同一套 Agent 代码，开发时用 StateBackend，生产用 StoreBackend/Sandbox
4. **权限即策略** — 声明式规则控制 Agent 能访问什么，而非事后审计
5. **Harness Profile 作为模型适配层** — 不同模型有不同的 system prompt 后缀调优

---

## 6. 学习路径建议

1. 入门：跑通 Quickstart，创建一个带 internet_search 工具的 research agent
2. 进阶：尝试不同的 backend（StateBackend -> FilesystemBackend -> CompositeBackend）
3. 深入：阅读 customization 文档，理解 system prompt 四层叠加和 middleware 机制
4. 实战：给 Agent 配置 permissions 和 subagents，体验主 Agent 规划 -> 子 Agent 执行的协作模式
5. 对比：与 DeerFlow、Spring AI Alibaba 的 Agent 框架对比，理解 Harness 设计范式的共性与差异

---

## 7. 相关笔记

- [[核心概念]] — LangGraph 底层机制（StateGraph、Pregel、Checkpoint）
- [[Router-Specialist实战]] — 子 Agent 委派的另一种实现范式
- [[../架构研究/DeerFlow|DeerFlow]] — 字节跳动的 Agent Harness
- [[../java-ai-ecosystem/Spring-AI-Alibaba|Spring AI Alibaba]] — Java 侧的 Agent OS
