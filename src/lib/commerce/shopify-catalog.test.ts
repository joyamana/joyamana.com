import { afterEach, describe, expect, it, vi } from "vitest";

const shopifyFetchMock = vi.hoisted(() => vi.fn());

vi.mock("./shopify", () => ({ shopifyFetch: shopifyFetchMock }));

import {
  type ShopifyProductNode,
  getShopifyCollection,
  getShopifyCollections,
  getShopifyProduct,
  getShopifyProducts,
  mapShopifyProduct,
  searchShopifyProducts,
  SHOPIFY_COLLECTION_QUERY,
  SHOPIFY_COLLECTIONS_QUERY,
  SHOPIFY_PRODUCT_QUERY,
  SHOPIFY_PRODUCT_VARIANTS_QUERY,
  SHOPIFY_PRODUCTS_QUERY,
  SHOPIFY_SEARCH_QUERY,
  ShopifyCatalogError,
} from "./shopify-catalog";

function connection<T>(
  nodes: T[],
  hasNextPage = false,
  endCursor: string | null = null,
) {
  return {
    nodes,
    pageInfo: { hasNextPage, endCursor },
  };
}

function productFixture(): ShopifyProductNode {
  return {
    id: "gid://shopify/Product/1",
    handle: "seven-chakra-bracelet",
    title: "Seven-Chakra Bracelet",
    description: "A translated storefront description.",
    availableForSale: true,
    seo: {
      title: "Seven-Chakra Bracelet SEO",
      description: "Storefront SEO description.",
    },
    featuredImage: {
      url: "https://cdn.shopify.com/featured.jpg",
      altText: "Featured bracelet",
      width: 1200,
      height: 1200,
    },
    images: {
      nodes: [
        {
          url: "https://cdn.shopify.com/one.jpg",
          altText: "Front view",
          width: 1200,
          height: 1200,
        },
        {
          url: "https://cdn.shopify.com/two.jpg",
          altText: null,
          width: 900,
          height: 1200,
        },
      ],
    },
    priceRange: {
      minVariantPrice: { amount: "68.50", currencyCode: "USD" },
      maxVariantPrice: { amount: "72.00", currencyCode: "USD" },
    },
    variants: {
      nodes: [
        {
          id: "gid://shopify/ProductVariant/11",
          title: "Obsidian",
          availableForSale: true,
          price: { amount: "68.50", currencyCode: "USD" },
          compareAtPrice: { amount: "75.00", currencyCode: "USD" },
          image: null,
          selectedOptions: [{ name: "Main stone", value: "Obsidian" }],
          quantityRule: { minimum: 1, maximum: null, increment: 1 },
        },
      ],
      pageInfo: { hasNextPage: false, endCursor: null },
    },
  };
}

function secondProductFixture() {
  const product = productFixture();
  return {
    ...product,
    id: "gid://shopify/Product/2",
    handle: "clear-quartz-bracelet",
    title: "Clear Quartz Bracelet",
    variants: {
      ...product.variants,
      nodes: product.variants.nodes.map((variant) => ({
        ...variant,
        id: "gid://shopify/ProductVariant/22",
        title: "Clear Quartz",
      })),
    },
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("Shopify catalog mapper and queries", () => {
  it("keeps MoneyV2 strings, all product images, and variant selections", () => {
    const product = mapShopifyProduct(productFixture());

    expect(product).toMatchObject({
      source: "shopify",
      title: "Seven-Chakra Bracelet",
      priceRange: {
        minVariantPrice: { amount: "68.50", currencyCode: "USD" },
        maxVariantPrice: { amount: "72.00", currencyCode: "USD" },
      },
      compareAtPrice: { amount: "75.00", currencyCode: "USD" },
      featuredImage: {
        url: "https://cdn.shopify.com/featured.jpg",
        width: 1200,
        height: 1200,
      },
    });
    expect(product.images).toHaveLength(2);
    expect(product.images[1]?.altText).toBe("Seven-Chakra Bracelet");
    expect(product.variants[0]).toMatchObject({
      price: { amount: "68.50", currencyCode: "USD" },
      availableForSale: true,
      selectedOptions: [{ name: "Main stone", value: "Obsidian" }],
      image: { url: "https://cdn.shopify.com/featured.jpg" },
      quantityRule: { minimum: 1, maximum: null, increment: 1 },
    });
    expect(product).not.toHaveProperty("facts");
  });

  it.each([
    { amount: "68.50", currencyCode: "USD" },
    { amount: "60.00", currencyCode: "USD" },
  ])(
    "does not present an invalid compare-at price as a discount: $amount $currencyCode",
    (compareAtPrice) => {
      const fixture = productFixture();
      fixture.variants.nodes[0].compareAtPrice = compareAtPrice;

      const product = mapShopifyProduct(fixture);

      expect(product.variants[0].compareAtPrice).toBeNull();
      expect(product.compareAtPrice).toBeNull();
    },
  );

  it("paginates all products with US Spanish context and no runtime caching", async () => {
    shopifyFetchMock
      .mockResolvedValueOnce({
        products: connection([productFixture()], true, "products-page-1"),
      })
      .mockResolvedValueOnce({
        products: connection([secondProductFixture()]),
      });

    await expect(getShopifyProducts("es-US")).resolves.toHaveLength(2);

    expect(SHOPIFY_PRODUCTS_QUERY).toContain(
      "@inContext(country: $country, language: $language)",
    );
    expect(SHOPIFY_PRODUCTS_QUERY).toContain("images(first: 10)");
    expect(SHOPIFY_PRODUCTS_QUERY).toContain("pageInfo");
    expect(SHOPIFY_PRODUCTS_QUERY).toContain("quantityRule");
    expect(shopifyFetchMock).toHaveBeenNthCalledWith(
      1,
      SHOPIFY_PRODUCTS_QUERY,
      { country: "US", language: "ES", first: 100, after: null },
      { cache: "no-store" },
    );
    expect(shopifyFetchMock).toHaveBeenNthCalledWith(
      2,
      SHOPIFY_PRODUCTS_QUERY,
      {
        country: "US",
        language: "ES",
        first: 100,
        after: "products-page-1",
      },
      { cache: "no-store" },
    );
  });

  it("paginates every variant for a single product", async () => {
    const firstPage = productFixture();
    firstPage.variants.pageInfo = {
      hasNextPage: true,
      endCursor: "variants-page-1",
    };
    const secondVariant = {
      ...firstPage.variants.nodes[0],
      id: "gid://shopify/ProductVariant/12",
      title: "Quartz",
      quantityRule: { minimum: 2, maximum: 10, increment: 2 },
    };
    shopifyFetchMock
      .mockResolvedValueOnce({ product: firstPage })
      .mockResolvedValueOnce({
        product: {
          id: firstPage.id,
          variants: connection([secondVariant]),
        },
      });

    const product = await getShopifyProduct(firstPage.handle, "en-US");

    expect(product?.variants).toHaveLength(2);
    expect(product?.variants[1]?.quantityRule).toEqual({
      minimum: 2,
      maximum: 10,
      increment: 2,
    });
    expect(SHOPIFY_PRODUCT_QUERY).toContain("pageInfo");
    expect(SHOPIFY_PRODUCT_VARIANTS_QUERY).toContain(
      "variants(first: $first, after: $after)",
    );
    expect(shopifyFetchMock).toHaveBeenNthCalledWith(
      2,
      SHOPIFY_PRODUCT_VARIANTS_QUERY,
      {
        country: "US",
        language: "EN",
        id: firstPage.id,
        first: 100,
        after: "variants-page-1",
      },
      { cache: "no-store" },
    );
  });

  it("returns only collections that contain Storefront-visible products", async () => {
    shopifyFetchMock
      .mockResolvedValueOnce({
        collections: connection(
          [
            {
              id: "gid://shopify/Collection/empty",
              handle: "empty",
              title: "Empty",
              description: "",
              seo: { title: null, description: null },
              image: null,
              products: { nodes: [] },
            },
          ],
          true,
          "collections-page-1",
        ),
      })
      .mockResolvedValueOnce({
        collections: connection([
          {
            id: "gid://shopify/Collection/real",
            handle: "seven-chakra",
            title: "Seven Chakra",
            description: "A real collection.",
            seo: { title: null, description: null },
            image: {
              url: "https://cdn.shopify.com/collection.jpg",
              altText: null,
              width: 1600,
              height: 900,
            },
            products: { nodes: [{ id: "gid://shopify/Product/1" }] },
          },
        ]),
      });

    await expect(getShopifyCollections("en-US")).resolves.toEqual([
      expect.objectContaining({
        handle: "seven-chakra",
        title: "Seven Chakra",
        source: "shopify",
        image: expect.objectContaining({
          altText: "Seven Chakra",
          width: 1600,
          height: 900,
        }),
      }),
    ]);
    expect(shopifyFetchMock).toHaveBeenNthCalledWith(
      1,
      SHOPIFY_COLLECTIONS_QUERY,
      { country: "US", language: "EN", first: 100, after: null },
      { cache: "no-store" },
    );
    expect(shopifyFetchMock).toHaveBeenNthCalledWith(
      2,
      SHOPIFY_COLLECTIONS_QUERY,
      {
        country: "US",
        language: "EN",
        first: 100,
        after: "collections-page-1",
      },
      { cache: "no-store" },
    );
  });

  it("treats an empty collection as unavailable", async () => {
    shopifyFetchMock.mockResolvedValueOnce({
      collection: {
        id: "gid://shopify/Collection/empty",
        handle: "empty",
        title: "Empty",
        description: "",
        seo: { title: null, description: null },
        image: null,
        products: connection([]),
      },
    });

    await expect(getShopifyCollection("empty", "en-US")).resolves.toBeNull();
  });

  it("paginates all products assigned to one collection", async () => {
    const collection = {
      id: "gid://shopify/Collection/real",
      handle: "bracelets",
      title: "Bracelets",
      description: "A real collection.",
      seo: { title: null, description: null },
      image: null,
      products: connection(
        [productFixture()],
        true,
        "collection-products-page-1",
      ),
    };
    shopifyFetchMock
      .mockResolvedValueOnce({ collection })
      .mockResolvedValueOnce({
        collection: {
          ...collection,
          products: connection([secondProductFixture()]),
        },
      });

    const result = await getShopifyCollection("bracelets", "es-US");

    expect(result?.products).toHaveLength(2);
    expect(SHOPIFY_COLLECTION_QUERY).toContain(
      "products(first: $first, after: $after)",
    );
    expect(shopifyFetchMock).toHaveBeenNthCalledWith(
      2,
      SHOPIFY_COLLECTION_QUERY,
      {
        country: "US",
        language: "ES",
        handle: "bracelets",
        first: 100,
        after: "collection-products-page-1",
      },
      { cache: "no-store" },
    );
  });

  it("rejects a missing pagination cursor instead of silently truncating", async () => {
    shopifyFetchMock.mockResolvedValueOnce({
      products: connection([productFixture()], true, null),
    });

    await expect(getShopifyProducts("en-US")).rejects.toMatchObject({
      name: "ShopifyCatalogError",
      kind: "invalid-data",
      message: expect.stringContaining("missing or repeated cursor"),
    });
    expect(shopifyFetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects a repeated pagination cursor instead of looping", async () => {
    shopifyFetchMock
      .mockResolvedValueOnce({
        products: connection([productFixture()], true, "repeated-cursor"),
      })
      .mockResolvedValueOnce({
        products: connection(
          [secondProductFixture()],
          true,
          "repeated-cursor",
        ),
      });

    await expect(getShopifyProducts("en-US")).rejects.toMatchObject({
      name: "ShopifyCatalogError",
      kind: "invalid-data",
      message: expect.stringContaining("missing or repeated cursor"),
    });
    expect(shopifyFetchMock).toHaveBeenCalledTimes(2);
  });

  it("uses Shopify full-text product search rather than the mock catalog", async () => {
    shopifyFetchMock
      .mockResolvedValueOnce({
        search: connection(
          [{ __typename: "Product", ...productFixture() }],
          true,
          "search-page-1",
        ),
      })
      .mockResolvedValueOnce({
        search: connection([
          { __typename: "Product", ...secondProductFixture() },
        ]),
      });

    await expect(
      searchShopifyProducts("  obsidian bracelet  ", "en-US"),
    ).resolves.toHaveLength(2);
    expect(SHOPIFY_SEARCH_QUERY).toContain(
      "search(first: $first, after: $after, query: $query, types: [PRODUCT])",
    );
    expect(shopifyFetchMock).toHaveBeenNthCalledWith(
      1,
      SHOPIFY_SEARCH_QUERY,
      {
        country: "US",
        language: "EN",
        query: "obsidian bracelet",
        first: 24,
        after: null,
      },
      { cache: "no-store" },
    );
    expect(shopifyFetchMock).toHaveBeenNthCalledWith(
      2,
      SHOPIFY_SEARCH_QUERY,
      {
        country: "US",
        language: "EN",
        query: "obsidian bracelet",
        first: 24,
        after: "search-page-1",
      },
      { cache: "no-store" },
    );
  });

  it("rejects planned locales before making a Shopify request", async () => {
    await expect(getShopifyProducts("en-CA")).rejects.toEqual(
      expect.objectContaining<Partial<ShopifyCatalogError>>({
        name: "ShopifyCatalogError",
        kind: "unsupported-locale",
      }),
    );
    expect(shopifyFetchMock).not.toHaveBeenCalled();
  });

  it.each(["CAD", "EUR"])(
    "rejects %s outside the enabled US USD context instead of coercing it",
    (currencyCode) => {
      const fixture = productFixture();
      fixture.variants.nodes[0].price.currencyCode = currencyCode;

      expect(() => mapShopifyProduct(fixture)).toThrowError(
        expect.objectContaining<Partial<ShopifyCatalogError>>({
          name: "ShopifyCatalogError",
          kind: "invalid-data",
        }),
      );
    },
  );

  it("rejects a compare-at currency outside the enabled US USD context", () => {
    const fixture = productFixture();
    fixture.variants.nodes[0].compareAtPrice = {
      amount: "99.00",
      currencyCode: "CAD",
    };

    expect(() => mapShopifyProduct(fixture)).toThrowError(
      expect.objectContaining<Partial<ShopifyCatalogError>>({
        name: "ShopifyCatalogError",
        kind: "invalid-data",
      }),
    );
  });

  it("rejects an invalid contextual quantity rule", () => {
    const fixture = productFixture();
    fixture.variants.nodes[0].quantityRule = {
      minimum: 2,
      maximum: 3,
      increment: 2,
    };

    expect(() => mapShopifyProduct(fixture)).toThrowError(
      expect.objectContaining<Partial<ShopifyCatalogError>>({
        name: "ShopifyCatalogError",
        kind: "invalid-data",
      }),
    );
  });
});
