---
title: API
author: ant-design
date: 2026-05-28
source: https://github.com/ant-design/x/blob/main/packages/x-skill/skills-zh/x-markdown/reference/API.md
tags:
  - react
  - ai-ui
  - ant-design-x
  - component-library
---

| 属�?| 说明 | 类型 | 默认�?|
| --- | --- | --- | --- |
| content | 需要渲染的 Markdown 内容 | `string` | - |
| children | Markdown 内容（与 `content` 二选一�?| `string` | - |
| components | �?HTML 节点映射为自定义 React 组件 | `Record<string, React.ComponentType<ComponentProps> \| keyof JSX.IntrinsicElements>` | - |
| streaming | 流式渲染行为配置 | `StreamingOption` | - |
| config | Marked 解析配置，后应用且可能覆盖内�?renderer | [`MarkedExtension`](https://marked.js.org/using_advanced#options) | `{ gfm: true }` |
| rootClassName | 根元素的额外 CSS 类名 | `string` | - |
| className | 根容器的额外 CSS 类名 | `string` | - |
| paragraphTag | 段落使用�?HTML 标签（避免自定义组件含块级元素时的校验问题） | `keyof JSX.IntrinsicElements` | `'p'` |
| style | 根容器的内联样式 | `CSSProperties` | - |
| prefixCls | 组件节点 CSS 类名前缀 | `string` | - |
| openLinksInNewTab | 是否为所有链接添�?`target="_blank"` 并在新标签页打开 | `boolean` | `false` |
| dompurifyConfig | HTML 净化与 XSS 防护�?DOMPurify 配置 | [`DOMPurify.Config`](https://github.com/cure53/DOMPurify#can-i-configure-dompurify) | - |
| protectCustomTagNewlines | 是否保留自定义标签内部的换行 | `boolean` | `false` |
| escapeRawHtml | 是否�?Markdown 中的原始 HTML 转义为纯文本展示（不解析为真�?HTML），用于�?XSS 同时保留内容 | `boolean` | `false` |
| debug | 是否开启调试模式（显示性能监控浮层�?| `boolean` | `false` |

### StreamingOption

| 字段 | 说明 | 类型 | 默认�?|
| --- | --- | --- | --- |
| hasNextChunk | 是否还有后续内容块。为 `false` 时会刷新缓存并完成渲�?| `boolean` | `false` |
| enableAnimation | 是否为块级元素启用文字淡入动�?| `boolean` | `false` |
| animationConfig | 动画配置（如淡入时长、缓动函数） | `AnimationConfig` | - |
| tail | 是否启用尾部指示�?| `boolean \| TailConfig` | `false` |
| incompleteMarkdownComponentMap | 将未闭合 Markdown 片段映射到自定义 loading 组件 | `Partial<Record<'link' \| 'image' \| 'html' \| 'emphasis' \| 'list' \| 'table' \| 'inline-code', string>>` | `{ link: 'incomplete-link', image: 'incomplete-image' }` |

### TailConfig

| 属�?| 说明 | 类型 | 默认�?|
| --- | --- | --- | --- |
| content | 尾部显示的内�?| `string` | `'�?` |
| component | 自定义尾部组件，优先级高�?content | `React.ComponentType<{ content?: string }>` | - |

### AnimationConfig

| 属�?        | 说明             | 类型     | 默认�?         |
| ------------ | ---------------- | -------- | --------------- |
| fadeDuration | 动画时长（毫秒） | `number` | `200`           |
| easing       | 缓动函数         | `string` | `'ease-in-out'` |
