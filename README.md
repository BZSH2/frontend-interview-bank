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
- 提供种子数据、构建脚本、运行态产物检查、CI、容器化交付脚手架

## 技术栈

- **Monorepo**：pnpm workspace
- **Client**：uni-app + Vue 3 + TypeScript + Pinia
- **Admin**：Vue 3 + Vite + TypeScript
- **Server**：NestJS + Prisma + MySQL
- **Code Quality**：ESLint + Prettier + lint-staged + Husky + Commitlint
- **Automation**：GitHub Actions + GHCR 运行态镜像发布

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

## 推荐交付策略（重要）

当前仓库已经把部署口径收口为：

1. **本地或 GitHub Actions hosted runner** 负责安装依赖、lint / typecheck、build、运行态产物检查、构建并发布运行态镜像。
2. **服务器** 只负责：
   - 准备 `api-server/.env`
   - 准备 `deploy/docker/.env.runtime`
   - `docker compose pull`
   - `docker compose up -d`
3. **当前服务器不再推荐执行** `pnpm install`、`pnpm bootstrap:dev`、`pnpm build:all` 这类源码级安装/构建流程。

推荐端口统一为：

- API：`36000`
- 用户端 H5：`36080`
- 管理后台：`36081`
- MySQL：`33307`

这样可避开当前机器上已存在的：

- `vue-admin`：占用 `80`
- `nest-admin`：占用 `35000`

> 推荐运行态编排文件：`deploy/docker/docker-compose.nest-admin-style.runtime.yml`
>
> 本地/CI 如需从源码构建镜像，可用：`deploy/docker/docker-compose.nest-admin-style.yml`
>
> 该 build compose 适合“构建端”，**不适合作为当前服务器的推荐部署路径**。

## 当前服务器推荐步骤（摘要）

1. 先让 GitHub Actions 发布 GHCR 镜像：见 `docs/automated-deployment.md`
2. 在服务器准备配置：

```bash
cp deploy/docker/.env.runtime.example deploy/docker/.env.runtime
cp api-server/.env.example api-server/.env
```

3. 修改：
   - `deploy/docker/.env.runtime` 里的镜像地址 / tag / MySQL 密码
   - `api-server/.env` 里的业务环境变量
4. 若 GHCR 包是私有的，先登录：

```bash
docker login ghcr.io
```

5. 启动纯运行态 compose：

```bash
docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml pull

docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml up -d
```

6. 验证：

```bash
curl -fsS http://127.0.0.1:36000/api/health/live
curl -fsS http://127.0.0.1:36000/api/health/ready
```

详细步骤见：`docs/current-server-deployment.md`

## 本地开发快速开始

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

```bash
cp api-server/.env.example api-server/.env
cp app-uni/.env.example app-uni/.env
cp admin-web/.env.example admin-web/.env

docker compose up -d mysql
pnpm --filter api-server prisma:push
pnpm --filter api-server prisma:seed
```

默认本地开发数据库：

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
- 用户端 H5：`http://127.0.0.1:5173`
- 后台：`http://127.0.0.1:5174`

## 本地构建与运行态验收

### 本地构建

```bash
pnpm lint
pnpm typecheck
pnpm --filter api-server build
VITE_API_BASE_URL=/api pnpm --filter app-uni build:h5
VITE_API_BASE_URL=/api VITE_ADMIN_TOKEN= pnpm --filter admin-web build
sh scripts/check-runtime-artifacts.sh
```

`check-runtime-artifacts.sh` 会检查：

- `api-server/dist/main.js` 是否存在
- `app-uni/dist/build/h5/index.html` 是否存在
- `admin-web/dist/index.html` 是否存在
- 前后台静态产物里是否残留 `localhost` / `127.0.0.1` 的 API 地址

### 仅静态预览

```bash
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

## GitHub Issue 同步（可选）

如果 `GITHUB_TOKEN` 为空，本地仍可完整跑通；只是申请不会自动创建 GitHub Issue。

后续补上 token 后，可以执行：

```bash
pnpm --filter api-server sync:github-issues:dry-run
pnpm --filter api-server sync:github-issues
```

## 管理后台鉴权（可选）

如需保护 `/api/admin/*`：

- 在 `api-server/.env` 中设置 `ADMIN_TOKEN`
- 在 `admin-web` 构建阶段注入同样的 `VITE_ADMIN_TOKEN`

当前默认的 GHCR 运行态镜像发布流程**不会自动注入该 token**，避免把环境专属值固化进通用镜像。
如需启用它，请在受控构建环境里生成专用 admin 镜像。

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
pnpm check:runtime-artifacts
pnpm smoke:test
pnpm preview:all
pnpm deploy:remote
pnpm --filter api-server prisma:push
pnpm --filter api-server prisma:seed
pnpm --filter api-server build
pnpm --filter app-uni build:h5
pnpm --filter admin-web build
```

说明：

- `pnpm build:all` 适合本地开发验收。
- `pnpm deploy:remote` / `scripts/deploy-remote.sh` 仍保留作旧的源码同步方案参考，**不是当前服务器的推荐路径**。
- 生产 / 演示部署优先走 GHCR 运行态镜像 + runtime compose。

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

如果想连同线上静态站点一起验收，也可以额外传入：

```bash
APP_BASE_URL=https://your-app.example.com \
ADMIN_BASE_URL=https://your-admin.example.com \
pnpm smoke:test
```

## CI / CD

### CI

文件：`.github/workflows/ci.yml`

在 PR / push 时执行：

- `pnpm lint`
- `pnpm typecheck`
- `pnpm --filter api-server build`
- `pnpm --filter app-uni build:h5`
- `pnpm --filter admin-web build`
- `sh scripts/check-runtime-artifacts.sh`

### 运行态镜像发布

文件：`.github/workflows/deploy.yml`

在以下情况执行：

- `ci.yml` 在 `main` 分支对应提交上通过后自动触发
- 或手动触发 `workflow_dispatch`

工作流会：

- 使用 GitHub Actions hosted runner
- 构建 API / H5 / Admin 三个运行态镜像
- 发布到 GHCR
- 产出 `main` 与 `sha-*` 标签

服务器只需 pull + up，不需要 `pnpm install`。

## 相关文档

- 部署总览：`docs/deployment.md`
- 自动化发布：`docs/automated-deployment.md`
- 当前服务器说明：`docs/current-server-deployment.md`
- 发布检查清单：`docs/release-checklist.md`
- Docker 运行态 compose：`deploy/docker/docker-compose.nest-admin-style.runtime.yml`
- Docker 本地构建 compose：`deploy/docker/docker-compose.nest-admin-style.yml`
- Nginx 容器配置：`deploy/nginx/*.container.conf`
