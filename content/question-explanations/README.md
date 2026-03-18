# 题目讲解 Markdown 文件

这里可以放**脱离数据库的题目讲解 Markdown 文件**。

用户端题目详情页会优先按下面的规则查找并渲染 `.md` 文件：

1. `content/question-explanations/<题目ID>.md`
2. `content/question-explanations/<分类名>/<题目标题>.md`
3. `content/question-explanations/<题目标题>.md`

## 文件命名规则

系统会自动做一层文件名规范化：

- 去掉非法文件名字符：`<>:"/\\|?*`
- 连续空白会替换成 `-`
- 前后多余的 `.` / `-` 会被移除
- 分类目录会转成小写

所以更稳妥的方式是直接使用 **题目 ID**：

```text
content/question-explanations/12.md
```

## 优先级说明

- 如果同一题既有数据库讲解，也有这里的 Markdown 文件，**优先使用 Markdown 文件**。
- 如果这里只是想临时增强某几道题的讲解，不需要改数据库，直接新建 `.md` 即可。

## Markdown 能力

当前支持：

- 标题
- 列表
- 引用
- 行内代码 / 代码块
- 链接
- 换行

为了安全，HTML 会被禁用，不会直接渲染原始 HTML 标签。

## 示例

```md
# Vue 响应式原理

## 一句话总结

Vue 3 基于 `Proxy` 拦截对象读写，并通过依赖收集 + 触发更新完成响应式。

## 面试可答

- `track`：读取时收集依赖
- `trigger`：修改时触发副作用
- `effect`：把副作用函数和依赖关联起来

> 如果继续追问，可以再展开 `ref`、`computed`、`watch` 的实现差异。
```
