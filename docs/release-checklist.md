# 发布检查清单

## 一、配置检查

### API

- [ ] `api-server/.env` 已存在
- [ ] `DATABASE_URL` 指向正确数据库
- [ ] `GITHUB_OWNER` / `GITHUB_REPO` 已设置
- [ ] `GITHUB_TOKEN` 已配置或明确留空
- [ ] `ADMIN_TOKEN` 已配置（生产建议开启）

### 前台 H5

- [ ] `app-uni/.env` 已设置 `VITE_API_BASE_URL`
- [ ] 构建后静态资源目录正确

### 后台 admin-web

- [ ] `admin-web/.env` 已设置 `VITE_API_BASE_URL`
- [ ] 如开启后台鉴权，则 `VITE_ADMIN_TOKEN` 与 API 的 `ADMIN_TOKEN` 一致

## 二、数据库检查

- [ ] MySQL 正常运行
- [ ] `pnpm --filter api-server prisma:push` 已执行
- [ ] `pnpm --filter api-server prisma:seed` 已按需要执行（生产可不执行 seed）
- [ ] 已确认生产库不会误灌测试数据

## 三、构建检查

- [ ] `pnpm check` 通过
- [ ] `pnpm --filter api-server build` 通过
- [ ] `pnpm --filter app-uni build:h5` 通过
- [ ] `pnpm --filter admin-web build` 通过

## 四、运行检查

- [ ] `/api/health` 可访问
- [ ] `/api/admin/overview` 可访问
- [ ] 前台首页可正常打开
- [ ] 后台首页可正常打开
- [ ] 新增讲解申请链路可用
- [ ] 管理后台更新题目 / 分类 / 申请状态可用

## 五、GitHub 同步检查

- [ ] `sync:github-issues:dry-run` 已先预览
- [ ] 确认不会把测试数据同步到公开仓库
- [ ] 正式同步前已清理不必要的演示申请

## 六、自动化 / 部署检查（如启用 GitHub Actions 自动部署）

- [ ] `.github/workflows/ci.yml` 运行通过
- [ ] `.github/workflows/deploy.yml` 已按需启用（配置 secrets 后会自动运行）
- [ ] GitHub Secrets 已配置：`DEPLOY_HOST` / `DEPLOY_USER` / `DEPLOY_SSH_KEY`
- [ ] 远程机器已准备好 `.env`（自动部署不会覆盖 `.env`）
- [ ] 远程机器已验证可执行 `scripts/deploy-remote.sh`
- [ ] 远程 smoke test：`pnpm smoke:test` 可通过（必要时配置 `ADMIN_TOKEN`）

## 七、安全检查

- [ ] 已启用 HTTPS
- [ ] 后台接口已启用 `ADMIN_TOKEN`
- [ ] GitHub Token 未写入仓库
- [ ] 暴露过的旧 Token 已 rotate
- [ ] Nginx / 反代仅暴露必要端口
