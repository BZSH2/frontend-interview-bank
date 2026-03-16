# frontend-interview-bank

一个可直接演示、可继续扩展的前端面试题库 Monorepo。

包含三个可独立运行的端：

- `app-uni`：uni-app 用户端（微信小程序 / H5 / PC 浏览器）
- `admin-web`：Vue 3 后台管理台（分类、题目、讲解申请、GitHub 同步）
- `api-server`：NestJS API 服务（题库、讲解申请、GitHub Issues 集成）

## 这版项目能做什么

- 用户端浏览题目、查看详情、提交“新增讲解”申请
- 后台管理题目 / 分类 / 讲解申请
- 后台支持补录讲解，并自动把关联申请置为 `DONE`
- 讲解申请可选择同步到 GitHub Issue
- 提供种子数据、构建脚本、烟雾测试、CI、自动部署脚手架

## 技术栈

- **Monorepo**：pnpm workspace
- **Client**：uni-app + Vue 3 + TypeScript + Pinia
- **Admin**：Vue 3 + Vite + TypeScript
- **Server**：NestJS + Prisma + MySQL
- **Code Quality**：ESLint + Prettier + lint-staged + Husky + Commitlint
- **Automation**：GitHub Actions + SSH/rsync 远程部署脚本

## 项目结构

```bash
frontend-interview-bank/
├─ admin-web/
├─ api-server/
├─ app-uni/
├─ deploy/
├─ docs/
├─ scripts/
├─ .github/workflows/
└─ package.json
```

## 环境要求

- Node.js 20+
- pnpm 10+
- Docker（本地起 MySQL 时推荐）
- MySQL 8+

## 快速开始

### 1) 安装依赖

```bash
pnpm install
```

或者直接用一键初始化：

```bash
pnpm bootstrap:dev
```

它会做这几件事：

1. 安装依赖
2. 复制缺失的 `.env`
3. 校验三端环境变量是否合理
4. 启动 `docker compose` 里的 MySQL
5. 执行 `prisma:push`
6. 注入示例数据

### 2) 手动初始化（可选）

如果你想手动控制步骤：

```bash
cp api-server/.env.example api-server/.env
cp app-uni/.env.example app-uni/.env
cp admin-web/.env.example admin-web/.env

docker compose up -d mysql
pnpm --filter api-server prisma:push
pnpm --filter api-server prisma:seed
```

默认数据库：

- host: `127.0.0.1`
- port: `33306`
- database: `frontend_interview_bank`
- user: `interview_app`
- password: `interview_app_123`

### 3) 启动本地开发

开 3 个终端：

```bash
pnpm dev:api
pnpm dev:uni:h5
pnpm dev:admin
```

默认地址：

- API：`http://127.0.0.1:3000/api`
- 用户端 H5：`http://127.0.0.1:5173`（uni-app dev server）
- 后台：`http://127.0.0.1:5174`

### 4) 本地构建 + 预览

```bash
pnpm build:all
pnpm preview:all
```

预览地址：

- 用户端 H5：`http://127.0.0.1:4173`
- 后台：`http://127.0.0.1:4174`

> `preview:all` 只托管静态产物，默认假定 API 已在另一个终端运行（例如 `pnpm dev:api`）。

## 默认示例数据

执行 seed 后会自动生成：

- 6 个题目分类
- 6 道前端面试题
- 1 条已完成讲解的数据
- 2 条“新增讲解申请”演示记录

这意味着你本地启动后就可以直接演示：

- 用户端浏览题目
- 后台查看 / 筛选题目
- 后台查看待处理讲解申请
- 后台补写讲解并观察状态变化

## 后台使用说明

当前后台重点覆盖三个场景：

1. **题目管理**
   - 关键词 / 分类 / 难度 / 状态 / 讲解状态筛选
   - 题目编辑器内直接补录讲解
   - 查看题目更新时间、讲解更新时间、关联申请同步状态

2. **讲解申请处理**
   - 支持分页、筛选、修改申请状态
   - 可一键跳转到题目编辑页
   - 可将本地申请同步到 GitHub

3. **分类管理**
   - 维护分类名称与排序
   - 实时看到每个分类下的题目数

## GitHub Issue 同步（可选）

如果 `GITHUB_TOKEN` 为空，本地仍可完整跑通；只是申请不会自动创建 GitHub Issue。

后续补上 token 后，可以执行：

```bash
pnpm --filter api-server sync:github-issues:dry-run
pnpm --filter api-server sync:github-issues
```

- `dry-run`：只预览要同步哪些申请
- 正式命令：会把 `githubIssueNumber` / `githubIssueId` 回写数据库

## 管理后台鉴权（可选）

如需保护 `/api/admin/*`：

- 在 `api-server/.env` 中设置 `ADMIN_TOKEN`
- 在 `admin-web/.env` 中设置同样的 `VITE_ADMIN_TOKEN`

本项目的烟雾测试脚本会自动读取环境变量 `ADMIN_TOKEN`，因此加了后台鉴权后仍然可以继续执行：

```bash
ADMIN_TOKEN=your-token pnpm smoke:test
```

## 常用脚本

```bash
pnpm lint
pnpm lint:fix
pnpm format
pnpm typecheck
pnpm check
pnpm validate:env
pnpm validate:env -- --require-env-files
pnpm bootstrap:dev
pnpm build:all
pnpm smoke:test
pnpm preview:all
pnpm deploy:remote
pnpm --filter api-server prisma:push
pnpm --filter api-server prisma:seed
pnpm --filter api-server build
pnpm --filter app-uni build:h5
pnpm --filter admin-web build
```

`pnpm validate:env` 会校验：

- `api-server/.env` / `.env.example` 中的 `PORT`、`DATABASE_URL`
- `admin-web` / `app-uni` 的 `VITE_API_BASE_URL` 是否为合法 URL，且以 `/api` 结尾
- 如果 API 开启了 `ADMIN_TOKEN`，则后台 `VITE_ADMIN_TOKEN` 是否保持一致
- GitHub 同步相关变量是否成对出现

## 推荐本地验收流程

如果你想快速确认项目可演示，推荐这条顺序：

```bash
pnpm bootstrap:dev
pnpm validate:env -- --require-env-files
pnpm build:all
pnpm dev:api
pnpm preview:all
pnpm smoke:test
```

## 健康检查与烟雾测试

当前 API 同时提供两类健康检查：

- `GET /api/health` 或 `GET /api/health/live`：进程存活检查
- `GET /api/health/ready`：就绪检查，会额外探测数据库连接

默认烟雾测试会依次验证：

- `health/live`
- `health/ready`
- 后台概览与申请列表
- 题目列表
- 前后台构建产物是否存在

如果你想连同线上静态站点一起验收，也可以额外传入：

```bash
APP_BASE_URL=https://your-app.example.com \
ADMIN_BASE_URL=https://your-admin.example.com \
pnpm smoke:test
```

## 自动化与部署

已经提供两层能力：

### 1. CI

- 文件：`.github/workflows/ci.yml`
- 在 PR / push 时执行：
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm build:all`

### 2. 自动部署脚手架

- 文件：`.github/workflows/deploy.yml`
- 远程脚本：`scripts/deploy-remote.sh`
- systemd 模板：`deploy/systemd/*.service.example`

`deploy-remote.sh` 默认会把“缺失 `.env` 时自动复制 example”视为风险并直接失败；
只有显式设置 `ALLOW_ENV_EXAMPLE_FALLBACK=true` 时，才会回退到 example 配置。

适合这类最小化生产方式：

- API：systemd 常驻 Node 进程
- 用户端 / 后台：构建后由 `serve-static.mjs` 或 Nginx 托管
- 数据库：宿主 MySQL 或 Docker 中的 MySQL

详细说明看：

- `docs/deployment.md`
- `docs/automated-deployment.md`
- `docs/release-checklist.md`

## 提交规范

统一使用 Conventional Commits，例如：

```bash
git commit -m "feat(admin): improve request workflow"
git commit -m "feat(deploy): add github actions remote deploy"
git commit -m "chore(repo): tighten smoke test"
```

## 相关文档

- 部署说明：`docs/deployment.md`
- 自动部署说明：`docs/automated-deployment.md`
- 发布检查清单：`docs/release-checklist.md`
- 当前服务器说明：`docs/current-server-deployment.md`
- Nginx 示例：`deploy/nginx/frontend-interview-bank.conf.example`
- PM2 示例：`deploy/pm2/ecosystem.config.cjs`
- systemd 示例：`deploy/systemd/*.service.example`
- Docker 示例：`deploy/docker/docker-compose.nest-admin-style.yml`
