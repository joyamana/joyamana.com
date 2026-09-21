# Project Roadmap

Status: Active planning — Production 已公开，当前聚焦数据完整度、privacy/measurement 与 hardening
Owner: Project owner  
Last updated: 2026-09-21

本文件只记录当前及未来优先级。已完成阶段与日期化实施记录见
[`archive/roadmap-2026-08-to-09.md`](archive/roadmap-2026-08-to-09.md)。详细验收以
`MVP_PRD.md` 和对应领域规格为准。

当前能力与发布范围统一见 [PROJECT_SPEC.md](PROJECT_SPEC.md)；所有待提供字段、译文、
素材和外部配置集中在 [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md)。

## Priority 1 — Product and Commerce completeness

- 按 Q-201/202 完成真实商品知识、图片代表性与三语言验收；mapper 已接入，重点是
  后台真实值、Variant 覆盖、原正文披露和购物路径。缺事实时保留全文，不猜测回填。
- 按 Q-203 完成系列内容与 reference/story 读取；缺描述的系列维持现有 noindex。
- 按 Q-204/207 验收新品牌资产、首页/PDP/Bag 与设备响应式，分切片发布和回滚。
- 特殊配送与税费只按 Q-003B/C/E 范围跟踪；翻译持续 readiness 不等于关闭已批准语言。

## Priority 2 — Privacy, discovery and structured entities

- 验收 Home/Contact 已实现的最小品牌图谱与实际 HTML；新增公开字段或 Policy Schema 时
  保持与内容事实来源一致，不复制非公开主体记录。
- 按 Q-206 完成 privacy/measurement 与外部工具验收，再建立有效商业基线。
- 当前 Search 保持 Product-only/noindex；只有内容规模证明需要时才接入 About、Blog、
  Crystal Guide，不提前引入独立搜索服务。
- 按 Q-205 完成正式 Editorial 内容治理；开放索引单独遵循 D-045，不随换色发布。
- D-016 的 Search/User crawler 与 training crawler 策略单独决策。

## Priority 3 — Engineering and launch hardening

- CI 已配置固定 Node 24 的 install/preflight/lint/typecheck/tests/build；验证 GitHub 实际执行，
  格式检查按团队需要再引入，不新增仅用于本轮的工具依赖。
- 完成关键设备/浏览器的 Accessibility、响应式、性能、链接、404、redirect、售罄与
  API 故障人工验收；达到 D-043 触发条件后再启用 Playwright。
- 复核 Next 404 提示的客户端恢复：当前 HTTP 404/noindex 正确，但初始 HTML 是空壳，
  2026-09-21 生产构建的浏览器本语言提示/恢复链接已验证，禁用 JavaScript 的恢复入口未解决。
  官方多 root layout 方案仍为实验性 global-not-found；稳定方案需单独评估布局/路由调整。
- 复核 CSP、安全响应头、日志/PII、第三方脚本和生产/Preview secret 隔离。
- 完成监控告警、owner、保留策略、rollback target 和发布值守记录。
- 按内容/运营变化持续复核索引矩阵、sitemap、hreflang、Schema 与 Checkout smoke。

## Post-launch optimization

只根据真实漏斗、客服、搜索和复购数据选择：

- 正式 Editorial 内容与商品/Guide 内链。
- 真实 Reviews、Email lifecycle、Recently Viewed、Reorder。
- Customer Account、Wishlist、Gift Card、Referral、Loyalty。
- 经人工服务验证后的 Custom Crystal。
- 目录规模证明需要时的高级搜索或推荐。

## Future markets

Canada 和其他 Market 只有在 Catalog、Pricing、Currency、库存、支付、税务、配送、
法律、客服和本地化内容全部就绪后才启用。一次只开放一个真实运营 Market，并单独验收
URL、canonical、hreflang、sitemap、Cart 与 Analytics；不得复制薄内容或为 Currency
生成 SEO URL。

## Current completion criteria

- `MVP_PRD.md` 对当前公开 scope 的验收全部通过，或有书面接受的具体例外。
- 商品、价格、库存、Cart 与 Checkout 在 Shopify、UI 和测试记录中一致。
- 已开放索引页面输出准确 HTML、metadata、canonical、hreflang、Schema 和 sitemap。
- Consent、PII、日志和第三方数据接收方与实际运行功能一致。
- 每次发布有可复现检查、人工 smoke、负责人和 rollback target。
