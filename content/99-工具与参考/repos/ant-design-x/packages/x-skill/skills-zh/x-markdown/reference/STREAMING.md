---
title: 流式渲染指南
author: ant-design
date: 2026-05-28
source: https://github.com/ant-design/x/blob/main/packages/x-skill/skills-zh/x-markdown/reference/STREAMING.md
tags:
  - react
  - ai-ui
  - ant-design-x
  - component-library
---

# 流式渲染指南

## 适用场景

�?Markdown 内容以分块方式持续追加，并且中途可能出现不完整语法时，使用 streaming 模式�?

典型场景包括�?

- 半截链接，如 `[docs](https://example`
- 半截表格
- 尚未闭合的代码块
- 回答仍在生成时的尾部光标

## 核心规则

`hasNextChunk` 必须真实反映流状态：

- 还有后续 chunk 时为 `true`
- 最后一块必须为 `false`，这样缓存的不完整片段才会被刷新为最终内�?

## 最小配�?

```tsx
<XMarkdown
  content={content}
  streaming={{
    hasNextChunk,
    enableAnimation: true,
    tail: true,
  }}
/>
```

## 不完整语法处�?

如果不完整片段需要展示自定义 loading UI，而不是直接显示破�?Markdown，可使用 `incompleteMarkdownComponentMap`�?

```tsx
<XMarkdown
  content={content}
  streaming={{
    hasNextChunk,
    incompleteMarkdownComponentMap: {
      link: 'link-loading',
      table: 'table-loading',
    },
  }}
  components={{
    'link-loading': LinkSkeleton,
    'table-loading': TableSkeleton,
  }}
/>
```

## Loading �?Done

自定义组件会收到 `streamStatus`�?

- `loading`：语法可能还未完�?
- `done`：最终内容已经稳�?

如果组件内部需要做昂贵解析或请求，优先等到 `streamStatus === 'done'`�?

## 聊天场景建议

- 只有在回答仍在生成时才显�?tail 指示器�?
- 占位组件尽量轻量�?
- 如果组件依赖闭合代码块或完整结构块，等到 `done` 再解析�?
- 不要�?`hasNextChunk` 长期停留�?`true`，否则最终内容无法收敛�?

## 排查清单

- 最终结果仍然残缺：确认最后一次渲染把 `hasNextChunk` 设为 `false`
- 占位组件不消失：确认映射的标签名已在 `components` 中注�?
- 性能不稳定：先关闭动画和占位组件，再逐个加回
