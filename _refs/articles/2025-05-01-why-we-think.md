# Why We Think

**Author:** Lilian Weng  
**Date:** 2025-05-01  
**URL:** https://lilianweng.github.io/posts/2025-05-01-thinking/  
**Tags:** language-model, reinforcement-learning, reasoning, long-read

---

Special thanks to John Schulman for a lot of super valuable feedback and direct edits on this post.

Test time compute (Graves et al. 2016, Ling, et al. 2017, Cobbe et al. 2021) and Chain-of-thought (CoT) (Wei et al. 2022, Nye et al. 2021), have led to significant improvements in model performance, while raising many research questions. This post aims to review recent developments in how to effectively use test-time compute (i.e. "thinking time") and why it helps.

The core idea is deeply connected to how humans think. We humans cannot immediately provide the answer for "What's 12345 times 56789?". Rather, it is natural to spend time pondering and analyzing before getting to the result, especially for complex problems. In Thinking, Fast and Slow (Kahneman, 2013), Daniel Kahneman characterizes human thinking into two modes, through the lens of the dual process theory:
- Fast thinking (System 1) operates quickly and automatically, driven by intuition and emotion while requiring little to no effort.
- Slow thinking (System 2) demands deliberate, logical thought and significant cognitive efforts.

One view of deep learning, is that neural networks can be characterized by the amount of computation and storage they can access in a forward pass, and if we optimize them to solve problems using gradient descent, the optimization process will figure out how to use these resources.

In Transformer models, the amount of computation (flops) that the model does for each generated token is roughly 2 times the number of parameters. CoT enables the model to perform far more flops of computation for each token of the answer that it is trying to compute. CoT has a nice property that it allows the model to use a variable amount of compute depending on the hardness of the problem.

A classic idea in machine learning is to define a probabilistic model with a latent (hidden) variable z and a visible variable y. Marginalizing over the possible values of the latent variable allows us to express a rich distribution over the visible variables, P(y) = sum_{z ~ P(z)} P(y | z).

## Parallel Sampling vs Sequential Revision

Two main approaches for improving the decoding process:

**Parallel sampling** generates multiple outputs simultaneously, providing guidance per step with process reward signals or using verifiers to judge the quality at the end. Best-of-N or beam search. Self-consistency (Wang et al. 2023) is commonly used to select the answer with majority vote among multiple CoT rollouts.

**Sequential revision** adapts the model's responses iteratively based on the output in the previous step, asking the model to intentionally reflect its existing response and correct mistakes.

Snell et al. (2024) showed that easier questions benefit from purely sequential test-time compute, whereas harder questions often perform best with an optimal ratio of sequential to parallel compute.

## Search Algorithms

- **Best-of-N**: collects N independent samples and chooses the highest-ranking sample
- **Beam search**: maintains a set of promising partial sequences, alternates between extending and pruning
- **Process Reward Model (PRM)**: guides beam search candidate selection
- **Reward balanced search (REBASE)**: separately trained PRM to determine how much each node should be expanded

## Self-Correction

Self-correction capability does not exist intrinsically among LLMs and does not easily work out of the box, due to:
1. Hallucination, including modifying correct responses to be incorrect
2. Behavior collapse to non-correcting behavior
3. Fail to generalize to distribution shift at test time

External feedback is needed for models to self improve.

## RL for Reasoning

DeepSeek-R1 runs through 2 rounds of SFT-RL training:
1. Cold-start SFT on thousands of cold-start data
2. Reasoning-oriented RL with format rewards and accuracy rewards
3. Rejection-sampling + non-reasoning SFT
4. Final RL stage on both reasoning and non-reasoning prompts

Interestingly, with pure RL (no SFT), the model still learns advanced reasoning capabilities like reflection and backtracking ("Aha moment").

## CoT Faithfulness

CoT could be biased due to lack of explicit training objectives aimed at encouraging faithful reasoning. Lanham et al. (2023) investigated several modes of CoT faithfulness failures:
- Early answering: model forms conclusion prematurely
- Uninformative tokens: filler text improves performance
- Human-unreadable encoding: relevant information encoded in hard-to-understand way
