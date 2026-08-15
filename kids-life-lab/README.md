# NOYA Kids · Life Lab — Prototype 1.0

> 不是学习打卡，不是家长监督后台。
> 这是孩子自己的一个小世界 —— 她在里面慢慢学会管理自己的
> 学习、生活、责任、成长、金钱和选择。

一个**纯静态**的网页原型：没有登录、没有服务器、没有数据库。
双击 `index.html` 即可用浏览器打开，数据保存在浏览器本地
（localStorage），刷新不会丢失。桌面优先，同时保持 responsive。

---

## 打开方式（推荐：单文件版）

> **只想双击打开、不折腾？下载这一个文件就够了：**
> [`kids-life-lab-standalone.html`](kids-life-lab-standalone.html)

这是把 CSS 和 JS 全部打包进去的**单文件版本**，不依赖任何其它文件。
下载它一个，双击就能用浏览器打开，数据依旧存在本地、刷新不丢。

**在 GitHub 上怎么下载单个文件：** 打开
`kids-life-lab/kids-life-lab-standalone.html` → 右上角点 **Download raw file**
（下载原始文件）→ 双击打开即可。

### 为什么之前打不开？

原来的 `index.html` 是**多文件结构**（`index.html` + `css/` 文件夹 + `js/`
文件夹）。如果你只下载了 `index.html` 一个文件，它找不到旁边的
`css/`、`js/`，页面就会是空白。要么下载**整个 `kids-life-lab` 文件夹**再打开
`index.html`，要么直接用上面的**单文件版**（最省事）。

### 开发用的多文件版

`index.html` + `css/` + `js/` 是便于继续开发和扩展的版本。
改完源码后，运行 `node build.mjs` 就能重新生成单文件版。

---

## 第一版包含什么

| 模块 | 说明 |
|------|------|
| **双孩子系统** | 顶部 Child Switcher 切换「甜甜圈 / 甜甜豆」，两个孩子的数据完全独立保存、独立统计 |
| **MY WORLD** | 首页是一张探索地图，而不是 Dashboard；五座岛屿：学习 / 生活 / 家庭 / 成长 / 财富 |
| **Today's Quest** | 每天几件最重要的小事，可勾选完成，完成后有克制、温柔的反馈（星星 / 地图前进 / 小岛跳动） |
| **Semester Journey** | 学期目标可视化成一条蜿蜒的路线：路标 = 关卡，走过 / 正在这里 / 未解锁 |
| **Baseline & Beyond** | 基本生活线（本来就要做的责任）+ 超越基本线（主动创造的额外价值 → 未来的 Value Credit） |
| **Money Island** | 钱袋 / 罐子 / 宝箱 / 爱心 / 种子 五个资源池，可**拖动硬币**分配；有限资源 → 自己选择 → 看到结果 |
| **My Life Atlas** | 成长时间线，按月查看；记录的不只是成绩，而是真正经历过的时刻 |
| **Decision Lab** | 五道问题的选择流程，系统**不给答案**，只帮孩子想清楚，最后 YES / NOT NOW |
| **Parent Mode** | 家长入口：搭建环境（学期目标、任务、Baseline、Beyond、财富账户、成长事件），而不是监控中心 |

---

## 代码结构（为未来扩展设计）

```
kids-life-lab/
├── index.html          # 入口，按顺序加载各脚本
├── css/
│   └── styles.css      # 全部视觉：storybook / 暖纸 / 克制的游戏感
└── js/
    ├── data.js         # 种子数据 + 岛屿 / 资源池 / 年龄等级配置
    ├── store.js        # localStorage 状态容器（深合并，加字段不破坏旧存档）
    ├── svg.js          # 手绘风 SVG：岛屿、货币容器、路线、点缀
    ├── views.js        # MY WORLD、各岛弹层、财富岛、学期旅程、时间线、选择实验室
    ├── parent.js       # Parent Mode
    └── app.js          # 启动 + 事件路由
```

设计原则：**same system + different child profiles + different age levels**。

### 如何扩展

- **加一个孩子**：在 `data.js` 的 `SEED.children` 里复制一份 profile，
  加进 `CHILD_ORDER`。其它代码不用改。
- **不同年龄难度**：在 `data.js` 的 `AGE_LEVELS` 里加一档，把孩子的
  `ageLevel` 指过去。结构已经为按年龄区分玩法预留。
- **加字段**：`store.js` 会把旧存档深合并到新的 `SEED` 之上，
  所以新增字段不会让已有存档报错。
- **加岛屿 / 资源池**：分别在 `ISLANDS` / `MONEY_POOLS` 里增加定义，
  并在各孩子 profile 中补上对应数据。

### 数据存储

- localStorage key：`noya-kids-life-lab-v1`
- 首页底部「重置示例数据」可清空回到种子数据。

---

## 这一版想回答的唯一问题

> 当我打开它的时候，我是否会觉得：
> *“This is not a study tracker. This is my child's little world.”*

先把这个世界做出来。复杂功能，以后再慢慢加。
