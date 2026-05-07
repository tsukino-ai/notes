# Prompt Engineering — Lilian Weng

> 原文：https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/  
> 作者：Lilian Weng (OpenAI)  
> 日期：2023-03-15

## 核心论点（一句话）

Prompt Engineering 是一门关于如何与 LLM 沟通以引导其产生期望输出的经验科学，核心目标是**对齐和模型可操纵性**；从 zero-shot 到 CoT 到自动提示设计，效果高度依赖模型和任务，需要大量实验。

---

## 关键概念

### 1. Few-Shot 学习的偏差
Zhao et al. (2021) 发现 GPT-3 在 few-shot 中的三种偏差：
- **Majority label bias**：示例标签分布不平衡时模型偏向多数类
- **Recency bias**：模型倾向于重复末尾的标签
- **Common token bias**：模型更倾向生成常见 token

**缓解：** 校准标签概率使其在输入为 N/A 时均匀分布。

### 2. 示例选择策略
- **k-NN 语义相似**：选择嵌入空间中与测试样本最接近的示例
- **图-based 多样性选择**：构建有向图，鼓励选择分散的样本
- **对比学习嵌入**：针对特定数据集训练嵌入用于样本选择
- **不确定性主动学习**：选择模型多次采样分歧大的示例

### 3. Chain-of-Thought 变体

| 技术 | 核心思想 |
|------|----------|
| **Zero-shot CoT** | "Let's think step by step" |
| **Few-shot CoT** | 提供带推理链的示例 |
| **Self-consistency** | 多次采样，多数投票 |
| **Complexity-based consistency** | 优先选择更复杂的推理链 |
| **STaR** | 自举：模型生成推理链，只保留导致正确答案的 |
| **Tree of Thoughts** | 每步探索多路径，BFS/DFS 搜索 |

### 4. 自动提示设计
- **AutoPrompt → Prefix-Tuning → P-tuning → Prompt-Tuning**：逐步简化，从离散优化到连续嵌入
- **APE**：模型生成指令候选 → 评分函数过滤 → 选择最优
- **Cluster + Select**：k-means 聚类问题 → 每簇选一个代表性示例 → zero-shot CoT 生成推理链

### 5. 增强语言模型

**检索增强：**
- RAG、Noisy channel inference、Product-of-Experts
- 发现：LM 即使有最新搜索信息，对 2020 后的问题仍表现更差 → 参数知识与上下文知识存在冲突

**程序辅助：**
- **PAL / PoT**：让模型生成代码，由 Python 解释器执行计算

**工具使用：**
- **TALM**：文本到文本 API 调用，self-play 迭代扩展数据集
- **Toolformer**：自监督方式学习使用工具（计算器、搜索、翻译、日历），只需少量演示

---

## 关键洞察

1. **Prompt 顺序很重要且不可预测**：同一组示例的不同排列可能导致从随机猜测到接近 SOTA 的性能差异，且这种差异不随模型规模或示例数量增加而减小。
2. **解释不一定可靠**：Ye & Durrett (2022) 发现解释更可能是非事实性的（nonfactual）而非不一致的（inconsistent），非事实解释往往导致错误预测。
3. **模型可以"内部检索"**：即使不用外部知识库，让模型先生成关于主题的知识再回答问题也有帮助。
4. **Toolformer 的启示**：模型可以通过自监督损失（API 调用是否帮助预测后续 token）自主学习何时使用工具，无需大量人工标注。

---

## 待深入研究的问题

- [ ] 多模态 prompt engineering：图像+文本的 few-shot 示例选择
- [ ] Long-context 模型中的 prompt 设计：示例顺序和位置的敏感性是否降低？
- [ ] 自动 prompt 设计与人类可解释性的权衡
- [ ] 模型对 prompt 的"叛逆"行为：为什么有时会拒绝遵循指令？
- [ ] 持续学习中的 prompt 适应：如何在不遗忘的情况下更新 few-shot 示例？

---

## 与已有知识的潜在关联

- [[CoT Prompting]] — 本文是 CoT 技术最系统的综述之一
- [[RAG]] — 检索增强生成与 in-context learning 的结合
- [[Function Calling]] — Toolformer 是 function calling 的理论前身
- [[模型微调]] — Prefix-Tuning / Prompt-Tuning 是 parameter-efficient fine-tuning 的重要方法
