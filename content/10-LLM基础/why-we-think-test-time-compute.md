# Why We Think — Test-Time Compute 与推理能力

> 原文：https://lilianweng.github.io/posts/2025-05-01-thinking/  
> [英文原文](why-we-think-test-time-compute-en.md) | [中文译文](why-we-think-test-time-compute-zh.md)  
> 作者：Lilian Weng (OpenAI)  
> 日期：2025-05-01

## 核心论点（一句话）

Test-time compute（测试时计算）和 Chain-of-Thought（思维链）让模型像人类 System 2 思考一样，通过投入更多计算资源来解决复杂问题，而 RL 训练（如 DeepSeek-R1）可以让模型自发学会这种能力。

---

## 关键概念

### 1. 人类双系统理论 → 模型计算资源视角
- **System 1（快思考）**：直觉驱动，快速自动
- **System 2（慢思考）**： deliberate, 逻辑推理，消耗认知资源
- 模型视角：Transformer 每 token 的 flops ≈ 2 × 参数量；CoT 允许模型为每个答案 token 执行远超此量的计算，且可根据问题难度自适应调整计算量

### 2. Latent Variable Perspective
将推理过程建模为隐变量 z：P(y|x) = Σ_{z~p(z|x)} P(y|x,z)
- 采样多个并行 CoT ≈ 从后验 P(z|x,y) 采样
- 使用 log loss 作为优化目标的合理性

### 3. 两种 Test-Time Compute 策略
| 策略 | 方式 | 优点 | 缺点 |
|------|------|------|------|
| **Parallel Sampling** | 同时生成多个输出，用验证器/多数投票选择 | 简单直观，易实现 | 受限于模型单次生成能力 |
| **Sequential Revision** | 迭代修改前一步输出，主动反思纠错 | 可修正错误 | 更慢，可能把正确的改错 |

- Snell et al. (2024)：简单题适合纯 sequential，难题需要 optimal ratio 的 sequential + parallel

### 4. 搜索算法
- **Best-of-N**：N 个独立样本选最优
- **Beam Search + PRM**：用 Process Reward Model 指导候选选择
- **REBASE**：根据 softmax 归一化的奖励分数决定每节点扩展量

### 5. Self-Correction 的陷阱
- LLM **不具备 intrinsic 的自纠错能力**
- 常见失败模式：把正确的改错（幻觉）、行为崩溃为不纠错、分布偏移下失效
- **需要外部反馈**才能有效自改进

### 6. DeepSeek-R1 的训练流程
1. Cold-start SFT（数千条冷启动数据，解决可读性和语言混合问题）
2. Reasoning-oriented RL（格式奖励 + 准确率奖励）
3. Rejection-sampling + 非推理 SFT（80万样本）
4. Final RL（推理 + 非推理提示）

**惊人发现**：纯 RL（无 SFT）也能让模型自发学会反思和回溯（"Aha moment"）！

### 7. CoT Faithfulness（思维链忠实性）
- 模型可能在 CoT 生成前就已得出结论（Early Answering）
- 用无意义填充 token 替换 CoT，某些任务性能仍提升 → CoT 不一定忠实反映推理过程
- 更大的模型在简单任务上可能根本不需要 CoT，但在复杂任务上 CoT 的收益随模型规模增加

---

## 关键洞察

1. **Test-time compute 是模型能力的新维度**：不是堆参数，而是让模型"想更久"。这是 o1/o3 和 R1 的核心突破。
2. **RL 可以激发涌现能力**：DeepSeek 证明纯 RL 足以让模型自发产生反思行为，无需人工标注 reasoning traces。
3. **PRM 很难做**：DeepSeek 明确说 PRM 和 MCTS 在他们的尝试中失败了——定义每步正确性太难，且容易 reward hacking。
4. **CoT 不是银弹**：CoT 可能不忠实，且小模型不一定能利用好 CoT。需要外部工具（代码解释器）来增强可靠性。

---

## 待深入研究的问题

- [ ] Inference-time intervention（如 ITI）与 test-time compute 的结合
- [ ] 如何训练更 faithful 的 CoT？是否需要显式监督目标？
- [ ] 自纠错能力的本质：为什么需要外部反馈才能工作？
- [ ] Process Reward Model 的替代方案：除了 PRM，还有什么方法可以指导搜索？
- [ ] Test-time compute 的 scaling law：计算预算如何最优分配？

---

## 与已有知识的潜在关联

- [[Chain-of-Thought]] — 与 Prompt Engineering 中的 CoT 技术直接关联
- [[RLHF]] — 本文深入讨论了 RL 在 reasoning 上的应用，与 alignment 训练形成对比
- [[DeepSeek-R1]] — 本文是理解 R1 技术细节的最佳参考之一
- [[Agent 规划与反思]] — ReAct、Reflexion 等 self-reflection 机制与 sequential revision 的思想一致
