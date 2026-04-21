# 部署说明（runtime-first）

## 一句话结论

当前推荐部署路径已经升级为：

- **GitHub Actions hosted runner**：安装依赖、lint、typecheck、build、检查运行态产物、发布 GHCR 镜像
- **GitHub Actions deploy workflow**：SSH 到阿里云服务器，执行运行态更新
- **服务器**：只保留 `docker compose pull && docker compose up -d` 这一类镜像运行职责
- **公网入口**：`https://uni.bzsh.fun`

当前服务器默认**不要**执行：

- `pnpm install`
- `pnpm bootstrap:dev`
- `pnpm build:all`
- 任何源码级 build

---

## 1. 角色分工

### GitHub Actions 负责

- `pnpm install --no-frozen-lockfile`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm --filter api-server build`
- `pnpm --filter app-uni build:h5`
- `pnpm --filter admin-web build`
- `sh scripts/check-runtime-artifacts.sh`
- 构建并发布 runtime 镜像到 GHCR
- 通过 SSH 触发阿里云部署

### 服务器负责

- 保存少量运行态部署文件
- `docker compose pull`
- `docker compose up -d`
- 提供本机健康检查端口
- 由宿主机 Caddy 把 `uni.bzsh.fun` 反代到 H5 容器

---

## 2. 运行态部署所需文件

- runtime compose：`deploy/docker/docker-compose.nest-admin-style.runtime.yml`
- runtime env 模板：`deploy/docker/.env.runtime.example`
- API 业务 env 模板：`api-server/.env.example`
- 自动部署脚本：`.github/deploy/deploy-aliyun.sh`
- 域名反代示例：`deploy/caddy/uni.bzsh.fun.Caddyfile.example`

### 镜像约定

默认运行态镜像来自 GHCR：

- `ghcr.io/bzsh2/frontend-interview-bank-api:sha-<commit>`
- `ghcr.io/bzsh2/frontend-interview-bank-web:sha-<commit>`
- `ghcr.io/bzsh2/frontend-interview-bank-admin:sha-<commit>`

当前部署使用两段式 workflow：

- 质量校验：`.github/workflows/ci.yml`
- 镜像发布 + 自动部署：`.github/workflows/deploy.yml`

---

## 3. 自动部署前置条件

### 3.1 GitHub Actions 配置

需要在仓库配置：

**Secrets**

- `ALIYUN_ECS_HOST`
- `ALIYUN_ECS_USER`
- `ALIYUN_ECS_SSH_KEY`
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_PASSWORD`
- `ADMIN_TOKEN`（可选）
- `GITHUB_SYNC_TOKEN`（可选）

**Variables**

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

### 3.2 DNS

把：

- `uni.bzsh.fun`

的 A 记录指向：

- `8.133.21.62`

### 3.3 宿主机 Caddy

在宿主机 Caddy 中加入：

- `deploy/caddy/uni.bzsh.fun.Caddyfile.example`

---

## 4. 自动部署触发方式

### 4.1 正常链路

1. push 到 `main`
2. `ci.yml` 成功
3. `deploy.yml` 成功

### 4.2 手动触发

也可以在 GitHub Actions 页面手动触发：

- `deploy`

适用于：

- 重试部署
- 回滚到指定 ref
- 只想重新发版 / 重新上线

---

## 5. 服务器上最终执行的动作

自动部署的服务器侧动作其实非常轻：

```bash
docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml pull

docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml up -d --remove-orphans
```

运行态 env 和 `api-server/.env` 由 deploy workflow 自动渲染并上传。

---

## 6. 验收命令

在服务器本机执行：

```bash
curl -fsS http://127.0.0.1:36000/api/health/live
curl -fsS http://127.0.0.1:36000/api/health/ready
curl -I http://127.0.0.1:36080
curl -I http://127.0.0.1:36081
```

公网验收：

```bash
curl -I https://uni.bzsh.fun
```

---

## 7. 端口规划

统一端口：

- API：`36000`
- H5：`36080`
- Admin：`36081`
- MySQL：`33307`

runtime compose 默认绑定到：

- `127.0.0.1:36000`
- `127.0.0.1:36080`
- `127.0.0.1:36081`
- `127.0.0.1:33307`

这样可以：

- 避让现有 `vue-admin:80`
- 避让现有 `nest-admin:35000`
- 避免直接暴露 API / Admin / MySQL

---

## 8. 保留但不推荐的路径

下面这些方案保留用于本地开发、临时调试或历史兼容：

- `deploy/docker/docker-compose.nest-admin-style.yml`
- `pnpm bootstrap:dev`
- PM2 / systemd 源码部署

它们**不作为当前服务器默认部署方案**。

---

## 9. 已知边界

截至当前文档版本：

- 自动部署已经闭环到“push main → GHCR → Aliyun compose”
- 域名生效仍依赖 DNS 正确指向服务器
- HTTPS 证书签发仍依赖 Caddy 在公网可达后自动申请
- 若 GitHub Actions secrets / vars 缺失，deploy workflow 会直接失败并给出缺少项
