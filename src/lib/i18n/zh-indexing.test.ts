import { afterEach, beforeEach, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "true");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.joyamana.com");
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

const approvedPaths = ["/", "/about", "/products/example", "/shop", "/shipping"];

it("opens approved Chinese scopes, canonical, Schema and three-language alternates", async () => {
  const { buildMetadata } = await import("@/lib/seo");
  const { isIndexingEnabledFor } = await import("@/config/site");
  const { serializeIndexableStructuredData } = await import("@/lib/structured-data");
  for (const path of approvedPaths) {
    const url = `https://www.joyamana.com/zh-hant-us${path === "/" ? "" : path}`;
    expect(isIndexingEnabledFor("zh-Hant-US", path)).toBe(true);
    const metadata = buildMetadata({ locale: "zh-Hant-US", title: "Joya Mana", description: "水晶首飾", path });
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.alternates).toMatchObject({ canonical: url, languages: { "zh-Hant-US": url } });
    expect(metadata.openGraph).toMatchObject({ locale: "zh_US", url });
    expect(serializeIndexableStructuredData({ "@type": "WebPage" }, { locale: "zh-Hant-US", path })).not.toBeNull();
  }
  const english = buildMetadata({ locale: "en-US", title: "Shop", description: "Shop", path: "/shop" });
  expect(english.alternates?.languages).toEqual({
    "en-US": "https://www.joyamana.com/shop",
    "es-US": "https://www.joyamana.com/es-us/shop",
    "zh-Hant-US": "https://www.joyamana.com/zh-hant-us/shop",
  });
});

it("keeps Editorial, private and unknown pages closed for every enabled language", async () => {
  const { buildMetadata } = await import("@/lib/seo");
  const { serializeIndexableStructuredData } = await import("@/lib/structured-data");
  for (const locale of ["en-US", "es-US", "zh-Hant-US"] as const) {
    for (const path of ["/blog", "/blog/story", "/crystals", "/crystals/guide", "/cart", "/search", "/account", "/future-page"]) {
      const metadata = buildMetadata({ locale, title: "Joya Mana", description: "Page", path });
      expect(metadata.robots).toMatchObject({ index: false });
      expect(metadata.alternates).toBeUndefined();
      expect(serializeIndexableStructuredData({ "@type": "WebPage" }, { locale, path })).toBeNull();
    }
  }
});

it("preserves parameter noindex and the clean Chinese canonical", async () => {
  const { buildMetadata } = await import("@/lib/seo");
  const metadata = buildMetadata({
    locale: "zh-Hant-US", path: "/shop", searchParams: { sort: "price" },
    title: "選購", description: "水晶首飾",
  });
  expect(metadata.robots).toMatchObject({ index: false });
  expect(metadata.alternates).toEqual({ canonical: "https://www.joyamana.com/zh-hant-us/shop", languages: undefined });
});

it("does not override a page's restricted alternate readiness", async () => {
  const { buildMetadata } = await import("@/lib/seo");
  const metadata = buildMetadata({ locale: "en-US", title: "About", description: "About", path: "/about", alternateLocales: ["en-US", "es-US"] });
  expect(metadata.alternates?.languages).not.toHaveProperty("zh-Hant-US");
});

it("keeps the master-off deployment closed despite the approved matrix", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "false");
  vi.resetModules();
  const { buildMetadata } = await import("@/lib/seo");
  const { isIndexingEnabledFor } = await import("@/config/site");
  for (const path of approvedPaths) {
    expect(isIndexingEnabledFor("zh-Hant-US", path)).toBe(false);
    const metadata = buildMetadata({ locale: "zh-Hant-US", title: "Joya Mana", description: "水晶首飾", path });
    expect(metadata.robots).toMatchObject({ index: false });
    expect(metadata.alternates).toBeUndefined();
  }
});
