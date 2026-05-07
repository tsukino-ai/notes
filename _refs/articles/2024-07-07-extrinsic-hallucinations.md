# Extrinsic Hallucinations in LLMs

**Author:** Lilian Weng  
**Date:** 2024-07-07  
**URL:** https://lilianweng.github.io/posts/2024-07-07-hallucination/  
**Tags:** nlp, language-model, safety, hallucination, factuality

---

Two types of hallucination:
- **In-context hallucination**: model output should be consistent with source content in context
- **Extrinsic hallucination**: model output should be grounded by pre-training dataset / world knowledge

## Causes

**Pre-training Data Issues**: out-of-date, missing, or incorrect information in training corpus

**Fine-tuning New Knowledge**: Gekhman et al. 2024 found that fine-tuning LLMs on new knowledge encourages hallucinations. Unknown examples are fitted slower than Known ones. The model starts to hallucinate when it learns most of the Unknown examples.

## Detection

- **FActScore**: atomic fact precision
- **SAFE**: Search-Augmented Factuality Evaluator, uses LM as agent to iteratively issue Google Search queries
- **SelfCheckGPT**: consistency check against multiple samples
- **TruthfulQA**: adversarially constructed to emphasize human falsehoods
- **SelfAware**: measures whether models know what they don't know

## Anti-Hallucination Methods

**RAG-based:**
- RARR: Retrofit Attribution using Research and Revision
- FAVA: Factuality Verification with Augmented Knowledge
- Self-RAG: Self-reflective retrieval-augmented generation

**Chain of Actions:**
- CoVe: Chain-of-Verification
- RECITE: Recitation-augmented generation

**Sampling:**
- Factual-nucleus sampling
- Inference-Time Intervention (ITI)

**Fine-tuning:**
- FLAME: Factuality-Aware Alignment
- Factuality tuning with DPO
- WebGPT / GopherCite: attribution training
