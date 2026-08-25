# Project Roadmap

Status: Active planning  
Owner: Project owner  
Last updated: 2026-08-25

Roadmap 按依赖和可验证结果排序，不承诺未经资源评估的日历日期。详细功能以
MVP PRD 和领域规格为准。

## Phase 0 — 决策与资料准备（测试站所需部分完成）

### 目标

把绿地项目变成可以安全初始化的工程规格。

### 工作

- 将 2026-08-03 业务回复同步到规范。
- 接受 D-009、D-011、D-015、D-020 至 D-023。
- 确认首发商品样本、图片、Collection 和库存模型。
- 确认 Shipping、Returns、Privacy、Terms、claims 负责人。
- 准备 Shopify development/store、Headless channel、Vercel 和域名。
- 审核 MVP PRD、Commerce、Content/SEO 和 Design 规格。

### 退出条件

- Project Spec 的核心品牌、Catalog 和运营字段不再是阻塞占位。
- 至少有一组代表性 Product/Variant/Collection 和一篇 Guide 内容样本。
- 技术与内容事实来源均为 Accepted。
- 有明确的上线窗口、角色和验收负责人。

## Phase 1 — 工程基础（测试站本地基线完成，外部集成待办）

### 目标

建立可部署、可测试、可连接 Shopify 的最小 Next.js 骨架。

### 工作

- 初始化 Git、Next.js App Router、TypeScript、pnpm 与 Node 版本。
- 建立 lint、typecheck、unit test 与 production build。
- 建立 Playwright、CI 和 format check（待办）。
- 建立环境变量验证、`.env.example` 和 secret 边界。
- 配置 Vercel Preview/Production，Preview 全站 `noindex`。
- 建立 Shopify Storefront API client、GraphQL types 与错误处理。
- 建立 typed US market context、统一 path helper 和 money formatter。
- 建立基础 layout、tokens、可访问导航和错误页。

当前本地结果：Next.js 骨架、已启用的 US Market 路由、保留但不公开的 CA
typed 配置、noindex/robots/sitemap、lint、typecheck、unit tests 和 production build
已建立。Shopify Headless private token 与 Storefront API 已连接；Product、Variant、
Money、Availability、Search 和非空 Collection 均通过显式 provider adapter 读取。
2026-08-25 Storefront 可见 1 个真实商品，但尚无包含商品的 Collection。Shopify
Cart 的创建、恢复、增改删、HttpOnly cookie、独立 Buy now Cart 与最新 Checkout URL
代码已完成；因 Q-003A–Q-003F 和 Checkout 运营配置未批准，跳转门禁仍关闭。
Vercel Preview、Playwright 与 CI 仍待外部账号或后续工程阶段。

### 退出条件

- 本地、CI、Preview 的 install/lint/typecheck/test/build 通过。
- Preview 可安全读取测试 Shopify 数据且不被索引。
- 无 token 暴露到客户端 bundle 或日志。

## Phase 2 — Commerce vertical slice

### 目标

先证明完整交易链路，再扩展内容和视觉细节。

### 工作

- Collection 查询和商品卡。
- PDP 数据映射、图库、Variant、Price、Availability。
- Storefront Cart 创建、恢复、更新、删除和错误状态。
- 获取最新 checkout URL 并跳转 Shopify hosted checkout。
- 处理售罄、价格变化、库存冲突与 API 失败。
- Webhook HMAC 验证与 Product/Collection cache invalidation。
- Commerce integration 与 E2E 测试。

2026-08-25 阶段结果：Catalog/PDP/Bag/Buy now/Checkout adapter 和 107 项 unit/
integration tests 已完成；Catalog/Variant 已全量分页并遵循 Shopify quantity rule；
真实 Cart 合约 smoke 已覆盖 create、库存冲突 warning、update/remove 与 HTTPS
Checkout URL。仍需 Shopify 发布真实 Collection、审核当前商品正文、发布人工审核的
西语翻译、完成政策和 Checkout 运营验收，并补 webhook、Playwright 和支付测试。

### 退出条件

- Home/Collection → PDP → Cart → Checkout 路径通过。
- UI、Cart、Shopify 的价格和库存一致。
- 游客无需账户即可进入 Checkout。
- Commerce 关键失败均有可恢复体验。

## Phase 3 — Brand, content and discovery

### 目标

完成品牌体验、可信内容以及 SEO/GEO 基础。

### 工作

- 按获批设计系统完成 Home、About、Contact 和 trust pages。
- 实现 Crystal Guide、Article 与作者/引用模型。
- 完成 metadata、canonical、Open Graph、Schema mapper。
- 完成 sitemap、robots、redirects 和索引控制。
- 建立 Product ↔ Crystal ↔ Article 的人工关联与内链。
- 配置 Search Console、Merchant Center 和获批 crawler policy。
- 只有核心基础全部通过后再评估 `llms.txt`。

### 退出条件

- 所有预期索引页面输出完整 HTML 和准确实体。
- Sitemap、canonical、noindex 与 Schema 自动测试通过。
- 真实内容通过 claims、作者、引用和业务审核。

## Phase 4 — Measurement, hardening and launch

### 目标

在真实设备、真实数据和可回滚条件下上线。

### 工作

- 实现最小 Analytics/consent，完成 Shopify 订单对账。
- 完成 Accessibility、性能、响应式、SEO 和安全审计。
- 检查第三方脚本、CSP、安全响应头、PII 和日志。
- 全量检查链接、404、redirect、售罄与永久下架策略。
- 完成 Shipping、Returns、Privacy、Terms 和客服流程签署。
- 建立发布、回滚、告警、值守和上线后验证清单。
- Soft launch，再根据数据正式发布。

### 退出条件

- `MVP_PRD.md` 的发布验收全部通过或有书面接受的例外。
- 生产域名、Checkout、Email、Analytics、robots、sitemap 正确。
- 有明确的回滚版本、负责人和事故响应方式。

## Phase 5 — 上线后优化

只根据数据选择，不预先承诺：

- 内容更新、搜索需求覆盖和 Collection 优化。
- 真实 Reviews、Email 生命周期、Recently Viewed、Reorder。
- Shopify Customer Account、订单历史和地址管理。
- Wishlist、Gift Card、Referral、Loyalty。
- 经表单/人工服务验证后的 Custom Crystal。
- 目录规模证明需要时的高级搜索或推荐。

进入条件：至少有可靠的漏斗、客服、搜索和复购数据，能说明问题规模与预期
价值。

## Phase 6 — 国际扩展

一次只启用一个业务已准备好的 Market，并仅开放已审核的 language-region：

- Shopify Market/Catalog、Pricing、Currency、库存、支付、税务、配送和法律
  要求就绪。
- 客服、退换、隐私和当地政策就绪。
- 关键页面与商品内容经过人工本地化和 QA。
- URL、currency、canonical、hreflang、sitemap 和 analytics 单独验收。

不得通过复制相同内容来“上线”新 Market；不得为 Currency 生成 SEO URL。
