# 自动化发布说明（GitHub Actions + GHCR）

这套自动化现在的目标很明确：

- **GitHub Actions hosted runner** 负责构建与发布运行态镜像
- **服务器** 只负责拉取镜像并启动
- **不依赖** self-hosted runner
- **不依赖** GitHub Actions 直接 SSH 回当前机器执行命令

这比“云端 rsync 源码到当前机器，再让当前机器 `pnpm install` / `pnpm build`”更符合这次交付目标。

## 当前包含的工作流

- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`

## CI workflow 做什么

`ci.yml` 在 PR / push 时执行：

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm --filter api-server build
VITE_API_BASE_URL=/api pnpm --filter app-uni build:h5
VITE_API_BASE_URL=/api VITE_ADMIN_TOKEN= pnpm --filter admin-web build
sh scripts/check-runtime-artifacts.sh
```

重点新增的是最后一步：

- 前后台静态产物里不允许残留 `localhost` / `127.0.0.1` 的 API 地址

## 镜像发布 workflow 做什么

`deploy.yml` 已改成“发布运行态镜像”，不再做 SSH 远程部署。

触发时机：

- `ci.yml` 在 `main` 分支对应提交上通过后自动触发
- 手动触发 `workflow_dispatch`

发布内容：

- `ghcr.io/<owner>/frontend-interview-bank-api`
- `ghcr.io/<owner>/frontend-interview-bank-web`
- `ghcr.io/<owner>/frontend-interview-bank-admin`

默认标签：

- `main`
- `sha-<commit>`

## 为什么不再使用 SSH / rsync 远程部署

因为当前目标服务器就是这台机器，而这次明确不希望：

- 云端实时连回当前机器执行命令
- 在当前机器上跑 `pnpm install`
- 在当前机器上跑源码级 `build`

因此自动化只负责“把可运行镜像准备好”，真正上线动作保留为服务器上的手动 `pull` / `up`。

这条链路更稳定，也更容易审计。

## GHCR 权限说明

工作流发布镜像只需要 GitHub 自带的：

- `GITHUB_TOKEN`

因此当前 `deploy.yml` 不再需要：

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`

工作流权限改为：

- `contents: read`
- `packages: write`

## 服务器如何消费这些镜像

### 1. 准备文件

```bash
cp deploy/docker/.env.runtime.example deploy/docker/.env.runtime
cp api-server/.env.example api-server/.env
```

### 2. 如果 GHCR 包是私有的，先登录

```bash
docker login ghcr.io
```

建议 PAT 至少具备：

- `read:packages`

### 3. 拉取并启动

```bash
docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml pull

docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml up -d
```

## 前端镜像的构建策略

H5 与 Admin 镜像默认使用：

- `VITE_API_BASE_URL=/api`

然后由容器内 Nginx 反代 `/api` 到 `interview-bank-api:3000`。

这样做的好处：

- 镜像不绑定某个固定 IP
- 当前机器、另一台测试机、未来云服务器都可复用同一份前端镜像
- CI 可以直接检查产物里是否残留 localhost 地址

## 关于 `VITE_ADMIN_TOKEN`

默认镜像发布工作流不会往 admin-web 镜像里注入 `VITE_ADMIN_TOKEN`。

原因很现实：

- 它本质上是构建期常量
- 一旦注入，值就会写进静态资源
- 不适合作为通用镜像发布工作流的默认行为

如果你确实要启用这一套弱鉴权模型，更建议在受控环境里单独构建 admin 专用镜像，而不是把环境专属 token 固化进默认发布链路。

## 推荐的发布/上线顺序

1. 开发完成后 push 到 `main`
2. 等 `ci.yml` 通过
3. `deploy.yml` 会自动接着发布 GHCR 镜像（也可手动触发）
4. 在当前机器更新 `deploy/docker/.env.runtime` 里的镜像 tag（建议固定 `sha-*`）
5. 手动执行 `docker compose pull && docker compose up -d`
6. 做健康检查

## 仍保留但已降级的旧方案

- `scripts/deploy-remote.sh`
- 旧的 SSH + rsync 远程部署文档/思路

这些内容仍可作为参考，但已经不再是推荐路径。
