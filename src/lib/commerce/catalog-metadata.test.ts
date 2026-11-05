import { afterEach, describe, expect, it, vi } from "vitest";

const catalog = vi.hoisted(() => ({
  getProducts: vi.fn(),
  getCollections: vi.fn(),
  getCollection: vi.fn(),
}));
vi.mock("./catalog", () => catalog);
vi.mock("@/config/site", () => ({
  siteConfig: { url: "https://www.joyamana.com", indexable: true },
  isIndexingEnabledFor: () => true,
}));

import {
  buildCatalogHubMetadata,
  buildCollectionMetadata,
} from "./catalog-metadata";
import type { ProductCollection } from "./types";

const collection: ProductCollection = {
  id: "gid://shopify/Collection/1",
  handle: "mineral-specimens",
  title: "Mineral Specimens",
  description: "Discover the natural forms of our mineral specimens.",
  hasProducts: true,
  image: null,
  products: [],
};

afterEach(() => vi.resetAllMocks());

describe.each(["en-US", "zh-Hant-US"] as const)("%s catalog hubs", (locale) => {
  it.each(["/shop", "/collections"] as const)(
    "keeps %s out of indexing when empty or unavailable",
    async (path) => {
      const source =
        path === "/shop" ? catalog.getProducts : catalog.getCollections;
      const args = { locale, path, title: "Catalog", description: "Browse." };
      source
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(new Error("Unavailable"));
      for (let attempt = 0; attempt < 2; attempt++) {
        const result = await buildCatalogHubMetadata(args);
        expect(result.robots).toMatchObject({ index: false });
        expect(result.alternates).toBeUndefined();
      }
      source.mockResolvedValue([{ handle: "published" }]);
      expect((await buildCatalogHubMetadata(args)).robots).toMatchObject({
        index: true,
      });
      expect(
        (
          await buildCatalogHubMetadata({
            ...args,
            searchParams: { color: "blue" },
          })
        ).robots,
      ).toMatchObject({ index: false });
    },
  );
});

describe("collection metadata", () => {
  it("includes an empty collection in hub readiness without advertising unavailable languages", async () => {
    catalog.getCollections.mockImplementation(async (_market, locale) =>
      locale === "en-US" ? [{ ...collection, hasProducts: false }] : [],
    );
    const result = await buildCatalogHubMetadata({
      locale: "en-US",
      path: "/collections",
      title: "Collections",
      description: "Browse all collections.",
    });
    expect(result.robots).toMatchObject({ index: true });
    expect(result.alternates?.languages).toEqual({
      "en-US": "https://www.joyamana.com/collections",
    });
  });

  it.each([
    ["missing", null],
    ["empty", { ...collection, hasProducts: false }],
    ["undescribed", { ...collection, description: " ", seoDescription: " " }],
  ])("keeps a %s collection out of indexing", async (_label, data) => {
    catalog.getCollection.mockResolvedValue(data);
    const result = await buildCollectionMetadata({
      handle: collection.handle,
      locale: "en-US",
    });
    expect(result.robots).toMatchObject({ index: false });
    expect(result.alternates).toBeUndefined();
    expect(catalog.getCollection).toHaveBeenCalledOnce();
  });

  it("publishes clean canonical and hreflang for independently ready language versions", async () => {
    catalog.getCollection.mockResolvedValue({
      ...collection,
      seoTitle: "Mineral Collection",
      seoDescription: "Explore our specimens.",
    });
    const result = await buildCollectionMetadata({
      handle: collection.handle,
      locale: "en-US",
    });
    expect(result.title).toBe("Mineral Collection");
    expect(result.description).toBe("Explore our specimens.");
    expect(result.robots).toMatchObject({ index: true });
    expect(result.alternates?.canonical).toBe(
      "https://www.joyamana.com/collections/mineral-specimens",
    );
    expect(result.alternates?.languages).toMatchObject({
      "en-US": "https://www.joyamana.com/collections/mineral-specimens",
      "zh-Hant-US":
        "https://www.joyamana.com/zh-hant-us/collections/mineral-specimens",
    });
  });

  it.each([
    ["empty", { ...collection, hasProducts: false }],
    ["undescribed", { ...collection, description: " " }],
    ["missing", null],
  ])(
    "omits a %s translated counterpart from hreflang",
    async (_label, translated) => {
      catalog.getCollection.mockImplementation(
        async (_handle, _market, locale) =>
          locale === "en-US" ? collection : translated,
      );
      const result = await buildCollectionMetadata({
        handle: collection.handle,
        locale: "en-US",
      });
      expect(result.alternates?.languages).not.toHaveProperty("zh-Hant-US");
      expect(result.robots).toMatchObject({ index: true });
    },
  );

  it("keeps filters noindex with a clean canonical and without hreflang", async () => {
    catalog.getCollection.mockResolvedValue(collection);
    const result = await buildCollectionMetadata({
      handle: collection.handle,
      locale: "zh-Hant-US",
      searchParams: { color: "blue", sort: "price-asc" },
    });
    expect(result.robots).toMatchObject({ index: false });
    expect(result.alternates?.canonical).toBe(
      "https://www.joyamana.com/zh-hant-us/collections/mineral-specimens",
    );
    expect(result.alternates?.languages).toBeUndefined();
    expect(catalog.getCollection).toHaveBeenCalledOnce();
  });
});
