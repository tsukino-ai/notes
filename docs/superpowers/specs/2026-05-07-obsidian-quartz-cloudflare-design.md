# Obsidian + Quartz + Cloudflare Pages 部署方案设计

> 日期：2026-05-07  
> 状态：待实施  
> 作者：Kimi Code CLI

---

## 1. 项目背景

本项目是一个 Obsidian 个人知识库，同时作为 AI 学习、源码学习、博客发布和项目方案沉淀中心。目标是将 Obsidian 笔记通过 Quartz 静态站点生成器发布为可公开访问的网站，托管在 Cloudflare Pages 上，并绑定自定义域名。

### 当前状态
- 已有一个 Obsidian 仓库，包含 `.obsidian/` 配置和少量 Markdown 笔记
- 尚未集成 Quartz
- 尚未配置任何自动化部署流程

### 技术选型理由
| 组件 | 选型 | 理由 |
|---|---|---|
| 笔记编辑 | Obsidian | 已有基础，支持 wikilinks、graph view 等高级特性 |
| 静态站点生成 | Quartz 4 | 原生支持 Obsidian 语法，内置全文搜索、图视图、反向链接 |
| 托管/CDN | Cloudflare Pages | 官方原生支持，免费额度充足，自动 HTTPS+全球 CDN |
| 版本控制 | GitHub | 与 Cloudflare Pages 集成最顺畅 |
| 自定义域名 | Cloudflare DNS | 与 Pages 无缝集成，自动 SSL |

---

## 2. 目标

1. **本地开发**：在 Obsidian 中正常编辑笔记，保存即生效
2. **自动构建**：每次 git push 到 GitHub，自动触发 Quartz 构建
3. **自动部署**：构建产物自动部署到 Cloudflare Pages
4. **自定义域名**：通过自有域名访问站点
5. **隐私保护**：Obsidian 配置（`.obsidian/`）和未发布笔记不参与构建

---

## 3. 架构设计

### 3.1 数据流

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Obsidian 编辑   │────►│  content/    │────►│  Git Push   │
│  (本地笔记)      │     │  (笔记目录)   │     │  到 GitHub  │
└─────────────────┘     └──────────────┘     └──────┬──────┘
                                                    │
                       ┌────────────────────────────┘
                       ▼
              ┌─────────────────┐
              │  GitHub 仓库     │
              │  (main 分支)     │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────────────┐
              │  Cloudflare Pages       │
              │  自动构建:               │
              │  git fetch --unshallow  │
              │  npx quartz build       │
              └───────────┬─────────────┘
                          │
                          ▼
              ┌─────────────────────────┐
              │  public/ 静态站点        │
              │  部署到 Cloudflare 边缘  │
              └───────────┬─────────────┘
                          │
                          ▼
              ┌─────────────────────────┐
              │  自定义域名              │
              │  (e.g. notes.xxx.com)   │
              └─────────────────────────┘
```

### 3.2 组件职责

| 组件 | 职责 | 边界 |
|---|---|---|
| Obsidian | Markdown 编辑、本地预览、插件管理 | 只读写 `.obsidian/` 和 `content/` |
| Quartz | 将 `content/` 构建为静态网站 | 不触碰 `.obsidian/`，只读取 `content/` |
| GitHub | 代码/内容版本控制、触发 CI | 托管完整项目 |
| Cloudflare Pages | 构建、托管、CDN 分发 | 只构建部署，不存储敏感配置 |
| Cloudflare DNS | 域名解析、SSL 证书管理 | 只处理域名层 |

---

## 4. 目录结构设计

初始化 Quartz 后，仓库结构如下：

```
tsukino_dev/                          ← Git 仓库根
│
├── content/                           ← Obsidian 笔记目录（Quartz 构建源）
│   ├── 欢迎.md
│   ├── AGENTS.md                      ← 可移入（知识库说明）
│   └── ... (其他笔记)
│
├── quartz/                            ← Quartz 框架核心（初始化时生成）
│   ├── components/
│   ├── styles/
│   ├── static/
│   └── ...
│
├── quartz.config.ts                   ← Quartz 主配置（baseUrl 等）
├── quartz.layout.ts                   ← 页面布局配置
├── package.json                       ← Node 依赖
├── package-lock.json
│
├── .obsidian/                         ← Obsidian 配置（保留，不参与构建）
│   ├── plugins/
│   ├── app.json
│   └── ...
│
├── .gitignore                         ← 排除 .obsidian/、node_modules/ 等
└── README.md                          ← 项目说明（可选）
```

### 4.1 关键说明

- **`.obsidian/` 保留在根目录**：Obsidian 打开仓库时仍能识别这是一个 Vault
- **`content/` 为 Quartz 构建源**：只有放入 `content/` 的 Markdown 才会被发布
- **`AGENTS.md` 的移动**：可移入 `content/` 作为知识库首页说明，或留在根目录不发布
- **`.gitignore` 必须排除**：`.obsidian/`、`node_modules/`、`public/`（构建产物）

---

## 5. 配置详情

### 5.1 Quartz 配置 (`quartz.config.ts`)

```typescript
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Tsukino Dev Notes",
    baseUrl: "notes.yourdomain.com",    // ← 自定义域名
    ignorePatterns: [".obsidian"],       // ← 确保 Obsidian 配置不被构建
    // ... 其他配置
  },
  // ...
}
```

### 5.2 Cloudflare Pages 构建配置

| 配置项 | 值 | 说明 |
|---|---|---|
| Production branch | `main` | 使用现有主分支 |
| Framework preset | None | Quartz 不是标准框架 |
| Build command | `git fetch --unshallow && npx quartz build` | 完整克隆以支持 git 时间戳 |
| Build output directory | `public` | Quartz 默认输出目录 |

> **为什么加 `git fetch --unshallow`？**  
> Cloudflare Pages 默认执行浅克隆（`--depth 1`）。Quartz 的部分功能（如基于 git commit 时间的笔记排序）需要完整 git 历史。添加此命令确保功能完整。

### 5.3 自定义域名配置

假设域名为 `notes.yourdomain.com`：

1. **Cloudflare Pages 项目设置**
   - 进入项目 → **Custom domains**
   - 添加域名：`notes.yourdomain.com`
   - Cloudflare 自动验证并生成 SSL 证书

2. **Cloudflare DNS 记录**
   - 类型：`CNAME`
   - 名称：`notes`
   - 目标：`<project-name>.pages.dev`
   - 代理状态：已代理（橙色云）

---

## 6. 部署流程

### 6.1 日常发布流程

```
1. 在 Obsidian 中编辑笔记
2. 保存后，git add + commit
3. git push origin main
4. Cloudflare Pages 自动检测 push
5. 执行构建命令（~30-60 秒）
6. 站点自动更新
```

### 6.2 首次初始化流程

1. **本地初始化 Quartz**
   ```bash
   npx quartz create
   # 选择：empty（空模板）或 from source（从源码）
   ```

2. **迁移现有笔记**
   - 将 `.md` 文件移入 `content/`
   - 调整 `quartz.config.ts` 中的 `baseUrl`

3. **推送到 GitHub**
   ```bash
   git add .
   git commit -m "init: quartz + cloudflare pages"
   git push origin main
   ```

4. **Cloudflare Pages 连接**
   - 登录 Cloudflare Dashboard
   - Pages → Create a project → Connect to Git
   - 选择 GitHub 仓库，填写构建配置（见 5.2）

5. **绑定自定义域名**（见 5.3）

---

## 7. 安全与隐私

### 7.1 不会发布的内容

| 内容 | 位置 | 是否发布 | 控制方式 |
|---|---|---|---|
| Obsidian 配置 | `.obsidian/` | ❌ 否 | 不在 `content/` 中 |
| 草稿/私有笔记 | `private/`（可创建） | ❌ 否 | `ignorePatterns` 排除 |
| 构建产物 | `public/` | ❌ 否 | `.gitignore` 排除 |
| 依赖 | `node_modules/` | ❌ 否 | `.gitignore` 排除 |

### 7.2 公开内容范围

- 只有 `content/` 目录下的 Markdown 文件会被构建
- 图片等附件若放在 `content/` 内也会被发布
- 建议：敏感附件单独存放，通过 `ignorePatterns` 精确控制

---

## 8. 风险与应对

| 风险 | 影响 | 应对策略 |
|---|---|---|
| Quartz 构建失败 | 部署中断 | 本地先执行 `npx quartz build` 验证 |
| 自定义域名解析延迟 | 新域名无法访问 | DNS 传播通常 < 5 分钟，Cloudflare 内即时 |
| 笔记意外公开 | 隐私泄露 | 严格使用 `ignorePatterns`，敏感内容本地双重确认 |
| Cloudflare Pages 构建限制 | 免费额度超限 | 个人站点几乎不可能触及（500 builds/月） |
| URL 无 `.html` 后缀 | 某些边缘情况 404 | Quartz 原生处理，Cloudflare Pages 支持良好 |

---

## 9. 成功标准

- [ ] 本地 `npx quartz build` 构建成功，无报错
- [ ] `git push` 后 Cloudflare Pages 自动构建成功
- [ ] 通过自定义域名可正常访问站点
- [ ] Obsidian 中编辑、保存、推送后，网站内容实时更新（< 2 分钟）
- [ ] `.obsidian/` 配置未出现在最终网站中
- [ ] wikilinks、graph view、全文搜索等功能正常工作

---

## 10. 后续扩展方向

- **评论系统**：集成 Giscus（GitHub Discussions 驱动）
- **访问分析**：Cloudflare Web Analytics（隐私友好，无需 cookie）
- **多语言支持**：Quartz i18n 插件
- **自动备份**：GitHub Actions 定时备份到另一个存储

---

## 附录：参考链接

- [Quartz 官方文档](https://quartz.jzhao.xyz/)
- [Quartz Hosting 指南](https://quartz.jzhao.xyz/hosting)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare Pages + GitHub 集成](https://developers.cloudflare.com/pages/get-started/guide/)
