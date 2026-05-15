---
title: "OpenSpec 源码解析：AI-Native 的 Spec-Driven Development 框架"
date: 2026-05-15
source: https://github.com/Fission-AI/OpenSpec
tags:
  - AI编码
  - OpenSpec
  - Spec-Driven-Development
  - CLI工具
  - TypeScript
---

# OpenSpec 源码解析：AI-Native 的 Spec-Driven Development 框架

> 源码仓库：`Fission-AI/OpenSpec`
> 版本：v1.3.1
> 协议：MIT
> npm：`@fission-ai/openspec`

## 一、项目定位

OpenSpec 是一个 **AI-Native 的 Spec-Driven Development 系统**，由 Fission AI 开发。它的核心哲学可以用四句话概括：

```text
→ fluid not rigid          （流动而非僵硬）
→ iterative not waterfall  （迭代而非瀑布）
→ easy not complex         （简单而非复杂）
→ built for brownfield not just greenfield  （为遗留项目设计，不只是新项目）
→ scalable from personal projects to enterprises  （从个人项目到企业级扩展）
```

与 Spec-Kit 强调 "严格的阶段关卡" 不同，OpenSpec 更强调 **流畅的迭代体验** 和 **对遗留代码库的友好支持**。

## 二、核心工作流（OPSX）

OpenSpec 的核心工作流称为 **OPSX**（OpenSpec eXtended），以 `opsx:*` 命令族驱动：

```mermaid
graph TD
    A[/opsx:propose "feature-name"] --> B[创建变更目录]
    B --> C[生成 proposal.md]
    B --> D[生成 specs/]
    B --> E[生成 design.md]
    B --> F[生成 tasks.md]
    F --> G[/opsx:apply]
    G --> H[按任务清单实施]
    H --> I[/opsx:archive]
    I --> J[归档到 archive/]
    I --> K[更新 specs/]
```

### 2.1 典型交互示例

```text
You: /opsx:propose add-dark-mode
AI:  Created openspec/changes/add-dark-mode/
     ✓ proposal.md — why we're doing this, what's changing
     ✓ specs/       — requirements and scenarios
     ✓ design.md    — technical approach
     ✓ tasks.md     — implementation checklist
     Ready for implementation!

You: /opsx:apply
AI:  Implementing tasks...
     ✓ 1.1 Add theme context provider
     ✓ 1.2 Create toggle component
     ✓ 2.1 Add CSS variables
     ✓ 2.2 Wire up localStorage
     All tasks complete!

You: /opsx:archive
AI:  Archived to openspec/changes/archive/2025-01-23-add-dark-mode/
     Specs updated. Ready for the next feature.
```

### 2.2 扩展工作流

除了核心三步，还有完整工作流：

| 命令 | 用途 |
|------|------|
| `/opsx:propose` | 提出变更（创建 artifact） |
| `/opsx:new` | 新建变更（扩展模式） |
| `/opsx:continue` | 继续未完成的变更 |
| `/opsx:apply` | 应用实施 |
| `/opsx:ff` | Fast-forward 快速实施 |
| `/opsx:verify` | 验证变更 |
| `/opsx:archive` | 归档变更 |
| `/opsx:bulk-archive` | 批量归档 |
| `/opsx:onboard` | 项目 onboarding |

## 三、架构拆解

### 3.1 项目结构

```
openspec/
├── src/
│   ├── cli/index.ts              # CLI 入口
│   ├── commands/                 # 命令实现
│   │   ├── change.ts             # 变更管理
│   │   ├── config.ts             # 配置管理
│   │   ├── schema.ts             # Schema 管理
│   │   ├── validate.ts           # 验证
│   │   ├── workspace.ts          # 工作空间
│   │   └── workflow/             # OPSX 工作流
│   │       ├── new-change.ts     # 新建变更
│   │       ├── instructions.ts   # 指令生成
│   │       ├── status.ts         # 状态查看
│   │       └── templates.ts      # 模板管理
│   ├── core/                     # 核心引擎
│   │   ├── artifact-graph/       # Artifact 依赖图
│   │   │   ├── graph.ts          # 图引擎（拓扑排序）
│   │   │   ├── schema.ts         # Schema 加载/验证
│   │   │   ├── instruction-loader.ts  # 指令加载
│   │   │   ├── resolver.ts       # Schema 解析器
│   │   │   └── state.ts          # 状态检测
│   │   ├── command-generation/   # 命令生成器
│   │   ├── completions.ts        # 自动补全
│   │   ├── config.ts             # 配置常量
│   │   ├── config-schema.ts      # 配置 Schema
│   │   ├── global-config.ts      # 全局配置
│   │   ├── init.ts               # 初始化逻辑
│   │   ├── archive.ts            # 归档引擎
│   │   ├── parsers/              # 各类解析器
│   │   ├── schemas/              # 内部 Schema
│   │   ├── templates/            # 模板系统
│   │   ├── validation/           # 验证引擎
│   │   └── workspace/            # 工作空间管理
│   ├── prompts/                  # Prompt 模板
│   ├── telemetry/                # 遥测
│   ├── ui/                       # UI 组件
│   └── utils/                    # 工具函数
├── schemas/                      # 用户可见 Schema
│   ├── spec-driven/              # 默认 spec-driven schema
│   └── workspace-planning/       # 工作空间规划 schema
├── openspec/                     # 项目自用的 OpenSpec 目录
│   ├── changes/                  # 变更历史
│   ├── specs/                    # 规格文档
│   └── explorations/             # 探索性实验
├── bin/openspec.js               # CLI 入口脚本
└── package.json
```

### 3.2 Artifact Graph — 核心抽象

OpenSpec 最核心的架构创新是 **Artifact Graph（制品依赖图）**。

**概念：** 每个变更由一组 "Artifact" 组成，Artifact 之间有依赖关系，形成一个有向无环图（DAG）。

**Schema 定义（`schemas/spec-driven/schema.yaml`）：**

```yaml
name: spec-driven
version: 1
description: Default OpenSpec workflow - proposal → specs → design → tasks
artifacts:
  - id: proposal
    generates: proposal.md
    description: Initial proposal document
    template: proposal.md
    instruction: |      # 给 AI 的精确指令
      Create the proposal document...
    requires: []        # 无依赖

  - id: specs
    generates: "specs/**/*.md"
    description: Detailed specifications
    template: spec.md
    instruction: |
      Create specification files...
    requires: [proposal]  # 依赖 proposal

  - id: design
    generates: design.md
    description: Technical design
    template: design.md
    instruction: |
      Create the design document...
    requires: [specs]

  - id: tasks
    generates: tasks.md
    description: Implementation tasks
    template: tasks.md
    instruction: |
      Create the task list...
    requires: [design]
```

**图引擎实现（`src/core/artifact-graph/graph.ts`）：**

```typescript
export class ArtifactGraph {
  private artifacts: Map<string, Artifact>;
  private schema: SchemaYaml;

  // 使用 Kahn 算法进行拓扑排序
  getBuildOrder(): string[] {
    const inDegree = new Map<string, number>();
    const dependents = new Map<string, string[]>();
    // ... Kahn's algorithm
  }

  // 获取所有 Artifact
  getAllArtifacts(): Artifact[]

  // 获取单个 Artifact
  getArtifact(id: string): Artifact | undefined
}
```

**关键洞察：**
- Artifact Graph 将 "文档" 提升为 "可执行节点"
- 每个 Artifact 都有 `instruction` 字段，直接指导 AI 生成内容
- 依赖关系确保生成顺序正确（先 proposal，后 specs，再 design）

### 3.3 多平台支持（30+ AI 工具）

OpenSpec 的配置系统（`src/core/config.ts`）定义了 **30+ AI 工具** 的支持：

```typescript
export const AI_TOOLS: AIToolOption[] = [
  { name: 'Claude Code', value: 'claude', skillsDir: '.claude' },
  { name: 'Codex', value: 'codex', skillsDir: '.codex' },
  { name: 'Cursor', value: 'cursor', skillsDir: '.cursor' },
  { name: 'Kimi CLI', value: 'kimi', skillsDir: '.kimi' },
  { name: 'GitHub Copilot', value: 'github-copilot', skillsDir: '.github' },
  { name: 'Gemini CLI', value: 'gemini', skillsDir: '.gemini' },
  { name: 'OpenCode', value: 'opencode', skillsDir: '.opencode' },
  // ... 共 30+ 个
];
```

**初始化逻辑（`src/core/init.ts`）：**

1. 检测项目中已存在的 AI 工具配置目录
2. 根据检测到的工具生成对应的 Skill 文件和命令文件
3. 将 `opsx:*` 命令映射到各平台的命令格式

```typescript
const WORKFLOW_TO_SKILL_DIR: Record<string, string> = {
  'propose': 'openspec-propose',
  'apply': 'openspec-apply-change',
  'archive': 'openspec-archive-change',
  // ... 11 个工作流
};
```

### 3.4 Schema-Driven 工作流

OpenSpec 的工作流完全由 **Schema YAML** 驱动，用户甚至可以自定义 Schema：

```yaml
# 自定义 schema 示例
name: my-custom-flow
version: 1
artifacts:
  - id: concept
    generates: concept.md
    requires: []
  - id: prototype
    generates: prototype/
    requires: [concept]
  - id: production
    generates: src/
    requires: [prototype]
```

这种设计让 OpenSpec 不仅是"一个工具"，而是**一个可定制的 spec-driven 框架**。

### 3.5 归档与规格合并（Delta-to-Spec）

当变更完成后，`/opsx:archive` 会：

1. 读取变更目录中的 delta specs
2. 与原 specs 进行合并（`src/core/specs-apply.ts`）
3. 更新 `openspec/specs/` 中的基线规格
4. 将变更目录移动到 `openspec/changes/archive/`

这确保了：
- 规格文档始终是最新的
- 历史变更可追溯
- 不会丢失任何需求演进

### 3.6 状态检测与增量更新

`src/core/artifact-graph/state.ts` 实现了 Artifact 的状态检测：

- 检测哪些 Artifact 已完成
- 哪些被阻塞（依赖未完成）
- 支持增量续传（`/opsx:continue`）

## 四、核心命令详解

### 4.1 `openspec init`

初始化流程：
1. 检测项目中的 AI 工具（`.claude/`, `.cursor/`, `.kimi/` 等）
2. 生成对应平台的 Skill 文件（`SKILL.md`）
3. 生成平台特定的命令文件
4. 创建 `openspec/` 目录结构
5. 可选：应用预设配置（`openspec config profile`）

### 4.2 `openspec config`

配置管理系统：
- `openspec config profile` — 选择工作流预设（精简/完整）
- `openspec config show` — 查看当前配置
- `openspec config set` — 修改配置项

### 4.3 `openspec validate`

验证引擎：
- 验证 Schema YAML 语法
- 检查 Artifact 依赖是否有环
- 验证生成的规格文档格式

### 4.4 `/opsx:propose`

创建新变更的核心命令：
1. 解析变更名称
2. 创建 `openspec/changes/<name>/` 目录
3. 根据 Schema 逐个生成 Artifact
4. 使用 `ArtifactGraph.getBuildOrder()` 确保正确顺序

## 五、设计理念与亮点

### 5.1 Artifact Graph 的图论抽象

将 "写文档" 抽象为 "图遍历" 是 OpenSpec 最 brilliant 的设计：
- **DAG 保证无环**：不会出现循环依赖的规格
- **拓扑排序确定顺序**：proposal → specs → design → tasks
- **状态机管理进度**：每个 Artifact 有明确的状态（未开始/进行中/已完成/被阻塞）

### 5.2 对 Brownfield 的友好设计

OpenSpec 明确宣称 "built for brownfield"：
- 可以在已有项目中随时 `openspec init`
- 不需要重写现有代码
- 增量式引入规格管理

### 5.3 流式迭代而非阶段关卡

与 Spec-Kit 的 "每个阶段必须人工确认" 不同，OpenSpec 允许：
- 快速 propose → apply → archive
- 在探索模式下不需要完整的规格
- 随时 `opsx:continue` 续接之前的工作

### 5.4 自举设计

OpenSpec 项目本身就用 OpenSpec 管理自己的开发：
- `openspec/changes/` 目录包含真实的变更历史
- `openspec/specs/` 包含 OpenSpec 自身的规格文档
- 这是 "eat your own dog food" 的典范

## 六、适用场景

| 场景 | 适用性 |
|------|--------|
| 遗留项目增量改进 | ⭐⭐⭐⭐⭐ brownfield-first 设计 |
| 快速功能迭代 | ⭐⭐⭐⭐⭐ propose→apply→archive 很快 |
| 团队规格管理 | ⭐⭐⭐⭐ 归档和规格合并很好 |
| 从零开始的新项目 | ⭐⭐⭐⭐ 同样适用 |
| 需要严格审计 | ⭐⭐⭐ 不如 Spec-Kit 严格 |
| 探索性原型 | ⭐⭐⭐⭐ 支持 exploration 模式 |

## 七、与知识库的关联

- 与 [[Superpowers-源码解析]] 关联：Superpowers 提供方法论，OpenSpec 提供规格管理基础设施
- 与 [[Spec-Kit-源码解析]] 关联：两者都是 Spec-Driven，但 OpenSpec 更灵活，Spec-Kit 更严格

## 八、待深入研究

- [ ] Artifact Graph 的自定义 Schema 开发指南
- [ ] Delta-to-Spec 合并算法的具体实现
- [ ] 与 CI/CD 集成的最佳实践（已有 `ci-nix-validation` spec）
- [ ] OpenSpec Dashboard 的架构和使用
- [ ] 在大型 monorepo 中的性能表现
- [ ] 与 Superpowers Skills 的协同使用方式
