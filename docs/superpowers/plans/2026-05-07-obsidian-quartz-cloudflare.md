# Obsidian + Quartz + Cloudflare Pages 部署实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有 Obsidian 知识库集成 Quartz 静态站点生成器，并配置自动部署到 Cloudflare Pages + 自定义域名。

**Architecture:** 在现有 Obsidian Vault 中初始化 Quartz，笔记存放在 `content/` 目录；GitHub 托管源码；Cloudflare Pages 监听 `main` 分支自动构建部署；Cloudflare DNS 绑定自定义域名。

**Tech Stack:** Node.js 22+, Quartz 4, Git, GitHub, Cloudflare Pages, Cloudflare DNS

---

## 文件结构映射

初始化完成后，仓库结构如下：

| 文件/目录 | 来源 | 职责 |
|---|---|---|
| `content/` | 手动创建/迁移 | Obsidian 笔记存放目录，Quartz 构建源 |
| `quartz/` | `npx quartz create` 生成 | Quartz 框架核心代码 |
| `quartz.config.ts` | `npx quartz create` 生成 + 手动修改 | Quartz 主配置（baseUrl、ignorePatterns） |
| `quartz.layout.ts` | `npx quartz create` 生成 | 页面布局配置 |
| `package.json` | `npx quartz create` 生成 | Node 依赖声明 |
| `.gitignore` | `npx quartz create` 生成 + 手动修改 | 排除 node_modules/、public/、.obsidian/ |
| `.obsidian/` | 已有 | Obsidian Vault 配置，保留在根目录 |
| `docs/` | 已有 | 设计文档和计划文档 |

---

### Task 1: 环境检查与准备

**Files:**
- 无文件变更，纯环境验证

- [ ] **Step 1: 检查 Node.js 版本**

Run:
```bash
node --version
npm --version
```
Expected:
- `node` >= v22.0.0
- `npm` >= v10.9.2

If version too low, update Node.js first.

- [ ] **Step 2: 确认当前 Git 状态**

Run:
```bash
git status
```
Expected: `On branch master` or `main`, working tree clean.

- [ ] **Step 3: 备份现有文件（以防 Quartz init 冲突）**

Run:
```bash
mkdir -p _backup
cp -r .obsidian _backup/
cp AGENTS.md _backup/
cp "欢迎.md" _backup/
```
Expected: `_backup/` directory created with copies.

---

### Task 2: 初始化 Quartz 项目

**Files:**
- Create: `package.json`, `package-lock.json`, `quartz.config.ts`, `quartz.layout.ts`, `.gitignore`
- Create: `quartz/` (entire directory)
- Create: `content/` (directory)

- [ ] **Step 1: 运行 Quartz 初始化**

Run:
```bash
cd C:\Users\65493\wxr\Obsidian\tsukino_dev
npx quartz create
```

When prompted:
- **Choose how to initialize Quartz**: Select `Empty Quartz` (or `Quartz from source` if you want full control)
- **Choose content source**: Select `Empty directory` (we will migrate existing notes manually)

Expected: `quartz/`, `content/`, `package.json`, `quartz.config.ts`, etc. created in current directory.

- [ ] **Step 2: 确认 Quartz 文件已生成**

Run:
```bash
ls -la
ls quartz/
```
Expected: `quartz.config.ts`, `package.json`, `content/`, `quartz/` present.

- [ ] **Step 3: 验证 .obsidian/ 未被覆盖**

Run:
```bash
ls .obsidian/
```
Expected: Original Obsidian config files still present (app.json, appearance.json, etc.).

- [ ] **Step 4: Commit initialization**

Run:
```bash
git add .
git commit -m "init: initialize Quartz 4 in existing Obsidian vault"
```
Expected: Commit successful.

---

### Task 3: 配置 Quartz

**Files:**
- Modify: `quartz.config.ts`

- [ ] **Step 1: 读取当前 quartz.config.ts**

Use ReadFile to inspect `quartz.config.ts` and identify the `configuration` object.

- [ ] **Step 2: 修改 quartz.config.ts 完整配置**

基于官方默认配置，修改以下关键项：

**configuration 对象：**
```typescript
configuration: {
  pageTitle: "Tsukino Dev Notes",
  pageTitleSuffix: "",
  enableSPA: true,
  enablePopovers: true,
  analytics: {
    provider: "plausible",              // 可后续改为 Cloudflare Web Analytics
  },
  locale: "zh-CN",                     // ← 中文站点
  baseUrl: "notes.tsukino.dev",        // ← 自定义域名
  ignorePatterns: [".obsidian", "private", "templates", "_backup"],
  defaultDateType: "created",          // ← "created" 按创建时间；"modified" 按修改时间
  // ... theme 配置保持不变或按需调整
}
```

**plugins.transformers 数组：**
在 `Plugin.Latex({ renderEngine: "katex" })` 之后添加：
```typescript
Plugin.HardLineBreaks(),                // ← 中文用户建议添加，与 Obsidian 预览行为一致
```

**plugins.emitters 数组：**
```typescript
emitters: [
  // Plugin.AliasRedirects(),          // ← 如不需要旧链接跳转，注释掉可加速构建
  Plugin.ComponentResources(),
  Plugin.ContentPage(),
  Plugin.FolderPage(),
  Plugin.TagPage(),
  Plugin.ContentIndex({
    enableSiteMap: true,
    enableRSS: true,
  }),
  Plugin.Assets(),
  Plugin.Static(),
  Plugin.Favicon(),
  Plugin.NotFoundPage(),
  // Plugin.CustomOgImages(),          // ← 如构建过慢，注释掉可显著加速（大型知识库建议）
],
```

- [ ] **Step 3: 验证修改后的配置**

Run:
```bash
cat quartz.config.ts | grep -E "baseUrl|ignorePatterns|pageTitle"
```
Expected: Shows your custom domain and ignorePatterns.

- [ ] **Step 4: Commit configuration**

Run:
```bash
git add quartz.config.ts
git commit -m "config: set baseUrl, pageTitle and ignorePatterns"
```

---

### Task 4: 迁移现有笔记与配置 .gitignore

**Files:**
- Create/Move: `content/欢迎.md`
- Create/Move: `content/AGENTS.md` (optional)
- Modify: `.gitignore`

- [ ] **Step 1: 移动现有 Markdown 笔记到 content/**

Run:
```bash
mv "欢迎.md" content/
# Optional: also move AGENTS.md if you want it published
mv AGENTS.md content/
```

- [ ] **Step 2: 创建 content/index.md 首页**

Quartz 需要 `content/index.md` 作为站点首页。如果 `欢迎.md` 就是首页内容，可以直接：

```bash
cd content
mv "欢迎.md" "index.md"
```

或者保留 `欢迎.md`，同时创建一个简短的 `index.md`：

```markdown
---
title: Tsukino Dev Notes
---

欢迎来到我的知识库！

- [[欢迎]]
```

Expected: `content/index.md` exists.

- [ ] **Step 3: 配置 .gitignore**

- [ ] **Step 2: 配置 .gitignore**

Open `.gitignore` and ensure these entries exist (add if missing):

```gitignore
# Dependencies
node_modules/

# Quartz build output
public/

# Build cache & profiling
.quartz-cache/
prof/
tsconfig.tsbuildinfo

# System files
.DS_Store

# Obsidian auto-generated files that change frequently
.obsidian/workspace.json
.obsidian/graph.json

# Private content
private/
```

> **Decision:** Keep `.obsidian/` in git (needed for LiveSync and cross-device use), but exclude auto-generated files that change frequently.

- [ ] **Step 3: Commit migration**

Run:
```bash
git add .
git commit -m "content: migrate existing notes to content/ and update .gitignore"
```

---

### Task 5: 本地构建验证

**Files:**
- No file changes (build artifacts are gitignored)

- [ ] **Step 1: 安装依赖**

Run:
```bash
npm install
```
Expected: `node_modules/` created, no errors.

- [ ] **Step 2: 执行本地构建**

Run:
```bash
npx quartz build
```
Expected: Build completes successfully, output ends with something like:
```
Found X files
Built X pages in Yms
```

- [ ] **Step 3: 验证 public/ 输出目录**

Run:
```bash
ls public/
```
Expected: `index.html`, static assets (js, css), and page directories present.

- [ ] **Step 4: 检查 .obsidian/ 未被包含在构建中**

Run:
```bash
ls public/ | grep obsidian
```
Expected: No output (`.obsidian/` not in public).

- [ ] **Step 5: （可选）本地预览**

Run:
```bash
npx quartz build --serve
```
Open browser to `http://localhost:8080/`
Expected: Site renders, wikilinks work.

Stop preview with Ctrl+C.

---

### Task 6: Git 分支标准化与推送到 GitHub

**Files:**
- No file changes

- [ ] **Step 1: 重命名当前分支为 main**

Run:
```bash
git branch -m main
```
Expected: `git branch` shows `* main`.

- [ ] **Step 2: 添加 GitHub remote**

Run:
```bash
git remote add origin https://github.com/YOUR_USERNAME/tsukino-dev.git
```
Replace `YOUR_USERNAME` with your actual GitHub username.

Expected: `git remote -v` shows origin pointing to your repo.

- [ ] **Step 3: 推送到 GitHub**

Run:
```bash
git push -u origin main
```
Expected: All commits pushed, branch `main` tracked.

---

### Task 7: Cloudflare Pages 项目配置

**Files:**
- No local file changes (Cloudflare Dashboard configuration)

- [ ] **Step 1: 登录 Cloudflare Dashboard 创建 Pages 项目**

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. Select **GitHub** and authorize Cloudflare
4. Select the `tsukino-dev` repository

- [ ] **Step 2: 配置构建设置**

In "Set up builds and deployments":

| Configuration | Value |
|---|---|
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `git fetch --unshallow && npx quartz build` |
| Build output directory | `public` |

Click **Save and Deploy**.

Expected: First build starts automatically.

- [ ] **Step 3: 等待首次构建完成并验证**

Wait for build to complete (usually 30-90 seconds).

Expected:
- Build status: **Success**
- Pages URL: `https://<project-name>.pages.dev` is live
- Opening the URL shows your Quartz site

---

### Task 8: 自定义域名绑定

**Files:**
- No local file changes (Cloudflare Dashboard + DNS configuration)

- [ ] **Step 1: 在 Pages 项目中添加自定义域名**

1. In Cloudflare Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain: `notes.tsukino.dev`
4. Click **Continue** and **Activate domain**

Expected: Cloudflare validates the domain and shows "Active" status (may take a few minutes).

- [ ] **Step 2: 确认 DNS 记录**

Cloudflare should auto-add a CNAME record if the domain is in the same Cloudflare account.

Verify in **DNS** → **Records**:
- Type: `CNAME`
- Name: `notes` (or your subdomain)
- Target: `<project-name>.pages.dev`
- Proxy status: Proxied (orange cloud)

If not auto-added, create it manually.

- [ ] **Step 3: 验证 HTTPS 和访问**

Open `https://notes.tsukino.dev`.

Expected:
- Site loads successfully
- HTTPS lock icon present
- Content matches your Obsidian notes

---

### Task 9: 端到端验证

**Files:**
- No file changes (functional validation)

- [ ] **Step 1: 编辑一篇笔记并推送**

1. Open Obsidian, edit any note in `content/`
2. Save the file
3. Git commit and push:

```bash
git add content/
git commit -m "test: update note to verify auto-deploy"
git push origin main
```

- [ ] **Step 2: 观察 Cloudflare Pages 自动构建**

1. Go to Cloudflare Pages dashboard
2. Watch for new build triggered by the push
3. Wait for build completion

Expected: Build completes successfully.

- [ ] **Step 3: 验证网站更新**

Open your custom domain and verify:
- The edit you just made is reflected on the site
- Time from push to live: < 2 minutes

- [ ] **Step 4: 验证核心 Quartz 功能**

Navigate the site and verify:
- [ ] Wikilinks (`[[...]]`) resolve correctly
- [ ] Graph view loads and shows connections
- [ ] Full-text search works
- [ ] Backlinks section appears on pages
- [ ] `.obsidian/` content is NOT accessible via URL

---

## Spec Coverage Check

| 设计文档要求 | 对应任务 |
|---|---|
| 在现有 Vault 中初始化 Quartz | Task 2 |
| 笔记存放在 `content/` | Task 4 |
| `baseUrl` 配置为自定义域名 | Task 3 |
| `ignorePatterns` 排除 `.obsidian/` | Task 3 |
| 自动构建部署（git push → Pages） | Task 6, 7 |
| Cloudflare Pages 构建配置 | Task 7 |
| 自定义域名 + DNS + HTTPS | Task 8 |
| 本地构建验证 | Task 5 |
| 端到端验证 | Task 9 |

---

## Placeholder Scan

- [x] 无 "TBD"、"TODO"、"implement later"
- [x] 所有命令和配置值为具体值（用户需在 Task 6 Step 2、Task 8 Step 1 替换 `your-domain.com` 和 GitHub username）
- [x] 每个任务包含完整的命令和预期输出
- [x] 无 "Similar to Task N" 引用

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-07-obsidian-quartz-cloudflare.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration. Better for multi-step setups with external services (GitHub, Cloudflare).

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
