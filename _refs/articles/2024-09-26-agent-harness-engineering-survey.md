---
title: Agent Harness Engineering：Agent的底盘工程综述｜CMU、耶鲁、Amazon
author: AI修猫Prompt
date: 2024-09-26
source: https://mp.weixin.qq.com/s?__biz=Mzg4MzYxODkzMg==&mid=2247508338&idx=1&sn=bd9dd854c1752d68a6706b966058e707
---

> 本文是论文《Agent Harness Engineering: A Survey》的中文解读，由 CMU、耶鲁大学、弗吉尼亚理工大学及亚马逊等机构研究团队撰写。

## 核心命题：binding-constraint thesis（约束瓶颈命题）

在长任务、多步骤、工具调用密集的Agent场景中，系统表现不再主要由模型本身决定，而是由模型外部的Harness决定。

论文引用的三个证据：
1. 只修改编辑工具格式和工具Harness，不改模型，多个coding benchmark上出现最高**10倍提升**
2. 固定GPT-5.2-Codex模型，仅通过系统提示词重构、中间件上下文注入、自验证hook，把Terminal-Bench 2.0从52.8% 提升到66.5%
3. Meta-Harness 通过自动优化Harness，在Terminal-Bench-2上达到76.4%，超过手工工程方案，且不修改模型权重

## 三阶段演进

| 阶段 | 时间 | 重点 |
|---|---|---|
| 提示词工程 | 2022-2024 | 优化单次模型调用的文本输入 |
| 上下文工程 | 2025 | 模型在每一步应该看到什么信息 |
| 线束工程 | 2026 | 管理多步骤、长时间运行任务的执行外壳 |

## ETCLOVG 七层架构

- **E**：Execution Environment & Sandbox（执行环境与沙箱）
- **T**：Tool Interface & Protocol（工具接口与协议）
- **C**：Context & Memory Management（上下文与记忆）
- **L**：Lifecycle & Orchestration（生命周期与编排）
- **O**：Observability & Operations（可观测性与运维）
- **V**：Verification & Evaluation（验证与评测）
- **G**：Governance & Security（治理与安全）

前四层 E/T/C/L 是结构核心，后三层 O/V/G 是控制平面。

## E 层：执行环境与沙箱

沙盒的三个核心目的：安全（Security）、可复现性（Reproducibility）、活跃性（Liveness）。

七类沙盒：
1. 通用托管沙盒（Daytona、E2B）
2. 计算机使用基础设施（Anthropic Computer Use）
3. 代码专用沙盒（OpenAI Code Interpreter）
4. 框架集成运行时（OpenHands）
5. 浏览器评估环境（WebArena）
6. 操作系统级权限沙盒（bubblewrap）
7. 沙盒抽象层

## T 层：工具接口与协议

- MCP（Model Context Protocol）已成为整合工具的显学
- A2A 协议专注于不同智能体应用之间的通信与协作
- 生产经验："更少但更好的工具"优于庞大工具菜单

## C 层：上下文与记忆管理

借用操作系统内存层级分为三层：
- **短期**（活动上下文窗口）：渐进式披露、KV缓存
- **中期**（会话状态与跨运行持久化）：结构化笔记
- **长期**（持久化记忆系统）：MemGPT、Mem0、Honcho

长周期任务需使用上下文压缩和子智能体隔离防止上下文漂移。

## L 层：生命周期与编排

- 单智能体内循环（ReAct模式、无状态重放）
- 多智能体编排（AutoGen分层、LangGraph图组合）
- 全生命周期任务流水线（Issue → PR）

## O 层：可观测性与运维

- 追踪平台：Langfuse、Arize Phoenix（基于OpenTelemetry的Span树）
- 成本追踪：FrugalGPT、智能路由
- 可靠性工程：Anthropic Managed Agents架构（大脑与双手解耦）

## V 层：验证与评测

五阶段 Task-to-Feedback Lifecycle：
1. 任务与基准基础（Grounding）
2. 执行前准备验证（Readiness）
3. 受控执行与追踪捕获（Execution）
4. 多级判断与故障归因（Judgement）
5. 持续回归反馈（Regression）

## G 层：治理与安全

- 权限与身份管理：上下文相关的权限控制、OAuth风格令牌
- 生命周期钩子：输入LLM前、执行工具前、工具返回后、人机交互审批
- 声明式宪法：YAML格式安全规则
- 审计：不可篡改的结构化日志

## 三个核心权衡

1. **成本-质量-速度的不可能三角**
2. **能力与控制的权衡**
3. **线束耦合问题**

## 五个开放问题

1. 如何在保证微虚拟机隔离强度的同时实现低成本大规模并发测试？
2. 上下文压缩必然丢失信息，如何量化？如何让智能体通过外部构件自我恢复？
3. 如何利用可观测性日志自动归因故障来源？
4. 标准化交接：如何在智能体/工具/人类之间传递意图、约束、权限、历史状态？
5. 如何随模型进化自动识别并拆除已变成"累赘"的Harness机制？
