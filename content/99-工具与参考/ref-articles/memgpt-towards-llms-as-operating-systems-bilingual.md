---
title: 'MemGPT: Towards LLMs as Operating Systems'
author: Charles Packer, Sarah Wooders, Kevin Lin, Vivian Fang, Shishir G. Patil, Ion Stoica, Joseph E. Gonzalez
date: 2023-10-12
source: https://arxiv.org/abs/2310.08560
---

# MemGPT: Towards LLMs as Operating Systems

> [!note] 译文
> MemGPT：将大语言模型作为操作系统

---

**Charles Packer, Sarah Wooders, Kevin Lin, Vivian Fang, Shishir G. Patil, Ion Stoica, Joseph E. Gonzalez**

University of California, Berkeley

---

## Abstract

Large language models (LLMs) have revolutionized AI, but are constrained by limited context windows, hindering their utility in tasks like extended conversations and document analysis. To enable using context beyond limited context windows, we propose virtual context management, a technique drawing inspiration from hierarchical memory systems in traditional operating systems which provide the illusion of an extended virtual memory via paging between physical memory and disk. Using this technique, we introduce MemGPT (MemoryGPT), a system that intelligently manages different storage tiers in order to effectively provide extended context within the LLM's limited context window. We evaluate our OS-inspired design in two domains where the limited context windows of modern LLMs severely handicaps their performance: document analysis, where MemGPT is able to analyze large documents that far exceed the underlying LLM's context window, and multi-session chat, where MemGPT can create conversational agents that remember, reflect, and evolve dynamically through long-term interactions with their users.

> [!note] 译文
> 大语言模型（LLM）彻底改变了人工智能，但受限于有限的上下文窗口，阻碍了其在扩展对话和文档分析等任务中的实用性。为了在有限上下文窗口之外使用上下文，我们提出了虚拟上下文管理技术，该技术借鉴了传统操作系统中的分层内存系统——通过物理内存和磁盘之间的分页来提供扩展虚拟内存的 illusion。利用这一技术，我们引入了 MemGPT（MemoryGPT），一个智能管理不同存储层级的系统，以在 LLM 有限的上下文窗口内有效提供扩展上下文。我们在两个领域评估了这种受操作系统启发的设计：文档分析（MemGPT 能够分析远超底层 LLM 上下文窗口的大型文档）和多会话聊天（MemGPT 能够创建能够记住、反思并通过与用户的长期交互动态进化的对话智能体）。

---

## 1. Introduction

In recent years, large language models (LLMs) and their underlying transformer architecture have become the cornerstone of conversational AI and have led to a wide array of consumer and enterprise applications.

> [!note] 译文
> 近年来，大语言模型（LLM）及其底层 Transformer 架构已成为对话式人工智能的基石，并催生了广泛的消费级和企业级应用。

---

Despite these advances, the limited fixed-length context windows used by LLMs significantly hinders their applicability to long conversations or reasoning about long documents. For example, the most widely used open-source LLMs can only support a few dozen back-and-forth messages or reason about a short document before exceeding their maximum input length.

> [!note] 译文
> 尽管取得了这些进展，LLM 使用的有限固定长度上下文窗口严重阻碍了其在长对话或长文档推理中的应用。例如，最广泛使用的开源 LLM 只能支持几十轮来回消息，或在超出最大输入长度之前推理一个短文档。

---

Directly extending the context length of transformers incurs a quadratic increase in computational time and memory cost due to the transformer architecture's self-attention mechanism, making the design of new long-context architectures a pressing research challenge. While developing longer models is an active area of research, even if we could overcome the computational challenges of context scaling, recent research shows that long-context models struggle to utilize additional context effectively. As consequence, given the considerable resources needed to train state-of-the-art LLMs and diminishing returns of context scaling, there is a critical need for alternative techniques to support long context.

> [!note] 译文
> 由于 Transformer 架构的自注意力机制，直接扩展 Transformer 的上下文长度会导致计算时间和内存成本的二次增长，这使得新长上下文架构的设计成为一个紧迫的研究挑战。虽然开发更长的模型是一个活跃的研究领域，但即使我们能够克服上下文扩展的计算挑战，最近的研究表明长上下文模型也难以有效利用额外的上下文。因此，鉴于训练最先进的 LLM 需要大量资源，且上下文扩展的收益递减，迫切需要替代技术来支持长上下文。

---

In this paper, we study how to provide the illusion of an infinite context while continuing to use fixed-context models. Our approach borrows from the idea of virtual memory paging that was developed to enable applications to work on datasets that far exceed the available memory by paging data between main memory and disk. We leverage the recent progress in function calling abilities of LLM agents to design MemGPT, an OS-inspired LLM system for virtual context management. Using function calls, LLM agents can read and write to external data sources, modify their own context, and choose when to return responses to the user.

> [!note] 译文
> 在本文中，我们研究了如何在使用固定上下文模型的同时提供无限上下文的 illusion。我们的方法借鉴了虚拟内存分页的思想——该技术通过在主内存和磁盘之间分页数据，使应用程序能够处理远超可用内存的数据集。我们利用 LLM 智能体函数调用能力的最新进展来设计 MemGPT，一个受操作系统启发的虚拟上下文管理 LLM 系统。通过函数调用，LLM 智能体可以读写外部数据源、修改自己的上下文，并选择何时向用户返回响应。

---

These capabilities allow LLMs to effective "page" in and out information between context windows (analogous to "main memory" in operating systems) and external storage, similar to hierarchical memory in traditional OSes. In addition, function calls can be leveraged to manage control flow between context management, response generation, and user interactions. This allows for an agent to choose to iteratively modify what is in its context for a single task, thereby more effectively utilizing its limited context.

> [!note] 译文
> 这些能力使 LLM 能够有效地在上下文窗口（类似于操作系统中的"主内存"）和外部存储之间"分页"进出信息，类似于传统操作系统中的分层内存。此外，函数调用可用于管理上下文管理、响应生成和用户交互之间的控制流。这使智能体能够选择迭代地修改其上下文中单个任务的内容，从而更有效地利用其有限的上下文。

---

In MemGPT, we treat context windows as a constrained memory resource, and design a memory hierarchy for LLMs analogous to memory tiers used in traditional OSes. Applications in traditional OSes interact with virtual memory, which provides an illusion of there being more memory resources than are actually available in physical memory by the OS paging overflow data to disk and retrieving data back into memory when accessed by applications. To provide a similar illusion of longer context length, we allow the LLM to manage what is placed in its own context via an 'LLM OS', which we call MemGPT. MemGPT enables the LLM to retrieve relevant historical data missing from what is placed in-context, and also evict less relevant data from context and into external storage systems.

> [!note] 译文
> 在 MemGPT 中，我们将上下文窗口视为受限的内存资源，并为 LLM 设计了类似于传统操作系统中使用的内存层级的内存层次结构。传统操作系统中的应用程序与虚拟内存交互，虚拟内存通过操作系统将溢出数据分页到磁盘并在应用程序访问时将数据检索回内存，提供了比物理内存中实际可用内存资源更多的 illusion。为了提供类似的更长上下文长度的 illusion，我们允许 LLM 通过"LLM 操作系统"（我们称之为 MemGPT）管理放置在其自身上下文中的内容。MemGPT 使 LLM 能够检索上下文中缺失的相关历史数据，并将不太相关的数据从上下文中逐出到外部存储系统。

---

The combined use of a memory-hierarchy, OS functions and event-based control flow allow MemGPT to handle unbounded context using LLMs that have finite context windows. To demonstrate the utility of our new OS-inspired LLM system, we evaluate MemGPT on two domains where the performance of existing LLMs is severely limited by finite context: document analysis, where the length of standard text files can quickly exceed the input capacity of modern LLMs, and conversational agents, where LLMs bound by limited conversation windows lack context awareness, persona consistency, and long-term memory during extended conversations.

> [!note] 译文
> 内存层次结构、操作系统功能和基于事件的控制流的结合使用，使 MemGPT 能够使用具有有限上下文窗口的 LLM 处理无界上下文。为了展示我们新的受操作系统启发的 LLM 系统的实用性，我们在两个领域评估了 MemGPT：文档分析（标准文本文件的长度可能很快超过现代 LLM 的输入容量）和对话智能体（受有限对话窗口限制的 LLM 在扩展对话期间缺乏上下文感知、角色一致性和长期记忆）。

---

## 2. MemGPT (MemoryGPT)

MemGPT's OS-inspired multi-level memory architecture delineates between two primary memory types: main context (analogous to main memory/physical memory/RAM) and external context (analogous to disk memory/disk storage). Main context consists of the LLM prompt tokens — anything in main context is considered in-context and can be accessed by the LLM processor during inference. External context refers to any information that is held outside of the LLM's fixed context window. This out-of-context data must always be explicitly moved into main context in order for it to be passed to the LLM processor during inference.

> [!note] 译文
> MemGPT 受操作系统启发的多级内存架构区分了两种主要内存类型：主上下文（类似于主内存/物理内存/RAM）和外部上下文（类似于磁盘内存/磁盘存储）。主上下文由 LLM 提示词 token 组成——主上下文中的任何内容都被视为上下文内，可以在推理期间由 LLM 处理器访问。外部上下文指保存在 LLM 固定上下文窗口之外的任何信息。这些上下文外数据必须始终显式移入主上下文，以便在推理期间传递给 LLM 处理器。

---

MemGPT provides function calls that allow the LLM processor to manage its own memory without any user intervention.

> [!note] 译文
> MemGPT 提供函数调用，使 LLM 处理器能够在无需任何用户干预的情况下管理自己的内存。

---

### 2.1. Main context (prompt tokens)

The prompt tokens in MemGPT are split into three contiguous sections: the system instructions, working context, and FIFO Queue.

> [!note] 译文
> MemGPT 中的提示词 token 被分成三个连续部分：系统指令、工作上下文和 FIFO 队列。

---

The system instructions are read-only (static) and contain information on the MemGPT control flow, the intended usage of the different memory levels, and instructions on how to use the MemGPT functions.

> [!note] 译文
> 系统指令是只读的（静态的），包含有关 MemGPT 控制流、不同内存级别的预期用途以及如何使用 MemGPT 函数的说明。

---

Working context is a fixed-size read/write block of unstructured text, writeable only via MemGPT function calls. In conversational settings, working context is intended to be used to store key facts, preferences, and other important information about the user and the persona the agent is adopting, allowing the agent to converse fluently with the user.

> [!note] 译文
> 工作上下文是一个固定大小的非结构化文本读写块，只能通过 MemGPT 函数调用写入。在对话设置中，工作上下文用于存储有关用户和智能体所采用角色的关键事实、偏好和其他重要信息，使智能体能够与用户流畅地交谈。

---

The FIFO queue stores a rolling history of messages, including messages between the agent and user, as well as system messages and function call inputs and outputs. The first index in the FIFO queue stores a system message containing a recursive summary of messages that have been evicted from the queue.

> [!note] 译文
> FIFO 队列存储消息滚动历史，包括智能体和用户之间的消息，以及系统消息和函数调用的输入输出。FIFO 队列的第一个索引存储一条系统消息，包含已从队列中逐出的消息的递归摘要。

---

### 2.2. Queue Manager

The queue manager manages messages in recall storage and the FIFO queue. When a new message is received by the system, the queue manager appends the incoming messages to the FIFO queue, concatenates the prompt tokens and triggers the LLM inference to generate LLM output. The queue manager writes both the incoming message and the generated LLM output to recall storage. When messages in recall storage are retrieved via a MemGPT function call, the queue manager appends them to the back of the queue to reinsert them into the LLM's context window.

> [!note] 译文
> 队列管理器管理召回存储和 FIFO 队列中的消息。当系统收到新消息时，队列管理器将传入消息追加到 FIFO 队列，连接提示词 token 并触发 LLM 推理以生成 LLM 输出。队列管理器将传入消息和生成的 LLM 输出都写入召回存储。当通过 MemGPT 函数调用检索召回存储中的消息时，队列管理器将它们追加到队列末尾以重新插入 LLM 的上下文窗口。

---

The queue manager is also responsible for controlling context overflow via a queue eviction policy. When the prompt tokens exceed the 'warning token count' of the underlying LLM's context window (e.g. 70% of the context window), the queue manager inserts a system message into the queue warning the LLM of an impending queue eviction (a 'memory pressure' warning) to allow the LLM to use MemGPT functions to store important information contained in the FIFO queue to working context or archival storage. When the prompt tokens exceed the 'flush token count' (e.g. 100% of the context window), the queue manager flushes the queue to free up space: the queue manager evicts a specific count of messages, generates a new recursive summary using the existing recursive summary and evicted messages. Once the queue is flushed, the evicted messages are no longer in-context, however they are stored indefinitely in recall storage and readable via MemGPT function calls.

> [!note] 译文
> 队列管理器还负责通过队列逐出策略控制上下文溢出。当提示词 token 超过底层 LLM 上下文窗口的"警告 token 计数"（例如上下文窗口的 70%）时，队列管理器在队列中插入一条系统消息，警告 LLM 即将发生的队列逐出（"内存压力"警告），以允许 LLM 使用 MemGPT 函数将 FIFO 队列中包含的重要信息存储到工作上下文或档案存储中。当提示词 token 超过"刷新 token 计数"（例如上下文窗口的 100%）时，队列管理器刷新队列以释放空间：队列管理器逐出特定数量的消息，使用现有的递归摘要和逐出的消息生成新的递归摘要。一旦队列被刷新，逐出的消息就不再处于上下文中，但它们会无限期地存储在召回存储中，并可通过 MemGPT 函数调用读取。

---

### 2.3. Function executor (handling of completion tokens)

MemGPT orchestrates data movement between main context and external context via function calls that are generated by the LLM processor. Memory edits and retrieval are entirely self-directed: MemGPT autonomously updates and searches through its own memory based on the current context. For instance, it can decide when to move items between contexts and modify its main context to better reflect its evolving understanding of its current objectives and responsibilities. We implement self-directed editing and retrieval by providing explicit instructions within the system instructions that guide the LLM on how to interact with the MemGPT memory systems.

> [!note] 译文
> MemGPT 通过 LLM 处理器生成的函数调用来编排主上下文和外部上下文之间的数据移动。内存编辑和检索完全自主：MemGPT 根据当前上下文自主更新和搜索自己的内存。例如，它可以决定何时在上下文之间移动项目，并修改其主上下文以更好地反映其对当前目标和职责的不断演变的理解。我们通过在系统指令中提供明确的说明来实现自主编辑和检索，指导 LLM 如何与 MemGPT 内存系统交互。

---

During each inference cycle, the LLM processor takes main context as input, and generates an output string. This output string is parsed by MemGPT to ensure correctness, and if the parser validates the function arguments the function is executed. The results, including any runtime errors, are then fed back to the processor by MemGPT. This feedback loop enables the system to learn from its actions and adjust its behavior accordingly.

> [!note] 译文
> 在每个推理周期中，LLM 处理器将主上下文作为输入，并生成一个输出字符串。MemGPT 解析此输出字符串以确保正确性，如果解析器验证了函数参数，则执行该函数。然后，MemGPT 将结果（包括任何运行时错误）反馈给处理器。这个反馈循环使系统能够从其行为中学习并相应地调整其行为。

---

### 2.4. Control flow and function chaining

In MemGPT, events trigger LLM inference: events are generalized inputs to MemGPT and can consist of user messages, system messages, user interactions, and timed events that are run on a regular schedule (allowing MemGPT to run 'unprompted' without user intervention). MemGPT processes events with a parser to convert them into plain text messages that can be appended to main context.

> [!note] 译文
> 在 MemGPT 中，事件触发 LLM 推理：事件是 MemGPT 的通用输入，可以包括用户消息、系统消息、用户交互以及按定期计划运行的时间事件（允许 MemGPT 在没有用户干预的情况下"无提示"运行）。MemGPT 使用解析器处理事件，将其转换为可追加到主上下文的纯文本消息。

---

Function chaining allows MemGPT to execute multiple function calls sequentially before returning control to the user. In MemGPT, functions can be called with a special flag that requests control be immediately returned to the processor after the requested function completes execution. If this flag is present, MemGPT will add the function output to main context and continue processor execution. If this flag is not present (a yield), MemGPT will not run the LLM processor until the next external event trigger.

> [!note] 译文
> 函数链允许 MemGPT 在将控制权返回给用户之前顺序执行多个函数调用。在 MemGPT 中，函数可以使用一个特殊标志调用，该标志请求在所请求函数完成执行后立即将控制权返回给处理器。如果存在此标志，MemGPT 会将函数输出添加到主上下文并继续处理器执行。如果不存在此标志（yield），MemGPT 将不会运行 LLM 处理器，直到下一个外部事件触发。

---

## 3. Experiments

We assess MemGPT in two long-context domains: conversational agents and document analysis. For conversational agents, we expand the existing Multi-Session Chat dataset and introduce two new dialogue tasks that evaluate an agent's ability to retain knowledge across long conversations. For document analysis, we benchmark MemGPT on existing tasks for question answering and key-value retrieval over lengthy documents. We also propose a new nested key-value retrieval task requiring collating information across multiple data sources, which tests the ability of an agent to collate information from multiple data sources (multihop retrieval).

> [!note] 译文
> 我们在两个长上下文领域评估 MemGPT：对话智能体和文档分析。对于对话智能体，我们扩展现有的多会话聊天数据集，并引入两个新的对话任务来评估智能体在长对话中保留知识的能力。对于文档分析，我们在现有任务上对 MemGPT 进行基准测试，包括长文档上的问答和键值检索。我们还提出了一个新的嵌套键值检索任务，需要从多个数据源整合信息，测试智能体从多个数据源整合信息（多跳检索）的能力。

---

### 3.1. MemGPT for conversational agents

Conversational agents like virtual companions and personalized assistants aim to engage users in natural, long-term interactions, potentially spanning weeks, months, or even years. This creates challenges for models with fixed-length contexts, which can only reference a limited history of the conversation. An 'infinite context' agent should seamlessly handle continuous exchanges without boundary or reset.

> [!note] 译文
> 像虚拟伴侣和个性化助手这样的对话智能体旨在与用户进行自然的长期交互，可能持续数周、数月甚至数年。这为具有固定长度上下文的模型带来了挑战，因为它们只能引用有限的对话历史。一个"无限上下文"智能体应该能够无缝处理连续的交流，没有边界或重置。

---

When conversing with a user, such an agent must satisfy two key criteria: (1) Consistency — The agent should maintain conversational coherence. New facts, preferences, and events mentioned should align with prior statements from both the user and agent. (2) Engagement — The agent should draw on long-term knowledge about the user to personalize responses. Referencing prior conversations makes dialogue more natural and engaging.

> [!note] 译文
> 当与用户交谈时，这样的智能体必须满足两个关键标准：(1) 一致性——智能体应保持对话连贯性。提到的新事实、偏好和事件应与用户和智能体之前的陈述一致。(2) 参与度——智能体应利用关于用户的长期知识来个性化响应。引用先前的对话使对话更自然、更吸引人。

---

#### 3.1.1. Deep Memory Retrieval Task (Consistency)

We introduce a new 'deep memory retrieval' (DMR) task based on the MSC dataset designed to test the consistency of a conversational agent. In DMR, the conversational agent is asked a question by the user that explicitly refers back to a prior conversation and has a very narrow expected answer range. We evaluate the quality of the generated response against the 'gold response' using ROUGE-L scores and an 'LLM judge'.

> [!note] 译文
> 我们基于 MSC 数据集引入了一个新的"深度记忆检索"（DMR）任务，旨在测试对话智能体的一致性。在 DMR 中，用户向对话智能体提出一个明确引用先前对话且预期答案范围非常狭窄的问题。我们使用 ROUGE-L 分数和"LLM 评判员"来评估生成响应与"黄金响应"的质量。

---

MemGPT utilizes memory to maintain coherence: Table 2 shows the performance of MemGPT vs the fixed-memory baselines. We compare MemGPT using different underlying LLMs, and compare against using the base LLM without MemGPT as a baseline. The baselines are able to see a lossy summarization of the past five conversations to mimic an extended recursive summarization procedure, while MemGPT instead has access to the full conversation history but must access it via paginated search queries to recall memory. In this task, we see that MemGPT clearly improves the performance of the underlying base LLM.

> [!note] 译文
> MemGPT 利用内存来保持一致性：表 2 显示了 MemGPT 与固定内存基线的性能比较。我们比较了使用不同底层 LLM 的 MemGPT，并与不使用 MemGPT 的基础 LLM 作为基线进行比较。基线能够看到过去五次对话的有损摘要，以模拟扩展的递归摘要过程，而 MemGPT 可以访问完整的对话历史，但必须通过分页搜索查询来访问召回内存。在这个任务中，我们看到 MemGPT 显著提高了底层基础 LLM 的性能。

---

#### 3.1.2. Conversation Opener Task (Engagement)

In the 'conversation opener' task we evaluate an agent's ability to craft engaging messages to the user that draw from knowledge accumulated in prior conversations. To evaluate the 'engagingness' of a conversation opener using the MSC dataset, we compare the generated opener to the gold personas: an engaging conversation opener should draw from one (or several) of the data points contained in the persona.

> [!note] 译文
> 在"对话开场白"任务中，我们评估智能体制作吸引用户的消息的能力，这些消息应借鉴先前对话中积累的知识。为了使用 MSC 数据集评估对话开场白的"吸引力"，我们将生成的开场白与黄金角色进行比较：一个有吸引力的对话开场白应该从角色中包含的一个（或几个）数据点中提取。

---

MemGPT utilizes memory to increase engagement: As seen in Table 3, MemGPT is able to craft engaging openers that perform similarly to and occasionally exceed the hand-written human openers. We observe that MemGPT tends to craft openers that are both more verbose and cover more aspects of the persona information than the human baseline. Additionally, we can see that storing information in working context is key to generating engaging openers.

> [!note] 译文
> MemGPT 利用内存来提高参与度：如表 3 所示，MemGPT 能够制作引人入胜的开场白，其表现与人工编写的人类开场白相似，有时甚至超过它们。我们观察到，MemGPT 倾向于制作比人类基线更冗长且涵盖更多角色信息方面的开场白。此外，我们可以看到将信息存储在工作上下文中是生成引人入胜开场白的关键。

---

### 3.2. MemGPT for document analysis

Document analysis also faces challenges due to the limited context windows of today's transformer models. However many documents easily surpass these lengths; for example, legal or financial documents such as Annual Reports (SEC Form 10-K) can easily pass the million token mark. Moreover, many real document analysis tasks require drawing connections across multiple such lengthy documents. Recent research also raises doubts about the utility of simply scaling contexts, since they find uneven attention distributions in large context models.

> [!note] 译文
> 由于当今 Transformer 模型的有限上下文窗口，文档分析也面临挑战。然而，许多文档很容易超过这些长度；例如，法律或财务文件（如年度报告（SEC 表格 10-K））很容易超过百万 token 标记。此外，许多真实的文档分析任务需要在多个这样的长文档之间建立联系。最近的研究也对简单扩展上下文的效用提出了质疑，因为他们发现在大上下文模型中存在不均匀的注意力分布。

---

#### 3.2.1. Multi-Document Question-Answering

To evaluate MemGPT's ability to analyze documents, we benchmark MemGPT against fixed-context baselines on the retriever-reader document QA task. In this task, a question is selected from the NaturalQuestions-Open dataset, and a retriever selects relevant Wikipedia documents for the question. A reader model (the LLM) is then fed these documents as input, and is asked to use the provided documents to answer the question.

> [!note] 译文
> 为了评估 MemGPT 分析文档的能力，我们在检索器-阅读器文档 QA 任务上将 MemGPT 与固定上下文基线进行基准测试。在此任务中，从 NaturalQuestions-Open 数据集中选择一个问题，检索器为该问题选择相关的维基百科文档。然后，阅读器模型（LLM）将这些文档作为输入，并要求使用提供的文档来回答问题。

---

We show the results for the document QA task in Figure 5. The fixed-context baselines performance is capped roughly at the performance of the retriever, as they use the information that is presented in their context window. By contrast, MemGPT is effectively able to make multiple calls to the retriever by querying archival storage, allowing it to scale to larger effective context lengths. MemGPT actively retrieves documents from its archival storage (and can iteratively page through results), so the total number of documents available to MemGPT is no longer limited by the number of documents that fit within the LLM processor's context window.

> [!note] 译文
> 我们在图 5 中展示了文档 QA 任务的结果。固定上下文基线的性能大致受限于检索器的性能，因为它们使用呈现在其上下文窗口中的信息。相比之下，MemGPT 能够通过查询档案存储有效地对检索器进行多次调用，使其能够扩展到更大的有效上下文长度。MemGPT 主动从其档案存储中检索文档（并可以迭代地分页浏览结果），因此 MemGPT 可用的文档总数不再受限于适合 LLM 处理器上下文窗口的文档数量。

---

#### 3.2.2. Nested Key-Value Retrieval (KV)

We introduce a new task based on the synthetic Key-Value retrieval proposed in prior work. The goal of this task is to demonstrate how MemGPT can collate information from multiple data sources. In the original KV task, the authors generated a synthetic dataset of key-value pairs, where each key and value is a 128-bit UUID. The agent is then given a key, and asked to return the associated value for the key.

> [!note] 译文
> 我们基于先前工作中提出的合成键值检索引入了一个新任务。此任务的目标是演示 MemGPT 如何从多个数据源整合信息。在原始 KV 任务中，作者生成了一组键值对的合成数据集，其中每个键和值都是一个 128 位 UUID。然后给智能体一个键，并要求返回该键的关联值。

---

We extend the KV task by introducing the concept of nested key-value lookups. In this variant, the value associated with a key is itself another key, creating chains of key-value lookups. The task requires a system to follow a chain of pointers from one key to the next, querying the data store at each step, until reaching a terminal value. This tests the system's ability to maintain state across multiple retrieval operations and reason about the relationships between different pieces of information.

> [!note] 译文
> 我们通过引入嵌套键值查找的概念来扩展 KV 任务。在此变体中，与键关联的值本身是另一个键，创建键值查找链。该任务要求系统从一个键跟随指针链到下一个键，在每一步查询数据存储，直到到达终端值。这测试了系统在多次检索操作中保持状态并推理不同信息片段之间关系的能力。

---

## 4. Related Work (Summary)

Long-context LLMs. Several lines of work have improved the context length of LLMs via more efficient transformer architectures, low-rank approximations, and neural memory. Another line of work aims to extend context windows beyond the length they were originally trained for. MemGPT builds upon these improvements in context length as they improve the size of the main memory in MemGPT. Our main contribution is a hierarchical tiered memory that uses a long-context LLM as the implementation of main memory.

> [!note] 译文
> 长上下文 LLM。多项工作通过更高效的 Transformer 架构、低秩近似和神经内存来改进 LLM 的上下文长度。另一项工作旨在将上下文窗口扩展到超出其最初训练长度的范围。MemGPT 建立在上下文长度的这些改进之上，因为它们提高了 MemGPT 中主内存的大小。我们的主要贡献是一个分层分级内存，它使用长上下文 LLM 作为主内存的实现。

---

Retrieval-augmented generation (RAG). RAG systems enhance LLMs by retrieving relevant documents from an external knowledge base to augment the model's input context. While effective for question answering, traditional RAG systems typically retrieve documents once before generation and do not allow the LLM to iteratively refine its retrieval strategy. MemGPT extends this paradigm by allowing the LLM to autonomously manage its own memory through function calls, enabling dynamic and iterative retrieval.

> [!note] 译文
> 检索增强生成（RAG）。RAG 系统通过从外部知识库中检索相关文档来增强 LLM，以扩充模型的输入上下文。虽然对问答很有效，但传统 RAG 系统通常在生成之前检索一次文档，不允许 LLM 迭代地改进其检索策略。MemGPT 通过允许 LLM 通过函数调用自主管理自己的内存来扩展这一范式，实现动态和迭代检索。

---

## 5. Conclusion

In this paper, we introduced MemGPT, a novel LLM system inspired by operating systems to manage the limited context windows of large language models. By designing a memory hierarchy and control flow analogous to traditional OSes, MemGPT provides the illusion of larger context resources for LLMs. This OS-inspired approach was evaluated in two domains where existing LLM performance is constrained by finite context lengths: document analysis and conversational agents. For document analysis, MemGPT could process lengthy texts well beyond the context limits of current LLMs by effectively paging relevant context in and out of memory. For conversational agents, MemGPT enabled maintaining long-term memory, consistency, and evolvability over extended dialogues. Overall, MemGPT demonstrates that operating system techniques like hierarchical memory management and interrupts can unlock the potential of LLMs even when constrained by fixed context lengths. This work opens numerous avenues for future exploration, including applying MemGPT to other domains with massive or unbounded contexts, integrating different memory tier technologies like databases or caches, and further improving control flow and memory management policies. By bridging concepts from OS architecture into AI systems, MemGPT represents a promising new direction for maximizing the capabilities of LLMs within their fundamental limits.

> [!note] 译文
> 在本文中，我们介绍了 MemGPT，一种受操作系统启发的新型 LLM 系统，用于管理大语言模型的有限上下文窗口。通过设计类似于传统操作系统的内存层次结构和控制流，MemGPT 为 LLM 提供了更大上下文资源的 illusion。这种受操作系统启发的方法在两个领域进行了评估：文档分析和对话智能体。对于文档分析，MemGPT 能够通过有效地将相关上下文分页进出内存来处理远超当前 LLM 上下文限制的长文本。对于对话智能体，MemGPT 能够在扩展对话中保持长期记忆、一致性和可进化性。总体而言，MemGPT 证明了操作系统技术（如分层内存管理和中断）即使在对固定上下文长度的约束下也能释放 LLM 的潜力。这项工作开辟了众多未来探索的途径，包括将 MemGPT 应用于具有大规模或无界上下文的其他领域，集成数据库或缓存等不同的内存层技术，以及进一步改进控制流和内存管理策略。通过将操作系统架构的概念桥接到人工智能系统中，MemGPT 代表了在基本限制内最大化 LLM 能力的有前途的新方向。

---
