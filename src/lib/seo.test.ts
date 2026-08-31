import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildMetadata,
  buildNoIndexMetadata,
  withoutTrailingBrand,
} from "./seo";

describe("metadata titles", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("leaves the root layout as the single owner of the brand suffix", () => {
    const metadata = buildMetadata({
      title: "Aquamarine bracelet | Joya Mana",
      description: "A Shopify product.",
      locale: "en-US",
      path: "/products/aquamarine-bracelet",
    });

    expect(metadata.title).toBe("Aquamarine bracelet");
    expect(metadata.openGraph).toMatchObject({
      title: "Aquamarine bracelet",
    });
  });

  it("removes repeated separator-delimited suffixes without erasing the brand", () => {
    expect(withoutTrailingBrand("Piece — Joya Mana · Joya Mana")).toBe(
      "Piece",
    );
    expect(withoutTrailingBrand("Joya Mana")).toBe("Joya Mana");
    expect(withoutTrailingBrand("The Joya Mana story")).toBe(
      "The Joya Mana story",
    );
  });

  it("preserves the explicit noindex metadata helper", () => {
    expect(
      buildNoIndexMetadata({ title: "Bag", description: "Review your bag." }),
    ).toMatchObject({
      title: "Bag",
      robots: { index: false, follow: false, noarchive: true },
    });
  });

  it("limits hreflang to locales with an approved equivalent page", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "true");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://joyamana.com");
    vi.resetModules();
    const { buildMetadata: buildIndexableMetadata } = await import("./seo");

    const metadata = buildIndexableMetadata({
      title: "Our Approach",
      description: "How Joya Mana approaches form and meaning.",
      locale: "en-US",
      path: "/about/our-approach",
      alternateLocales: ["en-US"],
    });

    expect(metadata.alternates).toEqual({
      canonical: "https://joyamana.com/about/our-approach",
      languages: {
        "en-US": "https://joyamana.com/about/our-approach",
      },
    });
  });

  it("keeps parameterized variants out of the index and points to the clean canonical", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "true");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://joyamana.com");
    vi.resetModules();
    const { buildMetadata: buildIndexableMetadata } = await import("./seo");

    const metadata = buildIndexableMetadata({
      title: "Shop",
      description: "Browse products.",
      locale: "en-US",
      path: "/shop",
      searchParams: { sort: "price", utm_source: "newsletter" },
    });

    expect(metadata.robots).toEqual({
      index: false,
      follow: false,
      noarchive: true,
    });
    expect(metadata.alternates).toEqual({
      canonical: "https://joyamana.com/shop",
      languages: undefined,
    });
    expect(metadata.openGraph).toMatchObject({
      url: "https://joyamana.com/shop",
    });
  });
});
