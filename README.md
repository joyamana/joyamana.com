# Joya Mana Storefront

面向美国市场的水晶 DTC 品牌站：Next.js App Router + Shopify Headless，部署于 Vercel。
en-US 使用根路径，es-US 使用 `/es-us`；共享 US Catalog / USD。
Production canonical 为 `https://www.joyamana.com`，Checkout 使用 `checkout.joyamana.com`。

当前能力与缺口见 [Project Spec](docs/PROJECT_SPEC.md)，优先级见 [Roadmap](docs/ROADMAP.md)。
下单支付已获业务方确认，Payment test mode 流程未发现问题。
Core、Commerce、Policies 的双语言索引已开放；Editorial 仍关闭。Contact 为 Email-only。

## 本地开发

需要 Node 24；pnpm 精确版本由 [package.json](package.json) 固定。
本机使用 mise 时，可在命令前加 `mise exec node@24 --`；nvm 用户运行 `nvm use`。

根据 [.env.example](.env.example) 配置本地 `.env.local`。
Shopify 商品与正文没有本地数据 fallback；未配置时显示不可用状态。

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm preflight
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

`typecheck` 先生成 Next 路由类型；`build` 自动运行环境 preflight。
依赖版本与互相兼容的稳定版例外见 [Technical Spec](docs/TECH_SPEC.md)。
Playwright 当前封存；CI 与 format check 尚未建立。
Vitest/build/HTTP 检查不替代人工浏览器与 Checkout 验收。

## 配置与发布

- `NEXT_PUBLIC_SITE_INDEXABLE` 是部署级总开关，叠加
  [indexing.ts](src/config/indexing.ts) 的语言/页面组矩阵与页面 readiness。
  Preview 必须关闭总开关。
- `SHOPIFY_CHECKOUT_ENABLED` 与 `CONTACT_FORM_ENABLED` 独立控制 Checkout 和表单；
  仓库示例/缺省值均关闭，Production 按获批范围配置。
- 内容与导航使用五分钟再验证缓存；价格、库存和 Cart 使用 no-store。
  内容更新后等待并核对实际响应；webhook 当前后置。
- `dev` 对应 Vercel Preview，`main` 对应 Production。
  发布、回滚与人工 smoke 见 [Launch Runbook](docs/LAUNCH_RUNBOOK.md)。

## 文档入口

| 文档 | 用途 |
|---|---|
| [AGENTS.md](AGENTS.md) | 仓库工作约束与文档优先级 |
| [Decisions](docs/DECISIONS.md) | 有效决策与批准边界 |
| [Brand Inputs](docs/BRAND_INPUTS.md) | 品牌、运营与内容的已确认/待定输入 |
| [Project Spec](docs/PROJECT_SPEC.md) / [MVP PRD](docs/MVP_PRD.md) | 当前状态、范围与验收 |
| [Technical](docs/TECH_SPEC.md) / [Commerce](docs/COMMERCE_SPEC.md) | 架构、数据与交易契约 |
| [Content/SEO/GEO](docs/CONTENT_SEO_GEO_SPEC.md) / [Design](docs/DESIGN_SYSTEM.md) | 内容、索引与视觉规范 |
| [Shopify Setup](docs/SHOPIFY_CATALOG_SETUP.md) | 后台字段与 Catalog 配置 |
| [Analytics](docs/ANALYTICS_AND_KPIS.md) / [Customer Lifecycle](docs/CUSTOMER_LIFECYCLE.md) | 尚待实施的测量、consent 与客户服务范围 |
| [Roadmap](docs/ROADMAP.md) / [Open Questions](docs/OPEN_QUESTIONS.md) | 优先级与未解决输入 |
| [Launch Runbook](docs/LAUNCH_RUNBOOK.md) / [References](docs/REFERENCES.md) | 操作流程与官方资料 |
| [PLANS.md](PLANS.md) | 当前执行计划与模板 |

[Archive](docs/archive/README.md) 仅用于历史追溯，不作为当前实现依据。
文档以中文为主；代码标识符用英文；客户文案支持 en-US/es-US，西语须人工审校。
