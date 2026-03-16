# 部署说明

## 推荐部署形态

当前仓库已经准备好一套适合单台服务器的轻量部署方案：

- `api-server`：Node 进程常驻（推荐 systemd / PM2）
- `admin-web`：构建后静态托管
- `app-uni` H5：构建后静态托管
- `mysql`：宿主机安装或 Docker Compose 托管

如果你想直接接上自动部署，请同时阅读：`docs/automated-deployment.md`。

## 环境要求

- Node.js 20+
- pnpm 10+
- MySQL 8+
- systemd 或 PM2
- Nginx（推荐，但非强依赖）

## 一、部署 API

### 1. 安装依赖

```bash
pnpm install --no-frozen-lockfile
```

### 2. 配置环境变量

参考：

- `api-server/.env.example`
- `app-uni/.env.example`
- `admin-web/.env.example`

关键变量：

- `PORT`
- `DATABASE_URL`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_TOKEN`
- `ADMIN_TOKEN`
- `admin-web/.env` 中的 `VITE_API_BASE_URL`
- `app-uni/.env` 中的 `VITE_API_BASE_URL`

建议在部署前先执行：

```bash
pnpm validate:env -- --require-env-files
```

### 3. 初始化数据库

```bash
pnpm --filter api-server prisma:push
```

如果是演示环境或首次初始化，也可以再执行：

```bash
pnpm --filter api-server prisma:seed
```

### 4. 构建 API

```bash
pnpm --filter api-server build
```

### 5. 托管 API

#### 方案 A：systemd（推荐）

参考：`deploy/systemd/frontend-interview-bank-api.service.example`

#### 方案 B：PM2

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

### 托管方式

#### 方案 A：Nginx

推荐挂载：

- 用户端：`/var/www/frontend-interview-bank/app`
- 后台：`/var/www/frontend-interview-bank/admin`

示例配置见：`deploy/nginx/frontend-interview-bank.conf.example`

#### 方案 B：Node 静态服务

仓库自带 `scripts/serve-static.mjs`，也可直接用：

```bash
node scripts/serve-static.mjs --root app-uni/dist/build/h5 --port 4173
node scripts/serve-static.mjs --root admin-web/dist --port 4174
```

对应 systemd 示例：

- `deploy/systemd/frontend-interview-bank-app.service.example`
- `deploy/systemd/frontend-interview-bank-admin.service.example`

## 三、安全建议

### 1. 后台接口保护

如果设置：

- `api-server/.env` 中的 `ADMIN_TOKEN`
- `admin-web/.env` 中的 `VITE_ADMIN_TOKEN`

则访问 `/api/admin/*` 时会要求 `x-admin-token`。

`pnpm validate:env -- --require-env-files` 会检查这两个 token 是否一致，避免“API 已加锁但后台构建时没带 token”这种常见配置错误。

### 2. GitHub Token

- 建议使用最小权限 PAT
- 不要把 PAT 提交进仓库
- 如果 token 曾经暴露，立刻 rotate

### 3. 生产建议

- 使用 HTTPS
- Node 进程只监听内网或 `127.0.0.1`
- 通过 Nginx 反代 `/api`
- 管理后台建议再加一层基础认证或 IP 限制

## 四、健康检查与验收

API 提供两个层级的健康接口：

- `/api/health` / `/api/health/live`：进程仍在运行
- `/api/health/ready`：数据库可连接，服务已就绪

推荐验收顺序：

```bash
pnpm validate:env -- --require-env-files
pnpm build:all
API_BASE_URL=http://127.0.0.1:3000/api pnpm smoke:test
```

如果前台和后台已经挂到了外部域名或端口，也可以一起验证：

```bash
API_BASE_URL=https://api.example.com/api \
APP_BASE_URL=https://app.example.com \
ADMIN_BASE_URL=https://admin.example.com \
pnpm smoke:test
```

## 五、自动部署方案

仓库已提供：

- `scripts/deploy-remote.sh`
- `.github/workflows/deploy.yml`

适合这种流程：

1. GitHub Actions 在 runner 上先 `pnpm build:all`
2. rsync 仓库到远程服务器
3. 远程服务器执行 `deploy-remote.sh`
4. 脚本完成依赖安装、数据库同步、构建、systemd 重启、烟雾测试

详见：`docs/automated-deployment.md`

## 六、Docker / 容器化方式

如果你希望和现有容器化项目风格保持一致，可以参考：

- `api-server/Dockerfile`
- `app-uni/Dockerfile`
- `admin-web/Dockerfile`
- `deploy/docker/docker-compose.nest-admin-style.yml`
- `deploy/docker/.env.nest-admin-style.example`

### Docker 构建时的前端环境变量

由于 `app-uni` 和 `admin-web` 是静态构建产物，部署时必须在构建阶段注入。当前仓库里的 Docker Compose 示例通过以下外层变量传入：

- `APP_H5_API_BASE_URL` → `app-uni` 镜像构建参数 `VITE_API_BASE_URL`
- `ADMIN_WEB_API_BASE_URL` → `admin-web` 镜像构建参数 `VITE_API_BASE_URL`
- `ADMIN_WEB_TOKEN` → `admin-web` 镜像构建参数 `VITE_ADMIN_TOKEN`（如需）

> 在 `docker-compose.nest-admin-style.yml` 中，容器内 API 会自动覆盖 `DATABASE_URL`，改为连接 `interview-bank-mysql:3306`。
