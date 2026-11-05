import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CatalogProduct } from "@/lib/commerce/types";

const catalog = vi.hoisted(() => ({
  getBrowseCollection: vi.fn(),
  getProductCategory: vi.fn(),
}));
const redirect = vi.hoisted(() =>
  vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT;${path}`);
  }),
);
vi.mock("@/lib/commerce/catalog", () => catalog);
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  permanentRedirect: redirect,
  notFound: () => {
    throw new Error("NEXT_HTTP_ERROR_FALLBACK;404");
  },
}));

const emptyCollection = {
  id: "gid://shopify/Collection/1",
  handle: "bracelets",
  title: "Bracelet Collection",
  description: "A collection of bracelets.",
  hasProducts: false,
  image: null,
  products: [],
};

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "true");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.joyamana.com");
  catalog.getBrowseCollection.mockResolvedValue(emptyCollection);
  catalog.getProductCategory.mockResolvedValue(null);
});
afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("collection detail and legacy category aliases", () => {
  it("keeps product links and Schema on an indexable collection, but suppresses Schema for filters", async () => {
    const product: CatalogProduct = {
      id: "gid://shopify/Product/1",
      handle: "crystal-object",
      title: "Crystal object",
      availableForSale: true,
      category: null,
      featuredImage: null,
      priceRange: {
        minVariantPrice: { amount: "68.00", currencyCode: "USD" },
        maxVariantPrice: { amount: "68.00", currencyCode: "USD" },
      },
      variants: [
        {
          id: "gid://shopify/ProductVariant/101",
          title: "Default Title",
          availableForSale: true,
          currentlyNotInStock: false,
          quantityAvailable: 1,
          price: { amount: "68.00", currencyCode: "USD" },
          compareAtPrice: null,
          image: null,
          selectedOptions: [],
          quantityRule: { minimum: 1, maximum: null, increment: 1 },
          colors: [],
        },
      ],
    };
    catalog.getBrowseCollection.mockResolvedValue({
      ...emptyCollection,
      hasProducts: true,
      products: [product],
    });
    const { CollectionPage } = await import("./collection-page");
    const html = renderToStaticMarkup(
      await CollectionPage({ locale: "en-US", handle: "bracelets" }),
    );
    expect(html).toContain('href="/products/crystal-object?variant=101"');
    expect(html).toContain('href="/collections/bracelets?available=1"');
    const script = html.match(
      /<script type="application\/ld\+json">(.*?)<\/script>/,
    );
    expect(script).not.toBeNull();
    const schema = JSON.parse(script![1]);
    expect(schema["@graph"]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "@type": "CollectionPage",
          name: "Bracelet Collection",
          url: "https://www.joyamana.com/collections/bracelets",
        }),
        expect.objectContaining({ "@type": "ItemList", numberOfItems: 1 }),
      ]),
    );
    const filtered = renderToStaticMarkup(
      await CollectionPage({
        locale: "en-US",
        handle: "bracelets",
        searchParams: { available: "1" },
      }),
    );
    expect(filtered).toContain('href="/products/crystal-object?variant=101"');
    expect(filtered).not.toContain("application/ld+json");
  });

  it.each(["en-US", "zh-Hant-US"] as const)(
    "keeps an existing empty collection instead of redirecting in %s",
    async (locale) => {
      const { CollectionPage } = await import("./collection-page");
      const html = renderToStaticMarkup(
        await CollectionPage({ locale, handle: "bracelets" }),
      );
      expect(html).toContain("<h1>Bracelet Collection</h1>");
      expect(html).toContain(
        locale === "en-US" ? "No products yet." : "暫時沒有商品。",
      );
      expect(html).not.toContain("application/ld+json");
      expect(catalog.getProductCategory).not.toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["en-US", ""],
    ["zh-Hant-US", "/zh-hant-us"],
  ] as const)(
    "redirects only a missing legacy alias while retaining queries in %s",
    async (locale, prefix) => {
      catalog.getBrowseCollection.mockResolvedValue(null);
      catalog.getProductCategory.mockResolvedValue({ handle: "bracelets" });
      const { CollectionPage } = await import("./collection-page");
      await expect(
        CollectionPage({
          locale,
          handle: "bracelets",
          searchParams: { color: ["blue", "green"], sort: "price-asc" },
        }),
      ).rejects.toThrow("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledExactlyOnceWith(
        `${prefix}/category/bracelets?color=blue&color=green&sort=price-asc`,
      );
      expect(catalog.getProductCategory).toHaveBeenCalledExactlyOnceWith(
        "bracelets",
        "us",
        locale,
      );
    },
  );

  it("returns 404 when a legacy alias has no available category target", async () => {
    catalog.getBrowseCollection.mockResolvedValue(null);
    const { CollectionPage } = await import("./collection-page");
    await expect(
      CollectionPage({ locale: "en-US", handle: "bracelets" }),
    ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    expect(redirect).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown collection without consulting categories", async () => {
    catalog.getBrowseCollection.mockResolvedValue(null);
    const { CollectionPage } = await import("./collection-page");
    await expect(
      CollectionPage({ locale: "en-US", handle: "missing" }),
    ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    expect(catalog.getProductCategory).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});
