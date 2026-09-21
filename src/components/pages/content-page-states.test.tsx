import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PageSearchParams } from "@/lib/seo";

const mocks = vi.hoisted(() => ({
  search: vi.fn(), about: vi.fn(), policy: vi.fn(), index: vi.fn(), article: vi.fn(),
}));
vi.mock("@/lib/commerce/catalog", () => ({ searchCatalog: mocks.search }));
vi.mock("@/lib/content/shopify-about-pages", () => ({ getShopifyAboutTree: mocks.about }));
vi.mock("@/lib/content/shopify-policies", () => ({ getShopifyPolicy: mocks.policy }));
vi.mock("@/lib/content/shopify-editorial", () => ({
  getShopifyEditorialIndex: mocks.index, getShopifyEditorialArticle: mocks.article,
}));
vi.mock("@/config/site", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/config/site")>(),
  isIndexingEnabledFor: () => true,
}));

import { SearchPage } from "./search-page";
import { AboutPage, AboutContentPage } from "./about-page";
import { PolicyPage } from "./policy-page";
import { EditorialIndexPage } from "./editorial-index-page";
import { EditorialDetailPage } from "./editorial-detail-page";
import { NotFoundContent } from "../not-found-content";
import { PageErrorContent } from "../page-error-content";
import EnglishAbout from "@/app/(english)/about/page";
import EnglishAboutChild from "@/app/(english)/about/[handle]/page";
import EnglishBlog from "@/app/(english)/blog/[handle]/page";
import EnglishGuide from "@/app/(english)/crystals/[handle]/page";
import SpanishAbout from "@/app/es-us/about/page";
import SpanishAboutChild from "@/app/es-us/about/[handle]/page";
import SpanishBlog from "@/app/es-us/blog/[handle]/page";
import SpanishGuide from "@/app/es-us/crystals/[handle]/page";
import ChineseAbout from "@/app/zh-hant-us/about/page";
import ChineseAboutChild from "@/app/zh-hant-us/about/[handle]/page";
import ChineseBlog from "@/app/zh-hant-us/blog/[handle]/page";
import ChineseGuide from "@/app/zh-hant-us/crystals/[handle]/page";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.search.mockResolvedValue([]);
  mocks.about.mockResolvedValue(null);
  mocks.policy.mockResolvedValue(null);
  mocks.index.mockResolvedValue(null);
  mocks.article.mockResolvedValue({
    id: "article-1", handle: "quartz", title: "Quartz guide", excerpt: "Quartz facts.",
    contentHtml: "<p>Original Shopify content.</p>", publishedAt: "2026-09-01T00:00:00Z",
    image: null, seoTitle: "Quartz guide", seoDescription: "Quartz facts.", tags: [], author: "",
    contentLocale: "en-US", requestedLocale: "en-US", usedDefaultLanguage: false,
  });
});

describe("Content page recovery", () => {
  it("offers localized clear and browse links after no search results", async () => {
    const html = renderToStaticMarkup(await SearchPage({ locale: "es-US", query: "unknown" }));
    expect(html).toContain('href="/es-us/shop"');
    expect(html).toContain('href="/es-us/search"');
    expect(html).toContain('value="unknown"');
    expect(html).not.toContain("Catálogo compartido");
  });

  it("keeps a failed search distinct from zero results and preserves the query", async () => {
    mocks.search.mockRejectedValueOnce(new Error("upstream unavailable"));
    const html = renderToStaticMarkup(await SearchPage({ locale: "en-US", query: "quartz" }));
    expect(html).toContain("Search is temporarily unavailable.");
    expect(html).not.toContain("0 product results");
    expect(html).toContain('value="quartz"');
    expect(html).toContain('action="/search"');
    expect(html).toContain('href="/shop"');
  });

  it("avoids a catalog request for an empty query", async () => {
    await SearchPage({ locale: "en-US", query: "" });
    expect(mocks.search).not.toHaveBeenCalled();
  });

  it("provides a local recovery route when upstream content is unavailable", async () => {
    const pages = [
      await AboutPage({ locale: "zh-Hant-US" }),
      await PolicyPage({ locale: "zh-Hant-US", kind: "shipping" }),
      await EditorialIndexPage({ locale: "zh-Hant-US", kind: "crystals" }),
    ];
    for (const page of pages) {
      const html = renderToStaticMarkup(page);
      expect(html.match(/<h1/g)).toHaveLength(1);
      expect(html).toContain('href="/zh-hant-us/shop"');
    }
  });

  it.each([
    { locale: "en-US", root: "/", shop: "/shop" },
    { locale: "es-US", root: "/es-us", shop: "/es-us/shop" },
    { locale: "zh-Hant-US", root: "/zh-hant-us", shop: "/zh-hant-us/shop" },
  ] as const)("keeps $locale error and missing-page recovery in the same locale", ({ locale, root, shop }) => {
    const missing = renderToStaticMarkup(<NotFoundContent locale={locale} />);
    const error = renderToStaticMarkup(<PageErrorContent locale={locale} retry={() => {}} />);
    for (const html of [missing, error]) {
      expect(html.match(/<h1/g)).toHaveLength(1);
      expect(html).not.toContain("<main");
      expect(html).toContain(`href="${root}"`);
    }
    expect(missing).toContain(`href="${shop}"`);
    expect(error).toContain('type="button"');
  });
});

describe("About and Editorial parameter guards", () => {
  it.each([EnglishAbout, EnglishAboutChild, EnglishBlog, EnglishGuide, SpanishAbout, SpanishAboutChild, SpanishBlog, SpanishGuide, ChineseAbout, ChineseAboutChild, ChineseBlog, ChineseGuide])("passes query presence, including empty values, to the template", async (page) => {
    for (const params of [{}, { source: "" }, { source: ["a", "b"] }] satisfies PageSearchParams[]) {
      const element = await page({ params: Promise.resolve({ handle: "quartz" }), searchParams: Promise.resolve(params) });
      expect(element.props.hasParameters).toBe(Object.keys(params).length > 0);
    }
  });

  it("suppresses About JSON-LD while keeping all visible original content", () => {
    const page = {
      id: "about", handle: "about", title: "About Joya Mana", navigationTitle: "About", summary: "Our story.",
      richText: "{}", html: "<p>Original Shopify story.</p>", lastUpdated: "2026-09-01",
      seoTitle: "About", seoDescription: "Our story.", contentLocale: "en-US", requestedLocale: "en-US",
      usedDefaultLanguage: false,
    } as const;
    const props = { locale: "en-US", page, tree: { root: page, children: [] } } as const;
    const clean = renderToStaticMarkup(<AboutContentPage {...props} tree={{ ...props.tree, children: [] }} />);
    const parameterized = renderToStaticMarkup(<AboutContentPage {...props} tree={{ ...props.tree, children: [] }} hasParameters />);
    expect(clean).toContain('type="application/ld+json"');
    expect(parameterized).toBe(clean.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, ""));
  });

  it("suppresses Article JSON-LD even if Editorial indexing is enabled", async () => {
    const props = { locale: "en-US", handle: "quartz", kind: "crystals" } as const;
    const clean = renderToStaticMarkup(await EditorialDetailPage(props));
    const parameterized = renderToStaticMarkup(await EditorialDetailPage({ ...props, hasParameters: true }));
    expect(clean).toContain('type="application/ld+json"');
    expect(parameterized).toBe(clean.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, ""));
  });
});
