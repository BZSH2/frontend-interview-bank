# frontend-interview-bank

前端面试题库 Monorepo，包含：

- `app-uni`：uni-app 用户端（微信小程序 / H5 / PC 浏览器）
- `api-server`：NestJS API 服务（题库、讲解申请、GitHub Issues 集成）

## 技术栈

- **Monorepo**：pnpm workspace
- **Client**：uni-app + Vue 3 + TypeScript + Pinia
- **Server**：NestJS + Prisma + MySQL
- **Code Quality**：ESLint + Prettier + lint-staged + Husky + Commitlint
- **CI**：GitHub Actions

## 项目结构

```bash
frontend-interview-bank/
├─ app-uni/
├─ api-server/
├─ .husky/
├─ .github/workflows/
└─ package.json
```

## 开发约束

- 统一使用 **Conventional Commits**
- 提交前自动执行 `lint-staged`
- 统一通过根目录脚本执行 lint / format / typecheck
- 默认按 **模块化、可扩展、前后端解耦** 的大厂工程化风格维护

## 快速开始

> 当前仓库已完成第一版工程骨架。安装依赖后可启动开发。

```bash
pnpm install
pnpm dev:api
pnpm dev:uni:h5
```

## 关键脚本

```bash
pnpm lint
pnpm lint:fix
pnpm format
pnpm typecheck
pnpm check
```

## 提交规范

示例：

```bash
git commit -m "feat(api): add explanation request module"
git commit -m "feat(app): scaffold question detail page"
git commit -m "chore(repo): add commitlint and husky"
```
