import { afterEach, describe, expect, it, vi } from "vitest";

const shopifyFetchMock = vi.hoisted(() => vi.fn());

vi.mock("./shopify", () => ({ shopifyFetch: shopifyFetchMock }));

import {
  getShopifyCatalogNavigation,
  getShopifyCollection,
  getShopifyCollections,
  getShopifyProduct,
  getShopifyProductRecommendations,
  getShopifyProducts,
  hydrateShopifyBrowseProducts,
  searchShopifyProducts,
  createCatalogReadBudget,
} from "./shopify-catalog";
import { mapShopifyProduct } from "./shopify-catalog-mappers";
import {
  type ShopifyProductNode,
  SHOPIFY_BROWSE_VARIANTS_QUERY,
  SHOPIFY_BROWSE_COLORS_QUERY,
  SHOPIFY_VARIANT_COLORS_QUERY,
  SHOPIFY_COLLECTION_QUERY,
  SHOPIFY_COLLECTIONS_QUERY,
  SHOPIFY_NAVIGATION_COLLECTIONS_QUERY,
  SHOPIFY_NAVIGATION_PRODUCTS_QUERY,
  SHOPIFY_PRODUCT_QUERY,
  SHOPIFY_PRODUCT_RECOMMENDATIONS_QUERY,
  SHOPIFY_PRODUCT_VARIANTS_QUERY,
  SHOPIFY_PRODUCTS_QUERY,
  SHOPIFY_SEARCH_QUERY,
  ShopifyCatalogError,
} from "./shopify-catalog-contract";

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

describe("complete catalog request budget", () => {
  afterEach(() => vi.restoreAllMocks());

  it("shares the request limit between base pages and variant hydration", async () => {
    const budget = createCatalogReadBudget();
    shopifyFetchMock.mockResolvedValue({
      products: connection([productFixture()]),
    });
    const products = await getShopifyProducts(
      "en-US",
      { cache: "no-store" },
      budget,
    );
    for (let request = 1; request < 100; request++)
      await budget.read("query", {});
    await expect(
      hydrateShopifyBrowseProducts(products, "en-US", budget),
    ).rejects.toMatchObject({ kind: "invalid-data" });
    expect(shopifyFetchMock).toHaveBeenCalledTimes(100);
  });

  it("uses the remaining total time for a request and stops at the deadline", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(0);
    const budget = createCatalogReadBudget();
    shopifyFetchMock.mockResolvedValue({});
    now.mockReturnValue(18_500);
    await budget.read("query", {});
    expect(shopifyFetchMock).toHaveBeenLastCalledWith(
      "query",
      {},
      expect.objectContaining({ timeoutMs: 1500 }),
    );
    now.mockReturnValue(20_000);
    expect(() => budget.read("query", {})).toThrow(ShopifyCatalogError);
    expect(shopifyFetchMock).toHaveBeenCalledTimes(1);
  });

  it("reads a full initial variant page on the PDP while keeping summary queries small", () => {
    expect(SHOPIFY_PRODUCT_QUERY).toContain("variants(first: 100,");
    expect(SHOPIFY_PRODUCTS_QUERY).not.toContain("variants(");
    for (const query of [
      SHOPIFY_PRODUCTS_QUERY,
      SHOPIFY_PRODUCT_RECOMMENDATIONS_QUERY,
      SHOPIFY_SEARCH_QUERY,
      SHOPIFY_COLLECTION_QUERY,
    ]) {
      expect(query).not.toMatch(
        /descriptionHtml|quantityRule|quantityAvailable|productModel|images\(/,
      );
      expect(query).toContain("priceRange");
    }
  });
});

it("reads Traditional Chinese products without changing country, money or hiding fallback", async () => {
  shopifyFetchMock.mockResolvedValueOnce({
    products: connection([productFixture()]),
  });
  const products = await getShopifyProducts("zh-Hant-US");
  expect(products[0].title).toBe("Seven-Chakra Bracelet");
  expect(products[0].priceRange.minVariantPrice.currencyCode).toBe("USD");
  expect(shopifyFetchMock).toHaveBeenCalledWith(
    SHOPIFY_PRODUCTS_QUERY,
    expect.objectContaining({ country: "US", language: "ZH_TW" }),
    expect.objectContaining({ cache: "no-store" }),
  );
});

function productFixture(): ShopifyProductNode {
  return {
    id: "gid://shopify/Product/1",
    handle: "seven-chakra-bracelet",
    title: "Seven-Chakra Bracelet",
    description: "A translated storefront description.",
    descriptionHtml:
      '<h2 onclick="bad()">Details</h2><p>A <strong>translated</strong> description.</p><ul><li>Natural stone</li></ul><script>alert(1)</script>',
    availableForSale: true,
    productModel: { value: "standard" },
    category: {
      id: "gid://shopify/TaxonomyCategory/aa-6-3",
      name: "Bracelets",
    },
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
          currentlyNotInStock: false,
          quantityAvailable: 1,
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

describe("Shopify related product summaries", () => {
  it("uses the requested US language and bounded no-store RELATED query, preserving relevance", async () => {
    shopifyFetchMock.mockResolvedValueOnce({
      productRecommendations: [secondProductFixture(), productFixture()],
    });
    const products = await getShopifyProductRecommendations(
      " bracelet ",
      "zh-Hant-US",
    );
    expect(products.map((product) => product.id)).toEqual([
      "gid://shopify/Product/2",
      "gid://shopify/Product/1",
    ]);
    expect(products[0]).not.toHaveProperty("variants");
    expect(products[0].priceRange.minVariantPrice.currencyCode).toBe("USD");
    expect(shopifyFetchMock).toHaveBeenCalledWith(
      SHOPIFY_PRODUCT_RECOMMENDATIONS_QUERY,
      { country: "US", language: "ZH_TW", handle: "bracelet" },
      expect.objectContaining({ cache: "no-store", timeoutMs: 10_000 }),
    );
    expect(SHOPIFY_PRODUCT_RECOMMENDATIONS_QUERY).toContain("intent: RELATED");
  });

  it.each([null, []])(
    "accepts an empty recommendation result: %j",
    async (result) => {
      shopifyFetchMock.mockResolvedValueOnce({
        productRecommendations: result,
      });
      await expect(
        getShopifyProductRecommendations("bracelet", "en-US"),
      ).resolves.toEqual([]);
    },
  );

  it.each([
    {},
    { productRecommendations: {} },
    { productRecommendations: [productFixture(), productFixture()] },
    { productRecommendations: [null] },
  ])(
    "rejects malformed or duplicate recommendation data: %j",
    async (result) => {
      shopifyFetchMock.mockResolvedValueOnce(result);
      await expect(
        getShopifyProductRecommendations("bracelet", "en-US"),
      ).rejects.toMatchObject({ kind: "invalid-data" });
    },
  );

  it("rejects recommendations outside the USD context", async () => {
    const product = secondProductFixture();
    product.priceRange.minVariantPrice.currencyCode = "CAD";
    shopifyFetchMock.mockResolvedValueOnce({
      productRecommendations: [product],
    });
    await expect(
      getShopifyProductRecommendations("bracelet", "en-US"),
    ).rejects.toMatchObject({ kind: "invalid-data" });
  });

  it("does not send blank handles or disabled languages to Shopify", async () => {
    await expect(
      getShopifyProductRecommendations(" ", "en-US"),
    ).resolves.toEqual([]);
    await expect(
      getShopifyProductRecommendations("bracelet", "es-US"),
    ).rejects.toMatchObject({ kind: "unsupported-locale" });
    expect(shopifyFetchMock).not.toHaveBeenCalled();
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("complete browsing variants", () => {
  it("reads a light first batch and every subsequent variant page", async () => {
    const fixture = productFixture();
    const laterVariant = {
      ...fixture.variants.nodes[0],
      id: "gid://shopify/ProductVariant/12",
      colors: { type: "list.single_line_text_field", value: '["Purple"]' },
    };
    shopifyFetchMock
      .mockResolvedValueOnce({
        nodes: [
          {
            id: fixture.id,
            variants: connection(fixture.variants.nodes, true, "next"),
          },
        ],
      })
      .mockResolvedValueOnce({
        product: { id: fixture.id, variants: connection([laterVariant]) },
      });
    const [item] = await hydrateShopifyBrowseProducts(
      [mapShopifyProduct(fixture)],
      "en-US",
    );
    expect(item.variants).toHaveLength(2);
    expect(item.variants[1]).toMatchObject({
      colors: ["Purple"],
      displayOrder: 1,
    });
    expect(SHOPIFY_BROWSE_VARIANTS_QUERY).not.toContain("descriptionHtml");
    expect(shopifyFetchMock).toHaveBeenCalledWith(
      SHOPIFY_BROWSE_VARIANTS_QUERY,
      expect.objectContaining({ ids: [fixture.id], language: "EN" }),
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("preserves localized option titles but uses default-language color identities", async () => {
    const fixture = productFixture();
    const local = {
      ...fixture.variants.nodes[0],
      title: "紫水晶",
      colors: { type: "list.single_line_text_field", value: '["紫色"]' },
    };
    const canonical = {
      id: local.id,
      colors: { type: "list.single_line_text_field", value: '["Purple"]' },
    };
    shopifyFetchMock
      .mockResolvedValueOnce({
        nodes: [{ id: fixture.id, variants: connection([local]) }],
      })
      .mockResolvedValueOnce({
        nodes: [{ id: fixture.id, variants: connection([canonical]) }],
      });
    const [item] = await hydrateShopifyBrowseProducts(
      [mapShopifyProduct(fixture)],
      "zh-Hant-US",
    );
    expect(item.variants[0]).toMatchObject({
      title: "紫水晶",
      colors: ["Purple"],
    });
    expect(shopifyFetchMock.mock.calls.map((call) => call[1].language)).toEqual(
      ["ZH_TW", "EN"],
    );
  });

  it("completes default-language color pages without rereading prices or inventory", async () => {
    const fixture = productFixture();
    const first = {
      ...fixture.variants.nodes[0],
      colors: { type: "list.single_line_text_field", value: '["Purple"]' },
    };
    const second = { ...first, id: "gid://shopify/ProductVariant/2" };
    shopifyFetchMock
      .mockResolvedValueOnce({
        nodes: [{ id: fixture.id, variants: connection([first, second]) }],
      })
      .mockResolvedValueOnce({
        nodes: [
          {
            id: fixture.id,
            variants: connection(
              [{ id: first.id, colors: first.colors }],
              true,
              "colors-page-1",
            ),
          },
        ],
      })
      .mockResolvedValueOnce({
        product: {
          id: fixture.id,
          variants: connection([{ id: second.id, colors: second.colors }]),
        },
      });
    const [item] = await hydrateShopifyBrowseProducts(
      [mapShopifyProduct(fixture)],
      "zh-Hant-US",
    );
    expect(item.variants.map((variant) => variant.id)).toEqual([
      first.id,
      second.id,
    ]);
    expect(shopifyFetchMock).toHaveBeenNthCalledWith(
      2,
      SHOPIFY_BROWSE_COLORS_QUERY,
      expect.objectContaining({ language: "EN" }),
      expect.any(Object),
    );
    expect(shopifyFetchMock).toHaveBeenNthCalledWith(
      3,
      SHOPIFY_VARIANT_COLORS_QUERY,
      expect.objectContaining({ language: "EN", after: "colors-page-1" }),
      expect.any(Object),
    );
    for (const query of [
      SHOPIFY_BROWSE_COLORS_QUERY,
      SHOPIFY_VARIANT_COLORS_QUERY,
    ])
      expect(query).not.toMatch(/price|quantity|image|selectedOptions/);
  });

  it("fails closed if a product disappears or pagination repeats", async () => {
    const fixture = productFixture();
    shopifyFetchMock.mockResolvedValueOnce({ nodes: [null] });
    await expect(
      hydrateShopifyBrowseProducts([mapShopifyProduct(fixture)], "en-US"),
    ).rejects.toThrow(ShopifyCatalogError);
    shopifyFetchMock
      .mockResolvedValueOnce({
        nodes: [
          {
            id: fixture.id,
            variants: connection(fixture.variants.nodes, true, "next"),
          },
        ],
      })
      .mockResolvedValueOnce({
        product: {
          id: fixture.id,
          variants: connection(fixture.variants.nodes),
        },
      });
    await expect(
      hydrateShopifyBrowseProducts([mapShopifyProduct(fixture)], "en-US"),
    ).rejects.toThrow(ShopifyCatalogError);
  });
});

describe("Shopify catalog mapper and queries", () => {
  it("keeps MoneyV2 strings, all product images, and variant selections", () => {
    const product = mapShopifyProduct(productFixture());

    expect(product).toMatchObject({
      title: "Seven-Chakra Bracelet",
      descriptionHtml:
        "<h2>Details</h2><p>A <strong>translated</strong> description.</p><ul><li>Natural stone</li></ul>",
      priceRange: {
        minVariantPrice: { amount: "68.50", currencyCode: "USD" },
        maxVariantPrice: { amount: "72.00", currencyCode: "USD" },
      },
      model: "standard",
      category: {
        id: "gid://shopify/TaxonomyCategory/aa-6-3",
        name: "Bracelets",
      },
      featuredImage: {
        url: "https://cdn.shopify.com/featured.jpg",
        width: 1200,
        height: 1200,
      },
    });
    expect(product.descriptionHtml).not.toContain("onclick");
    expect(product.descriptionHtml).not.toContain("<script");
    expect(product.images).toHaveLength(2);
    expect(product.images[1]?.altText).toBe("Seven-Chakra Bracelet");
    expect(product.variants[0]).toMatchObject({
      price: { amount: "68.50", currencyCode: "USD" },
      availableForSale: true,
      currentlyNotInStock: false,
      quantityAvailable: 1,
      selectedOptions: [{ name: "Main stone", value: "Obsidian" }],
      image: null,
      quantityRule: { minimum: 1, maximum: null, increment: 1 },
    });
    expect(product).not.toHaveProperty("facts");
  });

  it.each([
    ["standard", "standard"],
    ["natural_variation", "natural-variation"],
    ["one_of_one", "one-of-one"],
  ] as const)("maps product model %s to %s", (value, expected) => {
    const fixture = productFixture();
    fixture.productModel = { value };

    expect(mapShopifyProduct(fixture).model).toBe(expected);
  });

  it("fails closed when the product model is missing or unsupported", () => {
    const fixture = productFixture();
    fixture.productModel = { value: "limited" };
    expect(mapShopifyProduct(fixture).model).toBeUndefined();

    fixture.productModel = null;
    expect(mapShopifyProduct(fixture).model).toBeUndefined();
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
    },
  );

  it("paginates all products with US Chinese context and no runtime caching", async () => {
    shopifyFetchMock
      .mockResolvedValueOnce({
        products: connection([productFixture()], true, "products-page-1"),
      })
      .mockResolvedValueOnce({
        products: connection([secondProductFixture()]),
      });

    await expect(getShopifyProducts("zh-Hant-US")).resolves.toHaveLength(2);

    expect(SHOPIFY_PRODUCTS_QUERY).toContain(
      "@inContext(country: $country, language: $language)",
    );
    expect(SHOPIFY_PRODUCTS_QUERY).not.toContain("images(first: 10)");
    expect(SHOPIFY_PRODUCTS_QUERY).toContain("pageInfo");
    expect(SHOPIFY_PRODUCTS_QUERY).not.toContain("quantityRule");
    expect(SHOPIFY_PRODUCTS_QUERY).not.toContain("quantityAvailable");
    expect(SHOPIFY_PRODUCTS_QUERY).not.toContain("descriptionHtml");
    expect(SHOPIFY_PRODUCTS_QUERY).not.toContain("productModel:");
    expect(shopifyFetchMock).toHaveBeenNthCalledWith(
      1,
      SHOPIFY_PRODUCTS_QUERY,
      { country: "US", language: "ZH_TW", first: 100, after: null },
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(shopifyFetchMock).toHaveBeenNthCalledWith(
      2,
      SHOPIFY_PRODUCTS_QUERY,
      {
        country: "US",
        language: "ZH_TW",
        first: 100,
        after: "products-page-1",
      },
      expect.objectContaining({ cache: "no-store" }),
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
      "variants(first: $first, after: $after, sortKey: POSITION, reverse: false)",
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
      expect.objectContaining({ cache: "no-store" }),
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
              collectionKind: null,
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
            collectionKind: { value: "design_series" },
            products: { nodes: [{ id: "gid://shopify/Product/1" }] },
          },
        ]),
      });

    await expect(getShopifyCollections("en-US")).resolves.toEqual([
      expect.objectContaining({
        handle: "seven-chakra",
        title: "Seven Chakra",
        kind: "design_series",
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
      expect.objectContaining({ cache: "no-store" }),
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
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("loads Header navigation through dedicated minimal paginated queries", async () => {
    const fetchOptions = {
      buyerIp: null,
      cache: "force-cache" as const,
      revalidate: 300,
      tags: ["shopify-catalog-navigation"],
    };
    shopifyFetchMock
      .mockResolvedValueOnce({
        products: connection([
          {
            id: "gid://shopify/Product/1",
            category: { id: "gid://shopify/TaxonomyCategory/aa-6-3" },
          },
          {
            id: "gid://shopify/Product/2",
            category: { id: "gid://shopify/TaxonomyCategory/aa-6-3" },
          },
        ]),
      })
      .mockResolvedValueOnce({
        collections: connection([
          {
            id: "gid://shopify/Collection/1",
            handle: "patron-saint",
            title: "Patron Saint",
            collectionKind: { value: "design_series" },
            products: { nodes: [{ id: "gid://shopify/Product/1" }] },
          },
          {
            id: "gid://shopify/Collection/empty",
            handle: "empty",
            title: "Empty",
            collectionKind: { value: "design_series" },
            products: { nodes: [] },
          },
        ]),
      });

    await expect(
      getShopifyCatalogNavigation("en-US", fetchOptions),
    ).resolves.toEqual({
      productCategoryIds: ["gid://shopify/TaxonomyCategory/aa-6-3"],
      collections: [
        {
          handle: "patron-saint",
          title: "Patron Saint",
          kind: "design_series",
        },
      ],
    });

    expect(SHOPIFY_NAVIGATION_PRODUCTS_QUERY).toContain("category { id }");
    expect(SHOPIFY_NAVIGATION_PRODUCTS_QUERY).not.toContain("priceRange");
    expect(SHOPIFY_NAVIGATION_PRODUCTS_QUERY).not.toContain("availableForSale");
    expect(SHOPIFY_NAVIGATION_COLLECTIONS_QUERY).not.toContain("description");
    expect(SHOPIFY_NAVIGATION_COLLECTIONS_QUERY).not.toContain("image {");
    expect(shopifyFetchMock).toHaveBeenNthCalledWith(
      1,
      SHOPIFY_NAVIGATION_PRODUCTS_QUERY,
      { country: "US", language: "EN", first: 250, after: null },
      expect.objectContaining(fetchOptions),
    );
    expect(shopifyFetchMock).toHaveBeenNthCalledWith(
      2,
      SHOPIFY_NAVIGATION_COLLECTIONS_QUERY,
      { country: "US", language: "EN", first: 100, after: null },
      expect.objectContaining(fetchOptions),
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
        collectionKind: null,
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
      collectionKind: { value: "category" },
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

    const result = await getShopifyCollection("bracelets", "zh-Hant-US");

    expect(result?.products).toHaveLength(2);
    expect(result?.kind).toBe("category");
    expect(SHOPIFY_COLLECTION_QUERY).toContain(
      "products(first: $first, after: $after)",
    );
    expect(shopifyFetchMock).toHaveBeenNthCalledWith(
      2,
      SHOPIFY_COLLECTION_QUERY,
      {
        country: "US",
        language: "ZH_TW",
        handle: "bracelets",
        first: 100,
        after: "collection-products-page-1",
      },
      expect.objectContaining({ cache: "no-store" }),
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
        products: connection([secondProductFixture()], true, "repeated-cursor"),
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
      expect.objectContaining({ cache: "no-store" }),
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
      expect.objectContaining({ cache: "no-store" }),
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

describe("negative Shopify inventory", () => {
  it("accepts sellable backorders without inventing stock", () => {
    const fixture = productFixture();
    fixture.variants.nodes[0].quantityAvailable = -1;
    fixture.variants.nodes[0].currentlyNotInStock = true;
    expect(mapShopifyProduct(fixture).variants[0]).toMatchObject({
      quantityAvailable: -1,
      currentlyNotInStock: true,
    });
  });
});
