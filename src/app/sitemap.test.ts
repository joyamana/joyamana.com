import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductSummary } from "@/lib/commerce/types";

const mocks = vi.hoisted(() => ({
  getDesignCollections: vi.fn(),
  getProducts: vi.fn(),
  getPublishedShopifyEditorialPaths: vi.fn(),
  getPublishedShopifyAboutPaths: vi.fn(),
  getPublishedShopifyPolicyPaths: vi.fn(),
  getPublishedShopifyContentPagePaths: vi.fn(),
}));

vi.mock("@/lib/commerce/catalog", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/commerce/catalog")>()),
  getDesignCollections: mocks.getDesignCollections,
  getProducts: mocks.getProducts,
}));
vi.mock("@/lib/content/shopify-editorial", () => ({
  getPublishedShopifyEditorialPaths: mocks.getPublishedShopifyEditorialPaths,
}));
vi.mock("@/lib/content/shopify-about-pages", () => ({
  getPublishedShopifyAboutPaths: mocks.getPublishedShopifyAboutPaths,
}));
vi.mock("@/lib/content/shopify-policies", () => ({
  getPublishedShopifyPolicyPaths: mocks.getPublishedShopifyPolicyPaths,
}));
vi.mock("@/lib/content/shopify-content-pages", () => ({
  getPublishedShopifyContentPagePaths:
    mocks.getPublishedShopifyContentPagePaths,
}));
const policy = vi.hoisted(() => ({
  indexingPolicy: {
    "en-US": {
      core: true,
      commerce: false,
      policies: false,
      editorial: false,
    },
    "es-US": {
      core: false,
      commerce: false,
      policies: false,
      editorial: false,
    },
    "zh-Hant-US": {
      core: false,
      commerce: false,
      policies: false,
      editorial: false,
    },
  },
}));

vi.mock("@/config/indexing", () => policy);

beforeEach(() => {
  mocks.getProducts.mockResolvedValue([]);
  mocks.getDesignCollections.mockResolvedValue([]);
  mocks.getPublishedShopifyAboutPaths.mockResolvedValue([]);
  mocks.getPublishedShopifyContentPagePaths.mockResolvedValue([]);
});

afterEach(() => {
  policy.indexingPolicy["en-US"].commerce = false;
  policy.indexingPolicy["zh-Hant-US"].commerce = false;
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

const product: ProductSummary = {
  id: "gid://shopify/Product/1",
  handle: "published-object",
  title: "Published object",
  availableForSale: false,
  category: { id: "gid://shopify/TaxonomyCategory/rc-2", name: "Decor" },
  featuredImage: null,
  priceRange: {
    minVariantPrice: { amount: "68.00", currencyCode: "USD" },
    maxVariantPrice: { amount: "68.00", currencyCode: "USD" },
  },
};

describe("granular sitemap gates", () => {
  it("excludes empty catalog hubs even when commerce indexing is approved", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "true");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.joyamana.com");
    policy.indexingPolicy["en-US"].commerce = true;
    mocks.getProducts.mockResolvedValue([]);
    mocks.getDesignCollections.mockResolvedValue([]);
    mocks.getPublishedShopifyAboutPaths.mockResolvedValue([]);
    mocks.getPublishedShopifyContentPagePaths.mockResolvedValue([]);
    const { default: sitemap } = await import("./sitemap");
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls).not.toContain("https://www.joyamana.com/shop");
    expect(urls).not.toContain("https://www.joyamana.com/collections");
  });
  it("excludes collections that metadata keeps noindex for missing content", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "true");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.joyamana.com");
    policy.indexingPolicy["en-US"].commerce = true;
    mocks.getProducts.mockResolvedValue([]);
    mocks.getPublishedShopifyAboutPaths.mockResolvedValue([]);
    mocks.getPublishedShopifyContentPagePaths.mockResolvedValue([]);
    mocks.getDesignCollections.mockResolvedValue([
      { handle: "thin-series", description: " ", seoDescription: " " },
      { handle: "body-series", description: "Collection story" },
      {
        handle: "seo-series",
        description: "",
        seoDescription: "Series introduction",
      },
    ]);

    const { default: sitemap } = await import("./sitemap");
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls).toContain("https://www.joyamana.com/collections");
    expect(urls).toContain("https://www.joyamana.com/collections/body-series");
    expect(urls).toContain("https://www.joyamana.com/collections/seo-series");
    expect(urls).not.toContain(
      "https://www.joyamana.com/collections/thin-series",
    );
  });

  it("loads and publishes only the enabled locale and page group", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "true");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.joyamana.com");
    mocks.getPublishedShopifyAboutPaths.mockResolvedValue(["/about"]);
    mocks.getPublishedShopifyContentPagePaths.mockResolvedValue([
      "/accessibility",
    ]);

    const { default: sitemap } = await import("./sitemap");
    const entries = await sitemap();

    expect(entries.map((entry) => entry.url)).toEqual([
      "https://www.joyamana.com/",
      "https://www.joyamana.com/contact",
      "https://www.joyamana.com/about",
      "https://www.joyamana.com/accessibility",
    ]);
    expect(mocks.getPublishedShopifyAboutPaths).toHaveBeenCalledOnce();
    expect(mocks.getPublishedShopifyAboutPaths).toHaveBeenCalledWith("en-US");
    expect(mocks.getProducts).not.toHaveBeenCalled();
    expect(mocks.getDesignCollections).not.toHaveBeenCalled();
    expect(mocks.getPublishedShopifyPolicyPaths).not.toHaveBeenCalled();
    expect(mocks.getPublishedShopifyEditorialPaths).not.toHaveBeenCalled();
  });

  it("discovers new taxonomy routes in both public languages without inventing categories for unclassified products", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "true");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.joyamana.com");
    policy.indexingPolicy["en-US"].commerce = true;
    policy.indexingPolicy["zh-Hant-US"].commerce = true;
    mocks.getProducts.mockImplementation(async (_market, locale) => [
      {
        ...product,
        category: {
          ...product.category!,
          name: locale === "zh-Hant-US" ? "家居裝飾" : "Decor",
        },
      },
      {
        ...product,
        id: "gid://shopify/Product/2",
        handle: "unclassified-object",
        category: null,
      },
    ]);

    const { default: sitemap } = await import("./sitemap");
    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls.filter((url) => url.includes("/category/"))).toEqual([
      "https://www.joyamana.com/category/taxonomy-rc-2",
      "https://www.joyamana.com/zh-hant-us/category/taxonomy-rc-2",
    ]);
    expect(urls).toContain(
      "https://www.joyamana.com/products/unclassified-object",
    );
    expect(urls).toContain(
      "https://www.joyamana.com/zh-hant-us/products/unclassified-object",
    );
    expect(urls.some((url) => url.includes("/es-us/"))).toBe(false);
  });

  it("applies the locale commerce gate to automatically discovered categories", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "true");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.joyamana.com");
    policy.indexingPolicy["en-US"].commerce = true;
    mocks.getProducts.mockResolvedValue([product]);

    const { default: sitemap } = await import("./sitemap");
    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toContain("https://www.joyamana.com/category/taxonomy-rc-2");
    expect(urls.some((url) => url.includes("/zh-hant-us/"))).toBe(false);
    expect(mocks.getProducts).toHaveBeenCalledExactlyOnceWith("us", "en-US");
  });

  it("keeps automatic categories out of sitemap while deployment indexing is disabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "false");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.joyamana.com");
    policy.indexingPolicy["en-US"].commerce = true;
    policy.indexingPolicy["zh-Hant-US"].commerce = true;
    mocks.getProducts.mockResolvedValue([product]);

    const { default: sitemap } = await import("./sitemap");

    expect(await sitemap()).toEqual([]);
    expect(mocks.getProducts).not.toHaveBeenCalled();
  });
});
