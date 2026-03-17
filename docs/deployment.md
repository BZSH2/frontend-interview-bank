# 部署说明

## 先说结论

当前仓库的推荐部署策略已经收口成：

- **构建端（本地机器或 GitHub Actions hosted runner）**：安装依赖、lint / typecheck、build、运行态产物检查、发布镜像
- **服务器**：只保存配置文件，拉取运行态镜像并启动容器
- **当前服务器不推荐**：`pnpm install`、`pnpm bootstrap:dev`、`pnpm build:all`

这是为了把“交付”和“运行”拆开：

- 构建问题在本地/CI 暴露
- 服务器只做稳定的运行态承接
- 避免在当前机器上再做一次源码级安装和构建

## 当前机器的端口与冲突约束

已知现状：

- `vue-admin` 占用 `80`
- `nest-admin` 使用 `35000`

因此本项目统一使用：

- API：`36000`
- 用户端 H5：`36080`
- 管理后台：`36081`
- MySQL：`33307`

## 推荐部署形态：GHCR 运行态镜像 + Runtime Compose

### 1. 构建端负责什么

推荐由 GitHub Actions hosted runner 承担：

1. `pnpm install --frozen-lockfile`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm --filter api-server build`
5. `VITE_API_BASE_URL=/api pnpm --filter app-uni build:h5`
6. `VITE_API_BASE_URL=/api VITE_ADMIN_TOKEN= pnpm --filter admin-web build`
7. `sh scripts/check-runtime-artifacts.sh`
8. 构建并发布 GHCR 运行态镜像

### 2. 服务器负责什么

服务器只做这些事：

1. 准备 `api-server/.env`
2. 准备 `deploy/docker/.env.runtime`
3. `docker login ghcr.io`（如果镜像仓库是私有的）
4. `docker compose pull`
5. `docker compose up -d`
6. 健康检查与必要日志查看

### 3. 推荐使用的文件

- Runtime Compose：`deploy/docker/docker-compose.nest-admin-style.runtime.yml`
- Runtime 环境变量示例：`deploy/docker/.env.runtime.example`
- API 运行态镜像 Dockerfile：`deploy/docker/Dockerfile.node-runtime`
- 当前服务器步骤：`docs/current-server-deployment.md`
- 自动化镜像发布：`docs/automated-deployment.md`

## 为什么前端镜像默认使用 `/api`

前台 H5 和后台管理台都是静态资源，过去如果在构建阶段写死 `http://服务器IP:36000/api`，会带来两个问题：

1. 镜像不可移植，一换服务器地址就要重构建
2. 容易把 `localhost` / `127.0.0.1` 残留打进产物

现在默认改成：

- 构建阶段注入 `VITE_API_BASE_URL=/api`
- H5 / Admin 容器内的 Nginx 负责把 `/api` 反代到 `interview-bank-api:3000`

收益：

- 前端镜像可复用
- 不需要为不同服务器反复改构建参数
- 服务器对外仍保留 `36000` 作为 API 独立入口，便于健康检查与调试

## 当前服务器推荐步骤

### 1. 准备配置文件

```bash
cp deploy/docker/.env.runtime.example deploy/docker/.env.runtime
cp api-server/.env.example api-server/.env
```

需要修改：

- `deploy/docker/.env.runtime`：镜像地址 / tag / MySQL 密码 / 端口
- `api-server/.env`：`DATABASE_URL` 之外的业务环境变量（如 GitHub Token、Admin Token）

> `docker-compose.nest-admin-style.runtime.yml` 会在容器启动时覆盖 `DATABASE_URL`，让 API 始终连接 compose 内的 MySQL 容器；因此 `api-server/.env` 中保留本地开发地址不会影响容器内运行。
>
> 另外，默认发布到 GHCR 的 `admin-web` 镜像不会注入 `VITE_ADMIN_TOKEN`。如果你在 API 端启用了 `ADMIN_TOKEN`，需要额外产出一份带同值 `VITE_ADMIN_TOKEN` 的 admin 专用镜像。

### 2. 如果 GHCR 包是私有的，先登录

```bash
docker login ghcr.io
```

建议使用具备 `read:packages` 权限的 GitHub PAT。

### 3. 拉取并启动运行态服务

```bash
docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml pull

docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml up -d
```

### 4. 验证

```bash
curl -fsS http://127.0.0.1:36000/api/health/live
curl -fsS http://127.0.0.1:36000/api/health/ready
curl -I http://127.0.0.1:36080
curl -I http://127.0.0.1:36081
```

## 本地/CI 端的源码构建 compose（保留，但不是当前服务器推荐路径）

文件：`deploy/docker/docker-compose.nest-admin-style.yml`

适用场景：

- 你想在本地或某台专门的构建机里从源码构建镜像
- 你想先验证 compose 形态是否可用，再把镜像推到私有仓库

不适用场景：

- 当前服务器直接部署
- 希望“服务器完全不做 build”的场景

原因很简单：这个 compose 会在 `docker build` 时消耗源码构建时间，虽然不会在宿主机执行 `pnpm install`，但本质上仍是“在部署机做构建”。

## 旧路径说明（不推荐 / 仅开发调试）

以下路径仍然存在，但都已经降级为旧方案：

### 1. 服务器执行 `pnpm bootstrap:dev` / `pnpm build:all`

- 适合本地开发或临时调试
- **不适合当前服务器的稳定交付**

### 2. `scripts/deploy-remote.sh` / 旧的 SSH + rsync 部署

- 这条链路会把源码同步到目标机并在目标机上跑 `pnpm install`、`pnpm build`
- 与“服务器只接收运行产物或镜像”的目标冲突
- 现在仅保留作历史参考或临时迁移工具

## 健康检查与验收建议

推荐验收顺序：

### 构建端

```bash
pnpm lint
pnpm typecheck
pnpm --filter api-server build
VITE_API_BASE_URL=/api pnpm --filter app-uni build:h5
VITE_API_BASE_URL=/api VITE_ADMIN_TOKEN= pnpm --filter admin-web build
sh scripts/check-runtime-artifacts.sh
```

### 服务器端

```bash
docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml ps

docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml logs --tail=200
```

API 健康检查：

- `/api/health` / `/api/health/live`
- `/api/health/ready`

## 相关文件速查

- `deploy/docker/docker-compose.nest-admin-style.runtime.yml`
- `deploy/docker/.env.runtime.example`
- `deploy/docker/docker-compose.nest-admin-style.yml`
- `deploy/docker/.env.nest-admin-style.example`
- `deploy/docker/Dockerfile.node-runtime`
- `deploy/nginx/frontend-interview-bank-app.container.conf`
- `deploy/nginx/frontend-interview-bank-admin.container.conf`
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
