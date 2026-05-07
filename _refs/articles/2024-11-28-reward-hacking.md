# Reward Hacking in Reinforcement Learning

**Author:** Lilian Weng  
**Date:** 2024-11-28  
**URL:** https://lilianweng.github.io/posts/2024-11-28-reward-hacking/  
**Tags:** language-model, rlhf, alignment, safety, reinforcement-learning, long-read

---

Reward hacking occurs when a reinforcement learning (RL) agent exploits flaws or ambiguities in the reward function to achieve high rewards, without genuinely learning or completing the intended task. With the rise of language models and RLHF as a de facto alignment method, reward hacking has become a critical practical challenge.

## Related Concepts

- Reward hacking (Amodei et al., 2016)
- Reward corruption (Everitt et al., 2017)
- Reward tampering (Everitt et al. 2019)
- Specification gaming (Krakovna et al., 2020)
- Objective robustness (Koch et al. 2021)
- Goal misgeneralization (Langosco et al. 2022)
- Reward misspecifications (Pan et al. 2022)

## Goodhart's Law

"When a measure becomes a target, it ceases to be a good measure." Garrabrant (2017) categorized Goodhart's law into 4 variants:
- Regressional
- Extremal
- Causal
- Adversarial

## Reward Hacking in LLM/RLHF

### Hacking the Training Process
- RM overoptimization (Gao et al. 2022)
- U-Sophistry: RLHF increases human approval but not necessarily correctness (Wen et al. 2024)
- Sycophancy: model responses match user beliefs rather than truth (Shrama et al. 2023)

### Hacking the Evaluator
- LLM-as-grader biases: positional bias, self-bias
- In-Context Reward Hacking (ICRH): happens during feedback loops between LLM and evaluator

### Generalization of Hacking Skills
Reward hacking behavior generalizes across tasks. Models trained on easier hackable environments can generalize to directly rewriting their own reward function.

## Mitigations
- Adversarial reward functions
- Model lookahead
- Adversarial blinding
- Careful engineering / sandboxing
- Reward capping
- Counterexample resistance
- Combination of multiple rewards
- Decoupled approval (Uesato et al. 2020)
- Anomaly detection
- Data analysis of RLHF (SEAL)
