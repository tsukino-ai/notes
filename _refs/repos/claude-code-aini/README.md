# Claude Code Aini

一个强大的 AI 编程助手终端工具，支持接入 Anthropic 兼容 API。

## 功能特性

- 🖥️ **完整的终端 TUI 界面** - 沉浸式交互体验
- ⚡ **无头模式** - 支持脚本和 CI/CD 场景
- 🔌 **MCP 协议支持** - 可扩展的工具和插件系统
- 🌐 **灵活的 API 配置** - 支持自定义端点和模型
- 🛠️ **内置工具** - 文件编辑、代码搜索、终端命令等

---

## 快速开始（Windows 用户看这里）

> 只需 2 步：**配置 .env → 双击 start.cmd 启动**
>
> Bun 运行时已内置在项目 `vendor/bun/` 目录中，无需额外安装。

### 第一步：配置环境变量

1. 复制 `.env.example` 为 `.env`：

**Windows（CMD）：**
```cmd
copy .env.example .env
```

**macOS / Linux：**
```bash
cp .env.example .env
```

2. 用文本编辑器（记事本、VS Code 等）打开 `.env` 文件，填入你的 API 配置：

```env
# ============ API 认证（二选一）============
# 方式一：标准 API Key（通过 x-api-key 请求头发送）
ANTHROPIC_API_KEY=sk-your-api-key

# 方式二：Bearer Token（通过 Authorization 请求头发送）
ANTHROPIC_AUTH_TOKEN=your-bearer-token

# ============ API 端点 ============
# 默认为 Anthropic 官方，可改为其他兼容端点
ANTHROPIC_BASE_URL=https://api.anthropic.com

# ============ 模型配置 ============
ANTHROPIC_MODEL=claude-sonnet-4-20250514
ANTHROPIC_DEFAULT_SONNET_MODEL=claude-sonnet-4-20250514
ANTHROPIC_DEFAULT_HAIKU_MODEL=claude-haiku-3-20240307
ANTHROPIC_DEFAULT_OPUS_MODEL=claude-opus-4-20250514

# ============ 其他配置 ============
# API 超时时间（毫秒），默认 10 分钟
API_TIMEOUT_MS=600000

# 禁用遥测
DISABLE_TELEMETRY=1
CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
```

**如果使用 MiniMax 国产模型**（推荐，官网 https://minimaxi.com/ ）：

```env
ANTHROPIC_AUTH_TOKEN=你的MiniMax Token
ANTHROPIC_BASE_URL=https://api.minimaxi.com/anthropic
ANTHROPIC_MODEL=MiniMax-M2.7-highspeed
ANTHROPIC_DEFAULT_SONNET_MODEL=MiniMax-M2.7-highspeed
ANTHROPIC_DEFAULT_HAIKU_MODEL=MiniMax-M2.7-highspeed
ANTHROPIC_DEFAULT_OPUS_MODEL=MiniMax-M2.7-highspeed
API_TIMEOUT_MS=3000000
CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
DISABLE_TELEMETRY=1
```

---

### 第二步：启动

#### Windows 用户（推荐：双击启动）

**直接双击项目根目录下的 `start.cmd` 即可！**

它会自动完成以下工作：
- 使用项目自带的 `vendor/bun/bun.exe`，无需安装任何东西
- 首次运行时自动安装项目依赖（`bun install`）
- 检查 `.env` 是否存在（不存在会自动从模板复制一份）
- 启动交互式终端 TUI

如果你更喜欢手动操作，也可以在 CMD 或 PowerShell 中执行：

```cmd
cd claude-code-aini
bin\claude-aini.cmd
```

其他 Windows 命令示例：

```cmd
:: 单次问答模式
bin\claude-aini.cmd -p "你的问题"

:: 查看帮助
bin\claude-aini.cmd --help

:: 查看版本
bin\claude-aini.cmd --version

:: 降级模式（TUI 出问题时使用）
set CLAUDE_CODE_FORCE_RECOVERY_CLI=1
bin\claude-aini.cmd
```

#### macOS / Linux 用户

需要先安装 Bun（仅一次）：

```bash
curl -fsSL https://bun.sh/install | bash
```

然后：

```bash
cd claude-code-aini
bun install          # 首次运行安装依赖
./bin/claude-aini    # 启动
```

---

## 环境变量详解

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `ANTHROPIC_API_KEY` | 二选一 | API Key，通过 `x-api-key` 头发送 |
| `ANTHROPIC_AUTH_TOKEN` | 二选一 | Bearer Token，通过 `Authorization` 头发送 |
| `ANTHROPIC_BASE_URL` | 否 | API 端点地址 |
| `ANTHROPIC_MODEL` | 否 | 默认使用的模型 |
| `API_TIMEOUT_MS` | 否 | 请求超时时间（毫秒） |
| `DISABLE_TELEMETRY` | 否 | 设为 `1` 禁用遥测 |

---

## 使用第三方 API

本项目支持任何 Anthropic 兼容的 API 端点。

**示例：使用 MiniMax**

```env
ANTHROPIC_AUTH_TOKEN=your-minimax-token
ANTHROPIC_BASE_URL=https://api.minimaxi.com/anthropic
ANTHROPIC_MODEL=MiniMax-M2.7-highspeed
```

**示例：使用 OpenRouter**

```env
ANTHROPIC_AUTH_TOKEN=your-openrouter-key
ANTHROPIC_BASE_URL=https://openrouter.ai/api/v1
ANTHROPIC_MODEL=anthropic/claude-sonnet-4
```

---

## 降级模式

如果 TUI 界面出现问题，可以使用简化的命令行模式：

```bash
CLAUDE_CODE_FORCE_RECOVERY_CLI=1 ./bin/claude-aini
```

---

## 常见问题

**Q: Windows 启动时提示找不到 bun**

项目已自带 `vendor/bun/bun.exe`，正常情况不会出现此问题。如果你移动了 vendor 目录或文件被误删，请从其他同学处复制 `vendor/bun/bun.exe` 即可。

**Q: API 请求超时**

增大 `.env` 中 `API_TIMEOUT_MS` 的值，例如设为 `1200000`（20分钟）。

**Q: Windows 双击 start.cmd 闪退**

右键 `start.cmd` → 打开方式 → 选择「命令提示符」，或在 CMD 中手动运行 `start.cmd` 查看错误信息。

**Q: Windows 下中文乱码**

启动脚本已内置 `chcp 65001` 切换 UTF-8 编码。如果仍有问题，在运行前手动执行：

```cmd
chcp 65001
```

**Q: 安装依赖时报错 / 网络超时**

可以配置 npm 镜像源加速（Bun 也支持）：

```cmd
bunfig.toml 中已预配置，如需更换可编辑该文件
```

---

## 项目结构

```
claude-code-aini/
├── start.cmd              # [Windows] 一键启动脚本（双击运行）
├── vendor/bun/bun.exe     # [Windows] 内置 Bun 运行时，无需安装
├── bin/
│   ├── claude-aini        # [macOS/Linux] Bash 启动脚本
│   └── claude-aini.cmd    # [Windows] CMD 启动脚本
├── .env.example           # 环境变量模板（复制为 .env 使用）
├── package.json           # 项目配置
├── bunfig.toml            # Bun 运行时配置
├── preload.ts             # Bun 预加载脚本
├── src/
│   ├── entrypoints/       # 入口文件
│   ├── components/        # UI 组件
│   ├── tools/             # Agent 工具
│   ├── commands/          # 斜杠命令
│   ├── services/          # 服务层
│   └── utils/             # 工具函数
└── docs/                  # 文档
```

---

## 技术栈

- **运行时**: [Bun](https://bun.sh)
- **语言**: TypeScript
- **终端 UI**: React + [Ink](https://github.com/vadimdemedes/ink)
- **CLI**: Commander.js
- **API**: Anthropic SDK

---

特别提醒⚠️:仅限个人技术交流学习
