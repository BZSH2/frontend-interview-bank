# 导入 vue3js.cn Vue 系列题目

> 目标：把 https://vue3js.cn/interview/vue/vue.html 左侧 Vue 系列题目批量导入题库。

## 背景说明

- 这批题目以 `Vue` 分类导入。
- 导入数据源在仓库内固化为：
  - `api-server/prisma/data/vue-series-questions.ts`
- 该文件由一次性抓取脚本生成（用于首轮导入）。后续如要更新题目，可再次生成并重新运行导入脚本。

## 导入方式（推荐：增量导入）

> 适用于：你的数据库里已经有其他题目，不希望被清空。

1. 确保数据库已启动且 `DATABASE_URL` 指向正确实例。

2. 执行（在仓库根目录）：

```bash
pnpm --filter api-server prisma:push
pnpm --filter api-server prisma:import:vue-series
```

说明：

- 如果 `Vue` 分类不存在，会自动创建。
- 如果题目已存在（按标题或 aliases 匹配），会更新内容；否则创建新题目。

## 导入方式（全量 seed）

> 适用于：新环境一键初始化。

```bash
pnpm --filter api-server prisma:seed
```

注意：

- `seed.ts` 会清空数据库表并重新插入数据。

## 题目清单

当前抓取并固化为 **32 道** Vue 系列题目（见 `api-server/prisma/data/vue-series-questions.ts`）。
