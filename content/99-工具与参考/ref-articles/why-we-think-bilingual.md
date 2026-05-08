---
title: Why We Think — 中英段落对照阅读
author: Lilian Weng
date: 2025-05-01
source: https://lilianweng.github.io/posts/2025-05-01-thinking/
---

# Why We Think — 中英段落对照阅读

> 本文是 Lilian Weng 关于 test-time compute 与推理能力的综述文章。
> 每个英文段落下方为中文译文，保留段落结构，便于对照学习。

Special thanks to John Schulman for a lot of super valuable feedback and direct edits on this post.

> [!note] 译文
> 特别感谢 John Schulman 对本文提供了大量非常宝贵的反馈和直接修改。

---

Test time compute (Graves et al. 2016, Ling, et al. 2017, Cobbe et al. 2021) and Chain-of-thought (CoT) (Wei et al. 2022, Nye et al. 2021), have led to significant improvements in model performance, while raising many research questions. This post aims to review recent developments in how to effectively use test-time compute (i.e. "thinking time") and why it helps.

> [!note] 译文
> 测试时计算（Graves et al. 2016, Ling, et al. 2017, Cobbe et al. 2021）和思维链（CoT）（Wei et al. 2022, Nye et al. 2021）显著提升了模型性能，同时也带来了许多研究问题。本文旨在回顾如何有效使用测试时计算（即"思考时间"）的最新进展，以及它为何有效。

---

The core idea is deeply connected to how humans think. We humans cannot immediately provide the answer for "What's 12345 times 56789?". Rather, it is natural to spend time pondering and analyzing before getting to the result, especially for complex problems. In Thinking, Fast and Slow (Kahneman, 2013), Daniel Kahneman characterizes human thinking into two modes, through the lens of the dual process theory :
Fast thinking (System 1) operates quickly and automatically, driven by intuition and emotion while requiring little to no effort.

> [!note] 译文
> 核心思想与人类的思维方式密切相关。我们人类无法立即回答"12345 乘以 56789 等于多少？"。相反，在得出结果之前花时间思考和分析是很自然的，尤其是对于复杂问题。在《Thinking, Fast and Slow》（Kahneman, 2013）中，Daniel Kahneman 通过双过程理论（dual process theory）的视角，将人类思维分为两种模式：
> 快速思考（System 1）快速且自动地运作，由直觉和情感驱动，几乎不需要付出努力。

---

Slow thinking (System 2) demands deliberate, logical thought and significant cognitive efforts. This mode of thinking consumes more mental energy and requires intentional engagement.

> [!note] 译文
> 慢思考（系统2）需要审慎的、逻辑性的思考以及大量的认知努力。这种思维模式消耗更多的心理能量，需要有意识地去投入。

---

Because System 1 thinking is fast and easy, it often ends up being the main decision driver, at the cost of accuracy and logic. It naturally relies on our brain's mental shortcuts (i.e., heuristics) and can lead to errors and biases. By consciously slowing down and taking more time to reflect, improve and analyze, we can engage in System 2 thinking to challenge our instincts and make more rational choices.

> [!note] 译文
> 因为系统1思考快速且轻松，它往往成为主要的决策驱动力，但这要以准确性和逻辑性为代价。它天然地依赖我们大脑中的心理捷径（即启发式），并可能导致错误和偏见。通过有意识地放慢速度，花更多时间反思、改进和分析，我们可以调动系统2思考来挑战直觉，做出更理性的选择。

---

One view of deep learning, is that neural networks can be characterized by the amount of computation and storage they can access in a forward pass, and if we optimize them to solve problems using gradient descent, the optimization process will figure out how to use these resources–they'll figure out how to organize these resources into circuits for calculation and information storage. From this view, if we design an architecture or system that can do more computation at test time, and we train it to effectively use this resource, it'll work better.

> [!note] 译文
> 关于深度学习的一种观点是，神经网络可以通过它们在一次前向传播（forward pass）中能够访问的计算量和存储量来刻画，如果我们使用梯度下降（gradient descent）来优化它们以解决问题，优化过程会自行找出如何利用这些资源——它会弄清楚如何将这些资源组织成用于计算和信息存储的电路。从这个角度来看，如果我们设计一种能够在测试时（test time）进行更多计算的架构或系统，并训练它有效利用这一资源，它的表现就会更好。

---

In Transformer models, the amount of computation (flops) that the model does for each generated token is roughly 2 times the number of parameters. For sparse models like mixture of experts (MoE), only a fraction of the parameters are used in each forward pass, so computation = 2 * parameters / sparsity, where sparsity is the fraction of experts active.

> [!note] 译文
> 在 Transformer 模型中，模型为每个生成的词元所做的计算量（flops）大约是参数数量的 2 倍。对于像混合专家模型（mixture of experts/MoE）这样的稀疏模型，每次前向传播（forward pass）只使用一部分参数，因此计算量 = 2 * 参数数量 / 稀疏度，其中稀疏度是指活跃专家所占的比例。

---

On the other hand, CoT enables the model to perform far more flops of computation for each token of the answer that it is trying to compute. In fact, CoT has a nice property that it allows the model to use a variable amount of compute depending on the hardness of the problem.

> [!note] 译文
> 另一方面，思维链（Chain-of-Thought/CoT）使模型能够为其试图计算的答案中的每个词元执行远多于常规量的计算。事实上，CoT 有一个很好的特性：它允许模型根据问题的难度使用可变的计算量。

---

A classic idea in machine learning is to define a probabilistic model with a latent (hidden) variable $z$ and a visible variable $y$, where $y$ is given to our learning algorithm. Marginalizing (summing) over the possible values of the latent variable allows us to express a rich distribution over the visible variables, $P(y) = \sum_{z \sim P(z)} P(y \mid z)$. For example, we can model the distribution over math problems and solutions by letting $x$ denote a problem statement, $y$ be ground truth answer or proof, and $z$ as a free-form thought process that leads to the proof. The marginal probability distribution to optimize would be $P(y \mid x) = \sum_{z \sim p(z\mid x)} P(y \mid x, z)$

> [!note] 译文
> 机器学习中的一个经典思路是，定义一个包含潜变量（latent variable）$z$ 和可见变量 $y$ 的概率模型，其中 $y$ 被提供给我们的学习算法。对潜变量的可能取值进行边缘化（求和），使我们能够对可见变量表达一个丰富的分布，$P(y) = \sum_{z \sim P(z)} P(y \mid z)$。例如，我们可以通过让 $x$ 表示问题陈述、$y$ 表示真实答案或证明、$z$ 表示导致该证明的自由形式思维过程，来对数学问题与解答的分布进行建模。待优化的边缘概率分布为 $P(y \mid x) = \sum_{z \sim p(z\mid x)} P(y \mid x, z)$。

---

The latent variable perspective is particularly useful for understanding methods that involve collecting multiple parallel CoTs or searching over the CoT–these algorithms can be seen as sampling from the posterior $P(z \mid x, y)$. This view also suggests the benefits of using the log loss $\log P(y \mid x)$ as the target objective to optimize, as the log loss objective has been so effective in pretraining.

> [!note] 译文
> 潜变量（latent variable）视角对于理解涉及收集多个并行思维链（CoT）或在思维链上进行搜索的方法特别有用——这些算法可以看作是从后验分布 $P(z \mid x, y)$ 中采样。这一观点也表明了使用对数损失（log loss）$\log P(y \mid x)$ 作为优化目标的好处，因为对数损失目标在预训练中一直非常有效。

---

The strategy of generating intermediate steps before generating short answers, particularly for math problems, was explored by Ling, et al. 2017, who introduced the AQUA-RAT dataset, and then expanded by Cobbe et al. 2021, who introduced the Grade School Math (GSM) dataset. Cobbe et al. train a generator with supervised learning on human-written solutions and verifiers that predict the correctness of a candidate solution; they can then search over these solutions. Nye et al. (2021) experimented with intermediate thinking tokens as "scratchpads" and Wei et al. (2022) coined the now-standard term chain-of-thought (CoT).

> [!note] 译文
> 在生成简短答案之前先产生中间步骤的策略，尤其在数学问题中，由 Ling 等人于 2017 年进行了探索，他们引入了 AQUA-RAT 数据集；随后 Cobbe 等人于 2021 年进一步扩展，引入了 Grade School Math（GSM）数据集。Cobbe 等人使用监督学习在人类编写的解答上训练生成器，并训练验证器来预测候选解答的正确性；然后可以在这些解答上进行搜索。Nye 等人（2021）将中间思考 token 作为"scratchpads"进行实验，而 Wei 等人（2022）则创造了如今已成为标准术语的 chain-of-thought（CoT，思维链）。

---

Early work on improving CoT reasoning involved doing supervised learning on human-written reasoning traces or model-written traces filtered for answer correctness, where the latter can be seen as a rudimentary form of reinforcement learning (RL). Some other work found that one could significantly boost math performance of instruction tuned models by prompting them appropriately, with "think step by step" (Kojima et al. 2022) or more complex prompting to encourage the model to reflect on related knowledge first (Yasunaga et al. 2023).

> [!note] 译文
> 早期改进 CoT 推理的工作包括在人类编写的推理轨迹或经答案正确性筛选的模型生成轨迹上进行监督学习，后者可被视为一种初步的强化学习（RL）形式。另有研究发现，通过适当的提示可以显著提升指令微调模型的数学性能，例如使用"think step by step"（Kojima 等人，2022），或采用更复杂的提示以鼓励模型先反思相关知识（Yasunaga 等人，2023）。

---

Later work found that the CoT reasoning capabilities can be significantly improved by doing reinforcement learning on a dataset of problems with automatically checkable solutions, such as STEM problems with short answers, or coding tasks that can be checked with unit tests (Zelikman et al. 2022, Wang et al., 2023, Liu et al., 2023). This approach rose to prominence with the announcement of o1-preview, o3, and the R1 tech report (DeepSeek-AI, 2025), which showed that a simple recipe where a policy gradient algorithm could lead to strong performance.

> [!note] 译文
> 后续研究发现，通过在具有自动可验证解答的问题数据集上进行强化学习，可以显著提升 CoT 推理能力，例如答案较短的 STEM 问题，或可通过单元测试检查的编程任务（Zelikman 等人，2022；Wang 等人，2023；Liu 等人，2023）。随着 o1-preview、o3 以及 R1 技术报告（DeepSeek-AI，2025）的发布，这一方法逐渐声名鹊起，这些工作表明，一种简单的策略梯度算法配方就能带来强劲的性能表现。

---

The fundamental intent of test-time compute is to adaptively modify the model's output distribution at test time. There are various ways of utilizing test time resources for decoding to select better samples and thus alter the model's predictions towards a more desired distribution. Two main approaches for improving the decoding process are parallel sampling and sequential revision.

> [!note] 译文
> 测试时计算（test-time compute）的根本意图是在测试阶段自适应地调整模型的输出分布。利用测试时资源进行解码以选择更优样本，从而将模型预测推向更期望的分布，有多种实现方式。改进解码过程的两大主要方法是并行采样（parallel sampling）和顺序修正（sequential revision）。

---

Parallel sampling generates multiple outputs simultaneously, meanwhile providing guidance per step with process reward signals or using verifiers to judge the quality at the end. It is the most widely adopted decoding method to improve test time performance, such as best-of-$N$ or beam search. Self-consistency (Wang et al. 2023) is commonly used to select the answer with majority vote among multiple CoT rollouts when the ground truth is not available.

> [!note] 译文
> 并行采样同时生成多个输出，并在此过程中通过过程奖励信号（process reward signals）逐步提供引导，或在最后使用验证器判断质量。它是提升测试时性能最广泛采用的解码方法，例如 best-of-$N$ 或束搜索（beam search）。当真实答案不可用时，自一致性（self-consistency，Wang 等人，2023）通常被用于在多次 CoT rollout 中通过多数投票选出答案。

---

Sequential revision adapts the model's responses iteratively based on the output in the previous step, asking the model to intentionally reflect its existing response and correct mistakes. The revision process may have to rely on a fine-tuned model, as naively relying on the model's intrinsic capability of self-correction without external feedback may not lead to improvement (Kamoi et al. 2024, Huang et al. 2024).

> [!note] 译文
> 顺序修正基于前一步的输出迭代地调整模型的回答，要求模型有意识地反思现有回答并纠正错误。修正过程可能需要依赖经过微调的模型，因为天真地依赖模型内在的自我纠错能力而没有外部反馈，可能无法带来提升（Kamoi 等人，2024；Huang 等人，2024）。

---

Parallel sampling is simple, intuitive and easier to implement, but bounded by the model capability of whether it can achieve the correct solution in one-go. Sequential explicitly asks the model to reflect on mistakes but it is slower and requires extra care during implementation as it does run the risk of correct predictions being modified to be incorrect or introducing other types of hallucinations. These two methods can be used together. Snell et al. (2024) showed that easier questions benefit from purely sequential test-time compute, whereas harder questions often perform best with an optimal ratio of sequential to parallel compute.

> [!note] 译文
> 并行采样简单、直观且易于实现，但受限于模型能否一次性得出正确解答的能力。顺序修正明确要求模型反思错误，但它更慢，且在实现时需要格外小心，因为它确实存在将正确预测修改为错误，或引入其他类型幻觉（hallucination）的风险。这两种方法可以结合使用。Snell 等人（2024）表明，较简单的问题仅从纯粹的顺序测试时计算中获益，而较难的问题通常在顺序与并行计算的最优比例下表现最佳。

---

Given a generative model and a scoring function that we can use to score full or partial samples, there are various search algorithms we can use to find a high scoring sample. Best-of-$N$ is the simplest such algorithm: one just collects $N$ independent samples and chooses the highest-ranking sample according to some scoring function. Beam search is a more sophisticated search algorithm that makes the search process more adaptive, spending more sampling computation on more promising parts of the solution space.

> [!note] 译文
> 给定一个生成模型和一个可用于为完整或部分样本打分的评分函数，我们可以使用多种搜索算法来找到高分样本。Best-of-$N$ 是最简单的此类算法：只需收集 $N$ 个独立样本，并根据某个评分函数选择排名最高的样本。束搜索（beam search）是一种更复杂的搜索算法，它使搜索过程更具适应性，在解空间中更有希望的部分投入更多的采样计算。

---

Beam search maintains a set of promising partial sequences and alternates between extending them and pruning the less promising ones. As a selection mechanism, we can use a process reward model (PRM; Lightman et al. 2023) to guide beam search candidate selection. Xie et al. (2023) used LLM to evaluate how likely its own generated reasoning step is correct, formatted as a multiple-choice question and found that per-step self-evaluation reduces accumulative errors in multi-step reasoning during beam search decoding. Besides, during sampling, annealing the temperature helps mitigate aggregated randomness. These experiments by Xie et al. achieved 5-6% improvement on few-shot GSM8k, AQuA and StrategyQA benchmarks with the Codex model. Reward balanced search (short for "REBASE"; Wu et al. 2025) separately trained a process reward model (PRM) to determine how much each node should be expanded at each depth during beam search, according to the softmax-normalized reward scores. Jiang et al. (2024) trained their PRM, named "RATIONALYST", for beam search guidance on synthetic rationales conditioned on a large amount of unlabelled data. Good rationales are filtered based on whether they help reduce the neg log-prob of true answer tokens by a threshold, when comparing the difference between when the rationales is included in the context vs not. At inference time, RATIONALYST provides process supervision to the CoT generator by helping estimate log-prob of next reasoning steps ("implicit") or directly generating next reasoning steps as part of the prompt ("explicit").

> [!note] 译文
> 束搜索（beam search）维护一组有前景的部分序列，并在扩展它们和剪除较不具前景的序列之间交替进行。作为一种选择机制，我们可以使用过程奖励模型（process reward model, PRM; Lightman et al. 2023）来指导束搜索的候选选择。Xie et al. (2023) 使用大语言模型（LLM）评估其自身生成的推理步骤正确的可能性，将其格式化为多选题，并发现逐步自评估可以减少束搜索解码过程中多步推理的累积误差。此外，在采样过程中，对温度进行退火（annealing）有助于缓解聚合的随机性。Xie et al. 的这些实验在少样本 GSM8k、AQuA 和 StrategyQA 基准测试中使用 Codex 模型取得了 5-6% 的提升。Reward balanced search（简称 "REBASE"; Wu et al. 2025）单独训练了一个过程奖励模型（PRM），根据经过 softmax 归一化的奖励分数，来决定束搜索过程中每个深度上每个节点应扩展多少。Jiang et al. (2024) 训练了他们的 PRM，名为 "RATIONALYST"，用于基于大量未标注数据生成的合成推理链（rationales）上的束搜索指导。好的推理链通过比较将其包含在上下文中与不包含时，是否能帮助将真实答案 token 的负对数概率降低一个阈值来进行筛选。在推理时，RATIONALYST 通过帮助估计下一步推理步骤的对数概率（"隐式"），或直接将下一步推理步骤作为提示的一部分生成出来（"显式"），为 CoT 生成器提供过程监督。

---

Interestingly, it is possible to trigger the emergent chain-of-thought reasoning paths without explicit zero-shot or few-shot prompting. Wang & Zhou (2024) discovered that if we branch out at the first sampling tokens by retaining the top $k$ tokens with highest confidence, measured as the difference between top-1 and top-2 candidates during sampling, and then continue these $k$ sampling trials with greedy decoding onward, many of these sequences natively contain CoT. Especially when CoT does appear in the context, it leads to a more confident decoding of the final answer. To calculate the confidence of the final answer, the answer span needs to be identified by task-specific heuristics (e.g. last numerical values for math questions) or by prompting the model further with "So the answer is". The design choice of only branching out at the first token is based on the observation that early branching significantly enhances the diversity of potential paths, while later tokens are influenced a lot by previous sequences.

> [!note] 译文
> 有趣的是，无需显式的零样本或少样本提示，也有可能触发涌现的思维链（chain-of-thought）推理路径。Wang & Zhou (2024) 发现，如果我们在第一个采样 token 处进行分支，保留置信度最高的前 $k$ 个 token（以采样时 top-1 与 top-2 候选之间的差值衡量），然后继续对这 $k$ 个采样试验进行贪婪解码，这些序列中有许多天然地包含思维链（CoT）。特别是当 CoT 出现在上下文中时，它会导致对最终答案的更自信的解码。为了计算最终答案的置信度，答案片段需要通过任务特定的启发式方法（例如数学问题的最后一个数值）或通过进一步用 "So the answer is" 提示模型来识别。仅在第一个 token 处分支的设计选择是基于这样的观察：早期分支显著增强了潜在路径的多样性，而后续 token 则很大程度上受到前面序列的影响。

---

If the model can reflect and correct mistakes in past responses, we would expect the model to produce a nice sequence of iterative revision with increasing quality. However, this self-correction capability turns out to not exist intrinsically among LLMs and does not easily work out of the box, due to various failure modes, such as, (1) hallucination, including modifying correct responses to be incorrect; (2) behavior collapse to non-correcting behavior; e.g. making minor or no modification on the first incorrect responses; or (3) fail to generalize to distribution shift at test time. Experiments by Huang et al. (2024) showed that naively applying self-correction leads to worse performance and external feedback is needed for models to self improve, which can be based on matching ground truths, heuristics and task-specific metrics, unit tests results for coding questions (Shinn, et al. 2023), a stronger model (Zhang et al. 2024), as well as human feedback (Liu et al. 2023).

> [!note] 译文
> 如果模型能够反思并纠正过去回应中的错误，我们期望模型能产生一个质量逐步提升的迭代修正序列。然而，这种自我修正能力在大语言模型（LLMs）中并非内在存在，也不容易开箱即用，因为存在多种失效模式，例如：(1) 幻觉（hallucination），包括将正确的回答修改为错误的；(2) 行为坍缩为不修正的行为，例如对最初错误的回应只做微小修改或不做修改；或 (3) 无法在测试时的分布偏移上泛化。Huang et al. (2024) 的实验表明，天真地应用自我修正会导致性能下降，模型需要外部反馈才能自我改进，这种反馈可以基于匹配真实答案、启发式和任务特定指标、编码题目的单元测试结果（Shinn, et al. 2023）、更强的模型（Zhang et al. 2024），以及人类反馈（Liu et al. 2023）。

---

Self-correction learning (Welleck et al. 2023) aims to train a corrector model $P_\theta(y \mid y_0, x)$ given a fixed generator model $P_0(y_0 \mid x)$. While the generator model remains to be generic, the corrector model can task-specific and only does generation conditioned on an initial model response and additional feedback (e.g. a sentence, a compiler trace, unit test results; can be optional):

> [!note] 译文
> 自我修正学习（Self-correction learning; Welleck et al. 2023）旨在给定一个固定的生成器模型 $P_0(y_0 \mid x)$ 的情况下，训练一个修正器模型 $P_\theta(y \mid y_0, x)$。生成器模型保持通用性，而修正器模型可以是任务特定的，仅基于初始模型回应和额外反馈（例如一句话、编译器跟踪信息、单元测试结果；可为可选）进行生成：

---

Self-correction learning first generates first generates multiple outputs per prompt in the data pool;

> [!note] 译文
> 自我修正学习首先在数据池中为每个提示生成多个输出；

---

then create value-improving pairs by pairing two outputs for the same prompt together if one has a higher value than the other, (prompt $x$, hypothesis $y$, correction $y'$).

> [!note] 译文
> 然后通过将同一提示的两个输出配对来创建价值提升对，条件是其中一个的价值高于另一个，（提示 $x$、假设 $y$、修正 $y'$）。

---

These pairs are selected proportional to is improvement in value, $v(y') - v(y)$, and similarity between two outputs, $\text{Similarity}(y, y')$ to train the corrector model.

> [!note] 译文
> 这些配对根据其价值提升 $v(y') - v(y)$ 以及两个输出之间的相似度 $\text{Similarity}(y, y')$ 进行比例采样，用于训练纠正器模型。

---

To encourage exploration, the corrector provides new generations into the data pool as well. At the inference time, the corrector can be used iteratively to create a correction trajectory of sequential revision.

> [!note] 译文
> 为了鼓励探索，纠正器也会将新生成的内容加入到数据池中。在推理时，纠正器可以迭代使用，以创建一个顺序修正的纠正轨迹。

---

Recursive inspection (Qu et al. 2024) also aims to train a better corrector model but with a single model to do both generation and self-correction.

> [!note] 译文
> 递归检查（Qu et al. 2024）也旨在训练一个更好的纠正器模型，但它使用单个模型同时完成生成和自我纠正。

---

SCoRe (Self-Correction via Reinforcement Learning; Kumar et al. 2024) is a multi-turn RL approach to encourage the model to do self-correction by producing better answers at the second attempt than the one created at the first attempt. It composes two stages of training: stage 1 only maximizes the accuracy of the second attempt while enforcing a KL penalty only on the first attempt to avoid too much shifting of the first-turn responses from the base model behavior; stage 2 optimizes the accuracy of answers produced by both the first and second attempts. Ideally we do want to see performance at both first and second attempts to be better, but adding stage 1 prevents the behavior collapse where the model does minor or none edits on the first response, and stage 2 further improves the results.

> [!note] 译文
> SCoRe（通过强化学习进行自我纠正；Kumar et al. 2024）是一种多轮强化学习方法，旨在鼓励模型通过第二次尝试生成比第一次更好的答案来进行自我纠正。它包含两个训练阶段：阶段1仅最大化第二次尝试的准确性，同时仅在第一次尝试上施加 KL 散度惩罚，以避免第一轮回复过度偏离基础模型的行为；阶段2则优化第一次和第二次尝试生成答案的准确性。理想情况下，我们希望两次尝试的表现都能更好，但加入阶段1可以防止行为崩溃——即模型对第一次回复只做少量或不修改，而阶段2则进一步提升结果。

---

There's been a lot of recent success in using RL to improve the reasoning ability of language models, by using a collection of questions with ground truth answers (usually STEM problems and puzzles with easy to verify answers), and rewarding the model for getting the correct answer.Recent activity in this area was spurred by strong performance of the o-series models from OpenAI, and the subsequent releases of models and tech reports from DeepSeek.

> [!note] 译文
> 最近，使用强化学习来提升语言模型的推理能力取得了很大成功——通过收集带有标准答案的问题（通常是 STEM 问题和答案易于验证的谜题），并奖励模型答对正确答案。这一领域的近期进展受到了 OpenAI o系列模型强劲表现的推动，以及 DeepSeek 后续发布的模型和技术报告。

---

DeepSeek-R1 (DeepSeek-AI, 2025) is an open-source LLM designed to excel in tasks that require advanced reasoning skills like math, coding and logical problem solving. They run through 2 rounds of SFT-RL training, enabling R1 to be good at both reasoning and non-reasoning tasks.

> [!note] 译文
> DeepSeek-R1（DeepSeek-AI, 2025）是一个开源大语言模型，专为在需要高级推理技能的任务中表现出色而设计，如数学、编程和逻辑问题解决。它经历了两轮 SFT-强化学习训练，使 R1 在推理任务和非推理任务上都有良好表现。

---

Cold-start SFT is to fine-tune the DeepSeek-V3-Base base model on a collection of thousands of cold-start data. Without this step, the model has issues of poor readability and language mixing.

> [!note] 译文
> 冷启动 SFT 是指在数千条冷启动数据上微调 DeepSeek-V3-Base 基础模型。没有这个步骤，模型会存在可读性差和语言混杂的问题。

---

Reasoning-oriented RL trains a reasoning model on reasoning-only prompts with two types of rule-based rewards:

> [!note] 译文
> 面向推理的强化学习使用仅包含推理任务的提示来训练推理模型，并采用两种基于规则的奖励：

---

Format rewards: The model should wrap CoTs by <thinking> ... </thinking> tokens.

> [!note] 译文
> 格式奖励：模型应使用 `<thinking> ... </thinking>` 标记来包裹思维链。

---

Accuracy rewards: Whether the final answers are correct. The answer for math problems needs to be present in a specific format (e.g. in a box) to be verified reliably. For coding problems, a compiler is used to evaluate whether test cases pass.

> [!note] 译文
> 准确性奖励：最终答案是否正确。数学问题的答案需要以特定格式呈现（例如放在框中），才能被可靠验证。对于编程问题，则使用编译器来评估测试用例是否通过。

---

Rejection-sampling + non-reasoning SFT utilizes new SFT data created by rejection sampling on the RL checkpoint of step 2, combined with non-reasoning supervised data from DeepSeek-V3 in domains like writing, factual QA, and self-cognition, to retrain DeepSeek-V3-Base.

> [!note] 译文
> 拒绝采样 + 非推理 SFT：利用在步骤2的强化学习检查点上通过拒绝采样生成的新 SFT 数据，结合 DeepSeek-V3 在写作、事实问答和自我认知等领域的非推理监督数据，重新训练 DeepSeek-V3-Base。

---

Filter out CoTs with mixed languages, long paragraphs, and code blocks.

> [!note] 译文
> 过滤掉包含混合语言、长段落和代码块的思维链。

---

Include non-reasoning tasks using DeepSeek-V3 (DeepSeek-AI, 2024) pipeline.

> [!note] 译文
> 使用 DeepSeek-V3（DeepSeek-AI, 2024）流水线纳入非推理任务。

---

For certain non-reasoning tasks, call DeepSeek-V3 to generate potential CoTs before answering the question by prompting. But for simpler queries like "hello", CoT is not needed.

> [!note] 译文
> 对于某些非推理任务，在回答问题前通过提示调用 DeepSeek-V3 生成潜在的思维链。但对于像 `"hello"` 这样的简单查询，则不需要思维链。

---

Then fine-tune the DeepSeek-V3-Base on the total 800k samples for 2 epochs.

> [!note] 译文
> 然后在总共 80 万个样本上对 DeepSeek-V3-Base 进行 2 个 epoch 的微调。

---

The final RL stage trains the step 3 checkpoint on both reasoning and non-reasoning prompts, improving helpfulness, harmlessness and reasoning.

> [!note] 译文
> 最后的 RL（reinforcement learning，强化学习）阶段在推理和非推理提示上同时训练第 3 步的检查点，以提升有用性、无害性和推理能力。

---

Interestingly the DeepSeek team showed that with pure RL, no SFT stage, it is still possible to learn advanced reasoning capabilities like reflection and backtracking ("Aha moment"). The model naturally learns to spend more thinking tokens during the RL training process to solve reasoning tasks. The "aha moment" can emerge, referring to the model reflecting on previous mistakes and then trying alternative approaches to correct them. Later, various open source efforts happened for replicating R1 results like Open-R1, SimpleRL-reason, and TinyZero, all based on Qwen models. These efforts also confirmed that pure RL leads to great performance on math problems, as well as the emergent "aha moment".

> [!note] 译文
> DeepSeek 团队有趣地展示了，仅使用纯 RL（强化学习），没有 SFT 阶段，仍然可以学习到如反思和回溯（"Aha moment"）之类的高级推理能力。模型在 RL 训练过程中自然地学会花费更多的思考 token 来解决推理任务。"aha moment" 可能会出现，指的是模型反思之前的错误，然后尝试替代方法来纠正它们。后来，出现了各种开源工作来复现 R1 的结果，如 Open-R1、SimpleRL-reason 和 TinyZero，全部基于 Qwen 模型。这些工作也证实了纯 RL 在数学问题上表现出色，以及 "aha moment" 的涌现。

---

The DeepSeek team also shared some of their unsuccessful attempts. They failed to use process reward model (PRM) as it is hard to define per-step rubrics or determine whether an intermediate step is correct, meanwhile making the training more vulnerable to reward hacking. The efforts on MCTS (Monte Carlo Tree Search) also failed due to the large search space for language model tokens, in comparison to, say, chess; and training the fine-grained value model used for guiding the search is very challenging too. Failed attempts often provide unique insights and we would like to encourage the research community to share more about what did not work out.

> [!note] 译文
> DeepSeek 团队也分享了他们的一些失败尝试。他们未能成功使用过程奖励模型（PRM），因为很难定义每步的评分标准或判断中间步骤是否正确，同时这也使训练更容易受到 reward hacking（奖励黑客）的影响。他们在 MCTS（Monte Carlo Tree Search，蒙特卡洛树搜索）上的努力也失败了，因为与象棋等相比，语言模型 token 的搜索空间太大；而且用于指导搜索的细粒度价值模型的训练也非常具有挑战性。失败尝试往往能提供独特的见解，我们希望鼓励研究社区更多地分享哪些方法没有奏效。

---

During the reasoning steps, certain intermediate steps can be reliably and accurately solved by executing code or running mathematical calculations. Offloading that part of reasoning components into an external code interpreter, as in PAL (Program-Aided Language Model; Gao et al. 2022) or Chain of Code (Li et al. 2023), can extend the capability of LLM with external tools, eliminating the need for LLMs to learn to execute code or function as calculators themselves. These code emulators, like in Chain of Code, can be augmented by an LLM such that if a standard code interpreter fails, we have the option of using LLM to execute that line of code instead. Using code to enhance reasoning steps are especially beneficial for mathematical problems, symbolic reasoning and algorithmic tasks. These unit tests may not exist as part of the coding questions, and in those cases, we can instruct the model to self-generate unit tests for it to test against to verify the solution (Shinn, et al. 2023).

> [!note] 译文
> 在推理步骤中，某些中间步骤可以通过执行代码或运行数学计算来可靠且准确地解决。将这部分推理组件卸载到外部代码解释器中，如 PAL（Program-Aided Language Model; Gao et al. 2022）或 Chain of Code（Li et al. 2023），可以用外部工具扩展 LLM 的能力，消除 LLM 自身学习执行代码或充当计算器的需要。这些代码模拟器，如在 Chain of Code 中，可以由 LLM 增强，使得如果标准代码解释器失败，我们可以选择使用 LLM 来执行那行代码。使用代码来增强推理步骤对数学问题、符号推理和算法任务特别有益。这些单元测试可能并非编码问题的一部分，在那些情况下，我们可以指示模型自生成单元测试来验证解决方案（Shinn, et al. 2023）。

---

ReAct (Reason+Act; Yao et al. 2023) combines the action of searching the Wikipedia API and generation of reasoning traces, such that reasoning paths can incorporate external knowledge.

> [!note] 译文
> ReAct（Reason+Act; Yao et al. 2023）将搜索 Wikipedia API 的动作与推理轨迹的生成结合起来，使得推理路径可以整合外部知识。

---

o3 & o4-mini, recently released by OpenAI, are another two good examples where the reasoning process involves tool use like Web search, code execution and image processing. The team observed that large-scale reinforcement learning exhibits the same trend as in the GPT paradigm that "more compute = better performance".

> [!note] 译文
> OpenAI 最近发布的 o3 和 o4-mini 是另外两个很好的例子，其推理过程涉及工具使用，如网络搜索、代码执行和图像处理。团队观察到，大规模 reinforcement learning（强化学习）表现出与 GPT 范式相同的趋势，即"更多的计算 = 更好的性能"。

---

Deep learning models are often treated as black boxes and various interpretability methods have been proposed. Interpretability is useful for a couple reasons: first, it gives us an extra test to determine if the model is misaligned with its creators' intent, or if it's misbehaving in some way that we can't tell by monitoring its actions. Second, it can help us determine whether the model is using a sound process to compute its answers. Chain of thought provides an especially convenient form of interpretability, as it makes the model's internal process visible in natural language. This interpretability, however, rests on the assumption that the model truthfully describes its internal thought processes.

> [!note] 译文
> 深度学习模型常被视为黑箱，因此研究者提出了多种可解释性方法。可解释性的价值体现在两方面：首先，它为我们提供了一项额外的检验手段，用以判断模型是否与其设计者的意图存在偏差，或者是否在通过行为监控无法察觉的方式出现异常。其次，它有助于我们判断模型在计算答案时是否采用了合理的推理过程。思维链（Chain of Thought, CoT）提供了一种尤为便捷的可解释性形式，因为它将模型的内部推理过程以自然语言的形式呈现出来。然而，这种可解释性建立在一个前提假设之上，即模型能够如实地描述其内部思维过程。

---

Recent work showed that monitoring CoT of reasoning models can effectively detect model misbehavior such as reward hacking, and can even enable a weaker model to monitor a stronger model (Baker et al. 2025). Increasing test time compute can also lead to improved adversarial robustness (Zaremba et al. 2025); this makes sense intuitively, because thinking for longer should be especially useful when the model is presented with an unusual input, such as an adversarial example or jailbreak attempt – it can use the extra thinking time to make sense of the strange situation it's been presented with.

> [!note] 译文
> 近期研究表明，监控推理模型的思维链可以有效检测模型的异常行为，例如奖励黑客（reward hacking），甚至能让一个较弱的模型去监督更强的模型（Baker et al. 2025）。增加测试阶段的计算量也有助于提升对抗鲁棒性（Zaremba et al. 2025）；这从直觉上是合理的，因为当模型遇到非常规输入时——例如对抗样本或越狱尝试——更长的思考时间应当特别有用，它可以利用这些额外时间来理解所面临的异常情况。

---

Intuitively, model CoTs could be biased due to lack of explicit training objectives aimed at encouraging faithful reasoning. Or when we fine-tune the model on human-written explanations, those human-written samples may contain mistakes. Thus we cannot by default assume CoT is always faithful .

> [!note] 译文
> 从直觉上讲，模型的思维链可能存在偏差，因为目前缺乏旨在鼓励忠实推理的明确训练目标。或者，当我们使用人工撰写的解释对模型进行微调时，这些人工样本本身也可能包含错误。因此，我们不能默认假设思维链始终是忠实的。

---

Lanham et al. (2023) investigated several modes of CoT faithfulness failures by deliberately introducing mistakes into CoTs and measuring their impacts on the accuracy of a set of multiple choice tasks (e.g. AQuA, MMLU, ARC Challenge, TruthfulQA, HellaSwag):

> [!note] 译文
> Lanham et al. (2023) 通过故意在思维链中引入错误，并测量其对一组多项选择题任务准确率的影响，研究了思维链忠实性失效的几种模式（例如 AQuA、MMLU、ARC Challenge、TruthfulQA、HellaSwag）：

---

Mistake 1 (Early answering): The model may form a conclusion prematurely before CoT is generated. This is tested by early truncating or inserting mistakes into CoT. Different tasks revealed varying task-specific dependencies on CoT effectiveness; some have evaluation performance sensitive to truncated CoT but some do not. Wang et al. (2023) did similar experiments but with more subtle mistakes related to bridging objects or language templates in the formation of CoT.

> [!note] 译文
> 错误 1（过早作答）：模型可能在思维链生成之前就过早地形成了结论。研究者通过提前截断思维链或在其中插入错误来验证这一点。不同任务显示出对思维链有效性的任务特异性依赖程度各不相同；部分任务的评估性能对截断后的思维链较为敏感，而另一些则不然。Wang et al. (2023) 进行了类似的实验，但采用了更为隐蔽的错误类型，涉及思维链形成过程中的桥接对象或语言模板。

---

Mistake 2 (Uninformative tokens): Uninformative CoT tokens improve performance. This hypothesis is tested by replacing CoT with filler text (e.g. all periods) and this setup shows no accuracy increase and some tasks may suffer performance drop slightly when compared to no CoT.

> [!note] 译文
> 错误 2（无信息量的标记）：无信息量的思维链标记能够提升性能。该假设通过将思维链替换为填充文本（例如全为句点）来进行测试，结果表明这种设置并未带来准确率提升，且与不使用思维链相比，某些任务的性能可能会略有下降。

---

Mistake 3 (Human-unreadable encoding): Relevant information is encoded in a way that is hard for humans to understand. Paraphrasing CoTs in an non-standard way did not degrade performance across datasets, suggesting accuracy gains do not rely on human-readable reasoning.

> [!note] 译文
> 错误 3（人类难以理解的编码）：相关信息以人类难以理解的方式进行编码。以非标准方式改写思维链并未导致各数据集上的性能下降，这表明准确率的提升并不依赖于人类可读的推理过程。

---

Interestingly, Lanham et al. suggests that for multiple choice questions, smaller models may not be capable enough of utilizing CoT well, whereas larger models may have been able to solve the tasks without CoT. This dependency on CoT reasoning, measured by the percent of obtaining the same answer with vs without CoT, does not always increase with model size on multiple choice questions, but does increase with model size on addition tasks, implying that thinking time matters more for complex reasoning tasks.

> [!note] 译文
> 有趣的是，Lanham et al. 指出，对于多项选择题，较小的模型可能无法充分利用思维链，而较大的模型即使不使用思维链也可能能够完成这些任务。这种对思维链推理的依赖程度——通过使用与不使用思维链获得相同答案的比例来衡量——在多项选择题上并不总是随模型规模增大而增加，但在加法任务中确实随模型规模增大而增加，这意味着思考时间对于复杂推理任务更为重要。

---

