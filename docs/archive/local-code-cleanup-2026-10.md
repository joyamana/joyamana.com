# 全局代码、文档与缺陷清理


状态：Complete（本地实施与验证已交付；上游限制和后台事项保留为待办）

负责人：Codex / 项目负责人

最后更新：2026-10-03

范围：当前工作区，包括尚未提交的商品筛选、变体链接、配色和三语言修改。

### 目标

修复影响浏览、购物袋恢复和索引一致性的问题；删除确实不用的旧代码；让代码职责清楚、文档只说明当前规则和实际待办。
按用户后续授权执行本地代码修复，不把整站重写、重做视觉或扩展业务功能混入清理。

### 审查基线与限制

- 已检查 Commerce、内容适配、页面/组件、三语言、SEO、配置、测试与全部现行文档；未发现需要更换 Next.js、Shopify 或 Vercel 的理由。
- 开始审查时已有 39 个已跟踪文件被修改，另有未跟踪的新文件。这些是用户已有成果，实施前必须保存可恢复基线，不能 reset、覆盖或把它们当作本次新增。
- 现行 Markdown 共 18 份、约 4,058 行；archive 共 13 份、约 3,869 行。现行文件有 190 处 D-编号引用，当前相对文件链接检查未发现断链。
- 在 Node 24.21.0 下，环境预检、ESLint、Next 路由类型生成、TypeScript、36 个测试文件 / 235 个测试、Next production build 均通过。
- 原始 `pnpm` 入口未成功：本机启动器无法联网完成所固定版本的签名校验。上述检查改用仓库已安装的工具执行，未重新安装依赖、修改版本或绕过签名校验。后续仍需补做正常 `pnpm install --frozen-lockfile` 的干净安装验证。
- 本地生产构建 HTTP 检查覆盖三语言未知路径、`/en-ca`、`/fr-ca` 和西语缺失商品：均为 404/noindex，但初始 HTML 无 `main`、H1 或错误恢复正文。临时服务器已停止。
- 已复现的异常输入与购物袋问题来自实际源码和隔离数据；不代表已观察到线上事故。没有向 Shopify 写入购物袋/订单，没有执行付款、部署或人工浏览器验收。
- 文件行号是本次审查定位，实施后可能变化。

### 实施边界

- 保留 US/USD、三语言现有路径、Shopify hosted Checkout、游客购买及 Shopify 商业数据来源。
- 保留三语言薄路由和独立 document layout；它们承载 HTML 语言、字体和错误边界，不按重复代码机械合并。
- 保留 CA 的 typed planned 配置与 404 边界，只清理没有运行价值的未来 UI 和旧占位字段。
- 保留完整目录/Variant 匹配、稳定代表款、十进制金额、商业数据不缓存、导航/内容五分钟再验证、默认英文回退及现行索引范围。
- Contact/Resend 是已有明确保留要求的关闭功能，不等于无引用死代码；本方案不顺手启用或删除它。Analytics、账户、CMS、搜索平台等不在本次新增范围。
- 不把后台缺颜色、缺商品资料、缺译文，误报成前端需要编造数据来修复的 bug。

### 一、优先修复的问题

P1 表示影响核心流程或可能令整页失败，应先处理；P2 表示明确的局部缺陷或边界缺口，随后处理。以下每项单独补能证明用户行为的回归测试，不用大段源码快照代替测试。

#### 1. P1：已有购物袋遇到数量规则变化会整袋报错

- 位置：`src/lib/commerce/shopify-cart.ts:332`、`src/lib/commerce/types.ts:62`。
- 证据：原袋内数量为 5、后台 minimum 改为 10，或行数量合并到 100，`mapCartLine` 抛 `SHOPIFY_ERROR`。页面无法展示该行供用户修改或删除。
- 原因：把“已有 Shopify 数据能否读取”和“当前数量能否购买”当成同一校验。
- 修改：mapper 只拒绝结构损坏的数据；保留可识别的行，单独计算数量问题。新提交继续限制整数、步进和上限。服务端加购检查合并后的数量，不能只依赖浏览器按钮。
- 验收：minimum 上调、maximum 下调、increment 改变、数量超过本地上限时仍能看见和移除商品；不合法行不直接进入 Checkout。

#### 2. P1：库存减少后无法直接调整数量，Checkout 预检也未拦住

- 位置：`src/components/cart-view.tsx:216`、`src/app/actions/cart.ts:224`。
- 证据：袋内 10 件、库存剩 3 件时，“减到 9”仍超过库存，减号被禁用；当前只能删除后重加。隔离执行 `checkoutAction`，该输入仍返回成功，因为只检查 `availableForSale`。
- 修改：统一购物袋行的数量判断，提供“调整为当前可购买数量”的操作；不够 minimum 时提示移除/重新选款。Checkout 再读取最新数据，发现问题则返回行级提示并刷新购物袋。
- 验收：库存减少、售罄、数量规则变更、未知库存和允许缺货销售分别覆盖；价格变化仍以 Shopify 最新返回为准。
- 限定：这是站内恢复和预校验缺失，并不说明 Shopify 会允许错误成交；最终交易判断仍归 Shopify。

#### 3. P1：HTML 字符实体解析可以令商品或政策页面报错

- 位置：`src/lib/content/shopify-html.ts:25`，使用方包括 `shopify-catalog.ts:724` 与政策读取。
- 证据：`&#1114112;`、`&#x110000;` 抛 `RangeError`；`&copy;`、`&ndash;` 被二次转义，用户会看到实体名称。
- 修改：先补非法实体和常见编辑器输出用例，再替换手写正则解析与不完整实体解码。优先采用仍在维护、支持 Node 24 的成熟 HTML 解析/清洗实现，保留当前标签、链接协议和新窗口规则；不继续逐项补实体表。
- 依赖要求：新增包只在服务端处理 Shopify 正文，不传给新服务、不接触客户数据、无服务订阅费；记录传递依赖和维护成本，并封装在现有 `sanitizeShopifyHtml` 接口内，方便替换。安装前核对维护状态、版本、授权和漏洞记录。
- 验收：合法/非法 Unicode、超长实体、具名实体、双重转义、畸形标签、危险链接、表格和正常段落；异常正文不得因解码错误拖垮整个列表。

#### 4. P2：内容显示“不可用”，却仍可能允许索引

- 位置：`shopify-content-pages.ts:105,145,159`、`service-page-metadata.ts:96`、`accessibility-page.tsx:14`。
- 证据：非空 rich-text JSON 可以渲染成空 HTML；UI 显示不可用，metadata/sitemap 却只检查对象存在。`null` 或包含 `null` 子节点的 rich-text 还会抛 `TypeError`。
- 修改：在解析时验证节点结构、可见正文和日期，形成统一的“页面可发布”结果，供 UI、metadata、语言链接和 sitemap 使用。
- 同时修复：Accessibility 强制要求 `seo_description`，与当前规范和 About 的正文摘要回退不一致。提取小范围的 `content_page` 基础解析、摘要和内容检查，不建立通用 CMS 框架。
- 验收：空正文统一不可用/noindex/不进 sitemap；正常正文缺 SEO description 时提取真实摘要；缺译页面沿用现有可访问、索引受限规则。

#### 5. P2：About 参数页 noindex，但仍输出结构化数据

- 位置：三语言 `about/page.tsx`、`about/[handle]/page.tsx`、`components/pages/about-page.tsx:80`；Editorial 详情有同型遗漏。
- 证据：metadata 读取 `searchParams`，页面 Schema 生成没有收到参数。可发布的 `/about?utm_source=x` 因此仍输出 Schema。Editorial 当前关闭索引，暂时掩盖同型问题。
- 修改：薄路由把参数传到共享页面，再传入已有的结构化数据门禁；不新增第二套参数判断。
- 验收：三语言干净页和参数页成对检查。参数页 canonical 指向干净路径，noindex，无 alternate/Schema，不进 sitemap。

#### 6. P2：PDP 把加载中和无效选款显示为售罄

- 位置：`product-purchase.tsx:182`、`:186`、`add-to-cart.tsx:57`。
- 证据：`pending`、无有效选款和真实不可购买一起控制 `available`，随后统一显示 Sold out。
- 修改：分开维护库存事实、选款状态和提交状态；无效款提示重新选择，更新中显示更新提示，只有实际售罄才显示售罄。
- 验收：有货、售罄款链接、无效/外商品 Variant、慢响应切款、前进后退均显示正确文案，购买动作仍指向同一款。

#### 7. P2：从 Bag 返回商品页会丢失所选款式

- 位置：`cart-view.tsx:160,198`。
- 修改：图片和标题链接复用既有 Variant URL helper，带上 `?variant=…` 和当前语言。
- 验收：非默认款有不同图片/价格时，三语言 Bag → PDP 均保持原款；失效款进入既有重新选择流程。

#### 8. P2：购物袋只读取前 250 行

- 位置：`shopify-cart.ts:123` 的 connection、`:526` 的清空逻辑。
- 证据：没有 `pageInfo`，清空只删除已读取的行。[Shopify 官方说明](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart)目前允许购物袋最多 500 行；当前目录规模下触发概率较低。
- 修改：完整读取分页，校验 cursor/重复行；清空按单次输入上限分批执行。失败时重新读取实际剩余内容，不声称全部清空成功。
- 验收：250、251、500 行，重复/失效 cursor、第二批失败、总数量/金额/可见行一致。不得用静默截断解决。

#### 9. P2：404 状态码正确，但初始 HTML 没有恢复界面

- 位置：`src/app/not-found.tsx`、三语言 root layout/catch-all；西语还缺本地 `not-found.tsx`。
- 证据：本次 production build HTTP 检查已复现，含未知路径和不存在的西语商品。
- 修改：先做小范围路由实验，修复各语言 layout 与 not-found 的组合，复用多语言错误视图；保留原 URL 和三语言 document 结构。验收通过后才扩到全部路由。
- [Next 官方文档](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)仍将 `global-not-found` 标为 experimental，不把它直接作为生产默认方案。若稳定方案确实需要调整根布局，先记录具体原因、替代方案和影响，再决定实现。
- 验收：未知页面、缺失商品、停用市场、直接打开和客户端导航；HTTP 404/noindex，初始 HTML 有可读正文、正确语言和回首页/商店链接；无 JS 也可恢复。

#### 10. P2：环境预检和运行时校验不一致

- 位置：`scripts/preflight.mjs:68`、`src/config/site.ts:28`、`src/lib/commerce/shopify.ts:80`。
- 证据：隔离调用 `validateEnvironment({ NEXT_PUBLIC_SITE_INDEXABLE: "true" })` 返回无错误，运行时 URL 校验会拒绝；布尔值先 trim 校验、再按未 trim 原值读取也会造成含空格值被接受却不生效。
- 修改：提取预检和服务端共同使用的小型纯配置校验；明确空格处理规则，索引开启时一律要求合法 origin。保留预检的部署约束和运行时自身保护，两者职责不同，不删掉任意一层。
- 验收：本地/Preview/Production、缺失 URL、非法 origin、布尔值空格、错误 Shopify host/API version。错误只包含变量名和安全说明。
- 限定：缺 URL 漏检发生在非 Vercel 预检场景；运行时仍会拒绝，不是已证实的生产 canonical 泄漏。

### 二、先核实再决定修法的风险

| 项目 | 当前证据 | 下一步及默认处理 |
|---|---|---|
| 低库存文案无法可靠排除允许超卖的商品 | `types.ts:154` 把 `currentlyNotInStock=false` 用作排除条件；[官方定义](https://shopify.dev/docs/api/storefront/2026-07/objects/ProductVariant)只表示当前是否缺货且可买，并不是 inventory policy | 只读核验真实配置。不能确认禁止超卖时，不显示排他性的 `Only X left`。若要保留，先确定可供 Storefront 读取的可靠事实，不暗中接入 Admin API或复制库存政策。 |
| Article HTML 与商品/政策处理不同 | `shopify-editorial.ts:195` 原样返回 HTML，页面直接渲染 | 明确 Shopify 编辑权限与上游清洗保证；用真实格式样本验证后统一清洗边界，保留必要图片/内容标签。未证明可利用漏洞，不直接写成 XSS 事故。 |
| PDP 政策摘要与 Shopify 正文分开维护 | `product-purchase.tsx:35` 写死处理/退货天数，目前内容已获批准 | 先比对当前正文。确认差异才修正文案；优先设计 Shopify 同源摘要。更换后台字段或移除已批准摘要需在具体方案中说明影响，不能以清理名义改政策。 |
| 即时筛选和切款的交互覆盖不足 | 现有组件测试主要检查服务端静态输出 | 人工覆盖快速多选、慢响应、清除、返回/前进、语言切换、Escape/焦点和无 JS 链接。先复现再修改，不把假设写成 bug。 |
| 商品列表读取量可能偏大 | 首页只用少量商品，Category 先读取完整商品；完整变体又有额外读取 | 记录请求数、耗时、payload 后再减少重复字段/请求；不得改变全局筛选、颜色计数和稳定排序口径，也不放宽价格库存缓存。 |

### 三、代码清理与实现简化

| 修改点 | 具体做法 | 验收重点 |
|---|---|---|
| 无生产调用的代码 | 删除 `components/editorial-card.tsx`、`shopify.ts` 中仅被测试调用的 `shopifyMutation`，清理相关测试和 import；删除前再做完整引用检查 | 构建与已有行为测试通过；不把本文件内部使用的导出或动态类名误删 |
| 冗余派生字段 | 核实后删 Product 顶层无 UI 消费的 `compareAtPrice`、无生产消费的 `replacedCart`、仅测试消费的 `activeMarket` 别名；测试直接验证实际规则 | 保留 Variant 价格/compare-at、真实 Cart 恢复和 planned Market 行为 |
| 重复金额算法 | 合并 `shopify-catalog.ts` 的 `isStrictlyHigherAmount` 与 `catalog-browse.ts` 的十进制比较 | 覆盖整数、小数、尾随零、同价排序；不改为浮点数比较 |
| 旧 Canada UI | 分开 enabled locale 和 planned locale 类型；已启用 UI 仅要求 EN/ES/繁中，删散落的法语文案和 Canada 页面分支 | CA typed 配置仍在；CA 路径始终 404；EN/ES/繁中翻译键完整 |
| 旧配置 | US 状态从 prototype 归正；移除未被消费的 shippingZone/taxProfile/legalProfile 占位字段和 `.env.example` 中未使用的 GA4 占位值 | 只删除虚假配置抽象，不声明未知税费已确定；状态门禁测试保持正确 |
| 大文件职责 | `shopify-catalog.ts` 按 GraphQL 查询、数据转换、分页读取拆分；PDP 按图库/数量/购买状态拆分；Header 只按已有明确的桌面/移动职责整理 | 不引入 provider registry、通用表单框架或新的全局状态库；避免为凑行数增加转发文件 |
| 不可达商品资料 UI | `ProductFacts` 当前没有真实 mapper 输入；把所需字段列为后台/映射待办，清除误导性的已完成描述 | 不补假 materials/care/origin；有真实接入计划的代码不机械删除 |
| 已弃用 Image API | 首页和 PDP 的 `priority` 按实际首屏角色改为合适的 `preload`、`loading` 或 `fetchPriority` | 依照 [Next Image 文档](https://nextjs.org/docs/app/api-reference/components/image#preload)检查首屏请求与 LCP，不给所有图片预加载 |
| 依赖与工具链 | 实施时核验相互兼容的稳定版本、签名、peer 和变更说明；必要升级单独提交 | Node 24 不变，精确版本只在 manifest/lockfile 维护；不以“最新”为由升级到不兼容主版本 |

CSS 明确清理范围（`src/app/globals.css` 当前约 2,961 行）：

- `.section--tint`、`.editorial-grid`、`.page-hero--wide`、`.article-disclaimer`。
- `.split-copy`、`.large-copy`、`.policy-placeholder`。
- `.trust-page__status`、`.trust-page__requirements`、`.trust-page__source` 及其响应式规则。
- 保留仍在使用的 `.trust-page__header` / `__lede`、动态拼接的商品状态和 Contact 状态类。
- 先删死样式和重复规则，再考虑把明确属于 Catalog/PDP/Header 的样式迁到现有 CSS Modules 能力；保留全局 token/reset/type，不一口气改写整套 CSS。
- 保留用户近期确认的配色、首页理念区底色、不可购买卡片褪色和即时筛选布局，桌面/手机逐页对照。

### 四、文档重组

目标从 18 份现行文件收敛为 11 份。每条规则只在一个地方完整说明，其他文件用链接。压缩约一半是参考，不以删行数代替完整性。

| 最终文件 | 唯一职责 |
|---|---|
| `README.md` | 安装、运行、常用命令和文档入口 |
| `AGENTS.md` | 协作约束、安全要求、保留用户改动、验证要求、文档阅读顺序 |
| `PLANS.md` | 简短模板和当前执行计划，不不断累积已完成历史 |
| `docs/PROJECT_SPEC.md` | 项目提供什么、当前本地/生产范围、已确认品牌运营事实、未完成能力摘要 |
| `docs/TECH_SPEC.md` | 系统边界、市场/语言、缓存、工程配置、安全和代码职责 |
| `docs/COMMERCE_SPEC.md` | 商品/Variant、价格库存、数量、Bag、Checkout 的实际规则 |
| `docs/CONTENT_SEO_GEO_SPEC.md` | 内容来源、内容模型、翻译、URL、索引、Schema 和内容声明要求 |
| `docs/DESIGN_SYSTEM.md` | 最终品牌语气、视觉和交互要求；token 值直接链接代码 |
| `docs/SHOPIFY_CATALOG_SETUP.md` | 后台字段名、类型、填写方法和检查步骤 |
| `docs/LAUNCH_RUNBOOK.md` | 发布/回滚步骤与本次检查结果模板 |
| `docs/ROADMAP.md` | 未完成代码、后台输入和未来候选；逐项写影响范围与依赖 |

删除/合并清单：

| 原文件 | 处理 |
|---|---|
| `DECISIONS.md` | 有效规则迁入对应领域后删除；删除旧替代关系、审批流水和 D-编号依赖，不重新审批已经确定的规则 |
| `BRAND_INPUTS.md` | 确认事实进 Project/Design/Commerce；候选或待定内容进 Roadmap，合并后删除 |
| `MVP_PRD.md` | 当前用户旅程进 Project，具体行为和验收进领域规范/Runbook，合并后删除 |
| `OPEN_QUESTIONS.md` | 合并 Roadmap，保留特殊配送、运费、税费等问题和各自影响范围，删除重复文件与 Q-编号依赖 |
| `ANALYTICS_AND_KPIS.md` | 数据/consent 最小原则进 Tech/Commerce，未实施计划收为 Roadmap 短条目，删除大段预设计 |
| `CUSTOMER_LIFECYCLE.md` | 保留游客购买、交易身份与营销同意分离等当前规则，删账户/忠诚度等未实施蓝图，合并后删除 |
| `REFERENCES.md` | 只保留实际使用的官方资料，就近放入所属规范，删除泛化链接清单 |
| `docs/archive/` | 提炼仍需保留的当前规则后，删除过时原型、历史决策与重复完成记录，不再搬到另一个历史目录 |

两份 10 月 archive 是用户未跟踪文件，不能假设 Git 已经保存。删除前先保存可恢复快照并核对必要结论；本轮不删除任何历史文件。

先修正的文档冲突：

1. 搜索：当前是商品搜索；“启用必须同时检索内容”与现状冲突。内容搜索仅保留条件式待办。
2. Editorial：区分页面能访问与允许索引；当前三语言 Editorial 均关闭索引，删 PRD 表格中暗示已经开放的 Yes。
3. Footer：当前只有美国信息与语言入口，删“完整地区选择器”的要求。
4. 未知 `product_model`：明确为“不显示准确低库存提示”，不误写成整个商品禁止购买。
5. 状态：删 Beta/原型/首发目标和聊天过程混写；只在 Project 维护经过核实的本地与生产差异。
6. 动态数据：不再把“当前 93 个 Variant 均未填”写作永久事实；改成补齐字段和复核步骤，保留结果必须带检查日期。
7. 文档不要复制 CSS 全部 token、依赖完整版本、每次测试数量、相同缓存/支付/翻译说明。

语言要求：用“价格和库存从 Shopify 读取”“缺译页面可以访问，但已识别的回退页不允许索引”等完整中文。必要术语首次解释；删除 fail closed、readiness、hardening、gate 连用造成的晦涩表述。保留字段名、路径、命令等需要准确复制的英文。

迁移必须先搬有效规则、更新 `AGENTS.md` 阅读顺序与架构变更记录方式，再删原文件。系统边界变化仍要写清原因、替代方案和影响，改为就近维护当前技术说明，不恢复长篇决策历史。

### 五、执行顺序和阶段验收

| 阶段 | 工作 | 完成条件 |
|---|---|---|
| 0. 保存基线 | 保存已有 tracked diff 和未跟踪文件；记录当前测试；给有效规则标出文档去向 | 可以只撤回本次改动而不丢用户工作；基线不含 secret 文件 |
| 1. 核心 bug | 购物袋读取/数量恢复/Checkout、HTML 解码与解析 | 对应失败用例先能复现，修复后通过；其他商业数据规则不变 |
| 2. 页面一致性 | 内容可发布判断、参数 Schema、PDP 状态、Bag Variant 链接、404、预检；补 Cart 分页 | 三语言成对验证，初始 HTML/metadata/Schema/sitemap 一致；异常可恢复 |
| 3. 清理实现 | 死代码/CSS、旧 Canada UI、重复算法、无用字段；有证据的文件拆分和读取优化 | 引用、类型、已有测试通过；页面布局与当前视觉一致；性能优化有前后数据 |
| 4. 重写文档 | 按迁移表重写 11 份目标文件，消除冲突，最后删除旧文件/编号/历史 | 有效规则完整保留，命令/环境/路由与代码一致，无旧链接和重复正文 |
| 5. 完整回归 | 干净安装、全套检查、HTTP、人工浏览器和获准的测试 Checkout | 记录真实结果与剩余依赖；达到发布要求后另行发布，不用本地 build 代替发布验收 |

每个修复或纯清理形成独立可审查的变更组。格式化放最后单独处理，避免把实质修复淹没在大量排版 diff 中。
增加格式检查和现有代码托管平台的 CI：固定 Node 24 / pnpm，运行 frozen install、预检、lint、typecheck、测试和 build；PR 检查使用非敏感测试环境，不复制生产凭证，也不执行付款/部署。无关新 SaaS 不纳入。

### 六、验证清单

实施时的标准命令：

```bash
pnpm install --frozen-lockfile
pnpm preflight
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

本轮已执行的等效工具入口为 Node 24 下的 `scripts/preflight.mjs`、`node_modules/eslint/bin/eslint.js .`、`node_modules/next/dist/bin/next typegen`、`node_modules/typescript/bin/tsc --noEmit`、`node_modules/vitest/vitest.mjs run` 和 `node_modules/next/dist/bin/next build`。这不等于成功验证过干净安装。

- Commerce：有效/失效 Cart、规则变更、库存减少、合并数量、购物袋分页、售罄/未知库存、独立 Buy now、Checkout 最新 URL、三语言同款。使用 mock 覆盖异常，测试环境覆盖真实动作；不对生产创建测试订单。
- 内容/SEO：正常、缺失、空正文、英文回退和参数页；核对 H1、正文、lang、title、description、canonical、robots、hreflang、Schema 与 sitemap。Preview 永远 noindex，CA 永远 404。
- 交互：手机/桌面、键盘、焦点返回、移动菜单、筛选浮层、连续操作、慢网络、返回/前进、无 JS 核心链接；记录浏览器、路径、步骤和结果。按现有要求不启用 Playwright。
- 数据边界：服务端 token、完整 Cart ID、客户邮箱/地址不进入日志、客户端或快照；不新增未经批准的追踪/数据接收方。
- 文档：扫描旧文件名、D/Q 编号、archive 链接和相对路径；逐条核对有效规则迁移表；不把未核实的生产状态写成已完成。
- 性能：只对实际修改过的读取和图片策略测量请求数、响应量、首屏请求与页面表现，不凭代码变短声称更快。

### 风险与回退

- 本次跨交易、内容、样式和文档；按阶段提交，bug 修复与无行为清理分开，出问题只撤回对应变更组。
- 回退代码和文档，不回滚 Shopify 商品、库存、购物袋或订单事实。依赖变更同时恢复 manifest/lockfile。
- 文档删除前保存用户未提交内容；完成迁移表和断链检查再删除，不边猜边删。
- 低库存、政策摘要若需要新增后台事实或改变当前展示，先把具体影响列清；其余已确认 bug 和死代码清理可以独立推进。
- 正式颜色/商品资料、人工译文、特殊配送/税费及设备/Checkout 验收仍由对应负责人完成；只影响各自范围。

### 进度与本轮交付

- [x] 全局审查与执行方案；保存现有工作区快照，保留用户已有修改。
- [x] 购物袋规则变化恢复、库存减少修正、Checkout 预检和完整分页/分批清空。
- [x] HTML 解析、空正文/日期校验、正文 SEO 摘要、三语言参数 Schema。
- [x] PDP 选款/更新文案、缺图时真实图片回退、Bag Variant 返回链接、首屏图片 API。
- [x] 共享预检配置、死代码/CSS/派生字段、planned 与 enabled locale 分离。
- [x] 商品查询/mapper/读取与 PDP 图库/正文职责拆分、共享十进制比较。
- [x] Next 稳定安全补丁、Prettier、GitHub CI 配置，受影响文档与环境示例同步。
- [x] 干净安装、正常 pnpm 工具入口、本地生产 HTTP 与隔离 Chrome 浏览器验证。
- [ ] 动态 `notFound()` 初始正文：上游限制，未以框架内部补丁或实验性 API 绕过。

工作区恢复快照：`/private/tmp/joyamana-local-fixes-baseline-20261003`，不含凭证文件。
颜色、商品资料、译文、库存政策及运营政策的 Shopify 后台修改跳过。完整文档合并、
大范围历史删除、无证据的读取优化与样式迁移本轮未实施。

实际差异与依赖：

- `sanitize-html` 仅在服务端处理 Shopify 正文，复用 `sanitizeShopifyHtml` 接口；
  无新服务、客户数据接收方或订阅费。该包与 types 已固定版本。
- 按 [Next 9 月安全公告](https://nextjs.org/blog/september-2026-security-release)将
  Next 和配套 ESLint 配置升至稳定补丁，具体版本见 package.json/lockfile。
  ESLint 9 暂保留：安装的 import/React/a11y 插件仍未支持 ESLint 10，不覆盖 peer。
- Storefront 的 `currentlyNotInStock` 不能证明禁止超卖。按原来的真实库存披露要求，
  暂停准确低库存文案，等待可靠的 Shopify 同源事实；库存、数量和可购买状态仍正常读取。
- 404 先实验分层布局与共同根布局，结果均无初始正文，实验已撤回。
  未知路径/停用市场改用三语言 catch-all Route Handler，直接返回完整 404/noindex 文档。
  动态缺失商品/内容仍使用 Next `notFound()`；与
  [上游 #97000](https://github.com/vercel/next.js/issues/97000)同型的初始正文问题尚未解决。
- Header 状态与焦点逻辑保留，不为缩短文件机械拆分。ProductFacts 等后台字段接入暂缓，
  不在本地制造资料。没有部署、提交 PR、启用新业务门禁或创建 Shopify 购物袋/订单。

### Outcome

本地实施阶段已交付。最后复查补充了不属于当前商品的 Variant ID 的购买保护，以及购买步进与
99 件站内上限的对齐：例如 increment=2 时，恢复数量应为 98，不能提交 99。
保留用户原有修改；相关运行文档已同步，完整文档合并与历史删除未执行。

验证结果（Node 24）：

- 无凭证干净副本通过 `pnpm install --frozen-lockfile --strict-peer-dependencies`。
- 最终代码通过 `pnpm preflight`、`pnpm format:check`、`pnpm lint`、`pnpm typecheck`、
  `pnpm test`（40 文件 / 289 测试）和 `pnpm build`；依赖安装未绕过签名或 peer 校验。
- 本地生产 HTTP 检查 31 个路径，覆盖三语言首页、Shop、About、Accessibility、政策、
  Cart、参数页、未知路径与停用市场。当前索引总开关关闭，正常页面的 noindex 和无 Schema
  符合本地配置；开启索引时的 Schema/参数规则由回归测试覆盖，没有据此声称线上索引已验收。
- Chrome 154 的隔离配置通过 17 项检查：筛选/排序、语言切换保留参数、返回/前进、
  手机宽度、移动菜单 Escape 与焦点、商品链接款/失效款、三语言空购物袋、动态错误恢复和
  关闭 JavaScript 后的未知路径 404；未出现未捕获异常。这是本地自动浏览器检查，
  没有启用 Playwright，不替代人工设备验收和实际 Checkout/付款测试。
- Markdown 相对文件链接与 `git diff --check` 无错误。GitHub CI 尚未推送运行，未发布。

剩余问题：动态缺失商品/内容页初始 404 正文仍受 Next 稳定版本限制，浏览器加载
JavaScript 后可恢复；未知路径与停用市场已支持无 JavaScript 恢复。继续跟踪上游，
不以实验性 API 或框架内部补丁换取暂时通过。实际购物袋写入、支付、人工设备/译文验收
和 Shopify 后台资料、库存政策、运营设置均未执行，按后续批准范围处理。
