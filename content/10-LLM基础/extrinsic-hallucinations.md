# Extrinsic Hallucinations in LLMs

> 原文：https://lilianweng.github.io/posts/2024-07-07-hallucination/  
> 作者：Lilian Weng (OpenAI)  
> 日期：2024-07-07

## 核心论点（一句话）

LLM 幻觉的本质是模型生成了与上下文或世界知识不一致的虚构内容；本文系统梳理了幻觉的成因、检测方法和反幻觉技术，特别强调了 fine-tuning 新知识反而会加剧幻觉这一反直觉发现。

---

## 关键概念

### 1. 幻觉的分类
- **In-context hallucination**：输出应与上下文中的源内容一致
- **Extrinsic hallucination**：输出应基于预训练数据/世界知识，且模型不知道时应承认

### 2. 成因

**预训练数据问题**：
- 互联网爬取数据包含过时、缺失或错误信息
- 模型通过最大化对数似然可能错误记忆这些信息

**Fine-tuning 新知识的风险** (Gekhman et al. 2024)：
- LLM 学习带有新知识的微调示例比学习一致性知识的示例**更慢**
- 当模型学会了大部分 Unknown 示例后，**幻觉开始增加**
- 结论：**用 SFT 更新 LLM 知识有风险**

### 3. 检测方法

| 方法 | 核心思想 |
|------|----------|
| **FActScore** | 将长文本分解为原子事实，逐个验证 |
| **SAFE** | LM 作为 agent 迭代发起 Google 搜索查询验证 |
| **SelfCheckGPT** | 对黑盒 LLM 的多样本一致性检查 |
| **TruthfulQA** | 对抗性构造，利用人类常见错误观念 |
| **SelfAware** | 测量模型是否知道自己不知道 |

**校准未知知识**：
- Kadavath et al. (2022)：LLM 在 MMLU 等 MCQ 上对答案正确率的概率估计**校准良好**
- 但 RLHF 使模型校准变差
- 更大的模型在区分"可知/不可知"问题上表现更好

### 4. 反幻觉方法

**RAG + 编辑：**
- **RARR**：研究 → 修订，用搜索证据retrofit 归因
- **FAVA**：检索 + 编辑模型，针对幻觉错误类型生成合成训练数据
- **Self-RAG**：训练 LM 端到端输出反思 token（Retrieve, IsRel, IsSup, IsUse）

**验证链：**
- **CoVe (Chain-of-Verification)**：基线回答 → 设计验证问题 → 独立回答 → 交叉检查不一致性
- **RECITE**：先背诵相关知识，再生成答案，利用 Transformer 记忆作为检索机制

**采样与推理时干预：**
- **Factual-nucleus sampling**：动态调整采样概率 p
- **ITI (Inference-Time Intervention)**：识别与真实性相关的注意力头，沿"真实方向"偏移激活

**Fine-tuning：**
- **FLAME**：事实感知对齐（SFT + DPO），用 FActScore 作为奖励信号
- **Factuality tuning**：用 DPO 在模型自己生成的事实性得分差异上训练
- **WebGPT / GopherCite**：训练模型提供可验证的引用

---

## 关键洞察

1. **Fine-tuning 新知识 = 幻觉加速器**：这是反直觉但实验验证的发现。应该用 RAG 而非 SFT 来注入新知识。
2. **模型其实知道自己不知道**：Kadavath et al. 证明 LLM 的概率校准能力被低估了，RLHF 反而破坏了这种能力。
3. **独立验证优于长链验证**：CoVe 实验证明，将验证问题分开独立回答，比让模型在长上下文中验证效果更好（避免重复幻觉）。
4. **归因是减少幻觉的有效方式**：WebGPT/GopherCite 表明，训练模型提供引用比单纯提升事实性更实用。

---

## 待深入研究的问题

- [ ] 如何平衡模型的"承认不知道"能力和帮助性？过度保守的模型体验差
- [ ] ITI 等推理时干预与 test-time compute 的结合
- [ ] 长文本事实性（Long-form factuality）的系统性评估方法
- [ ] 模型内部知识 vs 外部检索知识冲突时的处理机制
- [ ] 多模态幻觉（图像+文本）的检测与缓解

---

## 与已有知识的潜在关联

- [[RAG]] — 本文是 RAG 缓解幻觉的理论基础
- [[RLHF]] — FLAME 等方法展示了如何将对齐训练聚焦于事实性
- [[模型可解释性]] — ITI 方法利用线性探针识别真实性相关注意力头
- [[Agent 工具使用]] — Self-RAG 中模型自主决定何时检索、如何评估检索结果
