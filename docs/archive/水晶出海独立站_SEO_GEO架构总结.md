# 水晶出海独立站项目架构总结（SEO / GEO / Hydrogen / Shopify）

> 归档状态：研究材料，非当前项目规范。
>
> 归档日期：2026-08-02
>
> 本文保留 SEO/GEO 研究价值，但 Hydrogen/Oxygen 技术结论已被
> Next.js App Router + Vercel 决策取代。当前方案以 `docs/TECH_SPEC.md`、
> `docs/CONTENT_SEO_GEO_SPEC.md` 与 `docs/DECISIONS.md` 为准。

## 一、项目目标

项目目标：

-   建立面向海外市场的水晶品牌独立站；
-   第一阶段只上线美国市场；
-   后续支持加拿大、英国、欧洲等多市场扩展；
-   前端需要：
    -   SEO 友好；
    -   GEO（Generative Engine Optimization）友好；
    -   AI 搜索和 AI 抓取友好；
    -   Responsive 响应式；
    -   高性能；
    -   支持长期品牌建设。

最终技术方向：

> Hydrogen + Shopify Headless Commerce

------------------------------------------------------------------------

# 二、总体架构

推荐架构：

    用户 / Googlebot / AI Crawler
                |
                v
    Hydrogen Storefront
    ├── React UI
    ├── Server Side Rendering
    ├── SEO Metadata
    ├── Structured Data
    ├── Sitemap
    ├── Robots
    ├── Responsive UI
    ├── Analytics
    └── Shopify API 聚合层
                |
                v
    Shopify
    ├── Products
    ├── Collections
    ├── Markets
    ├── Catalogs
    ├── Inventory
    ├── Cart
    ├── Checkout
    └── Customers

原则：

-   Shopify 作为电商后端；
-   Hydrogen 作为前端和 SSR 层；
-   第一阶段不建立独立业务后端。

------------------------------------------------------------------------

# 三、前后端架构决策

## 不采用

纯 SPA：

    浏览器
    ↓
    下载 JS
    ↓
    请求 API
    ↓
    渲染页面

原因：

-   SEO 较差；
-   AI 抓取不稳定；
-   首屏速度慢；
-   Core Web Vitals 风险高。

## 采用

SSR + Hydration：

    服务器生成 HTML
    +
    浏览器 React Hydration
    +
    局部客户端交互

优势：

-   Google 可直接读取内容；
-   AI crawler 更容易理解；
-   页面加载更快；
-   保留 React 开发体验。

------------------------------------------------------------------------

# 四、多市场架构

## 第一阶段

只上线美国：

    example.com

不要：

    /en-us/

原因：

-   美国是默认市场；
-   避免产生重复 URL；
-   保持 SEO 简洁。

配置：

    Market:
    US

    Language:
    English

    Currency:
    USD

------------------------------------------------------------------------

## 后续扩展

例如：

    example.com

    example.com/en-ca/

    example.com/en-gb/

通过：

-   Shopify Markets；
-   Catalog；
-   Currency；
-   Locale 配置；

实现扩展。

不要：

-   创建多个 Shopify Store；
-   创建多个前端项目。

------------------------------------------------------------------------

# 五、代码架构原则

目录：

    app/

    components/
    ├── commerce
    ├── content
    ├── layout
    └── common

    routes/
    ├── products
    ├── collections
    ├── pages
    ├── blogs
    └── locale routes

    lib/
    ├── markets
    ├── seo
    ├── shopify
    ├── analytics
    └── validation

    graphql/
    ├── fragments
    ├── queries
    └── mutations

核心原则：

    市场逻辑 ≠ 页面组件
    SEO逻辑 ≠ 页面模板
    CMS数据 ≠ UI样式

禁止：

    if(country === "CA")
    if(country === "UK")

分散在组件内部。

------------------------------------------------------------------------

# 六、SEO 架构

所有公开页面必须：

-   SSR 输出 HTML；
-   有唯一 title；
-   有 description；
-   有 canonical；
-   有 Open Graph；
-   有结构化数据。

页面类型：

## 商品页

Schema：

    Product
    Offer
    Brand
    BreadcrumbList
    WebPage

## 分类页

    CollectionPage
    ItemList
    BreadcrumbList

## 内容页

    Article
    Person
    Organization
    BreadcrumbList

------------------------------------------------------------------------

# 七、GEO（AI Search）优化策略

目标：

让：

-   ChatGPT；
-   Claude；
-   Google AI Overview；
-   Copilot；

更容易理解和引用网站。

核心不是特殊插件，而是：

    高质量 HTML
    +
    清晰信息结构
    +
    结构化数据
    +
    权威内容
    +
    可验证信息

------------------------------------------------------------------------

# 八、AI 抓取策略

robots.txt 应支持：

-   Googlebot；
-   Bingbot；
-   OAI-SearchBot；
-   ChatGPT-User；
-   Claude-SearchBot；
-   Claude-User。

需要独立控制：

-   GPTBot；
-   ClaudeBot。

避免：

-   CAPTCHA；
-   JS Challenge；
-   Cookie 强制；
-   阻止 AI crawler。

------------------------------------------------------------------------

# 九、内容架构（GEO）

内容模型增加：

## Article

字段：

    title
    summary
    body
    key_takeaways
    author
    reviewer
    date_published
    date_modified
    references
    related_questions
    related_products

## Author

字段：

    name
    bio
    expertise
    credentials
    profile
    sameAs

## Product Knowledge

字段：

    materials
    origin
    dimensions
    care
    use_cases
    features
    limitations
    faq
    references

------------------------------------------------------------------------

# 十、内容写作原则

AI 更容易理解：

-   明确回答；
-   定义清晰；
-   信息完整；
-   有来源；
-   有作者；
-   有更新时间。

文章结构：

    标题

    简短答案

    核心结论

    详细解释

    事实依据

    案例

    常见问题

    作者

    更新时间

    参考资料

避免：

-   空泛营销；
-   大量重复内容；
-   隐藏文本；
-   AI 专用隐藏页面。

------------------------------------------------------------------------

# 十一、结构化数据原则

所有 JSON-LD：

必须：

-   与页面实际内容一致；
-   与 UI 使用同一数据源。

不要：

页面：

    $89

Schema：

    $79

建立统一实体：

    Normalized Product Entity

            |
            ├── UI
            ├── JSON-LD
            ├── Metadata
            └── Analytics

------------------------------------------------------------------------

# 十二、llms.txt

可以提供：

    /llms.txt

作为辅助。

内容：

-   品牌介绍；
-   重要页面；
-   知识库入口。

但：

不能替代：

-   HTML；
-   Sitemap；
-   Schema；
-   内链；
-   高质量内容。

------------------------------------------------------------------------

# 十三、响应式设计

原则：

Mobile First。

要求：

-   手机；
-   平板；
-   桌面；

全部优化。

必须：

-   Responsive images；
-   稳定 aspect ratio；
-   Touch friendly；
-   无横向滚动；
-   Accessible navigation。

------------------------------------------------------------------------

# 十四、性能目标

Core Web Vitals：

    LCP <= 2.5s

    INP <= 200ms

    CLS <= 0.1

优化：

-   SSR；
-   图片优化；
-   路由拆包；
-   延迟加载非关键资源；
-   避免大型 JS bundle；
-   减少第三方脚本。

------------------------------------------------------------------------

# 十五、取消 Adsense

决定：

不使用 Google Adsense。

原因：

-   品牌电商不适合广告；
-   降低转化；
-   增加第三方脚本；
-   增加 CLS；
-   影响品牌体验。

因此删除：

-   广告组件；
-   广告 CMS；
-   广告脚本；
-   广告布局预留。

------------------------------------------------------------------------

# 十六、最终技术方案

    Frontend:

    Hydrogen
    React
    TypeScript
    SSR


    Commerce Backend:

    Shopify


    API:

    Shopify Storefront API


    SEO:

    SSR Metadata
    Canonical
    Schema
    Sitemap
    Robots


    GEO:

    Semantic HTML
    AI crawler support
    Entity structure
    Knowledge content
    Author system
    References


    Market:

    Shopify Markets


    Deployment:

    Oxygen

------------------------------------------------------------------------

# 十七、给 Codex 的核心开发约束

    Build a Hydrogen storefront for the US market first.

    Use root URLs for US.
    Do not create /en-us routes.

    The application must remain market-aware internally.

    All indexable pages must be server-rendered.

    Do not build a client-only SPA.

    Shopify remains the commerce backend.

    Do not create a custom backend initially.

    Remove all AdSense-related functionality.

    Optimize for SEO, GEO, AI search visibility,
    responsive design, and Core Web Vitals.

    Use semantic HTML.

    Generate structured data from normalized entities.

    Support AI crawlers through robots.txt.

    Do not create hidden AI-only content.

    Do not use crawler-specific cloaking.

    Maintain scalable multi-market architecture.

------------------------------------------------------------------------

# 最终结论

项目方向：

> 一个 SEO-first、GEO-first、AI-friendly、Headless Shopify 品牌独立站。

核心架构：

> Hydrogen SSR + Shopify + 结构化内容系统 + 多市场预留。

第一阶段保持简单：

> 美国市场上线，但代码架构为全球扩展准备。
