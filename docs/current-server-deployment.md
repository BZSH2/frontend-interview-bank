# 当前服务器部署说明

> 这份说明专门针对当前这台机器，目标是：
>
> - 不碰现有 `nest-admin` / `vue-admin`
> - 不要求服务器执行 `pnpm install`
> - 不要求服务器执行源码级 `build`
> - 服务器只拉运行态镜像并启动容器

## 当前机器约束

已知占用：

- `vue-admin`：占用 `80`
- `nest-admin`：使用 `35000`

本项目统一使用：

- API：`36000`
- 用户端 H5：`36080`
- 管理后台：`36081`
- MySQL：`33307`

当前仓库路径以本机现状为例：

```bash
/Users/bzsh/demo/frontend-interview-bank
```

如果你后续把仓库移到别处，只需要把下面命令里的路径替换掉即可。

## 当前服务器的推荐方式

### 结论

**推荐方式是：GHCR 运行态镜像 + runtime compose。**

也就是：

- 构建端先把镜像做好
- 当前机器只 `docker compose pull` + `docker compose up -d`
- 不在当前机器跑 `pnpm bootstrap:dev`
- 不在当前机器跑 `pnpm build:all`

## 一、构建端先准备镜像

推荐直接使用仓库内的 GitHub Actions hosted runner 工作流：

- 文件：`.github/workflows/deploy.yml`
- 作用：构建并发布这三个镜像到 GHCR
  - `frontend-interview-bank-api`
  - `frontend-interview-bank-web`
  - `frontend-interview-bank-admin`

发布后的常用标签：

- `main`
- `sha-<commit>`

如果你要追求可追溯性，当前服务器更推荐固定到 `sha-*` 标签，而不是一直跟 `main`。

## 二、当前机器准备运行态配置

进入仓库：

```bash
cd /Users/bzsh/demo/frontend-interview-bank
```

复制两个配置模板：

```bash
cp deploy/docker/.env.runtime.example deploy/docker/.env.runtime
cp api-server/.env.example api-server/.env
```

### 1. 修改 `deploy/docker/.env.runtime`

至少确认这些项：

- `API_IMAGE`
- `APP_IMAGE`
- `ADMIN_IMAGE`
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_PASSWORD`
- `API_HOST_PORT=36000`
- `APP_HOST_PORT=36080`
- `ADMIN_HOST_PORT=36081`
- `MYSQL_HOST_PORT=33307`

### 2. 修改 `api-server/.env`

主要看业务变量：

- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_TOKEN`
- `ADMIN_TOKEN`（如果你确实要用）

> 注意：默认发布到 GHCR 的 `admin-web` 镜像不会注入 `VITE_ADMIN_TOKEN`。
> 如果你在 API 里开启了 `ADMIN_TOKEN`，就需要额外构建一份带同值 `VITE_ADMIN_TOKEN` 的 admin 专用镜像。
>
> runtime compose 会在容器层覆盖 `DATABASE_URL`，让 API 连接 compose 内的 MySQL；
> 所以 `api-server/.env` 里的本地开发数据库地址不会直接带进容器运行时。

## 三、如果 GHCR 包是私有的，先登录

```bash
docker login ghcr.io
```

建议使用一个只读 PAT，权限至少包含：

- `read:packages`

## 四、拉取并启动纯运行态服务

```bash
docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml pull

docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml up -d
```

查看状态：

```bash
docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml ps
```

查看日志：

```bash
docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml logs --tail=200
```

## 五、访问与验收

启动完成后，访问：

- API：`http://当前机器IP:36000/api`
- 用户端：`http://当前机器IP:36080`
- 后台：`http://当前机器IP:36081`

建议先做这几步：

```bash
curl -fsS http://127.0.0.1:36000/api/health/live
curl -fsS http://127.0.0.1:36000/api/health/ready
curl -I http://127.0.0.1:36080
curl -I http://127.0.0.1:36081
```

## 六、前台 / 后台为什么不需要写死 API 地址

现在 H5 和 Admin 镜像默认都用：

- `VITE_API_BASE_URL=/api`

容器内自带的 Nginx 会把 `/api` 反代到 `interview-bank-api:3000`。

这意味着：

- 浏览器访问 `36080` 时，请求会走 `36080/api/*`
- 浏览器访问 `36081` 时，请求会走 `36081/api/*`
- 不需要把当前机器 IP 提前写死进静态产物
- 不会再把 `localhost` / `127.0.0.1` 残留进运行态前端资源

同时 API 仍然单独暴露在 `36000`，方便你做健康检查、调试和集成。

## 七、更新版本的方式

如果 GHCR 已经发布了新镜像，只需要：

```bash
docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml pull

docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml up -d
```

如果你使用的是固定的 `sha-*` 标签，更新版本时只改 `.env.runtime` 里的镜像 tag 即可。

## 八、明确不推荐的做法

### 1. 当前机器执行这些命令做部署

```bash
pnpm install
pnpm bootstrap:dev
pnpm build:all
```

它们适合开发，不适合当前机器的稳定交付。

### 2. 当前机器直接用源码 compose 构建镜像

```bash
docker compose \
  --env-file deploy/docker/.env.nest-admin-style \
  -f deploy/docker/docker-compose.nest-admin-style.yml up -d --build
```

这条路径仍然有用，但更适合作为：

- 本地实验
- 构建机打镜像
- 调试容器形态

**不是当前机器的首选部署方式**。

### 3. 旧的 SSH / rsync / 远程 pnpm 部署

与“当前机器只接收运行态镜像”的目标冲突，已经降级为旧方案。

## 九、相关文件

- `deploy/docker/docker-compose.nest-admin-style.runtime.yml`
- `deploy/docker/.env.runtime.example`
- `.github/workflows/deploy.yml`
- `.github/workflows/ci.yml`
- `docs/deployment.md`
- `docs/automated-deployment.md`
