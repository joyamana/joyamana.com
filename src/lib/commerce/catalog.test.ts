import { afterEach, describe, expect, it, vi } from "vitest";
import { markets } from "@/config/markets";
import type { Collection, Product, ProductCollection } from "./types";

const shopifyCatalogMocks = vi.hoisted(() => ({
  getShopifyCatalogNavigation: vi.fn(),
  getShopifyCollection: vi.fn(),
  getShopifyCollections: vi.fn(),
  getShopifyProduct: vi.fn(),
  getShopifyProductRecommendations: vi.fn(),
  getShopifyProducts: vi.fn(),
  hydrateShopifyBrowseProducts: vi.fn(),
  searchShopifyProducts: vi.fn(),
}));

vi.mock("./shopify-catalog", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./shopify-catalog")>()),
  ...shopifyCatalogMocks,
}));

import {
  getCatalogNavigationData,
  getBrowseCategory,
  getBrowseCollection,
  getCollection,
  getCollections,
  getProduct,
  getProductRecommendations,
  getProductCategory,
  getProducts,
  productCategoriesForProducts,
  searchCatalog,
} from "./catalog";

const product: Product = {
  id: "gid://shopify/Product/1",
  handle: "crystal-bracelet",
  title: "Crystal Bracelet",
  description: "A bracelet.",
  descriptionHtml: "<p>A bracelet.</p>",
  availableForSale: true,
  priceRange: {
    minVariantPrice: { amount: "68.00", currencyCode: "USD" },
    maxVariantPrice: { amount: "68.00", currencyCode: "USD" },
  },
  featuredImage: null,
  images: [],
  media: [],
  variants: [],
  category: {
    id: "gid://shopify/TaxonomyCategory/aa-6-3",
    name: "Bracelets",
  },
};

const designCollection: Collection = {
  id: "gid://shopify/Collection/1",
  handle: "patron-saint",
  title: "Patron Saint",
  description: "A design series.",
  image: null,
  hasProducts: true,
};

const religiousProduct: Product = {
  ...product,
  id: "gid://shopify/Product/2",
  handle: "guardian-figure",
  category: {
    id: "gid://shopify/TaxonomyCategory/rc-2",
    name: "Religious Items",
  },
};

const merchandisingCollection: Collection = {
  ...designCollection,
  id: "gid://shopify/Collection/2",
  handle: "featured",
  title: "Featured",
};

afterEach(() => {
  vi.resetAllMocks();
});

describe("Shopify catalog facade", () => {
  it("builds category routes from Shopify taxonomy identity", async () => {
    shopifyCatalogMocks.getShopifyProducts.mockResolvedValue([product]);

    await expect(
      getProductCategory("bracelets", "us", "en-US"),
    ).resolves.toMatchObject({
      handle: "bracelets",
      taxonomyId: "gid://shopify/TaxonomyCategory/aa-6-3",
      title: "Bracelets",
      products: [expect.objectContaining({ handle: "crystal-bracelet" })],
    });
    await expect(
      getProductCategory("bracelets", "us", "zh-Hant-US"),
    ).resolves.toMatchObject({
      title: "手鏈",
    });
    await expect(
      getProductCategory("rings", "us", "en-US"),
    ).resolves.toBeNull();
  });

  it("uses only the public navigation fetch cache and returns link fields", async () => {
    shopifyCatalogMocks.getShopifyCatalogNavigation.mockResolvedValue({
      productCategories: [
        { id: "gid://shopify/TaxonomyCategory/rc-2", name: "宗教物品" },
        { id: "gid://shopify/TaxonomyCategory/aa-6-3", name: "手鏈" },
        { id: "gid://shopify/TaxonomyCategory/rc-3", name: "另一類別" },
        { id: "gid://shopify/Product/not-taxonomy", name: "Invalid" },
        { id: "gid://shopify/TaxonomyCategory/rc-4", name: " " },
      ],
      collections: [
        {
          handle: "patron-saint",
          title: "Patron Saint",
        },
        { handle: "featured", title: "Featured" },
        { handle: "empty", title: "Coming soon" },
      ],
    });
    await expect(getCatalogNavigationData("us", "zh-Hant-US")).resolves.toEqual(
      {
        categories: [
          { handle: "bracelets", title: "手鏈" },
          { handle: "taxonomy-rc-2", title: "宗教物品" },
          { handle: "taxonomy-rc-3", title: "另一類別" },
        ],
        collections: [
          { handle: "patron-saint", title: "Patron Saint" },
          { handle: "featured", title: "Featured" },
          { handle: "empty", title: "Coming soon" },
        ],
      },
    );
    expect(
      shopifyCatalogMocks.getShopifyCatalogNavigation,
    ).toHaveBeenCalledWith("zh-Hant-US", {
      buyerIp: null,
      cache: "force-cache",
      revalidate: 300,
      tags: ["shopify-catalog-navigation"],
    });
  });

  it("discovers new categories and keeps sold-out published products without inventing categories", () => {
    const soldOut = {
      ...religiousProduct,
      id: "gid://shopify/Product/3",
      availableForSale: false,
    };
    const gemstones = {
      ...product,
      id: "gid://shopify/Product/4",
      category: {
        id: "gid://shopify/TaxonomyCategory/ae-2-2-6-2",
        name: "Gemstones",
      },
    };
    const otherCategory = {
      ...product,
      id: "gid://shopify/Product/5",
      category: {
        id: "gid://shopify/TaxonomyCategory/rc-3",
        name: "Religious Items",
      },
    };
    const uncategorized = {
      ...product,
      id: "gid://shopify/Product/6",
      category: null,
    };
    const categories = productCategoriesForProducts(
      [
        otherCategory,
        religiousProduct,
        soldOut,
        uncategorized,
        gemstones,
        product,
      ],
      "en-US",
    );
    expect(categories.map(({ handle }) => handle)).toEqual([
      "bracelets",
      "gemstones",
      "taxonomy-rc-2",
      "taxonomy-rc-3",
    ]);
    expect(categories[2].products).toEqual([religiousProduct, soldOut]);
    expect(categories[3].products).toEqual([otherCategory]);
    expect(productCategoriesForProducts([uncategorized], "en-US")).toEqual([]);
  });

  it("resolves new category pages in both languages and removes empty categories", async () => {
    shopifyCatalogMocks.getShopifyProducts.mockImplementation(
      async (locale) => [
        {
          ...religiousProduct,
          category: {
            ...religiousProduct.category,
            name: locale === "zh-Hant-US" ? "宗教物品" : "Religious Items",
          },
        },
      ],
    );
    await expect(
      getProductCategory("taxonomy-rc-2", "us", "en-US"),
    ).resolves.toMatchObject({
      handle: "taxonomy-rc-2",
      title: "Religious Items",
      products: [expect.objectContaining({ id: religiousProduct.id })],
    });
    await expect(
      getProductCategory("taxonomy-rc-2", "us", "zh-Hant-US"),
    ).resolves.toMatchObject({
      handle: "taxonomy-rc-2",
      title: "宗教物品",
    });
    shopifyCatalogMocks.getShopifyProducts.mockResolvedValue([]);
    await expect(
      getProductCategory("taxonomy-rc-2", "us", "en-US"),
    ).resolves.toBeNull();
    await expect(
      getBrowseCategory("taxonomy-rc-2", "us", "en-US"),
    ).resolves.toBeNull();
    expect(
      shopifyCatalogMocks.hydrateShopifyBrowseProducts,
    ).not.toHaveBeenCalled();
  });

  it("hydrates only members of a new browse category with the shared catalog budget", async () => {
    shopifyCatalogMocks.getShopifyProducts.mockResolvedValue([
      product,
      religiousProduct,
    ]);
    shopifyCatalogMocks.hydrateShopifyBrowseProducts.mockResolvedValue([
      religiousProduct,
    ]);
    await expect(
      getBrowseCategory("taxonomy-rc-2", "us", "en-US"),
    ).resolves.toMatchObject({
      handle: "taxonomy-rc-2",
      products: [religiousProduct],
    });
    expect(
      shopifyCatalogMocks.hydrateShopifyBrowseProducts,
    ).toHaveBeenCalledWith(
      [religiousProduct],
      "en-US",
      expect.objectContaining({ read: expect.any(Function) }),
    );
    expect(shopifyCatalogMocks.getShopifyProducts).toHaveBeenCalledWith(
      "en-US",
      { cache: "no-store" },
      expect.objectContaining({ read: expect.any(Function) }),
    );
  });

  it("rejects malformed category handles and established URL aliases before querying Shopify", async () => {
    for (const handle of [
      "religious-items",
      "taxonomy-aa-6-3",
      "taxonomy-rc-2/other",
    ]) {
      await expect(
        getProductCategory(handle, "us", "en-US"),
      ).resolves.toBeNull();
      await expect(
        getBrowseCategory(handle, "us", "en-US"),
      ).resolves.toBeNull();
    }
    expect(shopifyCatalogMocks.getShopifyProducts).not.toHaveBeenCalled();
    expect(
      shopifyCatalogMocks.hydrateShopifyBrowseProducts,
    ).not.toHaveBeenCalled();
  });

  it("keeps new categories unavailable in planned markets and paused languages", async () => {
    await expect(
      getProductCategory("taxonomy-rc-2", "ca", "en-CA"),
    ).resolves.toBeNull();
    await expect(
      getBrowseCategory("taxonomy-rc-2", "ca", "fr-CA"),
    ).resolves.toBeNull();
    await expect(
      getProductCategory("taxonomy-rc-2", "us", "es-US"),
    ).rejects.toMatchObject({ kind: "configuration" });
    await expect(
      getBrowseCategory("taxonomy-rc-2", "us", "es-US"),
    ).rejects.toMatchObject({ kind: "configuration" });
    expect(shopifyCatalogMocks.getShopifyProducts).not.toHaveBeenCalled();
  });

  it("exposes every visible Shopify collection, including empty and undescribed collections", async () => {
    const emptyCollection = {
      ...designCollection,
      id: "gid://shopify/Collection/3",
      handle: "empty",
      title: "Coming soon",
      description: "",
      hasProducts: false,
    };
    const collections = [
      designCollection,
      merchandisingCollection,
      emptyCollection,
    ];
    shopifyCatalogMocks.getShopifyCollections.mockResolvedValue(collections);
    shopifyCatalogMocks.hydrateShopifyBrowseProducts.mockImplementation(
      async (products) => products,
    );
    shopifyCatalogMocks.getShopifyCollection.mockImplementation(
      async (handle: string) => {
        const collection = collections.find((item) => item.handle === handle);
        return collection
          ? ({
              ...collection,
              products: collection.hasProducts ? [product] : [],
            } satisfies ProductCollection)
          : null;
      },
    );

    await expect(getCollections("us", "en-US")).resolves.toEqual(collections);
    await expect(
      getCollection("featured", "us", "en-US"),
    ).resolves.toMatchObject({
      ...merchandisingCollection,
      products: [product],
    });
    await expect(
      getBrowseCollection("empty", "us", "en-US"),
    ).resolves.toMatchObject({ ...emptyCollection, products: [] });
    expect(
      shopifyCatalogMocks.hydrateShopifyBrowseProducts,
    ).toHaveBeenCalledWith([], "en-US", expect.anything());
    await expect(getCollection("missing", "us", "en-US")).resolves.toBeNull();
  });

  it("uses one enabled US catalog for its configured languages", () => {
    expect(markets.us.regions).toEqual(["US"]);
    expect(markets.us.defaultCurrency).toBe("USD");
    expect(markets.us.currencies).toEqual(["USD"]);
    expect(markets.us.locales).toEqual(["en-US", "es-US", "zh-Hant-US"]);
    expect(markets.us.catalog).toBe("us");
  });

  it("keeps planned Canada empty without consulting Shopify", async () => {
    await expect(getProducts("ca", "en-CA")).resolves.toEqual([]);
    await expect(getProduct("anything", "ca", "en-CA")).resolves.toBeNull();
    await expect(
      getProductRecommendations("anything", "ca", "en-CA"),
    ).resolves.toEqual([]);
    await expect(getCollections("ca", "fr-CA")).resolves.toEqual([]);
    await expect(getCollection("anything", "ca", "fr-CA")).resolves.toBeNull();
    await expect(searchCatalog("quartz", "ca", "en-CA")).resolves.toEqual([]);
    await expect(getCatalogNavigationData("ca", "fr-CA")).resolves.toEqual({
      categories: [],
      collections: [],
    });

    expect(markets.ca.status).toBe("planned");
    expect(shopifyCatalogMocks.getShopifyProducts).not.toHaveBeenCalled();
    expect(
      shopifyCatalogMocks.getShopifyCatalogNavigation,
    ).not.toHaveBeenCalled();
    expect(shopifyCatalogMocks.getShopifyProduct).not.toHaveBeenCalled();
    expect(
      shopifyCatalogMocks.getShopifyProductRecommendations,
    ).not.toHaveBeenCalled();
    expect(shopifyCatalogMocks.getShopifyCollections).not.toHaveBeenCalled();
    expect(shopifyCatalogMocks.getShopifyCollection).not.toHaveBeenCalled();
    expect(shopifyCatalogMocks.searchShopifyProducts).not.toHaveBeenCalled();
  });

  it("always dispatches Shopify with the requested locale", async () => {
    shopifyCatalogMocks.getShopifyProducts.mockResolvedValue([product]);
    shopifyCatalogMocks.getShopifyProduct.mockResolvedValue(product);
    shopifyCatalogMocks.getShopifyProductRecommendations.mockResolvedValue([
      product,
    ]);
    shopifyCatalogMocks.getShopifyCollections.mockResolvedValue([
      designCollection,
    ]);
    shopifyCatalogMocks.searchShopifyProducts.mockResolvedValue([product]);

    await expect(getProducts("us", "zh-Hant-US")).resolves.toEqual([product]);
    await expect(
      getProduct("crystal-bracelet", "us", "en-US"),
    ).resolves.toEqual(product);
    await expect(
      getProductRecommendations("crystal-bracelet", "us", "zh-Hant-US"),
    ).resolves.toEqual([product]);
    await expect(getCollections("us", "zh-Hant-US")).resolves.toEqual([
      designCollection,
    ]);
    await expect(searchCatalog("crystal", "us", "zh-Hant-US")).resolves.toEqual(
      [product],
    );

    expect(shopifyCatalogMocks.getShopifyProducts).toHaveBeenCalledWith(
      "zh-Hant-US",
      { cache: "no-store" },
      expect.objectContaining({ read: expect.any(Function) }),
    );
    expect(shopifyCatalogMocks.getShopifyProduct).toHaveBeenCalledWith(
      "crystal-bracelet",
      "en-US",
    );
    expect(
      shopifyCatalogMocks.getShopifyProductRecommendations,
    ).toHaveBeenCalledWith("crystal-bracelet", "zh-Hant-US");
    expect(shopifyCatalogMocks.getShopifyCollections).toHaveBeenCalledWith(
      "zh-Hant-US",
    );
    expect(shopifyCatalogMocks.searchShopifyProducts).toHaveBeenCalledWith(
      "crystal",
      "zh-Hant-US",
    );
  });

  it("propagates Shopify failures without a local fallback", async () => {
    const upstreamError = new Error("Shopify unavailable");
    shopifyCatalogMocks.getShopifyProducts.mockRejectedValueOnce(upstreamError);

    await expect(getProducts("us", "en-US")).rejects.toBe(upstreamError);
    shopifyCatalogMocks.getShopifyCatalogNavigation.mockRejectedValueOnce(
      upstreamError,
    );
    await expect(getCatalogNavigationData("us", "en-US")).rejects.toBe(
      upstreamError,
    );
  });

  it("rejects disabled recommendation locales before contacting Shopify", async () => {
    await expect(
      getProductRecommendations("bracelet", "us", "es-US"),
    ).rejects.toMatchObject({ kind: "configuration" });
    expect(
      shopifyCatalogMocks.getShopifyProductRecommendations,
    ).not.toHaveBeenCalled();
  });
});
