# AGENTS.md

本文件只保留仓库工作约束。具体需求和操作方法写入 `docs/`，不追加临时任务或历史流水。

## 项目使命

建设面向美国市场的水晶 DTC 品牌站，依次优先：品牌体验与信任、购买转化与交易可靠性、
SEO、AI Search 可理解性、未来市场扩展。收入来自品牌商品销售，不依赖广告变现。

## 开始任务前

先读 `docs/PROJECT_SPEC.md`，再读对应领域规格；待办和未确认输入见 `docs/ROADMAP.md`。
技术任务使用 TECH_SPEC，商品使用 COMMERCE_SPEC，内容与索引使用 CONTENT_SEO_GEO_SPEC，
界面使用 DESIGN_SYSTEM；后台维护和发布分别使用 SHOPIFY_CATALOG_SETUP、LAUNCH_RUNBOOK。

规则优先级：用户当前指令、本文件的工作约束、PROJECT_SPEC、对应领域规格。
Roadmap 中的候选和待确认项不是业务批准。缺失输入若会改变品牌、商品模型、运营政策、
数据合规或系统边界，应说明影响并请求决策，不自行编造。

文档只维护当前规则、能力、操作和待办。完成计划与旧决定不归档，历史通过 Git 查询。
同一规则只在所属文档详细说明，其他地方引用；品牌事实、业务批准和候选建议须明确区分。

## 技术与市场边界

- Next.js App Router + TypeScript，Vercel 为首选部署平台。
- Shopify 是商品、变体、价格、库存、折扣、购物袋、订单、支付和 Checkout 的事实来源。
  使用 Headless channel + Storefront API，Checkout 跳转 Shopify 托管结账。
- 不建独立业务后端、数据库或认证系统；允许必要的 Next.js Route Handlers、
  Server Actions、缓存失效端点和服务端适配层。
- Server Components 优先，只在真实交互需要时使用 Client Components。
  索引页须在初始响应中提供完整 HTML，可使用静态生成、ISR 或动态服务端渲染。
- 当前只启用 US / US Catalog / USD。公开语言为 en-US 根路径与 zh-Hant-US
  `/zh-hant-us/`，繁中采用香港惯用书面语。es-US 暂停，保留映射与共享译文；
  `/es-us` 及子路径返回 404/noindex，不生成、展示、导航或索引，恢复前须重新批准。
- CA / CAD / en-CA / fr-CA 只保留 typed planned 配置。对应路径返回 404，
  不生成、不导航、不索引，启用前须重新批准。
- Market、Language、URL、Currency 分离。同一市场的语言共享商业事实；跨市场须隔离
  Catalog、价格、库存、购物袋、税费、配送和法律上下文。Currency 不进入 SEO URL。
- `/` 保持 en-US，不建 Global Site、不强制 IP redirect。未来地区入口优先考虑
  noindex `/choose-region`；迁移根路径或提前生成未来市场 URL 须先说明并获批。

## 客户、内容与数据

- 游客必须能购买。交易 Email、账户身份与营销同意分开；账户是可选服务门户。
- 不虚构评论、库存紧迫性、折扣、专家、资质、产地、采购或环保承诺。
- 传统或精神文化内容不得写成医疗事实；无可靠依据不得声称诊断、治疗、治愈、预防
  或健康安全功效。配送、退换、税费和隐私内容必须来自真实获批政策。
- UI、metadata、JSON-LD 和未来 analytics 使用同一份经过校验的数据；与可见内容一致。
- 不做隐藏 AI 页面、crawler cloaking、薄页面或关键词替换页。索引范围与 URL 规则见
  CONTENT_SEO_GEO_SPEC；`llms.txt` 只作可选辅助。
- 私密 Storefront token、Admin token、webhook secret 和客户 PII 只在服务端使用，
  不提交、打印或发送浏览器；正常购物袋状态不含 secret Cart ID 或 Checkout URL。
- 新生产依赖或平台须说明业务价值、数据边界、成本和退出路径；不提前接入未来工具。

## 工程与架构变更

选择最小、可读、可测试的实现，使用明确类型、集中配置和薄适配层，不预建未批准的系统。
代码标识符使用英文，界面支持当前启用的 US 语言，译文须人工审校；规划文档可用中文。
保留用户已有的无关改动，不顺手扩大重构范围。

以下变更实施前须说明原因、替代方案、迁移影响，并更新所属规格中的当前方案：
更换框架、部署平台或事实来源；新增数据库、长期服务、自建认证或客户数据处理方；
改变 URL、市场、索引、Checkout、订单、账户或营销同意边界；引入超出当前范围的大功能。
不再另建决策日志。可逆、局部且不改变系统边界的选择无需额外决策文件。

## 计划与完成

跨领域或跨阶段任务使用 `PLANS.md`。只保留进行中的计划，完成后更新规格和 Roadmap，
删除计划，不生成历史文档。

完成前按实际改动检查：

- 需求和验收满足；相关 lint、类型、测试与生产构建已运行，不能运行时说明原因。
  纯文档修改检查规则迁移、断链和代码一致性，不为它重复构建应用。
- 错误、加载、空状态、移动端和键盘行为；索引页面的初始 HTML、metadata、canonical、
  Schema、链接、sitemap/noindex；交易数据与 Shopify 一致；consent、PII、日志和 secret 边界。
- 文档、环境示例和命令与代码同步。交付说明改动、验证、剩余风险和业务待办。

## 验证入口

Node 保持 24，精确依赖以 package.json/lockfile 为准。语言映射在 `src/config/locales.ts`，
索引矩阵在 `src/config/indexing.ts`；Production canonical 为 `https://www.joyamana.com`。
默认索引和 Checkout 开关关闭，各部署按批准范围核验；Contact 当前只用 Email。
Preview 必须 noindex。缺译页面允许 Shopify 英文回退，不复制本地正文；配置批准不等于译文验收。

检查命令见 README，缓存与请求规则见 TECH_SPEC，设备和 Checkout 验收见 LAUNCH_RUNBOOK。
Playwright 当前封存；任何检查实际运行前不得声称通过。
