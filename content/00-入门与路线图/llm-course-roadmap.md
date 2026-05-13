---
title: "LLM 课程全景路线图 — mlabonne/llm-course"
date: 2026-05-13
source: "https://github.com/mlabonne/llm-course"
author: "Maxime Labonne"
tags:
  - LLM
  - 学习路线
  - 预训练
  - 微调
  - RAG
  - Agent
  - 部署
---

# LLM 课程全景路线图 — mlabonne/llm-course

> 本地存档：`_refs/repos/llm-course/`
> 原始仓库：https://github.com/mlabonne/llm-course
> Star：50k+ ⭐
> 作者：Maxime Labonne（Meta 研究科学家）

这是一份面向 **LLM Scientist + LLM Engineer** 双轨发展的完整课程索引。本笔记不做全文搬运，只提炼知识结构、关键概念跳转点和与本地知识库的衔接关系。

---

## 三轨学习架构

```
┌─────────────────────────────────────────────────────────────┐
│                    LLM Fundamentals                         │
│         (数学 · Python · 神经网络 · NLP 基础)                  │
│                    ↓ 前置必修课                               │
├──────────────────────────────┬──────────────────────────────┤
│        LLM Scientist         │         LLM Engineer         │
│      (研究 · 训练 · 对齐)      │    (工程 · RAG · Agent · 部署) │
│         ↓ 论文复现            │         ↓ 生产落地            │
└──────────────────────────────┴──────────────────────────────┘
```

---

## Track 1：LLM Fundamentals

| 模块 | 核心内容 | 与知识库关联 |
|------|---------|------------|
| 线性代数 / 微积分 / 概率论 | 矩阵运算、梯度、贝叶斯 | 基础数学，暂无独立笔记 |
| Python 编程 | NumPy、数据处理、面向对象 | 基础能力 |
| 机器学习基础 | 监督/无监督学习、过拟合、正则化 | 基础能力 |
| 神经网络 | 前向传播、反向传播、激活函数 | 基础能力 |
| NLP 基础 | Tokenization、Embedding、TF-IDF | 参见 [[../10-LLM基础/index\|LLM 基础]] |

> 💡 如果你已有 CS/ML 背景，此轨可快速跳过，直接进入 Scientist 或 Engineer 轨。

---

## Track 2：LLM Scientist

> 目标：**理解 LLM 内部机制、能复现论文、能独立做研究**

### 2.1 架构与核心机制

| 主题 | 关键概念 | 本地笔记 |
|------|---------|---------|
| Transformer 架构 | Self-Attention、MLP、Layer Norm、位置编码 | 参见 [[../10-LLM基础/index\|LLM 基础]] |
| Tokenization | BPE、WordPiece、SentencePiece、Unigram | — |
| Attention 变体 | MQA、GQA、Flash Attention、Sliding Window | — |
| 现代架构 | Mixture of Experts (MoE)、Mamba/SSM | — |

### 2.2 预训练（Pre-training）

- **数据管道**：Common Crawl 清洗、去重、质量过滤（CCNet、GPT-3 方法）
- **训练目标**：Next Token Prediction、Masked Language Modeling
- **Scaling Laws**：Chinchilla 最优计算-数据配比
- **分布式训练**：数据并行、张量并行、流水线并行、ZeRO

### 2.3 后训练（Post-training）

| 阶段 | 方法 | 关键论文/技术 |
|------|------|-------------|
| 监督微调 (SFT) | LoRA、QLoRA、DoRA | Hu et al. 2021, Dettmers et al. 2023 |
| 偏好对齐 | **DPO**、PPO、**GRPO** (DeepSeek-R1) | Rafailov et al. 2023, DeepSeek 2024 |
| 数据构建 | 指令多样性、拒绝采样、合成数据 | — |

> 🔗 本地关联：[[../10-LLM基础/why-we-think-test-time-compute\|Test-Time Compute]] 讨论了推理时计算扩展与训练后优化的关系。

### 2.4 评估与基准

- **通用能力**：MMLU、HellaSwag、ARC、TruthfulQA
- **代码能力**：HumanEval、MBPP、SWE-bench
- **长上下文**：Needle in a Haystack、RULER
- **安全性**：Red Teaming、Jailbreak 评估

### 2.5 量化与压缩

| 方法 | 特点 | 适用场景 |
|------|------|---------|
| GGUF (llama.cpp) |  CPU 推理友好、多种位宽 | 本地部署、边缘设备 |
| GPTQ |  4-bit 权重量化、逐层校准 | GPU 推理加速 |
| AWQ |  激活感知权重量化、更低精度损失 | 高精度 + 高效推理 |
| EXL2 |  混合位宽、极致压缩 | 显存极度受限 |

### 2.6 前沿趋势

- **模型合并**：Model Soups、TIES-Merging、SLERP
- **多模态**：Vision-Language Models (CLIP、LLaVA)
- **可解释性**：Mechanistic Interpretability、Sparse Autoencoders
- **Test-Time Compute**：o1、DeepSeek-R1 的推理时扩展

---

## Track 3：LLM Engineer

> 目标：**把 LLM 能力工程化落地，构建可生产的 AI 应用**

### 3.1 运行 LLM

| 方式 | 工具/平台 | 决策要点 |
|------|----------|---------|
| API 调用 | OpenAI、Anthropic、Gemini、Together | 延迟、成本、合规 |
| 本地运行 | Ollama、LM Studio、llama.cpp | 隐私、离线、硬件成本 |
| 自托管 | vLLM、TGI、TensorRT-LLM | 吞吐、并发、显存优化 |

### 3.2 向量存储与 RAG

- **Embedding 模型**：OpenAI `text-embedding-3`、BGE、E5、GTE
- **向量数据库**：Chroma、Weaviate、Qdrant、Milvus、pgvector
- **检索策略**：Dense、Sparse、Hybrid、Reranking

> 🔗 本地关联：[[../20-RAG工程/rag-evolution\|RAG 演进全景]] 详细梳理了从 Naive RAG → Advanced RAG → Agentic RAG 的完整路径。

### 3.3 Advanced RAG

| 技术 | 解决的问题 |
|------|-----------|
| Query Translation | 用户 query 模糊 → 多查询扩展、HyDE |
| Routing | 不同数据源/策略的选择 |
| Structured Retrieval | 表格、图谱、SQL 等结构化数据 |
| Agentic RAG | Agent 自主决策检索策略 |
| DSPy | 程序化优化 prompt 和 pipeline |

### 3.4 Agents

| 主题 | 关键内容 | 本地笔记 |
|------|---------|---------|
| MCP (Model Context Protocol) | 标准化工具接口，跨框架复用 | 待补充 [[../30-Agent工程/MCP协议详解\|MCP 协议详解]] |
| A2A (Agent-to-Agent) | Google 提出的 Agent 间通信协议 | — |
| LangGraph | 状态图编排，生产级工作流 | [[../30-Agent工程/LangGraph/index\|LangGraph]] |
| LlamaIndex | 数据增强 Agent 工具链 | — |

> 🔗 本地关联：[[../30-Agent工程/架构研究/agent-memory-design-references\|Agent 记忆架构参考文献]]、[[../30-Agent工程/Java-AI-生态/yu-ai-code-mother\|yu-ai-code-mother 架构分析]]

### 3.5 推理优化

| 技术 | 原理 | 收益 |
|------|------|------|
| Flash Attention | IO-aware 注意力计算 | 显存 ↓ 速度 ↑ |
| KV Cache | 缓存历史 Key/Value | 避免重复计算 |
| Speculative Decoding | 小模型草稿 + 大模型验证 | 延迟 ↓ 2-3x |
| Continuous Batching | 动态批次拼接 | GPU 利用率 ↑ |
| Quantized Inference | INT8/INT4/FP8 | 显存 ↓ 吞吐 ↑ |

### 3.6 部署架构

```
本地演示 (Gradio/Streamlit)
    ↓
API 服务 (FastAPI + vLLM)
    ↓
容器编排 (Docker + K8s)
    ↓
边缘/端侧 (ONNX / CoreML / MLX)
```

### 3.7 安全

- **Prompt Hacking**：Injection、Jailbreak、Leakage
- **Backdoors**：数据投毒、触发器攻击
- **Red Teaming**：自动化对抗测试、Human-in-the-loop

---

## 学习路径建议

### 路径 A：全栈 Agent 工程师（我的方向）

```
LLM Fundamentals（快速过）
    ↓
RAG 基础 → Advanced RAG → Agentic RAG
    ↓
Agents (MCP / LangGraph / Tool Calling)
    ↓
推理优化 + 部署 (vLLM / Docker / K8s)
    ↓
安全 + 监控 (Red Teaming / Metrics)
```

### 路径 B：模型研究与定制

```
LLM Fundamentals（扎实基础）
    ↓
Transformer 架构深入
    ↓
预训练数据与 Scaling Laws
    ↓
SFT (LoRA/QLoRA) + DPO/GRPO
    ↓
评估与量化
    ↓
前沿：Test-Time Compute / MoE / Mamba
```

---

## 关键外部资源

| 资源 | 链接 | 用途 |
|------|------|------|
| 课程 README | [GitHub](https://github.com/mlabonne/llm-course) | 完整大纲 + 论文链接 |
| Colab Notebooks | 见 README 各章节 | 可运行代码 |
| Maxime Labonne 博客 | [mlabonne.github.io](https://mlabonne.github.io/blog) | 深度文章 |
| Alignment Handbook | [HF 仓库](https://github.com/huggingface/alignment-handbook) | SFT + DPO 实战 |

---

## 与本地知识库的衔接

| 本课程模块 | 本地对应笔记 |
|-----------|------------|
| RAG / Advanced RAG | [[../20-RAG工程/rag-evolution\|RAG 演进全景]] |
| Agents / LangGraph | [[../30-Agent工程/LangGraph/index\|LangGraph]] |
| Agent Memory | [[../30-Agent工程/架构研究/agent-memory-design-references\|Agent 记忆架构参考文献]] |
| Test-Time Compute | [[../10-LLM基础/why-we-think-test-time-compute\|Test-Time Compute]] |
| Java AI 生态 | [[../30-Agent工程/Java-AI-生态/index\|Java AI 生态]] |
| Hallucination | [[../10-LLM基础/extrinsic-hallucinations\|外在幻觉]] |

---

> 📌 本笔记为**路线图索引**，每个主题如需深入，应回到原始仓库阅读对应 Colab Notebook 或论文。新增学习心得可直接在此笔记下方追加。
