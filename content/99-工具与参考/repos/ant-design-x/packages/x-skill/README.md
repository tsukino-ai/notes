---
title: README
author: ant-design
date: 2026-05-28
source: https://github.com/ant-design/x/blob/main/packages/x-skill/README.md
tags:
  - react
  - ai-ui
  - ant-design-x
  - component-library
---

<div align="center"><a name="readme-top"></a>

<img height="180" src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original">

<h1>Ant Design X Skill</h1>

Intelligent skill library specially designed for Ant Design X

[![CI status](https://github.com/ant-design/x/actions/workflows/main.yml/badge.svg)](https://github.com/ant-design/x/actions/workflows/main.yml) [![NPM version](https://img.shields.io/npm/v/@ant-design/x-skill.svg?style=flat-square)](https://npmjs.org/package/@ant-design/x-skill) [![NPM downloads](https://img.shields.io/npm/dm/@ant-design/x-skill.svg?style=flat-square)](https://npmjs.org/package/@ant-design/x-skill) [![bundle size](https://badgen.net/bundlephobia/minzip/@ant-design/x-skill?style=flat-square)](https://bundlephobia.com/package/@ant-design/x-skill) [![Ant Design](https://img.shields.io/badge/-Ant%20Design-blue?labelColor=black&logo=antdesign&style=flat-square)](https://ant.design)

[Changelog](./CHANGELOG.md) 路 [Report Bug](https://github.com/ant-design/x/issues/new?template=bug-report.yml) 路 [Feature Request](https://github.com/ant-design/x/issues/new?template=bug-feature-request.yml) 路 English 路 [涓枃](./README-zh_CN.md)

</div>

## 鉁?Core Features

- 馃 **Intelligent Development Experience**: Code generation and optimization suggestions based on best practices, with AI assisting your development
- 鈿?**Significant Efficiency Boost**: Reduce repetitive work and accelerate Ant Design X project development
- 馃洝 **Quality Assurance**: Strictly follow Ant Design X design specifications to ensure code quality and consistency
- 馃幆 **Full Scenario Coverage**: Cover common AI application scenarios like conversation components, data requests, state management, and Markdown rendering
- 馃敡 **Multi-IDE Support**: Support mainstream AI IDEs like Claude Code, CodeFuse, and Cursor

## 馃摝 Installation

### One-click Installation (Recommended)

Supports mainstream AI IDEs, complete installation with a single command:

```bash
# Install skill library globally
npm i -g @ant-design/x-skill

# Smart registration to current IDE
npx x-skill
```

### Claude Code Integration

#### Plugin Marketplace Installation (Officially Recommended)

**Step 1: Register Plugin Marketplace**

Execute the following command in Claude Code to add this repository as a plugin source:

```bash
/plugin marketplace add ant-design/x/blob/main/packages/x-skill/
```

**Step 2: Select and Install Skills**

Install the skills included in the x-skill package.

Click `Install now` to complete the installation.

#### Quick Installation

You can also directly install the complete skill package through commands:

```bash
/plugin install x-sdk-skills@x-agent-skills
```

### Manual Installation

Suitable for scenarios requiring customized configuration:

- **Global Installation**: Copy skill files to the `~/.claude/skills` directory, available for all projects
- **Project Installation**: Copy skill files to the `.claude/skills` directory in the project root, available only for the current project

## 馃敡 Included Skills

### use-x-chat

Conversation SDK usage guide to help you quickly integrate Ant Design X conversation features.

### x-chat-provider

Chat data flow management, providing efficient data stream processing solutions.

### x-request

Network request best practices, optimizing API calls and data processing.

### x-markdown

Markdown rendering guide for streaming output, component mapping, plugins, and themes.

## 馃幆 Applicable Scenarios

- **馃殌 New Project Startup**: Quickly set up Ant Design X project framework with complete configuration and best practices
- **鈿欙笍 Feature Development**: Get best practices and code examples for component usage, rendering, and integration to accelerate feature implementation
- **馃攳 Problem Troubleshooting**: Intelligent diagnosis and resolution of common development issues with professional solutions
- **馃搱 Performance Optimization**: Get professional advice for performance tuning to improve application performance

## 馃洜 Development

### Local Development

```bash
# Clone the project
git clone https://github.com/ant-design/x.git

# Enter the skill directory
cd packages/x-skill

# Install dependencies
npm install

# Development mode
npm run dev
```

### Build

```bash
# Build the project
npm run build

# Run tests
npm test
```

## 馃 How to Contribute

We welcome all forms of contribution, including but not limited to:

- 馃悰 [Report Bugs](https://github.com/ant-design/x/issues/new?template=bug-report.yml)
- 鉁?[Submit Feature Requests](https://github.com/ant-design/x/issues/new?template=bug-feature-request.yml)
- 馃摑 [Improve Documentation](https://github.com/ant-design/x/pulls)
- 馃捇 [Submit Code](https://github.com/ant-design/x/pulls)

Before participating, please read our [Contributor Guide](https://github.com/ant-design/ant-design/blob/master/.github/CONTRIBUTING.md).

## 馃摓 Community Support

If you encounter problems during use, you can seek help through the following channels:

1. [GitHub Discussions](https://github.com/ant-design/x/discussions) - Discussions and Q&A
2. [GitHub Issues](https://github.com/ant-design/x/issues) - Bug reports and feature requests

## 馃搫 License

[MIT](./LICENSE)
