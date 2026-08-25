import { afterEach, describe, expect, it, vi } from "vitest";
import { activeMarket, markets } from "@/config/markets";

const shopifyCatalogMocks = vi.hoisted(() => ({
  getShopifyCollection: vi.fn(),
  getShopifyCollections: vi.fn(),
  getShopifyProduct: vi.fn(),
  getShopifyProducts: vi.fn(),
  searchShopifyProducts: vi.fn(),
}));

vi.mock("./shopify-catalog", () => shopifyCatalogMocks);

import {
  CommerceProviderError,
  getCollection,
  getCollections,
  getProduct,
  getProducts,
  searchCatalog,
} from "./catalog";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.clearAllMocks();
});

describe("catalog provider facade", () => {
  it("normalizes the approved mock product without numeric commerce prices", async () => {
    process.env.COMMERCE_PROVIDER = "mock";
    const collection = await getCollection("seven-chakra", "us", "en-US");
    const product = collection?.products[0];

    expect(collection?.products).toHaveLength(1);
    expect(product).toMatchObject({
      handle: "seven-chakra-classic-bracelet-8mm",
      title: "Seven-Chakra Classic Bracelet — 8mm",
      source: "mock",
      priceRange: {
        minVariantPrice: { amount: "68.00", currencyCode: "USD" },
      },
    });
    expect(product?.variants[0]).toMatchObject({
      availableForSale: true,
      price: { amount: "68.00", currencyCode: "USD" },
      image: { width: 1254, height: 1254 },
      selectedOptions: [{ name: "Main stone", value: "White-pattern stone" }],
    });
  });

  it("returns locale-specific mock commerce strings", async () => {
    process.env.COMMERCE_PROVIDER = "mock";

    expect(await searchCatalog("bracelet", "us", "en-US")).toHaveLength(1);
    expect(await searchCatalog("pulsera", "us", "en-US")).toHaveLength(0);
    expect(await searchCatalog("pulsera", "us", "es-US")).toHaveLength(1);
    expect(
      (await getProduct(
        "seven-chakra-classic-bracelet-8mm",
        "us",
        "es-US",
      ))?.title,
    ).toBe("Pulsera Clásica de Siete Chakras — 8 mm");
  });

  it("uses one enabled US catalog for English and Spanish", () => {
    expect(activeMarket.regions).toEqual(["US"]);
    expect(activeMarket.defaultCurrency).toBe("USD");
    expect(activeMarket.currencies).toEqual(["USD"]);
    expect(activeMarket.locales).toEqual(["en-US", "es-US"]);
    expect(activeMarket.catalog).toBe("us");
  });

  it("keeps planned Canada empty without consulting Shopify", async () => {
    process.env.COMMERCE_PROVIDER = "shopify";

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

  it("dispatches Shopify with the requested locale and never falls back on errors", async () => {
    process.env.COMMERCE_PROVIDER = "shopify";
    const upstreamError = new Error("Shopify unavailable");
    shopifyCatalogMocks.getShopifyProducts.mockRejectedValueOnce(upstreamError);

    await expect(getProducts("us", "es-US")).rejects.toBe(upstreamError);
    expect(shopifyCatalogMocks.getShopifyProducts).toHaveBeenCalledWith("es-US");
  });

  it("rejects an unknown provider instead of silently using mock data", async () => {
    process.env.COMMERCE_PROVIDER = "other";

    await expect(getProducts()).rejects.toEqual(
      expect.objectContaining<Partial<CommerceProviderError>>({
        name: "CommerceProviderError",
        kind: "configuration",
        message: "COMMERCE_PROVIDER must be either mock or shopify.",
      }),
    );
  });

  it("defaults to Shopify when the provider is omitted", async () => {
    delete process.env.COMMERCE_PROVIDER;
    shopifyCatalogMocks.getShopifyProducts.mockResolvedValueOnce([]);

    await expect(getProducts()).resolves.toEqual([]);
    expect(shopifyCatalogMocks.getShopifyProducts).toHaveBeenCalledWith(
      "en-US",
    );
  });
});
