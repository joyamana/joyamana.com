import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { PageSearchParams } from "@/lib/seo";

vi.mock("@/lib/commerce/catalog", () => ({
  getAvailableProducts: vi.fn().mockResolvedValue([]),
  getCatalogNavigationData: vi.fn().mockResolvedValue({ categories: [], collections: [] }),
}));
vi.mock("@/lib/contact-delivery.server", () => ({ isContactFormEnabled: () => false }));
vi.mock("@/config/site", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/config/site")>(),
  isIndexingEnabledFor: () => true,
}));

import EnglishHome from "@/app/(english)/page";
import SpanishHome from "@/app/es-us/page";
import ChineseHome from "@/app/zh-hant-us/page";
import EnglishContact from "@/app/(english)/contact/page";
import SpanishContact from "@/app/es-us/contact/page";
import ChineseContact from "@/app/zh-hant-us/contact/page";
import { ContactPage } from "./contact-page";
import { HomePage } from "./home-page";

describe("Home and Contact parameter guards", () => {
  it.each([
    { name: "English Home", page: EnglishHome, locale: "en-US" },
    { name: "Spanish Home", page: SpanishHome, locale: "es-US" },
    { name: "Chinese Home", page: ChineseHome, locale: "zh-Hant-US" },
    { name: "English Contact", page: EnglishContact, locale: "en-US" },
    { name: "Spanish Contact", page: SpanishContact, locale: "es-US" },
    { name: "Chinese Contact", page: ChineseContact, locale: "zh-Hant-US" },
  ])("passes all parameterized $name requests to the Schema guard", async ({ page, locale }) => {
    const clean = await page({ searchParams: Promise.resolve({}) });
    expect(clean.props).toMatchObject({ locale, hasParameters: false });

    for (const params of [{ source: "campaign" }, { source: "" }, { source: ["one", "two"] }] satisfies PageSearchParams[]) {
      const parameterized = await page({ searchParams: Promise.resolve(params) });
      expect(parameterized.props).toMatchObject({ locale, hasParameters: true });
    }
  });

  it.each(["en-US", "es-US", "zh-Hant-US"] as const)(
    "keeps visible %s Home and Contact content while suppressing Schema for parameters",
    async (locale) => {
      for (const page of [HomePage, ContactPage]) {
        const clean = renderToStaticMarkup(await page({ locale }));
        const parameterized = renderToStaticMarkup(await page({ locale, hasParameters: true }));
        expect(clean).toContain('type="application/ld+json"');
        expect(clean).toContain('"@type":"OnlineStore"');
        expect(parameterized).not.toContain('type="application/ld+json"');
        expect(parameterized).toContain("<h1>");
        expect(parameterized).toBe(clean.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, ""));
      }
    },
  );
});
