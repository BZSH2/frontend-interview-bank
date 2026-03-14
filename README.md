# frontend-interview-bank

前端面试题库 Monorepo，包含：

- `app-uni`：uni-app 用户端（微信小程序 / H5 / PC 浏览器）
- `api-server`：NestJS API 服务（题库、讲解申请、GitHub Issues 集成）

## 技术栈

- **Monorepo**：pnpm workspace
- **Client**：uni-app + Vue 3 + TypeScript + Pinia
- **Server**：NestJS + Prisma + MySQL
- **Code Quality**：ESLint + Prettier + lint-staged + Husky + Commitlint
- **CI**：GitHub Actions

## 项目结构

```bash
frontend-interview-bank/
├─ app-uni/
├─ api-server/
├─ admin-web/
├─ docker-compose.yml
├─ .husky/
├─ .github/workflows/
└─ package.json
```

## 开发约束

- 统一使用 **Conventional Commits**
- 提交前自动执行 `lint-staged`
- 统一通过根目录脚本执行 lint / format / typecheck
- 默认按 **模块化、可扩展、前后端解耦** 的大厂工程化风格维护

## 快速开始

### 1) 安装依赖

```bash
pnpm install
```

> 也可以直接一键初始化：

```bash
pnpm bootstrap:dev
```

### 2) 启动本地 MySQL

```bash
docker compose up -d mysql
```

默认数据库配置：

- host: `127.0.0.1`
- port: `33306`
- database: `frontend_interview_bank`
- user: `interview_app`
- password: `interview_app_123`

### 3) 配置环境变量

```bash
cp api-server/.env.example api-server/.env
cp app-uni/.env.example app-uni/.env
cp admin-web/.env.example admin-web/.env
```

> `GITHUB_TOKEN` 可先留空；这样本地仍可跑通，只是用户点击“申请新增讲解”时不会自动创建 GitHub Issue。
> 如果你想保护后台接口，可在 `api-server/.env` 里设置 `ADMIN_TOKEN`，并在 `admin-web/.env` 里设置同样的 `VITE_ADMIN_TOKEN`。

### 4) 初始化数据库并注入示例数据

```bash
pnpm --filter api-server prisma:push
pnpm --filter api-server prisma:seed
```

### 5) 如需补同步到 GitHub（可选）

当 `GITHUB_TOKEN` 为空时，用户申请会先落本地数据库。
后面只要补上 token，就可以执行：

```bash
pnpm --filter api-server sync:github-issues:dry-run
pnpm --filter api-server sync:github-issues
```

- `dry-run` 只预览哪些申请会被同步
- 正式命令会把 `githubIssueNumber` / `githubIssueId` 回写数据库

### 6) 启动服务

```bash
pnpm dev:api
pnpm dev:uni:h5
pnpm dev:admin
```

## 已提供的示例数据

seed 完成后会自动生成：

- 6 个题目分类
- 6 道前端面试题
- 1 条已完成讲解的题目数据
- 2 条“新增讲解申请”演示记录

## 关键脚本

```bash
pnpm lint
pnpm lint:fix
pnpm format
pnpm typecheck
pnpm check
pnpm bootstrap:dev
pnpm build:all
pnpm smoke:test
pnpm preview:all
pnpm --filter api-server prisma:push
pnpm --filter api-server prisma:seed
pnpm --filter api-server build
pnpm --filter app-uni build:h5
pnpm --filter admin-web build
```

## 提交规范

示例：

```bash
git commit -m "feat(api): add explanation request module"
git commit -m "feat(app): scaffold question detail page"
git commit -m "chore(repo): add commitlint and husky"
```

## 部署

- 部署说明：`docs/deployment.md`
- Nginx 示例：`deploy/nginx/frontend-interview-bank.conf.example`
- PM2 示例：`deploy/pm2/ecosystem.config.cjs`

## 交付补充

- 发布检查清单：`docs/release-checklist.md`
- 生产部署说明：`docs/deployment.md`
- Docker 示例：`deploy/docker/docker-compose.app.example.yml`
