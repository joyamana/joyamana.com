import { afterEach, describe, expect, it, vi } from "vitest";
import { activeMarket, markets } from "@/config/markets";
import type { Collection, Product, ProductCollection } from "./types";

const shopifyCatalogMocks = vi.hoisted(() => ({
  getShopifyCollection: vi.fn(),
  getShopifyCollections: vi.fn(),
  getShopifyProduct: vi.fn(),
  getShopifyProducts: vi.fn(),
  searchShopifyProducts: vi.fn(),
}));

vi.mock("./shopify-catalog", () => shopifyCatalogMocks);

import {
  getCollection,
  getCollections,
  getDesignCollection,
  getDesignCollections,
  getProduct,
  getProductCategory,
  getProducts,
  searchCatalog,
} from "./catalog";

const product: Product = {
  id: "gid://shopify/Product/1",
  handle: "crystal-bracelet",
  title: "Crystal Bracelet",
  description: "A bracelet.",
  availableForSale: true,
  priceRange: {
    minVariantPrice: { amount: "68.00", currencyCode: "USD" },
    maxVariantPrice: { amount: "68.00", currencyCode: "USD" },
  },
  compareAtPrice: null,
  featuredImage: null,
  images: [],
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
  kind: "design_series",
};

const merchandisingCollection: Collection = {
  ...designCollection,
  id: "gid://shopify/Collection/2",
  handle: "featured",
  title: "Featured",
  kind: "merchandising",
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
      getProductCategory("bracelets", "us", "es-US"),
    ).resolves.toMatchObject({
      title: "Pulseras",
    });
    await expect(
      getProductCategory("rings", "us", "en-US"),
    ).resolves.toBeNull();
  });

  it("exposes only Shopify collections marked as design series", async () => {
    shopifyCatalogMocks.getShopifyCollections.mockResolvedValue([
      designCollection,
      merchandisingCollection,
    ]);
    shopifyCatalogMocks.getShopifyCollection.mockImplementation(
      async (handle: string) => {
        const collection =
          handle === "patron-saint"
            ? designCollection
            : handle === "featured"
              ? merchandisingCollection
              : null;
        return collection
          ? ({ ...collection, products: [] } satisfies ProductCollection)
          : null;
      },
    );

    await expect(getDesignCollections("us", "en-US")).resolves.toEqual([
      designCollection,
    ]);
    await expect(
      getDesignCollection("patron-saint", "us", "en-US"),
    ).resolves.toMatchObject({ kind: "design_series" });
    await expect(
      getDesignCollection("featured", "us", "en-US"),
    ).resolves.toBeNull();
  });

  it("uses one enabled US catalog for English and Spanish", () => {
    expect(activeMarket.regions).toEqual(["US"]);
    expect(activeMarket.defaultCurrency).toBe("USD");
    expect(activeMarket.currencies).toEqual(["USD"]);
    expect(activeMarket.locales).toEqual(["en-US", "es-US"]);
    expect(activeMarket.catalog).toBe("us");
  });

  it("keeps planned Canada empty without consulting Shopify", async () => {
    await expect(getProducts("ca", "en-CA")).resolves.toEqual([]);
    await expect(getProduct("anything", "ca", "en-CA")).resolves.toBeNull();
    await expect(getCollections("ca", "fr-CA")).resolves.toEqual([]);
    await expect(getCollection("anything", "ca", "fr-CA")).resolves.toBeNull();
    await expect(searchCatalog("quartz", "ca", "en-CA")).resolves.toEqual([]);

    expect(markets.ca.status).toBe("planned");
    expect(shopifyCatalogMocks.getShopifyProducts).not.toHaveBeenCalled();
    expect(shopifyCatalogMocks.getShopifyProduct).not.toHaveBeenCalled();
    expect(shopifyCatalogMocks.getShopifyCollections).not.toHaveBeenCalled();
    expect(shopifyCatalogMocks.getShopifyCollection).not.toHaveBeenCalled();
    expect(shopifyCatalogMocks.searchShopifyProducts).not.toHaveBeenCalled();
  });

  it("always dispatches Shopify with the requested locale", async () => {
    shopifyCatalogMocks.getShopifyProducts.mockResolvedValue([product]);
    shopifyCatalogMocks.getShopifyProduct.mockResolvedValue(product);
    shopifyCatalogMocks.getShopifyCollections.mockResolvedValue([
      designCollection,
    ]);
    shopifyCatalogMocks.searchShopifyProducts.mockResolvedValue([product]);

    await expect(getProducts("us", "es-US")).resolves.toEqual([product]);
    await expect(
      getProduct("crystal-bracelet", "us", "en-US"),
    ).resolves.toEqual(product);
    await expect(getCollections("us", "es-US")).resolves.toEqual([
      designCollection,
    ]);
    await expect(searchCatalog("crystal", "us", "es-US")).resolves.toEqual([
      product,
    ]);

    expect(shopifyCatalogMocks.getShopifyProducts).toHaveBeenCalledWith("es-US");
    expect(shopifyCatalogMocks.getShopifyProduct).toHaveBeenCalledWith(
      "crystal-bracelet",
      "en-US",
    );
    expect(shopifyCatalogMocks.getShopifyCollections).toHaveBeenCalledWith(
      "es-US",
    );
    expect(shopifyCatalogMocks.searchShopifyProducts).toHaveBeenCalledWith(
      "crystal",
      "es-US",
    );
  });

  it("propagates Shopify failures without a local fallback", async () => {
    const upstreamError = new Error("Shopify unavailable");
    shopifyCatalogMocks.getShopifyProducts.mockRejectedValueOnce(upstreamError);

    await expect(getProducts("us", "en-US")).rejects.toBe(upstreamError);
  });
});
