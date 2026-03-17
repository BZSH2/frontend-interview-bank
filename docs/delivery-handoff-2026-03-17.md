# frontend-interview-bank 交付说明（2026-03-17）

> 当前工作区可通过 `git log -1 --oneline` 查看本轮本地提交。

## 一、结论

本轮已将仓库从“运行态还依赖宿主机源码挂载”的状态，推进到 **runtime-first 交付口径**：

- 文档口径统一为：**本地 / GitHub Actions hosted runner 构建，服务器只拉镜像运行**
- runtime compose 已改为 **预构建镜像运行**，不再挂宿主机源码 / `dist` / `node_modules`
- CI 已补上 build 与 runtime artifacts 检查
- 已补 GHCR runtime 镜像发布 workflow
- API 已补 `health/live` 与 `health/ready`

但本轮仍有明确未闭环项：

- 还未做 GHCR 真发布验证
- 还未做 `docker compose up -d` 真机拉起
- 还未验证容器内 Prisma / OpenSSL 的 live runtime 行为
- 还未做带数据库的 live API smoke

所以当前结论应表述为：

> **部署方案、文档、CI、runtime 链路已收口；真机 Docker / Registry / Runtime 闭环待环境验证。**

---

## 二、改动清单

### 1. runtime 交付链路

- `api-server/Dockerfile`
  - 改为可直接产出 API runtime 镜像
  - 镜像内自带 OpenSSL、依赖、`dist`，容器启动时可直接执行 Prisma `db push` + `node dist/main.js`

- `deploy/docker/docker-compose.nest-admin-style.runtime.yml`
  - 改为使用预构建镜像：API / H5 / Admin 全部不再依赖宿主机源码挂载
  - 增加 API healthcheck

- `deploy/docker/.env.runtime.example`
  - 新增 runtime 部署专用 env 模板
  - 统一镜像地址、端口和 MySQL 参数

### 2. 健康检查与脚本

- `api-server/src/modules/health/health.controller.ts`
  - 新增 `/api/health/live`
  - 新增 `/api/health/ready`
  - `ready` 会检查数据库连通性

- `scripts/smoke-test.sh`
  - 新增 `SMOKE_SKIP_API=true` 模式
  - 允许在没有 live API / DB 时只做静态产物 smoke

### 3. CI / 镜像发布

- `.github/workflows/ci.yml`
  - 新增三端 build
  - 新增 `sh scripts/check-runtime-artifacts.sh`

- `.github/workflows/runtime-images.yml`
  - 新增 GHCR runtime 镜像发布 workflow
  - 使用 GitHub Actions hosted runner，不依赖 self-hosted runner

### 4. 文档统一收口

- `README.md`
- `docs/deployment.md`
- `docs/current-server-deployment.md`
- `api-server/.env.example`
- `deploy/docker/Dockerfile.node-runtime`

本轮统一后的核心口径：

- 本地 / GitHub Actions hosted runner：安装依赖、检查、build、发布镜像
- 服务器：准备 env、拉镜像、`docker compose up -d`
- 当前服务器不再默认执行 `pnpm install` / `pnpm bootstrap:dev` / `pnpm build:all`

---

## 三、推荐部署步骤

### 本地 / GitHub Actions

1. 代码合入 `main`
2. 由 `.github/workflows/runtime-images.yml` 构建并发布镜像到 GHCR
3. 确认 GHCR 有可用 tag（如 `main` / `sha-*`）

### 服务器

```bash
cd /root/.openclaw/workspace/frontend-interview-bank
cp deploy/docker/.env.runtime.example deploy/docker/.env.runtime
cp api-server/.env.example api-server/.env
```

填写：

- `API_RUNTIME_IMAGE`
- `APP_RUNTIME_IMAGE`
- `ADMIN_RUNTIME_IMAGE`
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_PASSWORD`
- `GITHUB_TOKEN`（如需）
- `ADMIN_TOKEN`（如需）

如果 GHCR 私有：

```bash
docker login ghcr.io
```

拉镜像并启动：

```bash
docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml pull

docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml up -d
```

验收：

```bash
curl -fsS http://127.0.0.1:36000/api/health/live
curl -fsS http://127.0.0.1:36000/api/health/ready
curl -I http://127.0.0.1:36080
curl -I http://127.0.0.1:36081
```

---

## 四、验证记录（本轮已实际执行）

### 已通过

```bash
pnpm --filter api-server build
sh scripts/check-runtime-artifacts.sh
SMOKE_SKIP_API=true pnpm smoke:test
docker compose --env-file deploy/docker/.env.runtime.example -f deploy/docker/docker-compose.nest-admin-style.runtime.yml config
```

### 结果

- API 当前代码可编译
- 前后台 dist 存在
- 前后台 dist 未发现硬编码 `localhost` API 地址
- runtime compose 配置可展开，镜像 / 端口 / env 注入语法无误

---

## 五、未完成 / 风险项

1. **未做 GHCR 真发布验证**
   - workflow 已补，但还未实际 push 镜像验证包权限与 tag 产出

2. **未做 runtime compose 真机拉起**
   - 还未在目标机器上执行 `pull + up -d`

3. **未验证容器内 Prisma / OpenSSL live 行为**
   - 当前仅完成构建与 compose 级校验
   - 仍需真实容器启动后验证 `/api/health/ready`

4. **未做带数据库的 live API smoke**
   - 当前只跑了 `SMOKE_SKIP_API=true` 的静态 smoke

---

## 六、当前统一端口

- API：`36000`
- H5：`36080`
- Admin：`36081`
- MySQL：`33307`

避让现有服务：

- `vue-admin`：`80`
- `nest-admin`：`35000`
