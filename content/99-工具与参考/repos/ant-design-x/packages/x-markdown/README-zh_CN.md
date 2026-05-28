---
title: README-zh_CN
author: ant-design
date: 2026-05-28
source: https://github.com/ant-design/x/blob/main/packages/x-markdown/README-zh_CN.md
tags:
  - react
  - ai-ui
  - ant-design-x
  - component-library
---

<div align="center"><a name="readme-top"></a>

<img height="180" src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original">

<h1>Ant Design X Markdown</h1>

流式友好、强拓展性和高性能�?Markdown 渲染�?

[![CI status][github-action-image]][github-action-url] [![codecov][codecov-image]][codecov-url] [![NPM version][npm-image]][npm-url]

[![NPM downloads][download-image]][download-url] [![][bundlephobia-image]][bundlephobia-url] [![antd][antd-image]][antd-url] [![Follow zhihu][zhihu-image]][zhihu-url]

[更新日志](../../CHANGELOG.zh-CN.md) · [报告一�?Bug][github-issues-bug-report] · [想新增特性？][github-issues-feature-request] · [English](./README.md) · 中文

[npm-image]: https://img.shields.io/npm/v/@ant-design/x-markdown.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@ant-design/x-markdown
[github-action-image]: https://github.com/ant-design/x/actions/workflows/main.yml/badge.svg
[github-action-url]: https://github.com/ant-design/x/actions/workflows/main.yml
[codecov-image]: https://codecov.io/gh/ant-design/x/graph/badge.svg?token=wrCCsyTmdi
[codecov-url]: https://codecov.io/gh/ant-design/x
[download-image]: https://img.shields.io/npm/dm/@ant-design/x-markdown.svg?style=flat-square
[download-url]: https://npmjs.org/package/@ant-design/x-markdown
[bundlephobia-image]: https://badgen.net/bundlephobia/minzip/@ant-design/x-markdown?style=flat-square
[bundlephobia-url]: https://bundlephobia.com/package/@ant-design/x-markdown
[github-issues-bug-report]: https://github.com/ant-design/x/issues/new?template=bug-report.yml
[github-issues-feature-request]: https://github.com/ant-design/x/issues/new?template=bug-feature-request.yml
[antd-image]: https://img.shields.io/badge/-Ant%20Design-blue?labelColor=black&logo=antdesign&style=flat-square
[antd-url]: https://ant.design
[zhihu-image]: https://img.shields.io/badge/-Ant%20Design-white?logo=zhihu
[zhihu-url]: https://www.zhihu.com/column/c_1564262000561106944

</div>

## �?特�?

使用 [`marked`](https://github.com/markedjs/marked) 作为基础 markdown 渲染器，具备 marked 的所有特性�?

- 🚀 为速度而生�?
- 🤖 流式友好，大模型Markdown渲染解决方案�?
- ⬇️ 低级编译器，用于解析 Markdown，无需长时间缓存或阻塞�?
- ⚖️ 轻量级，同时实现所有支持的风格和规范的 markdown 功能�?
- 🔐 默认安全，无 dangerouslySetInnerHTML XSS 攻击�?
- 🎨 可自定义组件，传递你自己的组件来代替 \<h2\> for ## hi�?
- 🔧 丰富的插件，有很多插件可供选择�?
- 😊 兼容�?00% 符合 CommonMark�?00% 符合 GFM 插件�?

## 兼容环境

�?[`marked`](https://github.com/markedjs/marked) 保持一致。为了提高整�?markdown 对于系统的兼容性支持，可以自定�?polyfill，来提高兼容性�?

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Opera |
| --- | --- | --- | --- | --- |
| >= 92 | >= 90 | >= 92 | >= 15.4 | >= 78 |

## 支持�?Markdown 规范

- [Markdown 1.0.0](https://daringfireball.net/projects/markdown/)
- [CommonMark](https://github.com/commonmark/commonmark-spec/wiki/Markdown-Flavors)
- [GitHub Flavored Markdown (GFM)](https://github.github.com/gfm/)

## 📦 安装

### 使用 npm �?yarn �?pnpm �?bun 安装 �?utoo 安装

**我们推荐使用 [npm](https://www.npmjs.com/) �?[yarn](https://github.com/yarnpkg/yarn/) �?[pnpm](https://pnpm.io/zh/) �?[bun](https://bun.sh/) �?[utoo](https://github.com/umijs/mako/tree/next) 的方式进行开�?*，不仅可在开发环境轻松调试，也可放心地在生产环境打包部署使用，享受整个生态圈和工具链带来的诸多好处。如果你的网络环境不佳，推荐使用 [cnpm](https://github.com/cnpm/cnpm)�?

```bash
npm install @ant-design/x-markdown
```

```bash
yarn add @ant-design/x-markdown
```

```bash
pnpm add @ant-design/x-markdown
```

```bash
ut install @ant-design/x-markdown
```

### 浏览器引�?

在浏览器中使�?`script` �?`link` 标签直接引入文件，并使用全局变量 `XMarkdown`�?

我们�?npm 发布包内�?dist 目录下提供了 `x-markdown.js`、`x-markdown.min.js` �?`x-markdown.min.js.map`�?

> **强烈不推荐使用已构建文件**，这样无法按需加载，而且难以获得底层依赖模块�?bug 快速修复支持�?

> 注意：`x-markdown.js` �?`x-markdown.min.js` �?`x-markdown.min.js.map`。依�?`react`、`react-dom`请确保提前引入这些文件�?

## 示例

```tsx
import React from 'react';
import { XMarkdown } from '@ant-design/x-markdown';
const content = `
# Hello World

### 欢迎使用 XMarkdown�?

- 项目1
- 项目2
- 项目3
`;

const App = () => <XMarkdown content={content} />;

export default App;
```

## 插件

`@ant-design/x-markdown` 提供了丰富的插件，你可以通过 `plugins` 属性来使用这些插件。插件详情查看[插件集](../x/docs/x-markdown/plugins.zh-CN.md)�?

## 主题

`@ant-design/x-markdown` 提供了主题可供选择。主题详情查看[主题](../x/docs/x-markdown/themes.zh-CN.md)�?

## 🌈 开箱即用的大模型企业级组件

`@ant-design/x` 基于 RICH 交互范式，在不同的交互阶段提供了大量的原子组件，帮助你灵活搭建你�?AI 应用，详情点击[这里](packages/x/README-zh_CN.md)�?

## ⚡️ 对接模型智能体服�?& 高效管理数据�?

`@ant-design/x-sdk` 提供了一系列的工具API，旨在提供开发者开箱即用的管理AI应用数据流，详情点击[这里](packages/x-sdk/README-zh_CN.md)�?

## 如何贡献

在任何形式的参与前，请先阅读 [贡献者文档](https://github.com/ant-design/ant-design/blob/master/.github/CONTRIBUTING.md)。如果你希望参与贡献，欢迎提�?[Pull Request](https://github.com/ant-design/ant-design/pulls)，或给我�?[报告 Bug](http://new-issue.ant.design/)�?

> 强烈推荐阅读 [《提问的智慧》](https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way)、[《如何向开源社区提问题》](https://github.com/seajs/seajs/issues/545) �?[《如何有效地报告 Bug》](http://www.chiark.greenend.org.uk/%7Esgtatham/bugs-cn.html)、[《如何向开源项目提交无法解答的问题》](https://zhuanlan.zhihu.com/p/25795393)，更好的问题更容易获得帮助�?

## 社区互助

如果您在使用的过程中碰到问题，可以通过下面几个途径寻求帮助，同时我们也鼓励资深用户通过下面的途径给新人提供帮助�?

通过 GitHub Discussions 提问时，建议使用 `Q&A` 标签�?

1. [GitHub Discussions](https://github.com/ant-design/x/discussions)
2. [GitHub Issues](https://github.com/ant-design/x/issues)

<a href="https://openomy.app/github/ant-design/x" target="_blank" style="display: block; width: 100%;" align="center">
  <img src="https://openomy.app/svg?repo=ant-design/x&chart=bubble&latestMonth=3" target="_blank" alt="Contribution Leaderboard" style="display: block; width: 100%;" />
 </a>
