---
title: "MemGPT: Towards LLMs as Operating Systems"
authors: Charles Packer, Sarah Wooders, Kevin Lin, Vivian Fang, Shishir G. Patil, Ion Stoica, Joseph E. Gonzalez
source: https://arxiv.org/abs/2310.08560
date: 2023-10-12
tags:
  - LLM
  - Agent
  - Memory
  - Context
  - MemGPT
---

# MemGPT: Towards LLMs as Operating Systems

**Abstract**: Large language models (LLMs) have revolutionized AI, but are constrained by limited context windows, hindering their utility in tasks like extended conversations and document analysis. To enable using context beyond limited context windows, we propose virtual context management, a technique drawing inspiration from hierarchical memory systems in traditional operating systems that provide the appearance of large memory resources through data movement between fast and slow memory. Using this technique, we introduce MemGPT (Memory-GPT), a system that intelligently manages different memory tiers in order to effectively provide extended context within the LLM's limited context window, and utilizes interrupts to manage control flow between itself and the user. We evaluate our OS-inspired design in two domains where the limited context windows of modern LLMs severely handicaps their performance: document analysis, where MemGPT is able to analyze large documents that far exceed the underlying LLM's context window, and multi-session chat, where MemGPT can create conversational agents that remember, reflect, and evolve dynamically through long-term interactions with their users. We release MemGPT code and data for our experiments at https://memgpt.ai.

> [!note] 译文
> **摘要**：大语言模型（LLM）彻底改变了 AI，但受限于有限的上下文窗口，阻碍了它们在扩展对话和文档分析等任务中的实用性。为了在有限上下文窗口之外使用上下文，我们提出了**虚拟上下文管理**（virtual context management）技术，这一技术灵感来自传统操作系统中的分层内存系统——通过在快速内存和慢速内存之间的数据移动来提供大内存资源的假象。利用这一技术，我们介绍了 MemGPT（Memory-GPT），一个智能管理不同内存层级的系统，以在 LLM 有限的上下文窗口内有效提供扩展上下文，并利用中断来管理自身与用户之间的控制流。我们在两个领域评估了我们受操作系统启发的设计——现代 LLM 的有限上下文窗口在这两个领域中严重削弱了它们的性能：**文档分析**（MemGPT 能够分析远超底层 LLM 上下文窗口的大型文档）和**多会话聊天**（MemGPT 可以创建对话 Agent，通过长期交互记住、反思并动态进化）。我们在 https://memgpt.ai 发布了 MemGPT 代码和实验数据。

---

> **Note**: This saved version is based on the arXiv abstract page. For the full paper with all technical details, sections, and experiments, please download the PDF at https://arxiv.org/pdf/2310.08560.pdf.

> [!note] 译文
> **注意**：此保存版本基于 arXiv 摘要页面。包含所有技术细节、章节和实验的完整论文，请下载 PDF：https://arxiv.org/pdf/2310.08560.pdf。
