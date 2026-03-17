# frontend-interview-bank

前端面试题库 Monorepo，包含：

- `app-uni`：uni-app 用户端（微信小程序 / H5 / PC 浏览器）
- `api-server`：NestJS API 服务（题库、讲解申请、GitHub Issues 集成）
- `admin-web`：管理后台

## 技术栈

- **Monorepo**：pnpm workspace
- **Client**：uni-app + Vue 3 + TypeScript + Pinia
- **Server**：NestJS + Prisma + MySQL
- **Code Quality**：ESLint + Prettier + lint-staged + Husky + Commitlint
- **CI/CD**：GitHub Actions + GHCR runtime images

## 项目结构

```bash
frontend-interview-bank/
├─ app-uni/
├─ api-server/
├─ admin-web/
├─ deploy/
├─ docs/
├─ scripts/
├─ .github/workflows/
└─ package.json
```

## 当前推荐交付口径（runtime-first）

### 本地 / GitHub Actions hosted runner 负责

- `pnpm install`
- lint / typecheck
- build
- `scripts/check-runtime-artifacts.sh`
- 构建并发布 runtime 镜像到 GHCR

### 服务器负责

- 准备 env 文件
- `docker login ghcr.io`（如镜像私有）
- `docker compose pull`
- `docker compose up -d`

### 当前服务器明确不要做的事

- `pnpm install`
- `pnpm bootstrap:dev`
- `pnpm build:all`
- 源码级 build

## 当前服务器端口规划

- API：`36000`
- 用户端 H5：`36080`
- Admin：`36081`
- MySQL：`33307`

避让现有服务：

- `vue-admin`：`80`
- `nest-admin`：`35000`

## 本地开发（仅开发调试）

> 这一节是本地开发路径，不是当前服务器推荐部署路径。

### 1) 安装依赖

```bash
pnpm install
```

也可以直接执行：

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

> `GITHUB_TOKEN` 可先留空；这样本地仍可跑通，只是“申请新增讲解”不会自动创建 GitHub Issue。
> 如果需要保护后台接口，可在 `api-server/.env` 中设置 `ADMIN_TOKEN`，并在 `admin-web/.env` 中设置同样的 `VITE_ADMIN_TOKEN`。

### 4) 初始化数据库并注入示例数据

```bash
pnpm --filter api-server prisma:push
pnpm --filter api-server prisma:seed
```

### 5) 启动本地服务

```bash
pnpm dev:api
pnpm dev:uni:h5
pnpm dev:admin
```

## 关键脚本

```bash
pnpm lint
pnpm typecheck
pnpm build:all
pnpm smoke:test
pnpm --filter api-server build
pnpm --filter app-uni build:h5
pnpm --filter admin-web build
sh scripts/check-runtime-artifacts.sh
```

> 如本机暂无数据库/API 环境，可使用：
>
> ```bash
> SMOKE_SKIP_API=true pnpm smoke:test
> ```

## 部署

### 推荐：runtime-first（当前服务器）

1. 使用 GitHub Actions hosted runner 构建并发布 GHCR 镜像
2. 服务器复制环境变量模板：

```bash
cp deploy/docker/.env.runtime.example deploy/docker/.env.runtime
cp api-server/.env.example api-server/.env
```

3. 按需填写镜像 tag、MySQL 密码、业务 env
4. 启动：

```bash
docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml pull

docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml up -d
```

### 非推荐：源码构建式 Docker / PM2 / systemd

保留给本地开发、临时调试或历史兼容使用；**不作为当前服务器默认部署方案**。

## 文档索引

- 统一部署说明：`docs/deployment.md`
- 当前服务器部署说明：`docs/current-server-deployment.md`
- 本轮交付说明：`docs/delivery-handoff-2026-03-17.md`
- 运行态 compose：`deploy/docker/docker-compose.nest-admin-style.runtime.yml`
- 运行态 env 示例：`deploy/docker/.env.runtime.example`
- 构建式 Docker compose：`deploy/docker/docker-compose.nest-admin-style.yml`
- 运行态产物检查：`scripts/check-runtime-artifacts.sh`

## 提交规范

示例：

```bash
git commit -m "feat(api): add explanation request module"
git commit -m "feat(app): scaffold question detail page"
git commit -m "chore(repo): harden runtime deployment flow"
```
