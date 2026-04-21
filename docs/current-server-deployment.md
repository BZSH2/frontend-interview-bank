# 当前服务器部署说明（runtime-first + auto deploy）

> 这份说明基于当前机器实际情况整理：
>
> - 目标服务器：当前这台阿里云 ECS
> - 推荐部署目录：`/opt/frontend-interview-bank`
> - 当前服务器已有 Docker
> - `vue-admin` 正占用 `80`
> - `nest-admin` 正使用 `35000`
>
> 因此本项目默认使用独立端口：
>
> - API：`36000`
> - H5：`36080`
> - Admin：`36081`
> - MySQL：`33307`
>
> 并且 runtime compose 默认只绑定到 `127.0.0.1`。

## 结论

**当前服务器推荐部署方式只有一条：runtime-first + GitHub Actions 自动部署。**

也就是：

- GitHub Actions：install、build、publish image、SSH 触发部署
- 当前服务器：pull image、up compose、提供本机健康检查
- 公网流量：`uni.bzsh.fun` → 宿主机 Caddy → `127.0.0.1:36080`

当前服务器默认**不要执行**：

- `pnpm install`
- `pnpm bootstrap:dev`
- `pnpm build:all`
- 任何源码级构建

---

## 1. 服务器上最终保留的目录

自动部署后，服务器上主要保留：

```text
/opt/frontend-interview-bank/
├─ api-server/.env
├─ deploy/docker/.env.runtime
├─ deploy/docker/docker-compose.nest-admin-style.runtime.yml
└─ deploy-aliyun.sh
```

这些文件由 GitHub Actions deploy workflow 自动上传或更新。

---

## 2. 需要在 GitHub 侧准备什么

在仓库 `BZSH2/frontend-interview-bank` 中配置：

### 必配 Secrets

- `ALIYUN_ECS_HOST`
- `ALIYUN_ECS_USER`
- `ALIYUN_ECS_SSH_KEY`
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_PASSWORD`

### 可选 Secrets

- `ADMIN_TOKEN`
- `GITHUB_SYNC_TOKEN`

### 推荐 Variables

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

---

## 3. 需要在服务器上准备什么

### 3.1 DNS

确保：

- `uni.bzsh.fun`

已经解析到当前服务器公网 IP：

- `8.133.21.62`

### 3.2 Caddy

把下面这个站点块加入宿主机 Caddy 配置：

- `deploy/caddy/uni.bzsh.fun.Caddyfile.example`

然后 reload Caddy。

---

## 4. 自动部署是如何工作的

### 正常链路

1. push 到 `main`
2. `ci.yml` 成功
3. `deploy.yml` 成功

### deploy workflow 在服务器侧执行的核心动作

```bash
docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml pull

docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml up -d --remove-orphans
```

### 固定镜像策略

`deploy.yml` 不使用浮动 `main` tag 直接上线，而是在同一个 workflow 里先发布镜像，再把本次提交固定到：

- `ghcr.io/bzsh2/frontend-interview-bank-api:sha-<commit>`
- `ghcr.io/bzsh2/frontend-interview-bank-web:sha-<commit>`
- `ghcr.io/bzsh2/frontend-interview-bank-admin:sha-<commit>`

这样能避免：

- `main` 漂移导致“本次部署到底用的是哪版镜像”不清楚
- 回滚时难以定位目标版本

---

## 5. 验收命令

### 服务器本机验收

```bash
curl -fsS http://127.0.0.1:36000/api/health/live
curl -fsS http://127.0.0.1:36000/api/health/ready
curl -I http://127.0.0.1:36080
curl -I http://127.0.0.1:36081
```

### 公网验收

```bash
curl -I https://uni.bzsh.fun
```

### 查看日志

```bash
cd /opt/frontend-interview-bank

docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml logs -f --tail=200
```

---

## 6. 为什么这次把端口改成只绑 localhost

因为当前部署目标已经明确是：

- 用域名访问 H5
- 用宿主机 Caddy 承接 HTTPS
- 不希望把 API / Admin / MySQL 裸暴露到公网

所以 runtime compose 改成：

- `127.0.0.1:36000:3000`
- `127.0.0.1:36080:80`
- `127.0.0.1:36081:80`
- `127.0.0.1:33307:3306`

这样更符合当前服务器的长期形态。

---

## 7. 手动兜底路径（只在自动部署失败时使用）

如果 GitHub Actions deploy workflow 失败，可以在服务器手动执行：

```bash
cd /opt/frontend-interview-bank

docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml pull

docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml up -d --remove-orphans
```

注意：

- 这是 **pull / up** 级别的兜底
- 仍然**不是**源码部署
- 仍然**不应该**在这台服务器跑 `pnpm install`
