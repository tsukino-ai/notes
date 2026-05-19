---
title: "Agent Harness Engineering: A Survey — 中英段落对照（精选章节）"
author: Junjie Li, Xi Xiao, Yunbei Zhang, et al.
date: 2026-05-16
source: https://openreview.net/pdf/f358711a95aaaf61fdeffd4ef3fc60fba9b8da57.pdf
project: https://picrew.github.io/LLM-Harness/
tags:
  - Agent
  - Survey
  - Harness Engineering
  - Bilingual
---

> 本文是论文《Agent Harness Engineering: A Survey》的**精选章节中英段落对照**，包含摘要、引言、开放问题和结论。完整论文共 71 页，正在投稿至 TMLR。

---

## Abstract

The rapid deployment of large language model (LLM) agents in production has revealed a recurring pattern: task execution reliability depends less on the underlying model than on the infrastructure layer that wraps it, the agent execution harness. This survey provides a practice-grounded, systematic treatment of agent harness engineering, organized around three claims. First, the agent harness is an independent system layer whose engineering quality drives a large share of real-world reliability, a position we develop through a three-phase engineering evolution from prompt to context to harness engineering, a cross-layer synthesis covering the cost–quality–speed trilemma, the capability–control tradeoff, and the harness coupling problem, and an open-problem agenda grounded in both research gaps and production pain points. Second, we propose ETCLOVG, a seven-layer taxonomy (Execution environment, Tool interface, Context management, Lifecycle/Orchestration, Observability, Verification, Governance) that extends prior six-component frameworks by treating observability and governance as independent architectural concerns. Third, we map 170+ open-source projects onto this taxonomy to expose ecosystem patterns, coverage gaps, and emerging design principles, alongside engineering principles distilled from production deployments at OpenAI, Anthropic, and LangChain that address the gap between practitioner knowledge and research vocabulary.

> [!note] 译文
> 大型语言模型（LLM）Agent 在生产环境中的快速部署揭示了一个反复出现的模式：任务执行的可靠性更多地取决于包裹模型的基础设施层——即 Agent 执行线束（agent execution harness）——而非底层模型本身。本综述提供了一个基于实践、系统化的 Agent 线束工程处理框架，围绕三个核心主张展开。首先，Agent 线束是一个独立的系统层，其工程质量驱动了现实世界可靠性的很大一部分；我们通过从提示词工程到上下文工程再到线束工程的三阶段工程演进、涵盖成本-质量-速度不可能三角、能力-控制权衡和线束耦合问题的跨层综合，以及基于研究空白和生产痛点的开放问题议程来论证这一立场。其次，我们提出了 ETCLOVG 七层分类法（执行环境、工具接口、上下文管理、生命周期/编排、可观测性、验证、治理），通过将可观测性和治理视为独立的架构关切，扩展了先前的六组件框架。第三，我们将 170 多个开源项目映射到这一分类法上，以揭示生态系统模式、覆盖缺口和新兴设计原则，同时结合从 OpenAI、Anthropic 和 LangChain 的生产部署中提炼出的工程原则，以弥合从业者知识与研究词汇之间的差距。

---

## 1 Introduction

### 1.1 The Binding Constraint: Harness over Model

The academic study of LLM-based agents has, by and large, been a study of the model. Research agendas center on what the model can do: whether it can plan across multiple steps, call tools reliably, retrieve and compress relevant memories, or coordinate with other agents. The implicit assumption is that agent capability is primarily a function of model capability, that a sufficiently capable model with a sufficiently good prompt will produce sufficiently reliable behavior.

> [!note] 译文
> 对基于 LLM 的 Agent 的学术研究，在很大程度上是对模型的研究。研究议程集中于模型能做什么：它是否能跨多步规划、可靠地调用工具、检索和压缩相关记忆，或与其他 Agent 协调。隐含的假设是，Agent 能力主要是模型能力的函数——一个足够强大的模型配上足够好的提示词，就能产生足够可靠的行为。

Recent empirical evidence challenges the assumption that better models alone produce more reliable agents. Three recent results establish the pattern. Bölük (2026a) modified only the edit-tool format and surrounding tool harness, with no model modification, and reported gains of up to 10× on coding benchmarks across 15 models. Trivedy (2026) improved a fixed GPT-5.2-Codex agent from 52.8% to 66.5% on Terminal-Bench 2.0 through system prompt restructuring, middleware context injection, and self-verification hooks alone, a 13.7 percentage point gain achieved entirely through infrastructure changes. Meta-Harness (Lee et al., 2026) achieved 76.4% on Terminal-Bench-2 via automated harness optimization, surpassing all hand-engineered approaches without modifying model weights. In each case, the variable was the execution harness (the infrastructure layer governing context construction, tool interaction, orchestration, feedback, and execution constraints); the model was held fixed. Each of these harness-only gains exceeds the typical 2 to 4 percentage point improvements reported as meaningful model advances on the same benchmarks. The pattern is not incidental: the harness, not the model, is driving the outcome.

> [!note] 译文
> 最近的实证证据挑战了"仅凭更强大的模型就能产生更可靠的 Agent"这一假设。三个近期结果确立了这一模式。Bölük（2026a）仅修改了编辑工具格式和周围工具线束，未修改模型，在 15 个模型的编程基准测试上报告了高达 10 倍的提升。Trivedy（2026）仅通过系统提示词重构、中间件上下文注入和自验证钩子，将固定的 GPT-5.2-Codex Agent 在 Terminal-Bench 2.0 上从 52.8% 提升到 66.5%——13.7 个百分点的增益完全通过基础设施变更实现。Meta-Harness（Lee 等，2026）通过自动化线束优化在 Terminal-Bench-2 上达到 76.4%，超过所有手工工程方案，且未修改模型权重。在每个案例中，变量都是执行线束（管理上下文构建、工具交互、编排、反馈和执行约束的基础设施层），模型保持不变。这些仅通过线束实现的增益均超过了同一基准测试上被认为是重大模型进展的典型 2-4 个百分点提升。这一模式并非偶然：驱动结果的是线束，而非模型。

We refer to this pattern as the binding-constraint thesis (Bölük, 2026b): for long-horizon tasks evaluated across comparable frontier models, benchmark variance may be driven as much by the execution harness as by the model itself. We use this thesis as the framing for the remainder of the survey.

> [!note] 译文
> 我们将这一模式称为约束瓶颈命题（binding-constraint thesis，Bölük，2026b）：对于在可比较的前沿模型上评估的长周期任务，基准测试的方差可能同样多地由执行线束驱动，而非仅由模型本身驱动。我们将这一命题作为本综述剩余部分的框架。
### 1.2 The Practitioner–Research Gap

A tension exists between practitioner urgency and research vocabulary. OpenAI explicitly framed "harness engineering" as the discipline of designing environments, constraints, documentation, and feedback loops around Codex agents, reporting in February 2026 that a small team produced an internal product of roughly one million lines over five months without manually writing production code (OpenAI, 2026a). Anthropic's agent-engineering posts arrived at the same principle from adjacent directions: effective agents should use simple and inspectable architectures, tool interfaces should be designed for agent use rather than copied from human-facing APIs, context should be progressively disclosed instead of eagerly loaded, and long-running work requires durable handoff artifacts and recoverable execution infrastructure (Anthropic, 2024a; Aizawa, 2025; Anthropic Applied AI Team, 2025; Anthropic, 2025d; 2026b). An article on Martin Fowler's site characterizes harness engineering as "cybernetic governors for AI agents," consisting of feedforward guides and feedback sensors that form control loops around LLMs (Böckeler, 2026).

> [!note] 译文
> 从业者的紧迫性与研究词汇之间存在张力。OpenAI 明确将"线束工程"框定为围绕 Codex Agent 设计环境、约束、文档和反馈循环的学科，并在 2026 年 2 月报告称，一个小团队在 5 个月内产出了约一百万行内部产品代码，且未手动编写生产代码（OpenAI，2026a）。Anthropic 的 Agent 工程文章从相邻方向得出了相同的原理：有效的 Agent 应使用简单且可检查的架构，工具接口应为 Agent 使用而设计而非从面向人类的 API 复制而来，上下文应渐进式披露而非急切加载，长周期工作需要持久的交接构件和可恢复的执行基础设施（Anthropic，2024a；Aizawa，2025；Anthropic Applied AI Team，2025；Anthropic，2025d；2026b）。Martin Fowler 网站上的一篇文章将线束工程描述为"AI Agent 的控制论调节器"，由形成围绕 LLM 的控制环路的前馈引导和反馈传感器组成（Böckeler，2026）。

The research community, meanwhile, has been studying the components of agent systems with increasing precision: memory, tool use, planning, and safety. What has not been studied systematically is the system that integrates these components into reliable operation. The result is a practitioner–research gap: practitioners know that harness infrastructure matters but lack the formal vocabulary to describe why, in terms that enable systematic improvement. This survey attempts to bridge that gap.

> [!note] 译文
> 与此同时，研究界一直在越来越精确地研究 Agent 系统的组件：记忆、工具使用、规划和安全。但尚未被系统研究的是将这些组件整合为可靠运行的系统。结果是从业者-研究差距：从业者知道线束基础设施很重要，但缺乏正式的词汇来描述为什么重要——以能够实现系统性改进的方式来描述。本综述试图弥合这一差距。

### 1.3 Scope and Contributions

This survey focuses on the infrastructure layer that wraps a language model to manage long-running, multi-step task execution. We do not survey agent frameworks as development tools, agent platforms as product categories, or model capabilities per se, though all three inform our analysis. Figure 4 summarizes the seven-layer taxonomy that structures the remainder of the survey.

> [!note] 译文
> 本综述聚焦于包裹语言模型以管理长周期、多步任务执行的基础设施层。我们不将 Agent 框架作为开发工具、Agent 平台作为产品类别、或模型能力本身进行综述，尽管这三者都为我们的分析提供了信息。图 4 总结了构成本综述剩余部分结构的七层分类法。

Our contributions are organized around three claims.

1. **Claim 1 (Conceptual):** Building on the binding-constraint thesis (Bölük, 2026b), we argue that the harness, not the model alone, is the binding constraint on real-world agent reliability. Three recent results show harness-only gains of up to 10× on coding benchmarks, +13.7 percentage points on Terminal-Bench 2.0, and 76.4% on Terminal-Bench-2 (§1), each exceeding typical model-driven gains on the same benchmarks. We develop this thesis through a three-phase engineering evolution (§2), a cross-layer synthesis covering the cost–quality–speed trilemma, the capability–control tradeoff, and the harness coupling problem (§11), and an open-problem agenda (§12).

2. **Claim 2 (Classificatory):** The seven-layer ETCLOVG taxonomy treats Observability and Governance as first-class layers rather than side effects of lifecycle hooks. Each has its own production tooling stack (Langfuse and OpenTelemetry on the observability side; permission engines, gateways, and audit pipelines on the governance side) and is owned by a different team in production deployments. We also place state management inside Lifecycle and Orchestration, where state lives next to the execution flow that reads and writes it (§2.3).

3. **Claim 3 (Empirical):** Mapping 170+ open-source projects onto ETCLOVG shows where the ecosystem is dense, where it is thin, and which categories earlier corpora missed. The mapping is the largest open-source agent-harness corpus to date. Execution, Tooling, Lifecycle, and Verification are densely covered; Observability and Governance are thinner and more often live in commercial platforms; and three categories absent from earlier corpora, including task runners, multi-agent orchestrators, and spec-driven development tools, are now first-class.

> [!note] 译文
> 我们的贡献围绕三个主张组织。
>
> 1. **主张 1（概念性）：** 基于约束瓶颈命题（Bölük，2026b），我们认为线束——而非模型本身——是现实世界 Agent 可靠性的约束瓶颈。三个近期结果显示，仅通过线束变更就在编程基准测试上获得高达 10 倍的提升、在 Terminal-Bench 2.0 上提升 13.7 个百分点、在 Terminal-Bench-2 上达到 76.4%（§1），每个都超过了同一基准测试上典型的模型驱动增益。我们通过三阶段工程演进（§2）、涵盖成本-质量-速度不可能三角、能力-控制权衡和线束耦合问题的跨层综合（§11），以及开放问题议程（§12）来发展这一命题。
>
> 2. **主张 2（分类性）：** 七层 ETCLOVG 分类法将可观测性和治理视为一级层，而非生命周期钩子的副作用。每一层都有自己的生产工具栈（可观测性侧的 Langfuse 和 OpenTelemetry；治理侧的权限引擎、网关和审计管道），在生产部署中由不同团队拥有。我们还将状态管理置于生命周期与编排内，状态与读写它的执行流共存（§2.3）。
>
> 3. **主张 3（实证性）：** 将 170 多个开源项目映射到 ETCLOVG 上，显示了生态系统何处密集、何处稀疏，以及早期语料库遗漏了哪些类别。该映射是迄今为止最大的开源 Agent 线束语料库。执行、工具、生命周期和验证覆盖密集；可观测性和治理覆盖较薄，更多存在于商业平台中；而早期语料库中缺失的三个类别——包括任务运行器、多 Agent 编排器和规范驱动开发工具——现在已成为一级类别。
---

## 12 Open Problems and Future Directions

The open problems collected here follow from the binding-constraint thesis and the cross-layer synthesis, and they form the forward-looking part of the evidence for Claim 1 (§1). Rather than treating the seven ETCLOVG layers as independent component lists, this section asks where the whole harness remains scientifically under-specified. The central pattern is that agent harnesses are becoming long-running control systems, but the field still lacks mature answers for hardening the execution substrate, preserving state, diagnosing failures, transferring responsibility, and updating the harness as model capabilities change. We organize these gaps into five questions that cut across the taxonomy.

> [!note] 译文
> 此处收集的开放问题源于约束瓶颈命题和跨层综合，它们构成了主张 1（§1）证据的前瞻部分。本节不是将七层 ETCLOVG 视为独立的组件列表，而是询问整个线束在科学上何处仍未被充分规定。核心模式是 Agent 线束正在成为长周期控制系统，但该领域仍缺乏关于强化执行基板、保持状态、诊断故障、转移责任以及随模型能力变化更新线束的成熟答案。我们将这些差距组织为五个跨分类法的问题。

### 12.1 Hardening and Scaling Execution Environments

Execution environments are becoming the control boundary where security, scalability, and portability meet. SandboxEscapeBench documents that frontier models can exploit sandbox weaknesses under realistic configurations (Marchand et al., 2026), but defense work remains fragmented across systems with different threat models and evaluation protocols (Wu et al., 2025; Yan, 2025). At the same time, the one-container-per-task pattern strains large-scale training and evaluation, where tens of thousands of parallel trajectories need cheap reset and replay; SWE-World points toward Docker-free surrogate environments, but the fidelity of learned transitions relative to real execution remains unresolved (Sun et al., 2026). Even deployment portability is not a solved engineering detail: Docker-based sandboxes inherit Linux-kernel assumptions, while macOS, Windows, browser, desktop, and hybrid-cloud settings expose different isolation and reproducibility constraints.

The open problem is to make the runtime substrate both measurable and composable. Future harnesses need common security evaluations for prompt injection, goal misalignment, and compositional amplification; cost models that decide when to use containers, microVMs, OS-level permission boundaries, full desktop VMs, browser environments, or learned surrogates; and portability layers that preserve semantics across self-hosted, cloud, and hybrid deployments.

> [!note] 译文
> 执行环境正在成为安全、可扩展性和可移植性交汇的控制边界。SandboxEscapeBench 记录表明，前沿模型可以在现实配置下利用沙盒弱点（Marchand 等，2026），但防御工作在不同威胁模型和评估协议的系统之间仍然碎片化（Wu 等，2025；Yan，2025）。同时，每任务一个容器的模式给大规模训练和评估带来压力，其中数万个并行轨迹需要廉价的重置和重放；SWE-World 指向无 Docker 的替代环境，但学习到的转换相对于真实执行的保真度仍未解决（Sun 等，2026）。即使部署可移植性也不是已解决的工程细节：基于 Docker 的沙盒继承了 Linux 内核假设，而 macOS、Windows、浏览器、桌面和混合云环境暴露出不同的隔离和可复现性约束。
>
> 开放问题是使运行时基板既可测量又可组合。未来的线束需要针对提示词注入、目标错位和组合放大的通用安全评估；决定何时使用容器、MicroVM、OS 级权限边界、完整桌面 VM、浏览器环境或学习替代品的成本模型；以及跨自托管、云和混合部署保持语义的移植层。

### 12.2 Maintaining Reliable State in Long-Running Agents

The deepest context problem is not simply how to fit more tokens into a prompt, but how to keep an agent's working state aligned with the true task state over long horizons. Long-running coding, research, and operations agents repeatedly summarize, retrieve, compact, and externalize information; every such operation can delete constraints, distort priorities, or preserve stale assumptions. Recent context-engineering work treats compaction, tool-result clearing, retrieval, and prompt-cache-aware ordering as practical mechanisms for managing limited context windows (Anthropic Applied AI Team, 2025; Anthropic, 2025c; OpenAI, 2026b). However, context rot and memory benchmarks show that longer inputs and richer memory stores do not automatically imply better task-state tracking (Hong et al., 2025; Tan et al., 2025; He et al., 2026).

A principled research agenda should therefore recast context management as state estimation. The open question is whether we can characterize how much task-relevant information is lost at each compression, retrieval, or forgetting step, and whether we can bound the divergence between the agent's internal state and the real state of the task. Future systems need uncertainty-aware summaries, provenance for remembered facts, contradiction handling, explicit staleness markers, and recovery procedures that let an agent reconstruct missing state from durable artifacts rather than trusting its own compressed history.

> [!note] 译文
> 最深的上下文问题不是简单地将更多 Token 塞入提示词，而是如何在长周期内保持 Agent 的工作状态与真实任务状态一致。长周期编程、研究和运维 Agent 反复地总结、检索、压缩和外化信息；每一次这样的操作都可能删除约束、扭曲优先级或保留过时的假设。最近的上下文工程工作将压缩、工具结果清除、检索和提示词缓存感知排序视为管理有限上下文窗口的实用机制（Anthropic Applied AI Team，2025；Anthropic，2025c；OpenAI，2026b）。然而，上下文腐烂和记忆基准测试表明，更长的输入和更丰富的记忆存储并不自动意味着更好的任务状态跟踪（Hong 等，2025；Tan 等，2025；He 等，2026）。
>
> 因此，有原则的研究议程应将上下文管理重新定义为状态估计。开放问题是，我们是否能够刻画每次压缩、检索或遗忘步骤中丢失了多少任务相关信息，以及是否能够限定 Agent 内部状态与任务真实状态之间的偏差。未来的系统需要不确定性感知的摘要、记忆事实的来源、矛盾处理、显式的过时标记，以及让 Agent 从持久构件而非信任其自身压缩历史来重建缺失状态的恢复程序。

### 12.3 Diagnosing Failures from Agent Traces

Agent evaluation is still too often final-score-centric: a run passes or fails, and the final number is treated as evidence about model quality. For harness engineering, this is insufficient because a failed rollout may originate from model reasoning, a misleading tool schema, sandbox misconfiguration, stale context, flaky tests, benchmark ambiguity, judge instability, or orchestration loops. Anthropic's analysis of agentic coding evaluations shows that infrastructure settings can measurably shift benchmark scores (Anthropic, 2026a), and recent work on randomness in agentic evals argues that single-run pass rates can hide substantial variance (Bjarnason et al., 2026). The evaluation layer must therefore be studied as a measurement instrument, not merely used as a leaderboard generator.

The next step is trace-native evaluation: traces should become the primary object from which systems compute outcome scores, trajectory quality, failure attribution, and regression tests. Observability systems already capture spans, tool calls, costs, retries, exceptions, and intermediate messages (OpenTelemetry, 2026; AlSayyad et al., 2026; Koc et al., 2025), but these traces are often disconnected from evaluation pipelines. LangChain's 2026 survey reports that 89% of teams use observability while only 52.4% run offline evaluations (LangChain, 2026a); this gap means teams can see what agents did without systematically judging whether the behavior was correct. Future work should close this loop by converting anomalous production traces into regression cases, computing trajectory metrics directly over spans, and feeding diagnostic signals back into prompt, tool, context, and orchestration changes.

> [!note] 译文
> Agent 评估仍然过于以最终分数为中心：一次运行通过或失败，最终数字被当作模型质量的证据。对于线束工程，这不够充分，因为失败的发布可能源于模型推理、误导性工具模式、沙盒配置错误、过时上下文、不稳定测试、基准测试模糊性、评判器不稳定性或编排循环。Anthropic 对 Agent 编程评估的分析表明，基础设施设置可以可测量地改变基准测试分数（Anthropic，2026a），而最近关于 Agent 评估中随机性的工作认为，单次运行通过率可能隐藏大量方差（Bjarnason 等，2026）。因此，评估层必须被研究为测量工具，而不仅仅被用作排行榜生成器。
>
> 下一步是轨迹原生评估：轨迹应成为系统从中计算结果分数、轨迹质量、故障归因和回归测试的主要对象。可观测性系统已经捕获了 span、工具调用、成本、重试、异常和中间消息（OpenTelemetry，2026；AlSayyad 等，2026；Koc 等，2025），但这些轨迹通常与评估管道断开。LangChain 2026 年的调研报告称，89% 的团队使用可观测性，而只有 52.4% 运行离线评估（LangChain，2026a）；这一差距意味着团队可以看到 Agent 做了什么，却没有系统地判断行为是否正确。未来的工作应通过将异常生产轨迹转化为回归用例、直接在 span 上计算轨迹指标、以及将诊断信号反馈回提示词、工具、上下文和编排的变更来闭合这一环路。
### 12.4 Standard Handoffs Across Agents, Tools, and Humans

Modern harnesses increasingly distribute work across planners, subagents, tools, sandboxes, evaluators, and humans, but the interfaces between these actors remain ad hoc. There are emerging local standards: MCP standardizes tool access, A2A targets inter-agent communication, and OpenTelemetry provides a general substrate for traces (Model Context Protocol, 2025b; A2A Project, 2025; OpenTelemetry, 2026; Ehtesham et al., 2025). What is missing is a cross-layer handoff contract. When a planner hands work to an executor, an agent calls a tool, a subagent returns control, or a system escalates to a human, the handoff should transfer not only a text summary but also intent, constraints, permissions, artifacts, provenance, budget state, risk level, trace history, and unresolved decisions.

This problem is partly technical and partly institutional. OpenAI's Symphony frames the issue tracker and repository as a control plane for agent work, while Anthropic's long-running-agent harnesses emphasize durable progress artifacts and clean handoff state (Kotliarskyi et al., 2026; Anthropic, 2025d; 2026b). Governance work reaches the same conclusion from the opposite direction: agent identity, delegation, permission manifests, and auditability are needed before agents can safely act on behalf of users across systems (South et al., 2025; Marro et al., 2025; Syros et al., 2025). The open problem is to define handoff protocols that are rich enough for safety and recovery, but simple enough for broad adoption. Such protocols should make responsibility explicit: who authorized the action, which state was transferred, which evidence supports the current plan, what the receiver is allowed to do, and when control must return to another agent or a human.

> [!note] 译文
> 现代线束越来越多地将工作分布在规划器、子 Agent、工具、沙盒、评估器和人类之间，但这些参与者之间的接口仍然是临时性的。已经出现了一些局部标准：MCP 标准化工具访问，A2A 针对 Agent 间通信，OpenTelemetry 为轨迹提供通用基板（Model Context Protocol，2025b；A2A Project，2025；OpenTelemetry，2026；Ehtesham 等，2025）。缺失的是跨层交接契约。当规划器将工作交给执行器、Agent 调用工具、子 Agent 返回控制权或系统升级到人类时，交接应传递的不仅是文本摘要，还包括意图、约束、权限、构件、来源、预算状态、风险级别、轨迹历史和未解决决策。
>
> 这个问题部分是技术性的，部分是制度性的。OpenAI 的 Symphony 将问题跟踪器和仓库框定为 Agent 工作的控制平面，而 Anthropic 的长周期 Agent 线束强调持久的进度构件和干净的交接状态（Kotliarskyi 等，2026；Anthropic，2025d；2026b）。治理工作从相反方向得出了相同的结论：在 Agent 能够安全地跨系统代表用户行动之前，需要 Agent 身份、委派、权限清单和可审计性（South 等，2025；Marro 等，2025；Syros 等，2025）。开放问题是定义足够丰富以确保安全和恢复的交接协议，但又足够简单以实现广泛采用。这样的协议应使责任明确：谁授权了该动作、转移了哪些状态、哪些证据支持当前计划、接收者被允许做什么、以及控制权何时必须返回给另一个 Agent 或人类。

### 12.5 Keeping Harnesses Useful as Models Improve

Harness design should not be assumed to move monotonically toward more scaffolding. Every wrapper, reset, verifier, planner, memory rule, and permission gate encodes an assumption about what the model cannot do reliably on its own. As model capabilities change, harness interventions should be re-estimated rather than assumed to remain beneficial. A factorial model-by-harness evaluation can reveal when an intervention improves all models, helps only specific model families, or reverses model rankings (Bölük, 2026b). Anthropic reports a concrete version of this pattern in long-running application development: context resets that were useful for one model became dispensable for a stronger model, and removing them reduced cost without degrading quality (Anthropic, 2026c). OpenAI similarly frames harness engineering as a discipline of keeping human attention, repository state, and agent execution aligned rather than merely adding more scaffolding (OpenAI, 2026a;b).

This creates a meta-engineering agenda: harnesses need mechanisms for optimizing and simplifying themselves. Meta-Harness shows that prompts, tools, and control loops can be searched as part of the optimization target rather than fixed by hand (Lee et al., 2026), while Natural-Language Agent Harnesses make harness modules explicit and ablatable (Pan et al., 2026). Production observability and cost systems such as TensorZero, Axon, and AgentOps point toward budget-aware harness operation (TensorZero, 2026; harshkedia177, 2026; AgentOps AI, 2026), but the research problem is broader than cost minimization. Future systems should identify which interventions are causally responsible for quality, safety, or reliability; run shadow-mode or A/B tests across harness variants; and optimize under joint quality–latency–cost–risk constraints. A central risk is benchmark overfitting: a harness that optimizes itself only against a narrow suite may become brittle. The more durable goal is adaptive simplification, where the harness continuously asks which controls are still necessary as tasks, tools, and model capabilities change.

> [!note] 译文
> 线束设计不应被假定为单调地向更多脚手架发展。每个包装器、重置、验证器、规划器、记忆规则和权限门都编码了一个关于模型自身不能可靠做什么的假设。随着模型能力的变化，线束干预应被重新估计，而非假定为仍然有益。因子化的模型-线束评估可以揭示一项干预何时改进了所有模型、仅帮助特定模型系列、或逆转模型排名（Bölük，2026b）。Anthropic 报告了长周期应用开发中这一模式的具体版本：对一个模型有用的上下文重置对更强的模型变得可有可无，移除它们在不降低质量的情况下减少了成本（Anthropic，2026c）。OpenAI 同样将线束工程框定为保持人类注意力、仓库状态和 Agent 执行对齐的学科，而非仅仅添加更多脚手架（OpenAI，2026a；b）。
>
> 这创造了一个元工程议程：线束需要自我优化和简化的机制。Meta-Harness 表明，提示词、工具和控制循环可以作为优化目标的一部分被搜索，而非手工固定（Lee 等，2026），而自然语言 Agent 线束使线束模块显式且可消融（Pan 等，2026）。TensorZero、Axon 和 AgentOps 等生产可观测性和成本系统指向预算感知的线束操作（TensorZero，2026；harshkedia177，2026；AgentOps AI，2026），但研究问题比成本最小化更广泛。未来的系统应识别哪些干预对质量、安全或可靠性有因果责任；跨线束变体运行影子模式或 A/B 测试；并在联合质量-延迟-成本-风险约束下优化。一个核心风险是基准测试过拟合：仅针对狭窄套件自我优化的线束可能变得脆弱。更持久的目标是自适应简化，即线束持续追问随着任务、工具和模型能力的变化，哪些控制仍然必要。

---

## 13 Conclusion

This survey treats the agent harness as an independent engineering surface and argues that infrastructure quality, not model capability alone, sets the ceiling on real-world agent reliability. Around this binding-constraint thesis we develop three claims. The seven-layer ETCLOVG taxonomy separates Observability and Governance from Lifecycle Hooks and reflects how production teams already organize their tooling and ownership. A mapping of 170+ open-source projects onto the taxonomy gives the most extensive ecosystem snapshot to date and surfaces adoption patterns, coverage gaps, and emerging design principles. A three-phase engineering evolution from prompt to context to harness engineering, together with a cross-layer synthesis covering the cost–quality–speed trilemma, the capability–control tradeoff, and the harness coupling problem, situates the harness within a broader engineering trajectory. Our analysis has limits. The corpus is biased toward English-language, GitHub-visible, open-source projects, and toward the coding-agent ecosystem; extending it to closed-source production systems and to non-coding agent ecosystems would sharpen the empirical picture. The taxonomy itself is descriptive: turning ETCLOVG into a normative framework that can guide harness design decisions, rather than only classify them, is the natural next step we hope this survey will encourage.

> [!note] 译文
> 本综述将 Agent 线束视为独立的工程表面，并论证基础设施质量——而非仅模型能力——设定了现实世界 Agent 可靠性的上限。围绕这一约束瓶颈命题，我们发展了三个主张。七层 ETCLOVG 分类法将可观测性和治理与生命周期钩子分离，反映了生产团队已经如何组织他们的工具和所有权。将 170 多个开源项目映射到分类法上，提供了迄今为止最广泛的生态系统快照，并揭示了采用模式、覆盖缺口和新兴设计原则。从提示词工程到上下文工程再到线束工程的三阶段工程演进，以及涵盖成本-质量-速度不可能三角、能力-控制权衡和线束耦合问题的跨层综合，将线束置于更广泛的工程轨迹中。我们的分析有局限性。语料库偏向英语、GitHub 可见的开源项目，以及编程 Agent 生态系统；将其扩展到闭源生产系统和非编程 Agent 生态系统将锐化实证图景。分类法本身是描述性的：将 ETCLOVG 转变为能够指导线束设计决策的规范性框架，而非仅对其进行分类，是我们希望本综述将鼓励的自然下一步。

---

> 全文共 71 页，正在投稿至 TMLR（Transactions on Machine Learning Research）。
> 
> - 原文 PDF：https://openreview.net/pdf/f358711a95aaaf61fdeffd4ef3fc60fba9b8da57.pdf
> - 项目主页：https://picrew.github.io/LLM-Harness/
> - Awesome-Agent-Harness 目录：https://github.com/picrew/LLM-Harness
