# 部署说明（runtime-first）

## 一句话结论

当前推荐部署路径是：

- **本地 / GitHub Actions hosted runner**：安装依赖、lint、typecheck、build、检查运行态产物、发布 GHCR 镜像
- **服务器**：准备 env、拉镜像、`docker compose up -d`

当前服务器默认**不要**执行：

- `pnpm install`
- `pnpm bootstrap:dev`
- `pnpm build:all`
- 任何源码级 build

---

## 1. 角色分工

### 本地 / GitHub Actions hosted runner 负责

- `pnpm install --no-frozen-lockfile`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm --filter api-server build`
- `pnpm --filter app-uni build:h5`
- `pnpm --filter admin-web build`
- `sh scripts/check-runtime-artifacts.sh`
- 构建并发布 runtime 镜像到 GHCR

### 服务器负责

- 配置 `deploy/docker/.env.runtime`
- 配置 `api-server/.env`
- `docker login ghcr.io`（如需要）
- `docker compose pull`
- `docker compose up -d`
- 运行后验收

---

## 2. 运行态部署所需文件

- runtime compose：`deploy/docker/docker-compose.nest-admin-style.runtime.yml`
- runtime env 模板：`deploy/docker/.env.runtime.example`
- API 业务 env 模板：`api-server/.env.example`
- 当前交付说明：`docs/delivery-handoff-2026-03-17.md`

### 镜像约定

默认运行态镜像：

- `ghcr.io/bzsh2/frontend-interview-bank-api:main`
- `ghcr.io/bzsh2/frontend-interview-bank-web:main`
- `ghcr.io/bzsh2/frontend-interview-bank-admin:main`

镜像发布 workflow：

- `.github/workflows/runtime-images.yml`

---

## 3. 服务器部署步骤

### 3.1 准备 env

```bash
cp deploy/docker/.env.runtime.example deploy/docker/.env.runtime
cp api-server/.env.example api-server/.env
```

需要至少确认：

- `API_RUNTIME_IMAGE`
- `APP_RUNTIME_IMAGE`
- `ADMIN_RUNTIME_IMAGE`
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_PASSWORD`
- `GITHUB_TOKEN`（如需同步 GitHub Issue）
- `ADMIN_TOKEN`（如需保护后台接口）

> `api-server/.env` 中的 `PORT` / `DATABASE_URL` 在 runtime compose 下会被 compose 覆盖，不需要手动改成容器内地址。

### 3.2 拉镜像并启动

```bash
docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml pull

docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml up -d
```

如果 GHCR 包是私有的，先登录：

```bash
docker login ghcr.io
```

---

## 4. 验收命令

```bash
curl -fsS http://127.0.0.1:36000/api/health/live
curl -fsS http://127.0.0.1:36000/api/health/ready
curl -I http://127.0.0.1:36080
curl -I http://127.0.0.1:36081
```

如果需要查看容器状态：

```bash
docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml ps
```

---

## 5. 端口规划

统一端口：

- API：`36000`
- H5：`36080`
- Admin：`36081`
- MySQL：`33307`

避让现有服务：

- `vue-admin`：`80`
- `nest-admin`：`35000`

---

## 6. CI / 镜像发布

### 质量检查

`.github/workflows/ci.yml` 负责：

- lint
- typecheck
- build api-server
- build app-uni h5
- build admin-web
- `sh scripts/check-runtime-artifacts.sh`

### 镜像发布

`.github/workflows/runtime-images.yml` 负责：

- 使用 GitHub Actions hosted runner 构建 runtime 镜像
- 发布到 GHCR
- 默认产出 `main` 和 `sha-*` 标签

---

## 7. 保留但不推荐的路径

下面这些方案保留用于本地开发、临时调试或历史兼容：

- `deploy/docker/docker-compose.nest-admin-style.yml`
- `pnpm bootstrap:dev`
- PM2 / systemd 源码部署

它们**不作为当前服务器默认部署方案**。

---

## 8. 已知边界

截至当前文档版本：

- runtime 链路已经从“挂宿主机源码 + dist + node_modules”收口为“预构建镜像运行”
- 文档和 workflow 已统一到 runtime-first
- 如果尚未在目标机器实际 `docker compose up -d` 并跑通数据库，则仍不能视为“真机上线闭环已完成”
