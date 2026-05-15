---
title: "Spec-Kit 源码解析：GitHub 官方的 Spec-Driven Development 工具包"
date: 2026-05-15
source: https://github.com/github/spec-kit
tags:
  - AI编码
  - Spec-Kit
  - Spec-Driven-Development
  - GitHub
  - CLI工具
---

# Spec-Kit 源码解析：GitHub 官方的 Spec-Driven Development 工具包

> 源码仓库：`github/spec-kit`
> 协议：MIT
> 定位：开源 Spec-Driven Development 工具包

## 一、项目定位

Spec-Kit 是 **GitHub 官方推出的开源工具包**，旨在将 "Spec-Driven Development（规格驱动开发）" 方法论落地为可执行的工具链。它的核心口号是：

> **"Specifications become executable"** — 规格说明不再是写完后就被丢弃的脚手架，而是直接生成可工作实现的驱动力。

与 vibe coding（凭感觉写代码）相对，Spec-Kit 要求开发者先明确 "做什么" 和 "为什么"，再让 AI 去处理 "怎么做"。

## 二、核心工作流

Spec-Kit 定义了一条从概念到代码的完整管道：

```mermaid
graph TD
    A[specify init] --> B[/speckit.constitution]
    B --> C[/speckit.specify]
    C --> D[/speckit.plan]
    D --> E[/speckit.tasks]
    E --> F[/speckit.implement]
    F --> G[代码交付]
```

各阶段职责清晰分离：

| 命令 | 阶段 | 关注点 |
|------|------|--------|
| `/speckit.constitution` | 项目原则 | 代码质量、测试标准、UX 一致性、性能要求 |
| `/speckit.specify` | 需求规格 | What & Why，不涉及技术栈 |
| `/speckit.plan` | 技术方案 | 架构选型、技术栈、实现策略 |
| `/speckit.tasks` | 任务分解 | 可执行的任务清单 |
| `/speckit.implement` | 实施交付 | 编码实现 |

## 三、架构拆解

### 3.1 项目结构

```
spec-kit/
├── src/specify_cli/           # 核心 CLI（Python）
│   ├── agents.py              # Agent 命令注册器
│   ├── catalogs.py            # 模板目录管理
│   ├── extensions.py          # 扩展系统
│   ├── integration_runtime.py # 集成运行时
│   ├── integration_state.py   # 集成状态管理
│   ├── presets.py             # 预设配置
│   ├── shared_infra.py        # 共享基础设施
│   ├── authentication/        # 认证模块（Azure DevOps, GitHub）
│   └── integrations/          # 多 Agent 集成系统
│       ├── base.py            # 集成基类
│       ├── manifest.py        # 集成清单（SHA256 追踪）
│       ├── claude/            # Claude Code
│       ├── codex/             # Codex CLI
│       ├── copilot/           # GitHub Copilot
│       ├── cursor/            # Cursor
│       └── ... (20+ 平台)
├── extensions/                # 官方扩展
│   ├── git/                   # Git 集成扩展
│   ├── selftest/              # 自测扩展
│   └── template/              # 模板扩展
├── presets/                   # 预设配置
│   ├── lean/                  # 精简预设
│   ├── scaffold/              # 脚手架预设
│   └── self-test/             # 自测预设
├── workflows/speckit/         # speckit 工作流定义
├── templates/                 # 模板文件
├── tests/                     # 测试套件
└── docs/                      # 文档
```

### 3.2 多 Agent 集成架构

Spec-Kit 的集成系统是其**最精妙的架构设计**。它支持 **30+ AI 编码平台**，包括：

Claude Code、Codex、Cursor、GitHub Copilot、Gemini CLI、OpenCode、Cline、Continue、Windsurf、Kimi CLI、RooCode、Trae、Junie 等。

**核心抽象：`IntegrationBase`**

```python
class IntegrationBase(ABC):
    key: str = ""                    # 唯一标识
    config: dict | None = None       # 元数据
    registrar_config: dict | None = None  # 注册配置
    context_file: str | None = None  # 上下文文件（如 CLAUDE.md）
    invoke_separator: str = "."      # 命令分隔符
    multi_install_safe: bool = False # 是否可多平台共存
```

**三种集成基类：**

| 基类 | 格式 | 代表平台 |
|------|------|---------|
| `MarkdownIntegration` | Markdown | Claude Code, Cursor |
| `TomlIntegration` | TOML | Gemini, Tabnine |
| `SkillsIntegration` | Skill Markdown | Claude, Codex, Copilot |

**`CommandRegistrar` — 命令注册中心：**

```python
class CommandRegistrar:
    AGENT_CONFIGS: dict[str, dict] = {}
    
    def parse_frontmatter(content: str) -> tuple[dict, str]:
        # 解析 YAML frontmatter
        
    def register_command(agent_key, command_name, content):
        # 将命令写入对应 Agent 目录
```

**关键设计：IntegrationManifest**

每个集成创建的文件都会被 `IntegrationManifest` 用 **SHA256 哈希**追踪。卸载时，**只删除哈希匹配的文件**，保留用户的自定义修改。这种设计既保证了干净的卸载，又尊重了用户的定制。

### 3.3 扩展系统（Extensions）

Spec-Kit 的扩展机制允许在不修改核心的情况下添加新能力：

```
extensions/
├── git/
│   ├── commands/          # 扩展命令实现
│   └── scripts/           # 辅助脚本
├── selftest/
│   └── commands/          # 自测命令
└── template/
    └── commands/          # 模板命令
```

扩展通过 `extensions.yml` 声明，运行时动态加载。

### 3.4 预设系统（Presets）

Presets 是对行为的定制，不改变工具本身：

| 预设 | 用途 |
|------|------|
| `lean` | 最小化配置，快速启动 |
| `scaffold` | 完整项目脚手架 |
| `self-test` | 内置自测流程 |

### 3.5 模板即约束

Spec-Kit 的深层设计理念是 **"模板作为对 LLM 的可执行约束"**。Prompt 工程不再是随意的对话，而是结构化、版本化、可测试的纪律。

每个工作流阶段都有精确的模板：

```markdown
---
name: speckit-specify
description: Create a spec for a feature or change
---

# Specify

## Overview
Create a specification that describes WHAT and WHY, not HOW.
...
```

## 四、核心命令实现

### 4.1 `specify init`

初始化项目，核心逻辑：
1. 检测项目类型和现有配置
2. 根据 `--integration` 参数生成对应 Agent 的命令文件
3. 写入项目原则模板（constitution）
4. 建立 `.specify/` 配置目录

### 4.2 `/speckit.constitution`

生成项目的 "宪法" —— 所有后续开发必须遵循的原则：
- 代码质量标准
- 测试覆盖率要求
- UX 一致性规范
- 性能基线

### 4.3 `/speckit.specify`

创建需求规格文档。关键约束：
- 只描述 **What & Why**
- 不指定技术栈
- 用自然语言描述用户场景

### 4.4 `/speckit.plan`

基于规格生成技术实现计划。这里才引入：
- 技术栈选型
- 架构设计
- 数据模型
- API 设计

### 4.5 `/speckit.tasks`

将计划拆解为可执行的任务清单，每个任务包含：
- 具体文件路径
- 变更类型（创建/修改/删除）
- 验收标准

## 五、Human-in-the-Loop 设计

Spec-Kit 在每个关键阶段都设置了**人工确认关卡**：

```mermaid
graph LR
    A[Specify] -->|用户确认| B[Plan]
    B -->|用户确认| C[Tasks]
    C -->|用户确认| D[Implement]
```

这与完全自动化的 Agent 工作流不同 —— Spec-Kit 认为**规格和设计必须经过人类审核**，因为 AI 可能在理解业务需求上有偏差。

## 六、安装与使用

```bash
# 安装 CLI（需要 uv）
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# 初始化项目
specify init my-project --integration copilot
cd my-project

# 使用 Agent 命令
/speckit.constitution Create principles focused on code quality...
/speckit.specify Build an application that can help me organize photos...
/speckit.plan The application uses Vite with minimal libraries...
/speckit.tasks
```

## 七、设计理念与亮点

### 7.1 生产级工程

- 30+ 平台集成，每个都有独立的测试
- 集成清单用 SHA256 追踪，卸载安全
- 完善的 CLI 弃用策略（ legacy flags 保留但提示迁移）

### 7.2 可扩展性

- 扩展系统不修改核心
- 预设系统允许行为定制
- 模板系统可覆盖

### 7.3 对 LLM 的结构化约束

将 Prompt 工程从 "对话艺术" 提升为 "工程纪律"：
- 模板定义精确的输出格式
- Frontmatter 声明元数据
- 阶段化的工作流确保不跳过关键步骤

## 八、适用场景

| 场景 | 适用性 |
|------|--------|
| 企业级项目 | ⭐⭐⭐⭐⭐ 严格的规格流程 |
| 多人协作 | ⭐⭐⭐⭐⭐ 规格是共同语言 |
| 需要审计合规 | ⭐⭐⭐⭐⭐ 可追溯的规格文档 |
| 个人小项目 | ⭐⭐⭐ 流程较重 |
| 快速原型 | ⭐⭐ 需要先有 Spec |
| 探索性研究 | ⭐⭐ 不适合 |

## 九、与知识库的关联

- 与 [[Superpowers-源码解析]] 对比：Superpowers 是方法论框架，Spec-Kit 是工具化实现
- 与 [[OpenSpec-源码解析]] 对比：两者都是 Spec-Driven，但实现路径不同

## 十、待深入研究

- [ ] Extension API 的完整规范和开发指南
- [ ] Preset 系统的自定义方法
- [ ] IntegrationManifest 的序列化格式和版本迁移
- [ ] 与 GitHub Issues / Projects 的深度集成
- [ ] 在实际团队中的采纳曲线和最佳实践
