import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { EnabledLocale } from "@/config/locales";
import type { StorefrontAboutPage } from "@/lib/content/shopify-about-pages";
import { AboutContentPage } from "./about-page";
import { EditorialDetailPage } from "./editorial-detail-page";

vi.mock("@/config/site", () => ({
  siteConfig: { url: "https://www.joyamana.com", indexable: true },
  isIndexingEnabledFor: () => true,
}));
vi.mock("@/lib/content/shopify-editorial", () => ({
  getShopifyEditorialArticle: vi.fn(
    async (_kind: string, handle: string, locale: EnabledLocale) => ({
      id: "gid://shopify/Article/1",
      handle,
      title: "A real article",
      seoDescription: "Article summary.",
      excerpt: "Article summary.",
      contentHtml: "<p>Article body.</p>",
      publishedAt: "2026-08-30T12:00:00Z",
      author: "Author",
      tags: [],
      image: null,
      contentLocale: locale,
      usedDefaultLanguage: false,
    }),
  ),
}));

function aboutPage(locale: EnabledLocale, handle: string): StorefrontAboutPage {
  return {
    id: "gid://shopify/Metaobject/1",
    handle,
    title: "About Joya Mana",
    navigationTitle: "About",
    summary: "Our approach.",
    richText: "{}",
    html: "<p>Our approach.</p>",
    lastUpdated: "2026-08-30",
    seoTitle: "About",
    seoDescription: "Our approach.",
    contentLocale: locale,
    requestedLocale: locale,
    usedDefaultLanguage: false,
  };
}

for (const locale of ["en-US", "es-US", "zh-Hant-US"] as const) {
  describe(`${locale} page Schema`, () => {
    it.each([undefined, "our-approach"])(
      "keeps clean About Schema and omits it for parameters: %s",
      (handle) => {
        const page = aboutPage(locale, handle ?? "about");
        const props = {
          locale,
          handle,
          page,
          tree: {
            root: aboutPage(locale, "about"),
            children: handle ? [page] : [],
          },
        };
        const clean = renderToStaticMarkup(<AboutContentPage {...props} />);
        const parameters = renderToStaticMarkup(
          <AboutContentPage {...props} searchParams={{ utm_source: "test" }} />,
        );
        expect(clean).toContain("application/ld+json");
        expect(parameters).not.toContain("application/ld+json");
        expect(parameters).toContain("<p>Our approach.</p>");
      },
    );

    it.each(["blog", "crystals"] as const)(
      "omits parameterized %s Schema without losing visible content",
      async (kind) => {
        const clean = renderToStaticMarkup(
          await EditorialDetailPage({ locale, kind, handle: "article" }),
        );
        const parameters = renderToStaticMarkup(
          await EditorialDetailPage({
            locale,
            kind,
            handle: "article",
            searchParams: { utm_source: "test" },
          }),
        );
        expect(clean).toContain("application/ld+json");
        expect(parameters).not.toContain("application/ld+json");
        expect(parameters).toContain("<p>Article body.</p>");
      },
    );
  });
}
