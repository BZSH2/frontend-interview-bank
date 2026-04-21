# 自动化发布说明（GitHub Actions → GHCR → 阿里云）

当前仓库的自动化链路已经调整为：

1. `ci.yml` 先做质量校验
2. `deploy.yml` 在 `ci` 成功后，统一完成 GHCR 运行态镜像发布 + SSH 到阿里云服务器执行部署

目标很明确：

- **GitHub Actions hosted runner** 负责 install / build / image publish
- **阿里云服务器** 只负责 pull image + run
- **公网入口** 固定使用 `https://uni.bzsh.fun`
- **不依赖** self-hosted runner
- **不在服务器执行** `pnpm install` / `pnpm build`

---

## 当前包含的工作流

- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`

---

## 工作流职责

### 1. `ci.yml`

在 PR / push 时执行：

```bash
pnpm install --no-frozen-lockfile
pnpm lint
pnpm typecheck
pnpm --filter api-server build
VITE_API_BASE_URL=/api pnpm --filter app-uni build:h5
VITE_API_BASE_URL=/api VITE_ADMIN_TOKEN= pnpm --filter admin-web build
sh scripts/check-runtime-artifacts.sh
```

重点兜底：

- API / H5 / Admin 都必须真实 build 成功
- 前后台静态产物里不允许残留 `localhost` / `127.0.0.1` API 地址

### 2. `deploy.yml`

触发时机：

- `ci.yml` 在 `main` 分支对应提交上成功完成后自动触发
- 或手动 `workflow_dispatch`

工作流会在同一个 workflow 中完成：

- 构建 API / H5 / Admin 三个运行态镜像
- 推送到 GHCR
- 发布标签：
  - `main`
  - `sha-<commit>`
- 使用 SSH 登录阿里云服务器
- 把本次提交对应的镜像 tag 固定到 `sha-<commit>`
- 重新渲染服务器上的：
  - `deploy/docker/.env.runtime`
  - `api-server/.env`
- 执行：

```bash
docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml pull

docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml up -d --remove-orphans
```

- 最后做本机健康检查：
  - `http://127.0.0.1:36000/api/health/ready`
  - `http://127.0.0.1:36080`
  - `http://127.0.0.1:36081`

---

## 必配 GitHub Secrets

在仓库 `BZSH2/frontend-interview-bank` 的 **Settings → Secrets and variables → Actions** 中配置：

### Secrets

- `ALIYUN_ECS_HOST`
  - 阿里云服务器公网 IP，例如：`8.133.21.62`
- `ALIYUN_ECS_USER`
  - SSH 登录用户，例如：`root`
- `ALIYUN_ECS_SSH_KEY`
  - GitHub Actions 用的私钥内容（推荐单独生成 deploy key）
- `MYSQL_ROOT_PASSWORD`
  - 运行态 MySQL root 密码
- `MYSQL_PASSWORD`
  - 运行态业务库用户密码

### 可选 Secrets

- `ADMIN_TOKEN`
  - 如需保护 `/api/admin/*`，可设置
- `GITHUB_SYNC_TOKEN`
  - 如需在运行态继续把“新增讲解申请”同步到 GitHub Issue，可设置

---

## 推荐 GitHub Variables

### Variables

- `ALIYUN_ECS_PORT=22`
- `ALIYUN_DEPLOY_PATH=/opt/frontend-interview-bank`
- `ALIYUN_APP_DOMAIN=uni.bzsh.fun`
- `API_HOST_PORT=36000`
- `APP_HOST_PORT=36080`
- `ADMIN_HOST_PORT=36081`
- `MYSQL_HOST_PORT=33307`
- `MYSQL_DATABASE=frontend_interview_bank`
- `MYSQL_USER=interview_app`
- `ISSUES_GITHUB_OWNER=BZSH2`
- `ISSUES_GITHUB_REPO=frontend-interview-bank`

如果不配，大部分变量工作流里也已经给了默认值；但建议显式写上，方便后续审计与迁移。

---

## 域名与反向代理

自动部署只负责把容器更新到服务器上。

要让 `https://uni.bzsh.fun` 可访问，还需要两件事：

### 1. DNS

把 `uni.bzsh.fun` 的 **A 记录** 指向：

- `8.133.21.62`

### 2. 宿主机 Caddy

在宿主机的 Caddy 配置中加入：

- `deploy/caddy/uni.bzsh.fun.Caddyfile.example`

这个站点会反代到：

- `127.0.0.1:36080`

说明：

- H5 容器内 Nginx 已经处理 `/api` → `interview-bank-api:3000`
- 所以公网只需要把整个域名反代到 H5 容器，不需要再单独配一层 `/api`

---

## 服务器上的最终目录结构

自动部署后，服务器上会收口到：

```text
/opt/frontend-interview-bank/
├─ api-server/.env
├─ deploy/docker/.env.runtime
├─ deploy/docker/docker-compose.nest-admin-style.runtime.yml
└─ deploy-aliyun.sh
```

---

## 为什么这次重新引入 SSH 自动部署

之前文档把 SSH 远程部署降级掉，是因为不希望：

- 在服务器上拉源码
- 在服务器上 `pnpm install`
- 在服务器上做源码级 build

这次重新引入 SSH，**只做运行态更新**：

- 不上传源码
- 不执行 pnpm
- 不执行前端 / Nest 构建
- 只拉 GHCR 镜像并重启 compose

所以它仍然符合“runtime-first”的原则。

---

## 推荐发布顺序

1. 本地开发完成后 push 到 `main`
2. 等 `ci.yml` 成功
3. 等 `deploy.yml` 成功
4. 访问：
   - `https://uni.bzsh.fun`
   - `http://127.0.0.1:36000/api/health/ready`（服务器本机）

---

## 手动兜底命令（自动部署失败时）

如果工作流失败，仍可在服务器手动执行：

```bash
cd /opt/frontend-interview-bank

docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml pull

docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml up -d --remove-orphans
```

---

## 已不再推荐的旧路径

- 在服务器执行 `pnpm install`
- 在服务器执行 `pnpm build:all`
- self-hosted runner 直接承担构建
- rsync 整个源码目录到服务器再现场编译

这些路径都不符合当前项目的部署收口方向。
