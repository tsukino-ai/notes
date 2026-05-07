# Prompt Engineering

**Author:** Lilian Weng  
**Date:** 2023-03-15  
**URL:** https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/  
**Tags:** nlp, language-model, alignment, steerability, prompting

---

Goal: alignment and model steerability without updating model weights.

## Basic Prompting
- Zero-shot
- Few-shot: choice of prompt format, training examples, and order dramatically affects performance
  - Majority label bias, recency bias, common token bias (Zhao et al. 2021)

## Tips
- Choose semantically similar examples via k-NN
- Diverse representative set via graph-based approach
- Random order to avoid biases
- Be specific and precise, avoid "not do X" but specify what to do

## Chain-of-Thought (CoT)
- Few-shot CoT with manually written reasoning chains
- Zero-shot CoT: "Let's think step by step"
- Self-consistency sampling for improved reasoning
- Complexity-based consistency
- Tree of Thoughts for multi-path exploration

## Automatic Prompt Design
- AutoPrompt, Prefix-Tuning, P-tuning, Prompt-Tuning
- APE (Automatic Prompt Engineer): search over model-generated instruction candidates
- Clustering-based demonstration selection

## Augmented Language Models
- Retrieval: RAG, Google Search augmentation
- Programming Language: PAL, PoT (offload computation to interpreter)
- External APIs: TALM, Toolformer
