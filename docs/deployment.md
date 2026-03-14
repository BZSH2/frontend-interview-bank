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
