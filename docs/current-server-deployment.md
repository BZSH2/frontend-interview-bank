# 当前服务器部署说明

> 这份说明基于当前机器实际情况整理：
>
> - 服务器路径：`/root/.openclaw/workspace/frontend-interview-bank`
> - Node / pnpm / Docker 已有
> - `systemd` 可用
> - `nginx` / `pm2` 当前未安装
> - 80 端口当前已被现有 `vue-admin` 容器占用

## 建议部署方式

在当前服务器上，先使用以下端口直接运行：

- API：`3000`
- 用户端 H5：`4173`
- 管理后台：`4174`
- MySQL：`33306`

这种方式**不会干扰你现有的 `nest-admin` / `vue-admin` 容器**。

## 一、首次准备

```bash
cd /root/.openclaw/workspace/frontend-interview-bank
pnpm bootstrap:dev
pnpm build:all
```

## 二、手动启动验证

### 1. 启动 API

```bash
cd /root/.openclaw/workspace/frontend-interview-bank
pnpm dev:api
```

### 2. 启动前台 / 后台静态预览

```bash
cd /root/.openclaw/workspace/frontend-interview-bank
pnpm preview:all
```

访问：

- 用户端：`http://当前服务器IP:4173`
- 后台：`http://当前服务器IP:4174`
- API 健康检查：`http://当前服务器IP:3000/api/health`

## 三、systemd 长驻方式（推荐）

复制示例 service：

- `deploy/systemd/frontend-interview-bank-api.service.example`
- `deploy/systemd/frontend-interview-bank-app.service.example`
- `deploy/systemd/frontend-interview-bank-admin.service.example`

到：

```bash
/etc/systemd/system/
```

然后执行：

```bash
systemctl daemon-reload
systemctl enable frontend-interview-bank-api
systemctl enable frontend-interview-bank-app
systemctl enable frontend-interview-bank-admin
systemctl start frontend-interview-bank-api
systemctl start frontend-interview-bank-app
systemctl start frontend-interview-bank-admin
```

查看状态：

```bash
systemctl status frontend-interview-bank-api
systemctl status frontend-interview-bank-app
systemctl status frontend-interview-bank-admin
```

## 四、如果后面要接入统一域名

由于 80 端口目前被已有容器占用，当前更适合：

1. 先使用端口直连验证业务
2. 后续再决定是否：
   - 调整现有 `vue-admin` 的反代规则
   - 或新装反向代理并重新分配入口

在不清楚现有 80 端口容器职责前，**不建议直接抢占 80 端口**。

## 五、当前服务器上的推荐操作顺序

```bash
cd /root/.openclaw/workspace/frontend-interview-bank
pnpm bootstrap:dev
pnpm build:all
pnpm smoke:test
```

确认没问题后，再切到 systemd 常驻。

## 六、如果要对齐当前 `nest-admin` 的部署风格

当前服务器上的 `nest-admin` / `vue-admin` 本质是：

- 后端：Node 容器
- 前端：Nginx 静态容器
- 都由 Docker 以 `restart: unless-stopped` 方式托管

本项目已经补了同风格示例：

- `api-server/Dockerfile`
- `app-uni/Dockerfile`
- `admin-web/Dockerfile`
- `deploy/docker/docker-compose.nest-admin-style.yml`

推荐端口：

- API：`36000`
- 用户端：`36080`
- 后台：`36081`

这样可以和你现有：

- `nest-admin`（35000）
- `vue-admin`（80）

并存，不冲突。

## 七、Docker Compose（对齐 nest-admin 风格）的实际用法

先复制环境变量示例：

```bash
cp deploy/docker/.env.nest-admin-style.example deploy/docker/.env.nest-admin-style
```

默认建议保持这几个值为 `/api`：

- `APP_H5_API_BASE_URL`
- `ADMIN_WEB_API_BASE_URL`

只有在“前台/后台和 API 不走同域反代、而是分域名或分机器部署”时，才需要改成完整地址。

- `ADMIN_WEB_TOKEN`（可选）

然后执行：

```bash
docker compose \
  --env-file deploy/docker/.env.nest-admin-style \
  -f deploy/docker/docker-compose.nest-admin-style.yml up -d --build
```

默认对外端口：

- API：`36000`
- 用户端：`36080`
- 后台：`36081`
- MySQL：`33307`

这样不会和当前已经在跑的：

- `nest-admin`（35000）
- `vue-admin`（80）
- 本地开发 MySQL（33306）

产生冲突。

> 说明：在 `docker-compose.nest-admin-style.yml` 中，容器内的 API 会自动覆盖 `DATABASE_URL`，改为连接 `interview-bank-mysql:3306`，不会直接使用宿主机的 `127.0.0.1:33306`。

> 现在 Docker 方案里，前台和后台容器会在容器内通过 Nginx 反代 `/api` 到 `interview-bank-api`，因此不需要提前知道服务器公网 IP。

- 免重建依赖的运行时 compose：`deploy/docker/docker-compose.nest-admin-style.runtime.yml`
- 运行时产物检查脚本：`scripts/check-runtime-artifacts.sh`

### 八、如果前端产物在本地构建、服务器只负责运行

这更符合当前协作分工：

- 本地 OpenClaw：安装依赖、构建、smoke test
- 当前服务器：接收 dist 产物、启动容器、做部署验收

服务器侧在收到本地产物后，先执行：

```bash
cd /root/.openclaw/workspace/frontend-interview-bank
sh scripts/check-runtime-artifacts.sh
```

确认产物里没有残留 `localhost` API 地址，再执行：

```bash
docker compose \
  --env-file deploy/docker/.env.nest-admin-style \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml up -d
```

这样就不需要在当前服务器重新跑 `pnpm i` / 前端构建。
