---
title: Markdown 渲染器性能基准测试
author: ant-design
date: 2026-05-28
source: https://github.com/ant-design/x/blob/main/packages/x-markdown/src/XMarkdown/__benchmark__/README.md
tags:
  - react
  - ai-ui
  - ant-design-x
  - component-library
---

# Markdown 渲染器性能基准测试

> 流式渲染场景下的性能对比分析

## 🚀 快速开�?

```bash
cd packages/x-markdown
npm run benchmark    # 一键运行完整测�?
```

## 📊 支持的渲染器

| 渲染�?            | 类型         | 特点               |
| ------------------ | ------------ | ------------------ |
| **marked**         | 传统解析�?  | 流行度高，性能中等 |
| **markdown-it**    | 可配置解析器 | 插件丰富，稍�?    |
| **react-markdown** | React组件    | 集成度高，性能较低 |
| **x-markdown**     | 高性能渲染�?| 本项目优化版�?    |
| **streamdown**     | 流式渲染     | 专为流式场景设计   |

## 📈 性能指标

| 指标          | 说明         | 理想�?  |
| ------------- | ------------ | -------- |
| **渲染时长**  | 完整渲染耗时 | 越低越好 |
| **平均FPS**   | 渲染流畅�?  | >45 FPS  |
| **FPS标准�?* | 帧率稳定�?  | <10      |
| **内存峰�?*  | 最大内存占�?| 越低越好 |
| **内存增量**  | 新增内存使用 | 越低越好 |

## 📁 输出报告

### 标准报告

- `benchmark-report.html` - 主要性能报告
- `benchmark-results.json` - 原始数据

### 增强报告

- `benchmark-comparison.html` - 详细对比分析
- `benchmark-historical.html` - 历史趋势
- `benchmark-history.json` - 历史数据

## 🎯 示例结果

```
┌─────────┬────────────────┬──────────────┬──────────┬─────────────�?
�?排名    �?渲染�?        �?时长(ms)     �?FPS      �?内存(MB)    �?
├─────────┼────────────────┼──────────────┼──────────┼─────────────�?
�?🥇     �?streamdown     �?3,987        �?58.3     �?20.12       �?
�?🥈     �?x-markdown     �?4,456        �?52.8     �?22.34       �?
�?🥉     �?marked         �?5,234        �?45.2     �?25.43       �?
�?4       �?markdown-it    �?6,123        �?38.7     �?28.91       �?
�?5       �?react-markdown �?7,891        �?32.1     �?35.67       �?
└─────────┴────────────────┴──────────────┴──────────┴─────────────�?
```

## ⚙️ 自定义测�?

编辑 `performance.spec.tsx`�?

```typescript
const RUN_COUNT = 3;           // 运行次数
const renderers = [...];       // 测试的渲染器
const updateInterval = 100;    // 更新频率(ms)
```

## 🔧 环境要求

- **Node.js**: �?16.0.0
- **内存**: �?4GB 可用
- **浏览�?*: Chromium (自动安装)
- **系统**: macOS/Linux/Windows

## 🚨 故障排除

| 问题       | 解决方案                 |
| ---------- | ------------------------ |
| 依赖错误   | `npm install`            |
| 浏览器缺�?| `npx playwright install` |
| 内存不足   | 关闭其他程序             |
| 权限问题   | 使用管理员权限运�?      |

## 💡 最佳实�?

1. **测试�?*：关闭无关应用，清理浏览器缓�?
2. **测试�?*：避免系统干扰，保持网络稳定
3. **测试�?*：保存结果，建立性能基线
