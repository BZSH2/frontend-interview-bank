# 当前服务器部署说明（runtime-first）

> 这份说明基于当前机器实际情况整理：
>
> - 项目路径：`/root/.openclaw/workspace/frontend-interview-bank`
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

## 结论

**当前服务器推荐部署方式只有一条：runtime-first。**

也就是：

- 本地 / GitHub Actions hosted runner：安装依赖、build、检查、发布镜像
- 当前服务器：拉镜像并运行

当前服务器默认**不要执行**：

- `pnpm install`
- `pnpm bootstrap:dev`
- `pnpm build:all`
- 任何源码级构建

---

## 1. 准备文件

在服务器项目目录下执行：

```bash
cd /root/.openclaw/workspace/frontend-interview-bank
cp deploy/docker/.env.runtime.example deploy/docker/.env.runtime
cp api-server/.env.example api-server/.env
```

需要重点填写：

### `deploy/docker/.env.runtime`

- `API_RUNTIME_IMAGE`
- `APP_RUNTIME_IMAGE`
- `ADMIN_RUNTIME_IMAGE`
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_PASSWORD`
- 如需换 tag，也在这里改

### `api-server/.env`

- `GITHUB_TOKEN`（如需把讲解申请同步到 GitHub）
- `ADMIN_TOKEN`（如需保护后台接口）
- 其他业务环境变量

> 说明：runtime compose 会自动覆盖 `PORT` / `DATABASE_URL`，因此 `api-server/.env` 中保留示例值即可。

---

## 2. 拉镜像并启动

如果 GHCR 包是私有的，先登录：

```bash
docker login ghcr.io
```

然后执行：

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

---

## 3. 验收命令

```bash
curl -fsS http://127.0.0.1:36000/api/health/live
curl -fsS http://127.0.0.1:36000/api/health/ready
curl -I http://127.0.0.1:36080
curl -I http://127.0.0.1:36081
```

如果要看日志：

```bash
docker compose \
  --env-file deploy/docker/.env.runtime \
  -f deploy/docker/docker-compose.nest-admin-style.runtime.yml logs -f --tail=200
```

---

## 4. 为什么不再推荐服务器本机构建

因为当前项目已经明确采用下面的协作原则：

- 当前服务器不适合再跑 `pnpm install`
- 重活应交给本地 / GitHub Actions hosted runner
- 服务器只负责运行产物 / 镜像

这样做的好处：

- 更稳定
- 避免服务器内存被依赖安装拖垮
- 部署链路更可复现
- 更容易切换到 GHCR / 官方托管 CI-CD

---

## 5. 非推荐路径说明

以下路径仍保留在仓库中，但**不是当前服务器默认部署方式**：

- `deploy/docker/docker-compose.nest-admin-style.yml`
- systemd 示例
- PM2 示例
- `pnpm bootstrap:dev`
- `pnpm build:all`

它们只用于：

- 本地开发
- 临时调试
- 历史兼容

---

## 6. 当前版本的已知边界

截至当前说明：

- runtime compose 已切到预构建镜像，不再挂宿主机源码 / `dist` / `node_modules`
- 当前服务器仍需要一次真实的 Docker / MySQL 启动验证，才能算彻底闭环
- 如果 GHCR 包尚未发布，需要先由 GitHub Actions 将镜像推上去
