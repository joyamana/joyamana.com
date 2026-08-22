# Official References

Status: Active reference index  
Owner: Project team  
Last verified: 2026-08-02

本文件列出规划时使用的主要官方资料。技术平台、crawler、Search feature 和
法规会变化；实现相关能力前必须重新核对当前官方文档，不能把本索引当永久版本
保证。

## Codex project guidance

- [Codex: Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [Codex best practices](https://learn.chatgpt.com/guides/best-practices)
- [Codex execution plans cookbook](https://developers.openai.com/cookbook/articles/codex_exec_plans)

本项目因此使用简洁根级 `AGENTS.md`、领域规格、`DECISIONS.md`、
`OPEN_QUESTIONS.md` 与 `PLANS.md`，并把旧讨论移出必读路径。

## Next.js

- [Next.js App Router documentation](https://nextjs.org/docs/app)
- [Metadata and OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [Incremental Static Regeneration](https://nextjs.org/docs/app/guides/incremental-static-regeneration)
- [Sitemap file convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Robots file convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)

实现时确认所安装稳定版本的 Server Components、fetch/cache、metadata、
route handler 和国际化示例，不直接复制旧版本代码。

## Shopify Headless

- [Bring your own headless stack](https://shopify.dev/docs/storefronts/headless/bring-your-own-stack)
- [Building with the Storefront API](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api)
- [Create and update a cart](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage)
- [Contextual Storefront API queries](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/in-context)
- [Storefront API Localization](https://shopify.dev/docs/api/storefront/latest/objects/Localization)
- [Shopify Metaobjects](https://shopify.dev/docs/apps/build/metaobjects)
- [Customer Account API](https://shopify.dev/docs/api/customer)

关键确认：Storefront API 可用于自选框架（包括 Next.js）；Cart 返回 Shopify
hosted checkout URL；market/language 使用当前 localization context；Customer
Account 是独立的后续能力。

## Google Search and Commerce

- [Google: Optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [SEO guide for web developers](https://developers.google.com/search/docs/fundamentals/get-started-developers)
- [Product structured data](https://developers.google.com/search/docs/appearance/structured-data/product)
- [Product variant structured data](https://developers.google.com/search/docs/appearance/structured-data/product-variants)
- [Merchant listing structured data](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing)
- [Structured data for ecommerce](https://developers.google.com/search/docs/specialty/ecommerce/include-structured-data-relevant-to-ecommerce)

Google 当前公开指导强调：AI Search 仍以可索引、技术清晰、独特且有价值的内容
为基础；商品结构化数据应放在初始 HTML 并与价格/库存一致。具体 eligibility
与字段要求上线前再核对。

## AI crawler controls

- [OpenAI publishers and developers FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)
- [Anthropic crawler controls](https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)

OpenAI 与 Anthropic 都区分搜索/用户触发访问和模型训练用途。User-Agent、
IP/verification 与产品名称会变化，实施 `robots.txt` 时必须使用当时官方资料。

## Advertising claims and reviews

- [FTC Health Products Compliance Guidance](https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance)
- [FTC Endorsements, Influencers, and Reviews](https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews)

规划采用保守 claims policy：客观和暗示性健康声明必须真实、不误导并有适当
依据；testimonial 不能绕过证据义务。具体文案需要合格专业人士审核。

## Accessibility

- [W3C Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)
- [What’s new in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)

项目以 WCAG 2.2 AA 为产品与工程目标；这不是对任何特定司法辖区合规结果的
保证。

## Internal historical sources

- `docs/archive/crystal-customer-system-design.md`
- `docs/archive/crystal-seo-architecture-summary.md`
- `docs/archive/水晶出海独立站_SEO_GEO架构总结.md`

这些文件只用于追溯，不是当前规范。它们的 Hydrogen/Oxygen、Sanity、
Customer Account 和 Custom Crystal 内容均需以当前决策重新批准。`/es-us/`
已由 D-006、D-007、D-024 重新批准为同一 US Market/Catalog 的西语路径。
