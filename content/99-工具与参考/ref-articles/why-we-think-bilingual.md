---
title: Why We Think — 中英逐句对照阅读
author: Lilian Weng
date: 2025-05-01
source: https://lilianweng.github.io/posts/2025-05-01-thinking/
---

# Why We Think — 中英逐句对照阅读

> 本文是 Lilian Weng 关于 test-time compute 与推理能力的综述文章。
> 每句英文原文下方紧跟中文译文，便于逐句对照学习。

Special thanks to John Schulman for a lot of super valuable feedback and direct edits on this post.
> 特别感谢 John Schulman 对本文提供了大量极具价值的反馈并进行了直接修改。

Test time compute (Graves et al. 2016, Ling, et al. 2017, Cobbe et al. 2021) and Chain-of-thought (CoT) (Wei et al. 2022, Nye et al. 2021), have led to significant improvements in model performance, while raising many research questions.
> Test-time compute（测试时计算）(Graves et al. 2016, Ling, et al. 2017, Cobbe et al. 2021) 和 Chain-of-thought (CoT)（思维链）(Wei et al. 2022, Nye et al. 2021) 显著提升了模型性能，同时也带来了许多研究问题。

This post aims to review recent developments in how to effectively use test-time compute (i.e. "thinking time") and why it helps.
> 本文旨在回顾如何有效利用 test-time compute（即"思考时间"）以及它为何有效的最新进展。

The core idea is deeply connected to how humans think.
> 核心思想与人类的思维方式密切相关。

We humans cannot immediately provide the answer for "What's 12345 times 56789?".
> 我们人类无法立即给出"12345 乘以 56789 等于多少？"的答案。

Rather, it is natural to spend time pondering and analyzing before getting to the result, especially for complex problems.
> 相反，在得出结果之前花时间思考和分析是很自然的，尤其是对于复杂的问题。

In Thinking, Fast and Slow (Kahneman, 2013), Daniel Kahneman characterizes human thinking into two modes, through the lens of the dual process theory :
> 在 *Thinking, Fast and Slow* (Kahneman, 2013) 中，Daniel Kahneman 通过双过程理论的视角将人类思维分为两种模式：

Fast thinking (System 1) operates quickly and automatically, driven by intuition and emotion while requiring little to no effort.
> 快思考（系统1）运作迅速且自动，由直觉和情绪驱动，几乎不需要付出努力。

Slow thinking (System 2) demands deliberate, logical thought and significant cognitive efforts.
> 慢思考（系统2）需要刻意的、逻辑性的思考以及大量的认知努力。

This mode of thinking consumes more mental energy and requires intentional engagement.
> 这种思维模式消耗更多脑力，需要有意识的投入。

Because System 1 thinking is fast and easy, it often ends up being the main decision driver, at the cost of accuracy and logic.
> 由于系统1思考快速且轻松，它往往成为主要的决策驱动力，代价是准确性和逻辑性。

It naturally relies on our brain's mental shortcuts (i.e., heuristics) and can lead to errors and biases.
> 它自然而然地依赖我们大脑的心理捷径（即启发式），并可能导致错误和偏见。

By consciously slowing down and taking more time to reflect, improve and analyze, we can engage in System 2 thinking to challenge our instincts and make more rational choices.
> 通过有意识地放慢速度，花更多时间反思、改进和分析，我们可以调动系统2思考来挑战本能，做出更理性的选择。

One view of deep learning, is that neural networks can be characterized by the amount of computation and storage they can access in a forward pass, and if we optimize them to solve problems using gradient descent, the optimization process will figure out how to use these resources–they'll figure out how to organize these resources into circuits for calculation and information storage.
> 关于深度学习的一种观点是，神经网络可以通过其在一次 forward pass（前向传播）中能够访问的计算量和存储量来刻画，如果我们使用 gradient descent（梯度下降）来优化它们以解决问题，优化过程将自行摸索如何利用这些资源——它们会搞清楚如何将这些资源组织成用于计算和信息存储的电路。

From this view, if we design an architecture or system that can do more computation at test time, and we train it to effectively use this resource, it'll work better.
> 从这个角度来看，如果我们设计一种能够在测试时进行更多计算的架构或系统，并训练它有效利用这一资源，它的表现就会更好。

In Transformer models, the amount of computation (flops) that the model does for each generated token is roughly 2 times the number of parameters.
> 在 Transformer 模型中，模型为每个生成的 token 所做的计算量（flops）大约是参数数量的2倍。

For sparse models like mixture of experts (MoE), only a fraction of the parameters are used in each forward pass, so computation = 2 * parameters / sparsity, where sparsity is the fraction of experts active.
> 对于像 mixture of experts (MoE)（混合专家模型）这样的稀疏模型，每次 forward pass 只使用一部分参数，因此计算量 = 2 * 参数数量 / 稀疏度，其中稀疏度是指被激活的专家比例。

On the other hand, CoT enables the model to perform far more flops of computation for each token of the answer that it is trying to compute.
> 另一方面，CoT 使模型能够为其试图计算的答案中的每个 token 执行远多于以往的计算量（flops）。

In fact, CoT has a nice property that it allows the model to use a variable amount of compute depending on the hardness of the problem.
> 事实上，CoT 有一个很好的特性：它允许模型根据问题的难度使用可变的计算量。

A classic idea in machine learning is to define a probabilistic model with a latent (hidden) variable $z$ and a visible variable $y$, where $y$ is given to our learning algorithm.
> 机器学习中的一个经典思想是，定义一个带有 latent variable（潜变量）$z$ 和可见变量 $y$ 的概率模型，其中 $y$ 被提供给我们的学习算法。

Marginalizing (summing) over the possible values of the latent variable allows us to express a rich distribution over the visible variables, $P(y) = \sum_{z \sim P(z)} P(y \mid z)$.
> 对 latent variable 的可能取值进行边缘化（求和），使我们能够对可见变量表达丰富的分布：$P(y) = \sum_{z \sim P(z)} P(y \mid z)$。

For example, we can model the distribution over math problems and solutions by letting $x$ denote a problem statement, $y$ be ground truth answer or proof, and $z$ as a free-form thought process that leads to the proof.
> 例如，我们可以通过令 $x$ 表示问题陈述、$y$ 表示真实答案或证明、$z$ 表示导致该证明的自由形式思维过程，来对数学问题和解的分布进行建模。

The marginal probability distribution to optimize would be $P(y \mid x) = \sum_{z \sim p(z\mid x)} P(y \mid x, z)$
> 需要优化的边缘概率分布为 $P(y \mid x) = \sum_{z \sim p(z\mid x)} P(y \mid x, z)$。

The latent variable perspective is particularly useful for understanding methods that involve collecting multiple parallel CoTs or searching over the CoT–these algorithms can be seen as sampling from the posterior $P(z \mid x, y)$.
> latent variable 的视角对于理解涉及收集多条并行 CoT 或在 CoT 上进行搜索的方法特别有用——这些算法可以看作是从后验分布 $P(z \mid x, y)$ 中采样。

This view also suggests the benefits of using the log loss $\log P(y \mid x)$ as the target objective to optimize, as the log loss objective has been so effective in pretraining.
> 这一观点也表明了使用 log loss（对数损失）$\log P(y \mid x)$ 作为优化目标的好处，因为 log loss 目标在预训练中已被证明非常有效。

The strategy of generating intermediate steps before generating short answers, particularly for math problems, was explored by Ling, et al. 2017, who introduced the AQUA-RAT dataset, and then expanded by Cobbe et al. 2021, who introduced the Grade School Math (GSM) dataset.
> 在生成简短答案之前先生成中间步骤的策略，特别是在数学问题上的应用，由 Ling 等人（2017）进行了探索，他们引入了 AQUA-RAT 数据集；随后 Cobbe 等人（2021）对其进行了扩展，引入了小学数学（GSM）数据集。

Cobbe et al. train a generator with supervised learning on human-written solutions and verifiers that predict the correctness of a candidate solution; they can then search over these solutions.
> Cobbe 等人使用监督学习在人类撰写的解决方案上训练生成器，并训练验证器来预测候选解决方案的正确性；然后他们可以在这些解决方案上进行搜索。

Nye et al. (2021) experimented with intermediate thinking tokens as "scratchpads" and Wei et al. (2022) coined the now-standard term chain-of-thought (CoT).
> Nye 等人（2021）尝试了将中间思考 token 作为"草稿纸"的实验，Wei 等人（2022）则创造了如今已成为标准术语的 chain-of-thought（CoT，思维链）。

Early work on improving CoT reasoning involved doing supervised learning on human-written reasoning traces or model-written traces filtered for answer correctness, where the latter can be seen as a rudimentary form of reinforcement learning (RL).
> 早期改进 CoT 推理的工作涉及对人类撰写的推理轨迹或模型撰写的推理轨迹进行监督学习（后者经过答案正确性筛选），其中后者可以被视为一种初级的 reinforcement learning, RL（强化学习）形式。

Some other work found that one could significantly boost math performance of instruction tuned models by prompting them appropriately, with "think step by step" (Kojima et al. 2022) or more complex prompting to encourage the model to reflect on related knowledge first (Yasunaga et al. 2023).
> 其他一些研究发现，通过适当的提示可以显著提升指令微调模型的数学性能，例如使用"think step by step"（Kojima 等，2022）或更复杂的提示来鼓励模型先反思相关知识（Yasunaga 等，2023）。

Later work found that the CoT reasoning capabilities can be significantly improved by doing reinforcement learning on a dataset of problems with automatically checkable solutions, such as STEM problems with short answers, or coding tasks that can be checked with unit tests (Zelikman et al. 2022, Wang et al., 2023, Liu et al., 2023).
> 后来的研究发现，通过在具有自动可检查解决方案的问题数据集上进行强化学习，可以显著提升 CoT 推理能力，例如具有简短答案的 STEM 问题，或可以通过单元测试检查的编码任务（Zelikman 等，2022；Wang 等，2023；Liu 等，2023）。

This approach rose to prominence with the announcement of o1-preview, o3, and the R1 tech report (DeepSeek-AI, 2025), which showed that a simple recipe where a policy gradient algorithm could lead to strong performance.
> 随着 o1-preview、o3 以及 R1 技术报告（DeepSeek-AI，2025）的发布，这一方法声名鹊起，这些研究表明一种简单的策略梯度算法配方可以带来强劲的性能表现。

The fundamental intent of test-time compute is to adaptively modify the model's output distribution at test time.
> 测试时计算的根本意图是在测试时自适应地修改模型的输出分布。

There are various ways of utilizing test time resources for decoding to select better samples and thus alter the model's predictions towards a more desired distribution.
> 利用测试时资源进行解码以选择更好的样本，从而将模型预测调整为更理想的分布，有多种方法。

Two main approaches for improving the decoding process are parallel sampling and sequential revision.
> 改进解码过程的两种主要方法是并行采样和顺序修正。

Parallel sampling generates multiple outputs simultaneously, meanwhile providing guidance per step with process reward signals or using verifiers to judge the quality at the end.
> 并行采样同时生成多个输出，同时通过过程奖励信号为每一步提供指导，或使用验证器在最终判断质量。

It is the most widely adopted decoding method to improve test time performance, such as best-of-$N$ or beam search.
> 这是提升测试时性能最广泛采用的解码方法，例如 best-of-$N$ 或 beam search（束搜索）。

Self-consistency (Wang et al. 2023) is commonly used to select the answer with majority vote among multiple CoT rollouts when the ground truth is not available.
> Self-consistency（自一致性）（Wang 等，2023）通常在无法获得真实答案时，用于通过多数投票从多个 CoT  rollout 中选择答案。

Sequential revision adapts the model's responses iteratively based on the output in the previous step, asking the model to intentionally reflect its existing response and correct mistakes.
> 顺序修正根据前一步的输出迭代调整模型的响应，要求模型有意识地反思其现有响应并纠正错误。

The revision process may have to rely on a fine-tuned model, as naively relying on the model's intrinsic capability of self-correction without external feedback may not lead to improvement (Kamoi et al. 2024, Huang et al. 2024).
> 修正过程可能需要依赖微调后的模型，因为天真地依赖模型固有的自我修正能力而缺乏外部反馈可能不会带来改进（Kamoi 等，2024；Huang 等，2024）。

Parallel sampling is simple, intuitive and easier to implement, but bounded by the model capability of whether it can achieve the correct solution in one-go.
> 并行采样简单、直观且易于实现，但受限于模型能否一次性得到正确解的能力。

Sequential explicitly asks the model to reflect on mistakes but it is slower and requires extra care during implementation as it does run the risk of correct predictions being modified to be incorrect or introducing other types of hallucinations.
> 顺序修正明确要求模型反思错误，但它更慢，且在实现过程中需要格外小心，因为它确实存在将正确预测修改为错误，或引入其他类型 hallucination（幻觉）的风险。

These two methods can be used together.
> 这两种方法可以结合使用。

Snell et al. (2024) showed that easier questions benefit from purely sequential test-time compute, whereas harder questions often perform best with an optimal ratio of sequential to parallel compute.
> Snell 等人（2024）表明，较简单的问题受益于纯顺序测试时计算，而较难的问题通常在顺序计算与并行计算的最佳比例下表现最好。

Given a generative model and a scoring function that we can use to score full or partial samples, there are various search algorithms we can use to find a high scoring sample.
> 给定一个生成模型和一个可用于对完整或部分样本进行评分的评分函数，我们可以使用各种搜索算法来找到高分样本。

Best-of-$N$ is the simplest such algorithm: one just collects $N$ independent samples and chooses the highest-ranking sample according to some scoring function.
> Best-of-$N$ 是这类算法中最简单的一种：只需收集 $N$ 个独立样本，然后根据某个评分函数选择排名最高的样本。

Beam search is a more sophisticated search algorithm that makes the search process more adaptive, spending more sampling computation on more promising parts of the solution space.
> Beam search 是一种更复杂的搜索算法，它使搜索过程更具适应性，在解空间中更有前景的部分投入更多的采样计算。

Beam search maintains a set of promising partial sequences and alternates between extending them and pruning the less promising ones.
> Beam search 维护一组有前景的部分序列，并在扩展它们和剪枝较不有前景的序列之间交替进行。

As a selection mechanism, we can use a process reward model (PRM; Lightman et al. 2023) to guide beam search candidate selection.
> 作为一种选择机制，我们可以使用 process reward model, PRM（过程奖励模型；Lightman 等，2023）来指导 beam search 候选选择。

Xie et al. (2023) used LLM to evaluate how likely its own generated reasoning step is correct, formatted as a multiple-choice question and found that per-step self-evaluation reduces accumulative errors in multi-step reasoning during beam search decoding.
> Xie 等人（2023）使用 LLM 评估其自身生成的推理步骤正确的可能性，将其格式化为多项选择题，并发现逐步自评估可以减少 beam search 解码过程中多步推理的累积误差。

Besides, during sampling, annealing the temperature helps mitigate aggregated randomness.
> 此外，在采样过程中，退火温度有助于缓解累积的随机性。

These experiments by Xie et al. achieved 5-6% improvement on few-shot GSM8k, AQuA and StrategyQA benchmarks with the Codex model.
> Xie 等人的这些实验在 few-shot GSM8k、AQuA 和 StrategyQA 基准上使用 Codex 模型取得了 5-6% 的提升。

Reward balanced search (short for "REBASE"; Wu et al. 2025) separately trained a process reward model (PRM) to determine how much each node should be expanded at each depth during beam search, according to the softmax-normalized reward scores.
> Reward balanced search（简称"REBASE"；Wu 等，2025）单独训练了一个 process reward model（PRM）来确定在 beam search 过程中每个深度上每个节点应扩展多少，依据是 softmax 归一化后的奖励分数。

Jiang et al. (2024) trained their PRM, named "RATIONALYST", for beam search guidance on synthetic rationales conditioned on a large amount of unlabelled data.
> Jiang 等人（2024）训练了他们的 PRM，名为"RATIONALYST"，用于在基于大量无标签数据条件的合成推理上进行 beam search 指导。

Good rationales are filtered based on whether they help reduce the neg log-prob of true answer tokens by a threshold, when comparing the difference between when the rationales is included in the context vs not.
> 好的推理会根据它们是否有助于将真实答案 token 的负对数概率降低一定阈值来筛选，通过比较上下文中包含推理与不包含推理时的差异。

At inference time, RATIONALYST provides process supervision to the CoT generator by helping estimate log-prob of next reasoning steps ("implicit") or directly generating next reasoning steps as part of the prompt ("explicit").
> 在推理时，RATIONALYST 通过帮助估计下一步推理的对数概率（"隐式"）或直接将下一步推理生成为提示的一部分（"显式"），为 CoT 生成器提供过程监督。

Interestingly, it is possible to trigger the emergent chain-of-thought reasoning paths without explicit zero-shot or few-shot prompting.
> 有趣的是，无需显式的零样本或少样本提示，就有可能触发涌现的思维链推理路径。

Wang & Zhou (2024) discovered that if we branch out at the first sampling tokens by retaining the top $k$ tokens with highest confidence, measured as the difference between top-1 and top-2 candidates during sampling, and then continue these $k$ sampling trials with greedy decoding onward, many of these sequences natively contain CoT.
> Wang & Zhou（2024）发现，如果我们在第一个采样 token 处进行分支，保留置信度最高的前 $k$ 个 token（置信度衡量为采样时 top-1 与 top-2 候选之间的差异），然后继续使用贪心解码进行这 $k$ 个采样试验，许多序列天然包含 CoT。

Especially when CoT does appear in the context, it leads to a more confident decoding of the final answer.
> 特别是当 CoT 确实出现在上下文中时，它会导致对最终答案的更自信解码。

To calculate the confidence of the final answer, the answer span needs to be identified by task-specific heuristics (e.g. last numerical values for math questions) or by prompting the model further with "So the answer is".
> 为了计算最终答案的置信度，答案片段需要通过任务特定的启发式方法（例如数学问题的最后一个数值）或通过进一步提示模型"So the answer is"来识别。

The design choice of only branching out at the first token is based on the observation that early branching significantly enhances the diversity of potential paths, while later tokens are influenced a lot by previous sequences.
> 仅在第一个 token 处进行分支的设计选择基于这样的观察：早期分支显著增强了潜在路径的多样性，而后续 token 在很大程度上受前面序列的影响。

If the model can reflect and correct mistakes in past responses, we would expect the model to produce a nice sequence of iterative revision with increasing quality.
> 如果模型能够反思并纠正过去响应中的错误，我们会期望模型产生一个质量逐渐提升的迭代修正序列。

However, this self-correction capability turns out to not exist intrinsically among LLMs and does not easily work out of the box, due to various failure modes, such as, (1) hallucination, including modifying correct responses to be incorrect; (2) behavior collapse to non-correcting behavior; e.g. making minor or no modification on the first incorrect responses; or (3) fail to generalize to distribution shift at test time.
> 然而，这种自我修正能力在 LLM 中并非内在存在，也不容易开箱即用，这是由于各种失效模式导致的，例如：（1）hallucination（幻觉），包括将正确的响应修改为错误；（2）行为坍缩为非修正行为，例如对第一个错误响应只做微小修改或不做修改；或（3）无法泛化到测试时的分布偏移。

Experiments by Huang et al. (2024) showed that naively applying self-correction leads to worse performance and external feedback is needed for models to self improve, which can be based on matching ground truths, heuristics and task-specific metrics, unit tests results for coding questions (Shinn, et al. 2023), a stronger model (Zhang et al. 2024), as well as human feedback (Liu et al. 2023).
> Huang 等人（2024）的实验表明，天真地应用自我修正会导致性能下降，模型需要外部反馈才能自我改进，这些反馈可以基于匹配真实答案、启发式和任务特定指标、编码问题的单元测试结果（Shinn 等，2023）、更强的模型（Zhang 等，2024）以及人类反馈（Liu 等，2023）。

Self-correction learning (Welleck et al. 2023) aims to train a corrector model $P_\theta(y \mid y_0, x)$ given a fixed generator model $P_0(y_0 \mid x)$.
> Self-correction learning（Welleck 等，2023）旨在给定一个固定的生成器模型 $P_0(y_0 \mid x)$，训练一个修正器模型 $P_\theta(y \mid y_0, x)$。

While the generator model remains to be generic, the corrector model can task-specific and only does generation conditioned on an initial model response and additional feedback (e.g. a sentence, a compiler trace, unit test results; can be optional):
> 虽然生成器模型保持通用，但修正器模型可以是任务特定的，并且仅基于初始模型响应和额外反馈（例如一个句子、编译器跟踪、单元测试结果；可选）进行生成：

Self-correction learning first generates first generates multiple outputs per prompt in the data pool;
> Self-correction learning 首先在数据池中为每个提示生成多个输出；

then create value-improving pairs by pairing two outputs for the same prompt together if one has a higher value than the other, (prompt $x$, hypothesis $y$, correction $y'$).
> 然后通过将同一提示的两个输出配对来创建价值改进对，如果其中一个的价值高于另一个，则配对为（提示 $x$、假设 $y$、修正 $y'$）。

These pairs are selected proportional to is improvement in value, $v(y') - v(y)$, and similarity between two outputs, $\text{Similarity}(y, y')$ to train the corrector model.
> 这些配对的选择与价值改进 $v(y') - v(y)$ 以及两个输出之间的相似度 $\text{Similarity}(y, y')$ 成正比，用于训练纠错模型。

To encourage exploration, the corrector provides new generations into the data pool as well.
> 为了鼓励探索，纠错器也会向数据池提供新生成的结果。

At the inference time, the corrector can be used iteratively to create a correction trajectory of sequential revision.
> 在推理时，纠错器可以迭代使用，以创建顺序修正的纠错轨迹。

Recursive inspection (Qu et al. 2024) also aims to train a better corrector model but with a single model to do both generation and self-correction.
> 递归检查（Qu et al. 2024）也旨在训练一个更好的纠错模型，但它使用单一模型同时完成生成和 self-correction（自我纠正）。

SCoRe (Self-Correction via Reinforcement Learning; Kumar et al. 2024) is a multi-turn RL approach to encourage the model to do self-correction by producing better answers at the second attempt than the one created at the first attempt.
> SCoRe（Self-Correction via Reinforcement Learning，通过强化学习进行自我纠正；Kumar et al. 2024）是一种多轮 RL（reinforcement learning，强化学习）方法，旨在鼓励模型进行 self-correction（自我纠正），通过在第二次尝试时产生比第一次更好的答案。

It composes two stages of training: stage 1 only maximizes the accuracy of the second attempt while enforcing a KL penalty only on the first attempt to avoid too much shifting of the first-turn responses from the base model behavior; stage 2 optimizes the accuracy of answers produced by both the first and second attempts.
> 它由两个训练阶段组成：阶段 1 仅最大化第二次尝试的准确率，同时仅在第一次尝试上强制执行 KL divergence（KL 散度）惩罚，以避免首轮响应过度偏离基础模型的行为；阶段 2 则优化第一次和第二次尝试所产生答案的准确率。

Ideally we do want to see performance at both first and second attempts to be better, but adding stage 1 prevents the behavior collapse where the model does minor or none edits on the first response, and stage 2 further improves the results.
> 理想情况下，我们确实希望看到第一次和第二次尝试的表现都更好，但加入阶段 1 可以防止模型在第一次响应中只做少量或不做任何编辑的行为崩溃，而阶段 2 则进一步提升结果。

There's been a lot of recent success in using RL to improve the reasoning ability of language models, by using a collection of questions with ground truth answers (usually STEM problems and puzzles with easy to verify answers), and rewarding the model for getting the correct answer.
> 最近，使用 RL（reinforcement learning，强化学习）来提升语言模型的推理能力取得了许多成功，具体方法是使用一组带有标准答案的问题（通常是 STEM 问题和容易验证答案的谜题），并在模型得出正确答案时给予奖励。

Recent activity in this area was spurred by strong performance of the o-series models from OpenAI, and the subsequent releases of models and tech reports from DeepSeek.
> 该领域的近期活动由 OpenAI 的 o 系列模型的强劲表现，以及 DeepSeek 随后发布的模型和技术报告所推动。

DeepSeek-R1 (DeepSeek-AI, 2025) is an open-source LLM designed to excel in tasks that require advanced reasoning skills like math, coding and logical problem solving.
> DeepSeek-R1（DeepSeek-AI, 2025）是一个开源 LLM，旨在擅长需要高级推理技能的任务，如数学、编程和逻辑问题求解。

They run through 2 rounds of SFT-RL training, enabling R1 to be good at both reasoning and non-reasoning tasks.
> 他们进行了两轮 SFT（Supervised Fine-Tuning，监督微调）-RL 训练，使 R1 能够同时擅长推理和非推理任务。

Cold-start SFT is to fine-tune the DeepSeek-V3-Base base model on a collection of thousands of cold-start data.
> Cold-start（冷启动）SFT 是在数千条 cold-start（冷启动）数据上微调 DeepSeek-V3-Base 基础模型。

Without this step, the model has issues of poor readability and language mixing.
> 没有这一步，模型会存在可读性差和语言混合的问题。

Reasoning-oriented RL trains a reasoning model on reasoning-only prompts with two types of rule-based rewards:
> 面向推理的 RL 仅使用推理提示来训练推理模型，并采用两种基于规则的奖励：

Format rewards: The model should wrap CoTs by <thinking> ... </thinking> tokens.
> 格式奖励：模型应使用 <thinking> ... </thinking> 标记来包裹 CoT。

Accuracy rewards: Whether the final answers are correct.
> 准确率奖励：最终答案是否正确。

The answer for math problems needs to be present in a specific format (e.g. in a box) to be verified reliably.
> 数学问题的答案需要以特定格式呈现（例如放在方框中），才能被可靠地验证。

For coding problems, a compiler is used to evaluate whether test cases pass.
> 对于编程问题，则使用编译器来评估测试用例是否通过。

Rejection-sampling + non-reasoning SFT utilizes new SFT data created by rejection sampling on the RL checkpoint of step 2, combined with non-reasoning supervised data from DeepSeek-V3 in domains like writing, factual QA, and self-cognition, to retrain DeepSeek-V3-Base.
> 拒绝采样 + 非推理 SFT 利用在步骤 2 的 RL 检查点上通过拒绝采样生成的新 SFT 数据，结合来自 DeepSeek-V3 的非推理监督数据（涵盖写作、事实问答和自我认知等领域），重新训练 DeepSeek-V3-Base。

Filter out CoTs with mixed languages, long paragraphs, and code blocks.
> 过滤掉包含混合语言、长段落和代码块的 CoT。

Include non-reasoning tasks using DeepSeek-V3 (DeepSeek-AI, 2024) pipeline.
> 使用 DeepSeek-V3（DeepSeek-AI, 2024）的流程来包含非推理任务。

For certain non-reasoning tasks, call DeepSeek-V3 to generate potential CoTs before answering the question by prompting.
> 对于某些非推理任务，在通过提示回答问题之前，调用 DeepSeek-V3 生成潜在的 CoT。

But for simpler queries like "hello", CoT is not needed.
> 但对于像 "hello" 这样更简单的查询，不需要 CoT。

Then fine-tune the DeepSeek-V3-Base on the total 800k samples for 2 epochs.
> 然后在总共 80 万样本上对 DeepSeek-V3-Base 进行 2 个 epoch 的微调。

The final RL stage trains the step 3 checkpoint on both reasoning and non-reasoning prompts, improving helpfulness, harmlessness and reasoning.
> 最终的 RL（强化学习）阶段在推理和非推理提示上训练第 3 步的检查点，以提升有用性、无害性和推理能力。

Interestingly the DeepSeek team showed that with pure RL, no SFT stage, it is still possible to learn advanced reasoning capabilities like reflection and backtracking ("Aha moment").
> 有趣的是，DeepSeek 团队表明，仅凭纯 RL（强化学习），没有 SFT 阶段，仍然可以学习到反思和回溯等高级推理能力（"Aha moment"）。

The model naturally learns to spend more thinking tokens during the RL training process to solve reasoning tasks.
> 模型在 RL（强化学习）训练过程中自然地学会花费更多思考 token 来解决推理任务。

The "aha moment" can emerge, referring to the model reflecting on previous mistakes and then trying alternative approaches to correct them.
> "Aha moment" 可能会出现，指的是模型反思先前的错误，然后尝试替代方法来纠正它们。

Later, various open source efforts happened for replicating R1 results like Open-R1, SimpleRL-reason, and TinyZero, all based on Qwen models.
> 后来，各种开源努力致力于复现 R1 的结果，如 Open-R1、SimpleRL-reason 和 TinyZero，全部基于 Qwen 模型。

These efforts also confirmed that pure RL leads to great performance on math problems, as well as the emergent "aha moment".
> 这些努力也证实了纯 RL（强化学习）在数学问题上能带来出色的性能，以及涌现的 "aha moment"。

The DeepSeek team also shared some of their unsuccessful attempts.
> DeepSeek 团队还分享了一些他们未成功的尝试。

They failed to use process reward model (PRM) as it is hard to define per-step rubrics or determine whether an intermediate step is correct, meanwhile making the training more vulnerable to reward hacking（奖励黑客）.
> 他们未能成功使用过程奖励模型（PRM），因为很难定义逐步的评分细则或判断中间步骤是否正确，同时这也使训练更容易受到 reward hacking（奖励黑客）的影响。

The efforts on MCTS（蒙特卡洛树搜索）also failed due to the large search space for language model tokens, in comparison to, say, chess; and training the fine-grained value model used for guiding the search is very challenging too.
> MCTS（蒙特卡洛树搜索）方面的努力也失败了，因为语言模型 token 的搜索空间非常庞大，比如与国际象棋相比；而且训练用于指导搜索的细粒度价值模型也非常具有挑战性。

Failed attempts often provide unique insights and we would like to encourage the research community to share more about what did not work out.
> 失败的尝试往往能提供独特的见解，我们希望鼓励研究社区更多地分享哪些方法没有奏效。

During the reasoning steps, certain intermediate steps can be reliably and accurately solved by executing code or running mathematical calculations.
> 在推理步骤中，某些中间步骤可以通过执行代码或运行数学计算来可靠且准确地解决。

Offloading that part of reasoning components into an external code interpreter, as in PAL (Program-Aided Language Model; Gao et al. 2022) or Chain of Code (Li et al. 2023), can extend the capability of LLM with external tools, eliminating the need for LLMs to learn to execute code or function as calculators themselves.
> 将这部分推理组件卸载到外部代码解释器中，如 PAL（Program-Aided Language Model; Gao et al. 2022）或 Chain of Code（Li et al. 2023），可以通过外部工具扩展 LLM 的能力，消除了 LLM 自身需要学习执行代码或充当计算器的必要性。

These code emulators, like in Chain of Code, can be augmented by an LLM such that if a standard code interpreter fails, we have the option of using LLM to execute that line of code instead.
> 这些代码模拟器，如 Chain of Code 中的那样，可以由 LLM 增强，这样如果标准代码解释器失败，我们可以选择使用 LLM 来执行该行代码。

Using code to enhance reasoning steps are especially beneficial for mathematical problems, symbolic reasoning and algorithmic tasks.
> 使用代码来增强推理步骤对数学问题、符号推理和算法任务尤其有益。

These unit tests may not exist as part of the coding questions, and in those cases, we can instruct the model to self-generate unit tests for it to test against to verify the solution (Shinn, et al. 2023).
> 这些单元测试可能并不作为编程问题的一部分存在，在这种情况下，我们可以指示模型自生成单元测试来验证解决方案（Shinn, et al. 2023）。

ReAct (Reason+Act; Yao et al. 2023) combines the action of searching the Wikipedia API and generation of reasoning traces, such that reasoning paths can incorporate external knowledge.
> ReAct（Reason+Act; Yao et al. 2023）结合了搜索 Wikipedia API 的动作和推理轨迹的生成，使得推理路径可以融入外部知识。

o3 & o4-mini, recently released by OpenAI, are another two good examples where the reasoning process involves tool use like Web search, code execution and image processing.
> OpenAI 最近发布的 o3 和 o4-mini 是另外两个很好的例子，其推理过程涉及使用工具，如网络搜索、代码执行和图像处理。

The team observed that large-scale reinforcement learning exhibits the same trend as in the GPT paradigm that "more compute = better performance".
> 该团队观察到，大规模 reinforcement learning（强化学习）展现出与 GPT 范式相同的趋势，即"更多计算 = 更好性能"。

Deep learning models are often treated as black boxes and various interpretability methods have been proposed.
> 深度学习模型常被视为黑箱，人们为此提出了各种 interpretability（可解释性）方法。

Interpretability is useful for a couple reasons: first, it gives us an extra test to determine if the model is misaligned with its creators' intent, or if it's misbehaving in some way that we can't tell by monitoring its actions.
> 可解释性有两个主要用途：首先，它为我们提供了一个额外的检验手段，用于判断模型是否与其创建者的意图不一致，或者是否以某种我们无法通过监控其行为发现的方式表现异常。

Second, it can help us determine whether the model is using a sound process to compute its answers.
> 其次，它可以帮助我们判断模型在计算答案时是否采用了合理的过程。

Chain of thought provides an especially convenient form of interpretability, as it makes the model's internal process visible in natural language.
> Chain of thought, CoT（思维链）提供了一种特别便捷的可解释性形式，因为它使模型的内部过程以自然语言的形式呈现出来。

This interpretability, however, rests on the assumption that the model truthfully describes its internal thought processes.
> 然而，这种可解释性建立在模型如实描述其内部思维过程的假设之上。

Recent work showed that monitoring CoT of reasoning models can effectively detect model misbehavior such as reward hacking, and can even enable a weaker model to monitor a stronger model (Baker et al. 2025).
> 近期研究表明，监控推理模型的 CoT 可以有效检测模型的不良行为，例如 reward hacking（奖励黑客），甚至能让一个较弱的模型去监控一个更强的模型（Baker et al. 2025）。

Increasing test time compute can also lead to improved adversarial robustness (Zaremba et al. 2025); this makes sense intuitively, because thinking for longer should be especially useful when the model is presented with an unusual input, such as an adversarial example or jailbreak attempt – it can use the extra thinking time to make sense of the strange situation it's been presented with.
> 增加测试时的计算量也能提升 adversarial robustness（对抗鲁棒性）（Zaremba et al. 2025）；直观上这是合理的，因为当模型遇到不寻常的输入（如对抗样本或越狱尝试）时，更长时间的思考应该特别有用——它可以利用额外的思考时间来理解自己所面对的异常情境。

Intuitively, model CoTs could be biased due to lack of explicit training objectives aimed at encouraging faithful reasoning.
> 直观上，模型的 CoT 可能存在偏差，因为缺乏旨在鼓励忠实推理的明确训练目标。

Or when we fine-tune the model on human-written explanations, those human-written samples may contain mistakes.
> 或者，当我们在人工撰写的解释上微调模型时，这些人工样本可能包含错误。

Thus we cannot by default assume CoT is always faithful .
> 因此，我们不能默认假设 CoT 始终是忠实的。

Lanham et al. (2023) investigated several modes of CoT faithfulness failures by deliberately introducing mistakes into CoTs and measuring their impacts on the accuracy of a set of multiple choice tasks (e.g. AQuA, MMLU, ARC Challenge, TruthfulQA, HellaSwag):
> Lanham et al. (2023) 通过在 CoT 中故意引入错误，并测量其对一组多项选择任务（例如 AQuA、MMLU、ARC Challenge、TruthfulQA、HellaSwag）准确率的影响，研究了 CoT 忠实性失效的几种模式：

Mistake 1 (Early answering): The model may form a conclusion prematurely before CoT is generated.
> 错误1（过早作答）：模型可能在 CoT 生成之前就过早地形成了结论。

This is tested by early truncating or inserting mistakes into CoT.
> 研究者通过提前截断或在 CoT 中插入错误来检验这一点。

Different tasks revealed varying task-specific dependencies on CoT effectiveness; some have evaluation performance sensitive to truncated CoT but some do not.
> 不同任务显示出对 CoT 有效性的任务特定依赖程度各不相同；有些任务的评估性能对截断后的 CoT 敏感，而有些则不然。

Wang et al. (2023) did similar experiments but with more subtle mistakes related to bridging objects or language templates in the formation of CoT.
> Wang et al. (2023) 进行了类似的实验，但引入了更微妙的错误，这些错误与 CoT 形成过程中的桥接对象或语言模板相关。

Mistake 2 (Uninformative tokens): Uninformative CoT tokens improve performance.
> 错误2（无信息量的标记）：无信息量的 CoT 标记可以提升性能。

This hypothesis is tested by replacing CoT with filler text (e.g. all periods) and this setup shows no accuracy increase and some tasks may suffer performance drop slightly when compared to no CoT.
> 研究者通过用填充文本（例如全是句点）替换 CoT 来检验这一假设，实验结果表明准确率并未提高，且与没有 CoT 相比，某些任务的性能可能会略有下降。

Mistake 3 (Human-unreadable encoding): Relevant information is encoded in a way that is hard for humans to understand.
> 错误3（人类不可读的编码）：相关信息以一种人类难以理解的方式进行编码。

Paraphrasing CoTs in an non-standard way did not degrade performance across datasets, suggesting accuracy gains do not rely on human-readable reasoning.
> 以非标准方式改写 CoT 并未导致各数据集上的性能下降，这表明准确率的提升并不依赖于人类可读的推理过程。

Interestingly, Lanham et al. suggests that for multiple choice questions, smaller models may not be capable enough of utilizing CoT well, whereas larger models may have been able to solve the tasks without CoT.
> 有趣的是，Lanham et al. 指出，对于多项选择题，较小的模型可能不足以很好地利用 CoT，而较大的模型即使没有 CoT 也可能已经能够解决这些任务。

This dependency on CoT reasoning, measured by the percent of obtaining the same answer with vs without CoT, does not always increase with model size on multiple choice questions, but does increase with model size on addition tasks, implying that thinking time matters more for complex reasoning tasks.
> 这种对 CoT 推理的依赖性——通过使用与不使用 CoT 获得相同答案的百分比来衡量——在多项选择题上并不总是随模型规模增大而增加，但在加法任务上确实随模型规模增大而增加，这意味着思考时间对复杂推理任务更为重要。

