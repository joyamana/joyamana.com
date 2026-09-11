import { afterEach, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

it("keeps Chinese metadata, Schema and alternates closed even with the production master gate", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "true");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.joyamana.com");
  vi.resetModules();
  const { buildMetadata } = await import("@/lib/seo");
  const { isIndexingEnabledFor } = await import("@/config/site");
  const { serializeIndexableStructuredData } = await import("@/lib/structured-data");
  for (const path of ["/", "/about", "/products/example", "/shop", "/shipping", "/blog", "/cart", "/search"]) {
    expect(isIndexingEnabledFor("zh-Hant-US", path)).toBe(false);
    const metadata = buildMetadata({locale: "zh-Hant-US", title: "Joya Mana", description: "水晶首飾", path});
    expect(metadata.robots).toMatchObject({index: false});
    expect(metadata.alternates).toBeUndefined();
    expect(metadata.openGraph).toMatchObject({locale: "zh_US", url: `https://www.joyamana.com/zh-hant-us${path === "/" ? "" : path}`});
    expect(serializeIndexableStructuredData({"@type": "WebPage"}, {locale:"zh-Hant-US", path})).toBeNull();
  }
  const english = buildMetadata({locale: "en-US", title: "Shop", description: "Shop", path: "/shop"});
  expect(english.alternates?.languages).not.toHaveProperty("zh-Hant-US");
  expect(english.robots).toMatchObject({index: true});
});
