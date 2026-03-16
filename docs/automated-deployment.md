# 自动部署说明（GitHub Actions + SSH）

这套自动化以“**轻量、可维护、容易展示**”为目标：

- CI 负责检查代码质量和构建可用性
- Deploy workflow 负责把仓库同步到远程服务器
- 远程服务器使用 `scripts/deploy-remote.sh` 执行安装、构建、数据库同步、服务重启、烟雾测试

适合单台云服务器 / VPS / Linux 主机。

## 已包含的文件

- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `scripts/deploy-remote.sh`
- `deploy/systemd/frontend-interview-bank-*.service.example`

## 部署前提

远程机器需要提前具备：

- Node.js 20+
- pnpm 10+
- MySQL 8+（或 Docker 中的 MySQL）
- systemd（如果你采用示例里的常驻方式）
- SSH 可登录

建议代码目录：

```bash
/var/www/frontend-interview-bank/current
```

## 远程服务器首次准备

### 1) 创建目录

```bash
mkdir -p /var/www/frontend-interview-bank/current
```

### 2) 准备环境变量

在远程机器中手动放好这些文件：

```bash
/var/www/frontend-interview-bank/current/api-server/.env
/var/www/frontend-interview-bank/current/app-uni/.env
/var/www/frontend-interview-bank/current/admin-web/.env
```

可从各自的 `.env.example` 复制开始。

> 注意：GitHub Actions 的 rsync 已显式排除了这三个 `.env` 文件，自动部署不会覆盖它们。

### 3) 安装 / 更新 systemd（可选）

如果你采用本仓库附带的 systemd 模板，可在首次部署时让 workflow 自动安装，或手动执行：

```bash
cp deploy/systemd/frontend-interview-bank-api.service.example /etc/systemd/system/frontend-interview-bank-api.service
cp deploy/systemd/frontend-interview-bank-app.service.example /etc/systemd/system/frontend-interview-bank-app.service
cp deploy/systemd/frontend-interview-bank-admin.service.example /etc/systemd/system/frontend-interview-bank-admin.service

systemctl daemon-reload
systemctl enable frontend-interview-bank-api
systemctl enable frontend-interview-bank-app
systemctl enable frontend-interview-bank-admin
```

## GitHub Secrets 配置

在仓库 Settings → Secrets and variables → Actions 中配置。

> 注意：`deploy.yml` 的 job 默认会在 secrets 未配置时 **自动跳过**，避免在未启用自动部署的仓库里出现红叉。

### 必填

- `DEPLOY_HOST`：目标服务器 IP / 域名
- `DEPLOY_USER`：SSH 用户
- `DEPLOY_SSH_KEY`：SSH 私钥

### 可选

- `DEPLOY_PORT`：SSH 端口，默认 `22`
- `DEPLOY_PATH`：部署根目录，默认 `/var/www/frontend-interview-bank`
- `API_PORT`：API 对外端口，用于远程 smoke test，默认 `3000`

## workflow 行为说明

### CI workflow

`ci.yml` 会在 PR / push 时执行：

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build:all
```

### Deploy workflow

`deploy.yml` 会在以下情况触发：

- push 到 `main`
- 手动触发 `workflow_dispatch`

部署过程：

1. Checkout 仓库
2. 安装依赖
3. 本地 runner 先执行 `pnpm build:all`
4. 用 rsync 把仓库同步到远程 `current/`
5. 通过 SSH 执行 `scripts/deploy-remote.sh`
6. 远程脚本执行：
   - `pnpm install`
   - `pnpm --filter api-server prisma:push`
   - `pnpm build:all`
   - `systemctl restart ...`
   - `pnpm smoke:test`

## 手动触发部署时的两个开关

`workflow_dispatch` 提供两个布尔输入：

### `run_db_seed`

- `false`：默认，适合正常生产部署
- `true`：会在远程执行 `pnpm --filter api-server prisma:seed`

适合首次初始化演示环境或需要重建 demo 数据时使用。

### `install_systemd_units`

- `false`：默认，不改 systemd 文件
- `true`：把仓库内的 `deploy/systemd/*.service.example` 安装到 `/etc/systemd/system/`

适合第一次上线或模板更新后重新安装。

## 本地手动执行远程部署脚本

如果你已经 SSH 到服务器，也可以直接执行：

```bash
cd /var/www/frontend-interview-bank/current
sh scripts/deploy-remote.sh
```

可选环境变量：

```bash
DEPLOY_ROOT=/var/www/frontend-interview-bank \
API_PORT=3000 \
RUN_DB_SEED=false \
INSTALL_SYSTEMD_UNITS=false \
RUN_SMOKE_TEST=true \
sh scripts/deploy-remote.sh
```

## 常见注意点

### 1. `.env` 不要放进 GitHub Secrets 直接拼文件

本仓库当前自动部署选择的是：

- 代码走 rsync
- 机密配置放在服务器本地 `.env`

这样更简单，也更符合小团队 / 单机项目的实际维护方式。

### 2. 后台开启 `ADMIN_TOKEN` 后，烟雾测试仍可用

`scripts/smoke-test.sh` 已支持读取环境变量 `ADMIN_TOKEN` 并自动携带 `x-admin-token` 请求后台接口。

如果你的 systemd service 或 shell 环境里能拿到该变量，部署后的 smoke test 就不会被后台鉴权拦住。

### 3. `build:all` 会再次做 lint / typecheck

这是刻意保守的做法：

- GitHub runner 先验证一遍
- 远程机器再验证一遍

这样能尽量避免“本地能构建、服务器缺依赖/配置后才翻车”的情况。

## 推荐上线顺序

1. 先在远程机器手动完成一次部署，确认 `.env` / DB / systemd 都没问题
2. 再配置 GitHub Secrets
3. 手动点一次 `workflow_dispatch`
4. 成功后再依赖 `push main` 自动部署

## 适合继续扩展的方向

如果后续要升级到更完整的 CI/CD，可以在这套基础上继续加：

- GitHub Environment protection
- Docker registry 镜像构建
- 蓝绿/滚动发布
- 自动回滚
- 发布版本号 / release notes
