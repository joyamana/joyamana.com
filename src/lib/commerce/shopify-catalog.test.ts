import { afterEach, describe, expect, it, vi } from "vitest";

const shopifyFetchMock = vi.hoisted(() => vi.fn());

vi.mock("./shopify", () => ({ shopifyFetch: shopifyFetchMock }));

import {
  type ShopifyProductNode,
  getShopifyCatalogNavigation,
  getShopifyCollection,
  getShopifyCollections,
  getShopifyProduct,
  getShopifyProducts,
  getShopifyAvailableProducts,
  getShopifyRelatedProducts,
  mapShopifyProduct,
  searchShopifyProducts,
  SHOPIFY_COLLECTION_QUERY,
  SHOPIFY_COLLECTIONS_QUERY,
  SHOPIFY_NAVIGATION_COLLECTIONS_QUERY,
  SHOPIFY_NAVIGATION_PRODUCTS_QUERY,
  SHOPIFY_PRODUCT_QUERY,
  SHOPIFY_PRODUCT_VARIANTS_QUERY,
  SHOPIFY_PRODUCTS_QUERY,
  SHOPIFY_AVAILABLE_PRODUCTS_QUERY,
  SHOPIFY_RELATED_PRODUCTS_QUERY,
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

it("reads Traditional Chinese products without changing country, money or hiding fallback", async () => {
  shopifyFetchMock.mockResolvedValueOnce({ products: connection([productFixture()]) });
  const products = await getShopifyProducts("zh-Hant-US");
  expect(products[0].title).toBe("Seven-Chakra Bracelet");
  expect(products[0].priceRange.minVariantPrice.currencyCode).toBe("USD");
  expect(shopifyFetchMock).toHaveBeenCalledWith(
    SHOPIFY_PRODUCTS_QUERY,
    expect.objectContaining({ country: "US", language: "ZH_TW" }),
    expect.objectContaining({cache: "no-store"}),
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

afterEach(() => {
  vi.clearAllMocks();
});

describe("Shopify catalog mapper and queries", () => {
  it("maps only typed Shopify knowledge and preserves variant overrides", () => {
    const node = productFixture();
    node.summary = { type: "single_line_text_field", value: "  A short description.  " };
    node.material = { type: "multi_line_text_field", value: "Quartz" };
    node.dimensions = { type: "single_line_text_field", value: "12 mm beads" };
    node.fit = { type: "single_line_text_field", value: "Fits approx. 16.5 cm wrist" };
    node.treatment = { type: "single_line_text_field", value: "Heat treated" };
    node.care = { type: "multi_line_text_field", value: "Wipe with a soft cloth." };
    node.packageContents = { type: "multi_line_text_field", value: "Bracelet and guidebook" };
    node.imageRepresentation = { type: "single_line_text_field", value: "representative" };
    node.variants.nodes[0].fit = { type: "single_line_text_field", value: "Fits approx. 18 cm wrist" };
    node.variants.nodes[0].material = { type: "single_line_text_field", value: "  " };

    const mapped = mapShopifyProduct(node);
    expect(mapped.facts).toEqual({
      summary: "A short description.",
      material: "Quartz",
      dimensions: "12 mm beads",
      fit: "Fits approx. 16.5 cm wrist",
      treatment: "Heat treated",
      care: "Wipe with a soft cloth.",
      packageContents: "Bracelet and guidebook",
      imageRepresentation: "representative",
    });
    expect(mapped.variants[0].facts).toEqual({ fit: "Fits approx. 18 cm wrist" });
    expect({ ...mapped.facts, ...mapped.variants[0].facts }).toMatchObject({
      material: "Quartz",
      fit: "Fits approx. 18 cm wrist",
      treatment: "Heat treated",
    });
    expect(SHOPIFY_PRODUCT_QUERY).toContain('key: "treatment") { type value }');
    expect(SHOPIFY_PRODUCT_VARIANTS_QUERY).toContain('key: "fit") { type value }');
  });

  it("omits missing, blank, incompatible and unknown knowledge without reading the description", () => {
    const node = productFixture();
    node.description = "Untreated quartz, 12 mm beads, shown exact item.";
    node.material = { type: "rich_text_field", value: '{"type":"root"}' };
    node.fit = { type: "number_integer", value: "16" };
    node.treatment = { type: "single_line_text_field", value: "  " };
    node.imageRepresentation = { type: "single_line_text_field", value: "probably-exact" };
    expect(mapShopifyProduct(node)).not.toHaveProperty("facts");
    node.imageRepresentation.value = "exact_item";
    expect(mapShopifyProduct(node).facts).toEqual({ imageRepresentation: "exact-item" });
  });

  it("maps related articles only into supported, nonempty storefront routes", () => {
    const node = productFixture();
    const article = {
      __typename: "Article",
      id: "gid://shopify/Article/1",
      title: "Quartz care",
      handle: "quartz-care",
      content: "Q",
      publishedAt: "2026-01-01T00:00:00Z",
      blog: { handle: "crystals" },
    };
    node.relatedContent = {
      type: "list.article_reference",
      references: { nodes: [
        article,
        article,
        { ...article, id: "gid://shopify/Article/2", blog: { handle: "unsupported" } },
        { ...article, id: "gid://shopify/Article/3", handle: "../admin" },
        { ...article, id: "gid://shopify/Article/4", content: "" },
        { ...article, id: "gid://shopify/Article/5", publishedAt: "invalid" },
        { __typename: "Product" },
      ] },
    };
    expect(mapShopifyProduct(node).facts?.relatedContent).toEqual([
      { id: article.id, title: "Quartz care", path: "/crystals/quartz-care" },
    ]);
    node.relatedContent.references = null;
    expect(mapShopifyProduct(node)).not.toHaveProperty("facts");
  });

  it("loads a bounded available selection without full product or variant payloads", async () => {
    shopifyFetchMock.mockResolvedValueOnce({
      products: connection([productFixture()], true, "unused-cursor"),
    });
    const products = await getShopifyAvailableProducts("zh-Hant-US", 4);
    expect(products).toHaveLength(1);
    expect(products[0]).not.toHaveProperty("variants");
    expect(products[0]).not.toHaveProperty("description");
    expect(shopifyFetchMock).toHaveBeenCalledTimes(1);
    expect(shopifyFetchMock).toHaveBeenCalledWith(
      SHOPIFY_AVAILABLE_PRODUCTS_QUERY,
      { country: "US", language: "ZH_TW", first: 4 },
      { cache: "no-store" },
    );
    expect(SHOPIFY_AVAILABLE_PRODUCTS_QUERY).toContain('query: "available_for_sale:true"');
    expect(SHOPIFY_AVAILABLE_PRODUCTS_QUERY).toContain("images(first: 1)");
    expect(SHOPIFY_AVAILABLE_PRODUCTS_QUERY).not.toContain("descriptionHtml");
    expect(SHOPIFY_AVAILABLE_PRODUCTS_QUERY).not.toContain("variants(");
  });

  it("keeps a genuine variant image when a product has no main image", async () => {
    const node = productFixture();
    const variantImage = node.images.nodes[0];
    node.featuredImage = null;
    node.images.nodes = [];
    node.variants.nodes[0].image = variantImage;
    expect(mapShopifyProduct(node).featuredImage?.url).toBe(variantImage.url);
    shopifyFetchMock.mockResolvedValueOnce({
      products: { nodes: [{ ...node, imageVariant: { image: variantImage } }] },
    });
    const selection = await getShopifyAvailableProducts("en-US");
    expect(selection[0].featuredImage?.url).toBe(variantImage.url);
  });

  it("uses Shopify recommendations without catalog-wide reads or invented fallback products", async () => {
    const source = productFixture();
    const related = secondProductFixture();
    shopifyFetchMock.mockResolvedValueOnce({ productRecommendations: [
      source, related, related, { ...related, id: "gid://shopify/Product/3", availableForSale: false },
    ] });
    await expect(getShopifyRelatedProducts(source.id, "es-US", 3)).resolves.toEqual([
      expect.objectContaining({ id: related.id }),
    ]);
    expect(shopifyFetchMock).toHaveBeenCalledTimes(1);
    expect(shopifyFetchMock).toHaveBeenCalledWith(
      SHOPIFY_RELATED_PRODUCTS_QUERY,
      { country: "US", language: "ES", productId: source.id },
      { cache: "no-store" },
    );
    expect(SHOPIFY_RELATED_PRODUCTS_QUERY).toContain("productRecommendations(productId: $productId, intent: RELATED)");
    shopifyFetchMock.mockResolvedValueOnce({ productRecommendations: null });
    await expect(getShopifyRelatedProducts(source.id, "es-US")).resolves.toEqual([]);
  });

  it("bounds selection sizes and rejects invalid recommendation identities before fetching", async () => {
    await expect(getShopifyAvailableProducts("en-US", 100)).rejects.toThrow(RangeError);
    await expect(getShopifyRelatedProducts("invalid", "en-US")).rejects.toThrow(ShopifyCatalogError);
    await expect(getShopifyRelatedProducts("gid://shopify/Product/1", "en-US", 11)).rejects.toThrow(RangeError);
    expect(shopifyFetchMock).not.toHaveBeenCalled();
  });

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
      compareAtPrice: { amount: "75.00", currencyCode: "USD" },
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
      image: { url: "https://cdn.shopify.com/featured.jpg" },
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
    expect(SHOPIFY_PRODUCTS_QUERY).toContain("quantityAvailable");
    expect(SHOPIFY_PRODUCTS_QUERY).toContain("descriptionHtml");
    expect(SHOPIFY_PRODUCTS_QUERY).toContain(
      'productModel: metafield(namespace: "custom", key: "product_model")',
    );
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
      fetchOptions,
    );
    expect(shopifyFetchMock).toHaveBeenNthCalledWith(
      2,
      SHOPIFY_NAVIGATION_COLLECTIONS_QUERY,
      { country: "US", language: "EN", first: 100, after: null },
      fetchOptions,
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

    const result = await getShopifyCollection("bracelets", "es-US");

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
