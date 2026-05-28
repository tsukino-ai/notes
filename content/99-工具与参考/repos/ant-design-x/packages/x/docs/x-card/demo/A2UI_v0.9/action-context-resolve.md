---
title: action-context-resolve
author: ant-design
date: 2026-05-28
source: https://github.com/ant-design/x/blob/main/packages/x/docs/x-card/demo/A2UI_v0.9/action-context-resolve.md
tags:
  - react
  - ai-ui
  - ant-design-x
  - component-library
---

## zh-CN

演示 X-Card 在触�?action 时自动解�?context 中的 path 引用为实际值�?

当组件触�?action 时（如提交表单），X-Card 会自动将 action 配置中的 `{ path: "xxx" }` 格式转换�?`{ value: "实际�? }` 格式，方便外部直接使用解析后的值�?

## en-US

Demonstrates X-Card automatically resolving path references in action context to actual values when an action is triggered.

When a component triggers an action (like submitting a form), X-Card will automatically convert the `{ path: "xxx" }` format in the action configuration to `{ value: "actual_value" }` format, making it convenient for external code to use the resolved values directly.
