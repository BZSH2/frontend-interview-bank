# frontend-interview-bank 交付说明（2026-03-17）

## 这次收口后的结论

这轮调整后的唯一推荐部署路径是：

- **本地 / GitHub Actions hosted runner**：安装依赖、lint / typecheck、build、运行态产物检查、构建并发布运行态镜像
- **当前服务器**：只准备运行时环境变量、拉镜像、`docker compose up -d`
- **当前服务器不执行**：`pnpm install`、`pnpm bootstrap:dev`、`pnpm build:all`

目标是把部署链路收口成**纯运行态优先**，减少服务器上的不确定性。

## 当前机器上的端口约定

为避开现有服务冲突，统一使用：

- API：`36000`
- 用户端 H5：`36080`
- Admin：`36081`
- MySQL：`33307`

已知现有占用：

- `vue-admin`：`80`
- `nest-admin`：`35000`

## 关键改动

### 1. 纯运行态 compose

新增：

- `deploy/docker/docker-compose.nest-admin-style.runtime.yml`
- `deploy/docker/.env.runtime.example`

说明：

- API / H5 / Admin 全部使用预构建镜像
- 不再依赖宿主机源码目录、`dist`、`node_modules` 挂载运行
- 服务器只需要 `pull` + `up -d`

### 2. API 运行态镜像

新增 / 更新：

- `deploy/docker/Dockerfile.node-runtime`
- `api-server/Dockerfile`

说明：

- 使用 Node 20 Debian slim 多阶段镜像
- 运行态链路包含 API `dist`
- 包含 Prisma generate 结果
- 安装 OpenSSL / CA 证书以覆盖 Prisma 运行依赖

### 3. 前端镜像默认走 `/api`

新增 / 更新：

- `app-uni/Dockerfile`
- `admin-web/Dockerfile`
- `deploy/nginx/frontend-interview-bank-app.container.conf`
- `deploy/nginx/frontend-interview-bank-admin.container.conf`

说明：

- 前台 / 后台默认使用 `VITE_API_BASE_URL=/api`
- 容器内 Nginx 将 `/api` 反代到 `interview-bank-api:3000`
- 避免把服务器 IP、`localhost`、`127.0.0.1` 写死进静态产物

### 4. CI / 发布流程

更新：

- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`

说明：

- CI 补上 build 级别校验和运行态产物检查
- 发布流程改为官方托管 runner 构建并推送 GHCR 镜像
- 不依赖 self-hosted runner
- 不再采用 SSH / rsync / 远程 `pnpm install` / 远程 `build`

### 5. 运行态产物检查

新增：

- `scripts/check-runtime-artifacts.sh`
- `package.json` 中的 `check:runtime-artifacts`

说明：

- 检查 API / H5 / Admin 的关键构建产物是否存在
- 检查前台 / 后台静态产物中是否残留 `localhost` / `127.0.0.1` API 地址

### 6. 文档统一

更新：

- `README.md`
- `docs/deployment.md`
- `docs/current-server-deployment.md`
- `docs/automated-deployment.md`
- `docs/release-checklist.md`
- `deploy/docker/.env.nest-admin-style.example`

说明：

- 把服务器本机安装依赖 / 构建的路径降级为旧方案或开发调试用途
- 明确当前服务器唯一推荐方式是：**GHCR 运行态镜像 + runtime compose**

## 当前推荐部署步骤

### A. 构建端 / GitHub Actions

先通过 GitHub Actions 发布 3 个镜像：

- `frontend-interview-bank-api`
- `frontend-interview-bank-web`
- `frontend-interview-bank-admin`

推荐在服务器侧优先使用 `sha-*` tag，而不是长期跟随 `main`。

### B. 当前服务器

进入仓库目录后执行：

```bash
cp deploy/docker/.env.runtime.example deploy/docker/.env.runtime
cp api-server/.env.example api-server/.env
```

然后至少补齐：

- `API_IMAGE`
- `APP_IMAGE`
- `ADMIN_IMAGE`
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_PASSWORD`
- `API_HOST_PORT=36000`
- `APP_HOST_PORT=36080`
- `ADMIN_HOST_PORT=36081`
- `MYSQL_HOST_PORT=33307`

如果 GHCR 包是私有的：

```bash
docker login ghcr.io
```

启动：

```bash
docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml pull

docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml up -d
```

验证：

```bash
curl -fsS http://127.0.0.1:36000/api/health/live
curl -fsS http://127.0.0.1:36000/api/health/ready
curl -I http://127.0.0.1:36080
curl -I http://127.0.0.1:36081
```

## 我已完成的本地验证

以下命令已在本机执行并通过：

```bash
pnpm lint
pnpm typecheck
pnpm --filter api-server build
VITE_API_BASE_URL=/api pnpm --filter app-uni build:h5
VITE_API_BASE_URL=/api VITE_ADMIN_TOKEN= pnpm --filter admin-web build
sh scripts/check-runtime-artifacts.sh
SMOKE_SKIP_API=true pnpm smoke:test
git diff --check
```

## 还没闭环的部分

当前环境没有 Docker / MySQL 运行条件，因此**未完成**以下验证：

- Docker image 实际 build
- `docker compose` 运行态拉起
- 容器内 Prisma / OpenSSL 真机验证
- 带数据库的 live API smoke
- GHCR workflow 的真实线上执行

因此目前的状态应描述为：

- **部署方案、文档、CI、运行态链路已收口**
- **Docker / Registry / Runtime 真机闭环验证仍待有环境时完成**

## 仓库基线说明

这轮修改基于：

- 分支：`main`
- 起点基线：`342c42f`
- 本地 `main` 相对 `origin/main`：**ahead 5 commits**

本说明仅记录本轮收口后的交付口径，不表示 Docker 真机验证已完成。
