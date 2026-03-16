# 部署说明

## 推荐部署形态

适合一台 Vultr / 云服务器的最小部署方式：

- `api-server`：Node 进程托管（推荐 PM2）
- `admin-web`：构建后由 Nginx 托管静态文件
- `app-uni` H5：构建后由 Nginx 托管静态文件
- `mysql`：可继续用 Docker Compose，或换成托管数据库

## 环境要求

- Node.js 20+
- pnpm 10+
- MySQL 8+
- Nginx（推荐）
- PM2（推荐）

## 一、部署 API

### 1. 安装依赖

```bash
pnpm install --no-frozen-lockfile
```

### 2. 配置环境变量

参考：`api-server/.env.example`

关键变量：

- `PORT`
- `DATABASE_URL`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_TOKEN`
- `ADMIN_TOKEN`

### 3. 初始化数据库

```bash
pnpm --filter api-server prisma:push
pnpm --filter api-server prisma:seed
```

### 4. 构建 API

```bash
pnpm --filter api-server build
```

### 5. 使用 PM2 托管

```bash
pm2 start deploy/pm2/ecosystem.config.cjs --only api-server
pm2 save
```

## 二、部署前台与后台静态文件

### 构建

```bash
pnpm --filter app-uni build:h5
pnpm --filter admin-web build
```

构建产物：

- 用户端：`app-uni/dist/build/h5`
- 后台：`admin-web/dist`

### Nginx 推荐挂载

- 用户端挂到：`/var/www/frontend-interview-bank/app`
- 后台挂到：`/var/www/frontend-interview-bank/admin`

示例配置见：

- `deploy/nginx/frontend-interview-bank.conf.example`

## 三、安全建议

### 1. 后台接口保护

如果设置：

- `api-server/.env` 中的 `ADMIN_TOKEN`
- `admin-web/.env` 中的 `VITE_ADMIN_TOKEN`

则访问 `/api/admin/*` 时会要求 `x-admin-token`。

### 2. GitHub Token

- 建议使用最小权限 PAT
- 不要把 PAT 提交进仓库
- 如果 token 曾经暴露，立刻 rotate

### 3. 生产环境

- 使用 HTTPS
- Node 进程只监听内网或 `127.0.0.1`
- 通过 Nginx 反代 `/api`
- 管理后台建议再加一层基础认证或 IP 限制

## 四、对齐 nest-admin 风格的部署方式

如果你希望和当前服务器上的 `nest-admin` 保持一致，可以直接参考：

- `api-server/Dockerfile`
- `app-uni/Dockerfile`
- `admin-web/Dockerfile`
- `deploy/docker/docker-compose.nest-admin-style.yml`

这是典型的：

- 后端 Node 镜像
- 前台/后台 Nginx 静态镜像
- Docker Compose 编排
- `restart: unless-stopped` 常驻

### Docker 构建时的前端环境变量

由于 `app-uni` 和 `admin-web` 是静态构建产物，部署时必须在构建阶段注入：

- `APP_H5_API_BASE_URL`
- `ADMIN_WEB_API_BASE_URL`
- `ADMIN_WEB_TOKEN`（如需）

参考：`deploy/docker/.env.nest-admin-style.example`

> 说明：在 `docker-compose.nest-admin-style.yml` 中，容器内的 API 会自动覆盖 `DATABASE_URL`，改为连接 `interview-bank-mysql:3306`，不会直接使用宿主机的 `127.0.0.1:33306`。

> 当前 Docker 方案推荐前台/后台使用相对路径 `/api`，由容器内 Nginx 反代到 API 容器；只有前端与 API 分域/分机部署时，才改为完整地址。

- 免重建依赖的运行时 compose：`deploy/docker/docker-compose.nest-admin-style.runtime.yml`
- 运行时 compose 适合“本地完成构建 → 服务器只挂载 dist 和运行”的协作方式；上线前可用 `scripts/check-runtime-artifacts.sh` 快速检查产物里是否还残留 `localhost` API 地址。
