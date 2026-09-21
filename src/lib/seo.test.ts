import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildMetadata,
  buildNoIndexMetadata,
  getCollectionSeoDescription,
  withoutTrailingBrand,
} from "./seo";

const getProduct = vi.hoisted(() => vi.fn());
vi.mock("@/lib/commerce/catalog", () => ({ getProduct }));
vi.mock("@/components/pages/product-page", () => ({ ProductPage: () => null }));

vi.mock("@/config/indexing", () => ({
  indexingPolicy: {
    "en-US": {
      core: true,
      commerce: true,
      policies: true,
      editorial: true,
    },
    "es-US": {
      core: true,
      commerce: true,
      policies: true,
      editorial: true,
    },
  },
}));

describe("metadata titles", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("uses meaningful collection SEO copy and rejects empty content", () => {
    expect(getCollectionSeoDescription(null)).toBeUndefined();
    expect(
      getCollectionSeoDescription({ description: " ", seoDescription: " " }),
    ).toBeUndefined();
    expect(
      getCollectionSeoDescription({ description: " Body ", seoDescription: " " }),
    ).toBe("Body");
    expect(
      getCollectionSeoDescription({ description: "Body", seoDescription: " SEO " }),
    ).toBe("SEO");
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

  it("resolves the default brand image against the configured site origin", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.joyamana.com");
    vi.resetModules();
    const { buildMetadata: buildSiteMetadata } = await import("./seo");
    const metadata = buildSiteMetadata({
      title: "About",
      description: "The Joya Mana story.",
      locale: "es-US",
      path: "/about",
    });

    expect(metadata.openGraph).toMatchObject({
      images: [{
        url: "https://www.joyamana.com/brand/joya-mana-opengraph.png",
        width: 1200,
        height: 630,
        alt: "Joya Mana",
      }],
    });
  });

  it("preserves an explicit page image instead of substituting the brand image", () => {
    const images = [{
      url: "https://cdn.shopify.com/s/files/1/product.jpg",
      width: 1000,
      height: 1200,
      alt: "Quartz bracelet",
    }];
    const metadata = buildMetadata({
      title: "Quartz bracelet",
      description: "Product details.",
      locale: "en-US",
      images,
    });

    expect(metadata.openGraph).toMatchObject({ images });
  });

  it.each([
    ["en-US", () => import("@/app/(english)/products/[handle]/page")],
    ["es-US", () => import("@/app/es-us/products/[handle]/page")],
    ["zh-Hant-US", () => import("@/app/zh-hant-us/products/[handle]/page")],
  ] as const)("uses the normalized Shopify product image for %s shares", async (locale, loadRoute) => {
    getProduct.mockResolvedValue({
      title: "Quartz bracelet",
      description: "Product details.",
      featuredImage: {
        url: "https://cdn.shopify.com/s/files/1/quartz.jpg",
        width: 900,
        height: 1200,
        altText: "Quartz bracelet on linen",
      },
    });
    const { generateMetadata } = await loadRoute();
    const metadata = await generateMetadata({
      params: Promise.resolve({ handle: "quartz" }),
      searchParams: Promise.resolve({}),
    });

    expect(getProduct).toHaveBeenCalledWith("quartz", "us", locale);
    expect(metadata.openGraph).toMatchObject({
      images: [{
        url: "https://cdn.shopify.com/s/files/1/quartz.jpg",
        width: 900,
        height: 1200,
        alt: "Quartz bracelet on linen",
      }],
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

  it("keeps an unclassified page noindex even while approved gates are open", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "true");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://joyamana.com");
    vi.resetModules();
    const { buildMetadata: buildGranularMetadata } = await import("./seo");

    const metadata = buildGranularMetadata({
      title: "Future page",
      description: "Not yet classified.",
      locale: "en-US",
      path: "/future-page",
    });

    expect(metadata.robots).toEqual({
      index: false,
      follow: false,
      noarchive: true,
    });
    expect(metadata.alternates).toBeUndefined();
  });
});
