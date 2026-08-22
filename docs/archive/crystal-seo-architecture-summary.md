# Crystal 品牌网站国际化 SEO 与架构讨论总结

> 归档状态：研究材料，非当前项目规范。
>
> 归档日期：2026-08-02
>
> 本文中的 Hydrogen、Sanity、首发 `/es-us/` 与 Custom Crystal 等内容是早期
> 方案，不再构成实施指令。当前方案以 `docs/TECH_SPEC.md`、
> `docs/CONTENT_SEO_GEO_SPEC.md` 与 `docs/DECISIONS.md` 为准。

## 项目背景

目标：建设一个面向海外市场的高端水晶品牌网站。

网站不是单纯 Shopify 商城，而是：

-   品牌官网
-   Shopify 电商
-   Crystal Guide 水晶知识库
-   Personal Blog
-   未来 Custom Crystal 定制功能

技术方向：

-   Headless Shopify
-   Hydrogen + React Router
-   Shopify Storefront API
-   Sanity CMS（推荐）
-   Shopify Checkout

------------------------------------------------------------------------

# 核心架构原则

## Shopify 负责

-   Product
-   Variant
-   Inventory
-   Price
-   Collection
-   Discount
-   Order
-   Customer
-   Checkout
-   Market
-   Catalog

## CMS 负责

-   Blog
-   Crystal Guide
-   Brand Story
-   Marketing Pages
-   Educational Content
-   Author

## Hydrogen 负责

-   页面渲染
-   SEO
-   Routing
-   用户体验
-   Cart Experience
-   Customizer

------------------------------------------------------------------------

# 国际化核心原则

Market 和 Language 必须分离。

不要把：

    country = language

绑定。

应该：

Market:

-   US
-   CA
-   GB
-   FR

Language:

-   en
-   es
-   fr

------------------------------------------------------------------------

# URL 最终建议

经过讨论，最终采用：

## 当前阶段（只运营美国）

英文美国站：

    /

示例：

    /products/amethyst-bracelet
    /collections/bracelets
    /crystals/amethyst
    /blog/how-to-clean-amethyst

美国西班牙语：

    /es-us/

示例：

    /es-us/products/pulsera-de-amatista
    /es-us/blog/como-limpiar-la-amatista

------------------------------------------------------------------------

# 为什么不用全量 locale

不推荐一开始：

    /en-us/
    /es-us/
    /en-ca/
    /fr-ca/
    /en-gb/

原因：

-   当前只有美国市场
-   增加无意义 URL
-   增加维护成本
-   主市场 URL 变长
-   不需要提前为未来市场创建页面

------------------------------------------------------------------------

# 为什么不用国家优先

例如：

    /us/
    /ca/
    /uk/

问题：

-   无法表达语言
-   加拿大、比利时等多语言市场复杂
-   SEO hreflang 不够直观

------------------------------------------------------------------------

# 为什么不用语言优先

例如：

    /en/
    /es/

问题：

未来不同国家：

-   商品不同
-   库存不同
-   价格不同

无法表达 Market。

------------------------------------------------------------------------

# 未来扩展方式

加拿大：

    /en-ca/
    /fr-ca/

英国：

    /en-gb/

法国：

    /fr-fr/

增加市场时：

-   新增 Shopify Market
-   新增 Catalog
-   新增语言内容
-   新增 URL

无需重构。

------------------------------------------------------------------------

# SEO 策略

## Canonical

每个页面：

self canonical。

不要：

加拿大页面 canonical 到美国。

------------------------------------------------------------------------

## hreflang

使用：

-   en-US
-   es-US
-   en-CA
-   fr-CA
-   en-GB

只输出真实存在的页面。

不要为未来市场生成 hreflang。

------------------------------------------------------------------------

# Blog 策略

不要复制：

    /en-us/blog/article

    /en-ca/blog/article

    /en-gb/blog/article

如果内容完全一样。

应该：

一份内容，多市场共享。

只有真正本地化：

例如：

-   加拿大物流指南
-   美国节日礼物推荐

才创建独立页面。

------------------------------------------------------------------------

# Crystal Guide 策略

水晶知识属于长期 SEO 内容。

不要重复创建。

例如：

    /crystals/amethyst

作为权威内容。

只有：

-   翻译
-   地区法规
-   本地内容

需要独立版本。

------------------------------------------------------------------------

# Product 策略

商品属于 Market 内容。

不同市场可以不同：

-   商品
-   SKU
-   Price
-   Inventory
-   Shipping
-   Promotion

例如：

美国：

    /products/example

加拿大：

    /en-ca/products/example

如果加拿大没有销售：

不要创建页面。

不要强制跳转。

------------------------------------------------------------------------

# 美国西班牙语策略

目标：

US Hispanic Spanish。

不是 Spain Spanish。

使用：

Neutral Latin American Spanish。

推荐：

-   celular
-   computadora
-   ustedes

避免：

-   ordenador
-   móvil
-   vosotros

注意：

某些词在不同地区可能有不同含义。

品牌文案使用中性表达。

------------------------------------------------------------------------

# Crawl Budget 讨论

问题：

locale 页面增加是否影响 Google Crawl Budget？

结论：

不是 URL 前缀的问题。

真正的问题：

-   大量重复页面
-   无价值页面
-   未上线市场页面

解决：

-   只生成真实市场 URL
-   控制 sitemap
-   不提前创建未来市场页面

------------------------------------------------------------------------

# CRO 与 SEO

不要：

根据 IP 强制 301。

推荐：

-   市场提示
-   用户主动切换
-   保存用户选择

同时保持：

-   SEO URL 独立
-   hreflang 正确

------------------------------------------------------------------------

# 工程实现原则

内部：

不要硬编码：

    USD
    US
    English

应该：

    Market Context

    Language Context

所有链接：

必须 locale-aware。

不要：

    /products

硬编码。

使用：

    localizedPath()

或统一 Link Component。

------------------------------------------------------------------------

# 数据模型建议

Market:

    US
    CA
    GB
    FR

Language:

    en
    es
    fr

Content:

    Title
    Body
    Language
    Visible Markets

Product:

Shopify 管理。

Blog:

CMS 管理。

------------------------------------------------------------------------

# Custom Crystal

Phase 1:

表单式：

-   Bracelet
-   Necklace
-   Crystal
-   Size
-   Metal
-   Engraving

保存：

-   Design ID
-   Line Item Properties

价格必须服务端验证。

------------------------------------------------------------------------

# 最终架构结论

采用：

    Global-ready architecture

    +
    Current-market-only URLs

即：

内部：

支持全球。

外部：

只展示当前运营市场。

当前：

    /
    US English

    /es-us/
    US Spanish

未来：

    /en-ca/
    /fr-ca/
    /en-gb/
    /fr-fr/

核心原则：

> 架构按全球品牌设计，URL 按当前业务规模设计。
