import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDesignCollections: vi.fn(),
  getProducts: vi.fn(),
  productCategoriesForProducts: vi.fn(),
  getPublishedShopifyEditorialPaths: vi.fn(),
  getPublishedShopifyAboutPaths: vi.fn(),
  getPublishedShopifyPolicyPaths: vi.fn(),
  getPublishedShopifyContentPagePaths: vi.fn(),
}));

vi.mock("@/lib/commerce/catalog", () => ({
  getDesignCollections: mocks.getDesignCollections,
  getProducts: mocks.getProducts,
  productCategoriesForProducts: mocks.productCategoriesForProducts,
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
vi.mock("@/config/indexing", () => ({
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
  },
}));

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("granular sitemap gates", () => {
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
});
