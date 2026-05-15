---
title: Aider 源码解析
date: 2026-05-15
source: https://github.com/Aider-AI/aider
tags:
  - AI编码
  - CLI
  - Python
  - Pair Programming
  - Repo Map
---

> [📖 中英段落对照阅读](../99-工具与参考/ref-articles/aider-bilingual.md)

## 项目概览

**Aider** 是终端 AI Pair Programming 工具的代表作，由 Paul Gauthier 创建，支持多种模型，以稳定的代码编辑和仓库理解能力著称。

- **仓库**: https://github.com/Aider-AI/aider
- **Stars**: 44,829 | **Forks**: 4,411 | **Open Issues**: 1,535
- **License**: Apache-2.0
- **包名**: `aider-chat` (PyPI), 安装量 6.8M+

## 技术栈

| 维度 | 技术 |
|---|---|
| 语言 | Python |
| 包管理 | pip / uv |
| 依赖 | prompt_toolkit, GitPython, shtab, dotenv |
| 模型支持 | OpenAI, Anthropic, OpenRouter, Ollama, 本地模型等 |
| 编辑格式 | Unified diff, Edit block, Whole file |

## 目录结构

```
aider/
├── aider/                   # 核心源码
│   ├── main.py              # CLI 入口
│   ├── __main__.py          # python -m aider 入口
│   ├── args.py              # 参数解析
│   ├── commands.py          # 斜杠命令系统 (/add, /drop, /commit 等)
│   ├── io.py                # 输入输出抽象层
│   ├── llm.py               # LLM 调用封装
│   ├── models.py            # 模型配置与能力表
│   ├── sendchat.py          # 聊天消息发送
│   ├── repo.py              # Git 仓库操作
│   ├── repomap.py           # 仓库地图（代码结构摘要）
│   ├── diffs.py             # Diff 处理与匹配
│   ├── editor.py            # 编辑器集成
│   ├── linter.py            # 代码检查集成
│   ├── voice.py             # 语音输入支持
│   ├── history.py           # 对话历史管理
│   ├── watch.py             # 文件监听模式
│   ├── coders/              # 编码模式实现
│   │   ├── base_coder.py    # 编码器基类
│   │   ├── architect_coder.py   # Architect 模式
│   │   ├── ask_coder.py     # Ask 模式（只读问答）
│   │   ├── editblock_coder.py   # Edit block 编辑模式
│   │   └── context_coder.py # 上下文管理模式
│   ├── queries/             # 预设查询/提示词
│   └── resources/           # 内置资源文件
├── benchmark/               # 评测基准
├── tests/                   # 测试
└── scripts/                 # 脚本工具
```

## 核心入口与公共 API

| 模块 | 入口 | 职责 |
|---|---|---|
| CLI | `aider/main.py` / `aider/__main__.py` | 程序启动、配置加载 |
| Coder | `aider/coders/base_coder.py` | Agent 主循环、消息处理、代码编辑 |
| Repo Map | `aider/repomap.py` | 代码库结构抽象，辅助大模型理解项目 |
| LLM | `aider/llm.py` | 多模型后端统一接口 |
| IO | `aider/io.py` | 终端渲染、用户交互 |

## 亮点设计

### 1. 多模式 Coder 架构
`coders/` 目录下实现了多种编码策略：
- **base_coder**: 通用 Agent 循环（Message → LLM → Tool Use → Apply → Commit）
- **editblock_coder**: 使用 "Search/Replace" 块格式进行精准编辑，这是 Aider 最稳定的编辑方式
- **architect_coder**: 双模型架构（Architect 模型设计 + Editor 模型实现）
- **ask_coder**: 只读模式，用于代码解释和问答

### 2. Repo Map（仓库地图）
`repomap.py` 是 Aider 的核心创新之一：
- 通过静态分析生成代码库的精简结构树
- 包含函数签名、类关系、文件依赖
- 作为系统提示注入 LLM，使其"理解"整个项目而无需全量加载

### 3. Edit Block 格式
Aider 定义了一套结构化的编辑格式：
```
<<<<<<< SEARCH
旧代码
=======
新代码
>>>>>>> REPLACE
```
这种格式比 raw diff 更易于 LLM 生成，且容错性更强。

### 4. 斜杠命令系统
`commands.py` 实现了丰富的 `/command` 交互：
- `/add`, `/drop` 管理文件上下文
- `/commit`, `/undo` 版本控制
- `/lint`, `/test` 质量门禁
- `/map`, `/architect` 模式切换

## 待深入研究

- [ ] `repomap.py` 的 TAGS 解析算法（如何为不同语言生成符号树）
- [ ] `editblock_coder.py` 的模糊匹配策略（SEARCH 块不完全匹配时的容错）
- [ ] `architect_coder.py` 的双模型协作协议（Architect ↔ Editor 的消息传递）
- [ ] `diffs.py` 中的 diff 解析与冲突解决算法
- [ ] 与 [[AI编码/Git 集成最佳实践]] 的关联

## 与知识库的关联

- [[AI编码/Edit Block 格式]] — Aider 是这一格式的开创者和最佳实践
- [[AI编码/Repo Map 技术]] — 仓库地图实现参考
- [[Agent 工程/终端 Agent 架构对比]] — 与 Codex、Gemini CLI 的编辑策略对比
