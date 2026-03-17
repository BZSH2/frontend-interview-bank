# 发布检查清单

## 一、配置检查

- [ ] 已确认当前推荐交付方式是：**构建端出镜像，服务器只 pull / up**
- [ ] 已确认当前服务器统一端口：API `36000` / H5 `36080` / Admin `36081` / MySQL `33307`

### API

- [ ] `api-server/.env` 已存在
- [ ] `GITHUB_OWNER` / `GITHUB_REPO` 已设置
- [ ] `GITHUB_TOKEN` 已配置或明确留空
- [ ] `ADMIN_TOKEN` 已按需配置

### Runtime Compose

- [ ] `deploy/docker/.env.runtime` 已存在
- [ ] `API_IMAGE` / `APP_IMAGE` / `ADMIN_IMAGE` 已指向正确 tag
- [ ] MySQL 账号密码已改成非默认值

## 二、数据库检查

- [ ] MySQL 正常运行
- [ ] 已确认运行态 compose 暴露端口为 `33307`
- [ ] 已确认不会误把开发库配置带到正式容器环境

## 三、构建检查（构建端）

- [ ] `pnpm lint` 通过
- [ ] `pnpm typecheck` 通过
- [ ] `pnpm --filter api-server build` 通过
- [ ] `VITE_API_BASE_URL=/api pnpm --filter app-uni build:h5` 通过
- [ ] `VITE_API_BASE_URL=/api VITE_ADMIN_TOKEN= pnpm --filter admin-web build` 通过
- [ ] `sh scripts/check-runtime-artifacts.sh` 通过

## 四、运行检查（服务器端）

- [ ] `docker compose ... pull` 成功
- [ ] `docker compose ... up -d` 成功
- [ ] `/api/health` 或 `/api/health/live` 可访问
- [ ] `/api/health/ready` 可访问
- [ ] 前台首页可正常打开
- [ ] 后台首页可正常打开

## 五、GitHub 同步检查（如启用）

- [ ] `sync:github-issues:dry-run` 已先预览
- [ ] 确认不会把测试数据同步到公开仓库
- [ ] 正式同步前已清理不必要的演示申请

## 六、自动化 / 镜像发布检查

- [ ] `.github/workflows/ci.yml` 运行通过
- [ ] `.github/workflows/deploy.yml` 已成功发布 GHCR 运行态镜像
- [ ] 已记录本次使用的镜像 tag（建议 `sha-*`）
- [ ] 如果 GHCR 包是私有的，服务器已完成 `docker login ghcr.io`
- [ ] 已确认不再依赖 SSH + rsync + 远程 `pnpm install`

## 七、安全检查

- [ ] 已启用 HTTPS（如对外公开）
- [ ] GitHub Token 未写入仓库
- [ ] 暴露过的旧 Token 已 rotate
- [ ] 仅暴露必要端口
- [ ] 若使用 `ADMIN_TOKEN`，已理解它是构建期注入到前端的弱鉴权模型，不应当替代真正的后台鉴权体系
