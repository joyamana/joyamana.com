# Joya Mana Storefront

面向美国市场的水晶品牌站，使用 Next.js App Router、Shopify Headless 和 Vercel。
当前能力见 [项目说明](docs/PROJECT_SPEC.md)，未完成工作见 [Roadmap](docs/ROADMAP.md)。

## 本地开发

使用 Node 24，pnpm 版本由 [package.json](package.json) 固定。
根据 [.env.example](.env.example) 创建 `.env.local`。商品与正文从 Shopify 读取；
没有配置时显示不可用，不提供本地商品或政策后备数据。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

提交代码前按改动范围运行：

```bash
pnpm preflight
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

`pnpm format` 修正代码排版；类型检查会先生成路由类型，build 会先运行环境预检。
GitHub [CI](.github/workflows/ci.yml) 对 PR、dev/main 提交运行上述检查，结果以 GitHub 为准。
浏览器和 Checkout 的人工验收见 [发布手册](docs/LAUNCH_RUNBOOK.md)。

## 文档

| 文件 | 内容 |
|---|---|
| [AGENTS.md](AGENTS.md) | 仓库工作约束与阅读顺序 |
| [项目说明](docs/PROJECT_SPEC.md) | 范围、用户流程、当前能力和限制 |
| [技术规格](docs/TECH_SPEC.md) | 架构、缓存、配置、数据与安全 |
| [交易规格](docs/COMMERCE_SPEC.md) | 商品、选款、购物袋、结账、客服与营销同意 |
| [内容与索引](docs/CONTENT_SEO_GEO_SPEC.md) | 内容来源、翻译、URL、SEO、结构化数据与声明 |
| [设计规范](docs/DESIGN_SYSTEM.md) | 品牌表达、视觉和交互 |
| [Shopify 维护](docs/SHOPIFY_CATALOG_SETUP.md) | 后台字段、商品分类和维护检查 |
| [Roadmap](docs/ROADMAP.md) | 代码待办、后台输入和未决事项 |
| [发布手册](docs/LAUNCH_RUNBOOK.md) | 发布检查、验证与回滚 |
| [PLANS.md](PLANS.md) | 正在执行的计划与模板 |

同一规则只在对应文档详细说明；历史通过 Git 查询，不再维护归档或决策流水。
