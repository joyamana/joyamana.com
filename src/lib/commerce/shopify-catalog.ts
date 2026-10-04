import { isEnabledLocale, shopifyContextForLocale } from "@/config/locales";
import type { Locale } from "@/lib/i18n/locales";
import { shopifyFetch, type ShopifyFetchOptions } from "./shopify";
import type {
  Collection,
  Product,
  ProductSummary,
  CatalogProduct,
  ProductCollection,
} from "./types";
import {
  optionalText,
  mapShopifyProduct,
  mapShopifyProductSummary,
  mapVariant,
  mapCollectionBase,
  mapCollectionKind,
} from "./shopify-catalog-mappers";
import {
  PRODUCT_PAGE_SIZE,
  COLLECTION_PAGE_SIZE,
  VARIANT_PAGE_SIZE,
  SEARCH_PAGE_SIZE,
  NAVIGATION_PRODUCT_PAGE_SIZE,
  NAVIGATION_COLLECTION_PAGE_SIZE,
  SHOPIFY_PRODUCTS_QUERY,
  SHOPIFY_PRODUCT_QUERY,
  SHOPIFY_PRODUCT_VARIANTS_QUERY,
  SHOPIFY_BROWSE_VARIANTS_QUERY,
  SHOPIFY_BROWSE_COLORS_QUERY,
  SHOPIFY_VARIANT_COLORS_QUERY,
  SHOPIFY_COLLECTIONS_QUERY,
  SHOPIFY_COLLECTION_QUERY,
  SHOPIFY_SEARCH_QUERY,
  SHOPIFY_NAVIGATION_PRODUCTS_QUERY,
  SHOPIFY_NAVIGATION_COLLECTIONS_QUERY,
  ShopifyCatalogError,
  type ShopifyConnection,
  type ShopifyProductSummaryNode,
  type ShopifyVariantColorsNode,
  type ShopifyProductsData,
  type ShopifyProductData,
  type ShopifyProductVariantsData,
  type ShopifyVariantNode,
  type ShopifyCollectionsData,
  type ShopifyCollectionData,
  type ShopifySearchData,
  type ShopifyNavigationProductsData,
  type ShopifyNavigationCollectionsData,
  type ShopifyCatalogNavigationSnapshot,
} from "./shopify-catalog-contract";

export function createCatalogReadBudget() {
  const deadline = Date.now() + 20_000;
  let requests = 0;
  return {
    read<T>(
      query: string,
      variables: Record<string, unknown>,
      options: ShopifyFetchOptions = { cache: "no-store" },
    ) {
      const remaining = deadline - Date.now();
      if (++requests > 100 || remaining <= 0) {
        throw new ShopifyCatalogError(
          "invalid-data",
          "The complete catalog could not be read within its request budget.",
        );
      }
      return shopifyFetch<T>(query, variables, {
        ...options,
        timeoutMs: Math.min(options.timeoutMs ?? 10_000, remaining),
      });
    },
  };
}

function shopifyContext(locale: Locale) {
  if (isEnabledLocale(locale)) return shopifyContextForLocale(locale);

  throw new ShopifyCatalogError(
    "unsupported-locale",
    "This locale is not enabled for the Shopify catalog.",
  );
}

async function collectConnectionNodes<T extends { id: string }>(
  firstPage: ShopifyConnection<T>,
  loadNextPage: (after: string) => Promise<ShopifyConnection<T>>,
  connectionName: string,
) {
  const nodes: T[] = [];
  const seenNodeIds = new Set<string>();
  const seenCursors = new Set<string>();
  let page: ShopifyConnection<T> | null | undefined = firstPage;

  while (page) {
    if (!Array.isArray(page.nodes) || !page.pageInfo) {
      throw new ShopifyCatalogError(
        "invalid-data",
        `Shopify returned an invalid ${connectionName} connection.`,
      );
    }

    for (const node of page.nodes) {
      if (!node?.id || seenNodeIds.has(node.id)) {
        throw new ShopifyCatalogError(
          "invalid-data",
          `Shopify returned duplicate or invalid nodes while paginating ${connectionName}.`,
        );
      }
      seenNodeIds.add(node.id);
      nodes.push(node);
    }

    const { endCursor, hasNextPage } = page.pageInfo;
    if (typeof hasNextPage !== "boolean") {
      throw new ShopifyCatalogError(
        "invalid-data",
        `Shopify returned invalid page information for ${connectionName}.`,
      );
    }
    if (!hasNextPage) return nodes;

    if (
      typeof endCursor !== "string" ||
      endCursor.trim().length === 0 ||
      seenCursors.has(endCursor)
    ) {
      throw new ShopifyCatalogError(
        "invalid-data",
        `Shopify returned a missing or repeated cursor while paginating ${connectionName}.`,
      );
    }

    seenCursors.add(endCursor);
    page = await loadNextPage(endCursor);
  }

  throw new ShopifyCatalogError(
    "invalid-data",
    `Shopify returned an invalid ${connectionName} page.`,
  );
}

export async function getShopifyProducts(
  locale: Locale,
  fetchOptions: ShopifyFetchOptions = { cache: "no-store" },
  budget = createCatalogReadBudget(),
): Promise<ProductSummary[]> {
  const context = shopifyContext(locale);
  const loadPage = (after: string | null) =>
    budget.read<ShopifyProductsData>(
      SHOPIFY_PRODUCTS_QUERY,
      { ...context, first: PRODUCT_PAGE_SIZE, after },
      fetchOptions,
    );
  const firstPage = await loadPage(null);
  const nodes = await collectConnectionNodes(
    firstPage.products,
    async (after) => (await loadPage(after)).products,
    "products",
  );
  return nodes.map(mapShopifyProductSummary);
}

export async function getShopifyProduct(
  handle: string,
  locale: Locale,
  budget = createCatalogReadBudget(),
): Promise<Product | null> {
  const normalizedHandle = handle.trim();
  if (!normalizedHandle) return null;

  const context = shopifyContext(locale);
  const data = await budget.read<ShopifyProductData>(
    SHOPIFY_PRODUCT_QUERY,
    { ...context, handle: normalizedHandle },
    { cache: "no-store" },
  );
  if (!data.product) return null;

  const product = data.product;
  const variants = await collectConnectionNodes(
    product.variants,
    async (after) => {
      const nextPage = await budget.read<ShopifyProductVariantsData>(
        SHOPIFY_PRODUCT_VARIANTS_QUERY,
        {
          ...context,
          id: product.id,
          first: VARIANT_PAGE_SIZE,
          after,
        },
        { cache: "no-store" },
      );
      if (!nextPage.product || nextPage.product.id !== product.id) {
        throw new ShopifyCatalogError(
          "invalid-data",
          "Shopify changed the product while its variants were being paginated.",
        );
      }
      return nextPage.product.variants;
    },
    `variants for product ${product.id}`,
  );

  return mapShopifyProduct({
    ...product,
    variants: { ...product.variants, nodes: variants },
  });
}

export async function hydrateShopifyBrowseProducts(
  products: ProductSummary[],
  locale: Locale,
  budget = createCatalogReadBudget(),
): Promise<CatalogProduct[]> {
  if (!products.length) return [];
  const load = <T>(query: string, variables: Record<string, unknown>) =>
    budget.read<T>(query, variables);
  const batches: ProductSummary[][] = [];
  for (let index = 0; index < products.length; index += 8)
    batches.push(products.slice(index, index + 8));
  const hydrated = new Map<string, CatalogProduct>();
  let nextBatch = 0;

  async function readBatch<T extends ShopifyVariantColorsNode>(
    batch: ProductSummary[],
    languageLocale: Locale,
    colorsOnly: boolean,
  ) {
    const context = shopifyContext(languageLocale);
    const data = await load<{
      nodes: Array<{
        id: string;
        variants: ShopifyConnection<T>;
      } | null>;
    }>(
      colorsOnly ? SHOPIFY_BROWSE_COLORS_QUERY : SHOPIFY_BROWSE_VARIANTS_QUERY,
      {
        ...context,
        ids: batch.map((product) => product.id),
      },
    );
    const nodes = new Map(
      data.nodes.flatMap((node) => (node ? [[node.id, node] as const] : [])),
    );
    if (
      data.nodes.length !== batch.length ||
      nodes.size !== batch.length ||
      batch.some((product) => !nodes.has(product.id))
    ) {
      throw new ShopifyCatalogError(
        "invalid-data",
        "Shopify changed the catalog while its variants were being read.",
      );
    }
    const results = new Map<string, T[]>();
    // Complete each connection before accepting any results. Three batch workers bound concurrency.
    for (const product of batch) {
      const variants = await collectConnectionNodes(
        nodes.get(product.id)!.variants,
        async (after) => {
          const page = await load<{
            product: { id: string; variants: ShopifyConnection<T> } | null;
          }>(
            colorsOnly
              ? SHOPIFY_VARIANT_COLORS_QUERY
              : SHOPIFY_PRODUCT_VARIANTS_QUERY,
            {
              ...context,
              id: product.id,
              first: VARIANT_PAGE_SIZE,
              after,
            },
          );
          if (page.product?.id !== product.id) {
            throw new ShopifyCatalogError(
              "invalid-data",
              "Shopify changed a product while its variants were being read.",
            );
          }
          return page.product.variants;
        },
        "browse variants",
      );
      if (!variants.length)
        throw new ShopifyCatalogError(
          "invalid-data",
          "Shopify returned a product without variants.",
        );
      results.set(product.id, variants);
    }
    return results;
  }

  async function worker() {
    while (nextBatch < batches.length) {
      const batch = batches[nextBatch++];
      const localized = await readBatch<ShopifyVariantNode>(
        batch,
        locale,
        false,
      );
      // Translate labels independently; matching identities must remain in the default language.
      const needsCanonicalColors =
        locale !== "en-US" &&
        [...localized.values()].some((variants) =>
          variants.some((variant) => variant.colors),
        );
      const canonical = needsCanonicalColors
        ? await readBatch<ShopifyVariantColorsNode>(batch, "en-US", true)
        : localized;
      for (const product of batch) {
        const variants = localized.get(product.id)!;
        const canonicalVariants = new Map(
          canonical.get(product.id)!.map((variant) => [variant.id, variant]),
        );
        if (
          canonicalVariants.size !== variants.length ||
          variants.some((variant) => !canonicalVariants.has(variant.id))
        ) {
          throw new ShopifyCatalogError(
            "invalid-data",
            "Shopify changed the variants between language reads.",
          );
        }
        hydrated.set(product.id, {
          ...product,
          variants: variants.map((variant, index) =>
            mapVariant(
              { ...variant, colors: canonicalVariants.get(variant.id)!.colors },
              product.title,
              index,
            ),
          ),
        });
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(3, batches.length) }, worker),
  );
  return products.map((product) => hydrated.get(product.id)!);
}

export async function getShopifyCollections(
  locale: Locale,
  fetchOptions: ShopifyFetchOptions = { cache: "no-store" },
  budget = createCatalogReadBudget(),
): Promise<Collection[]> {
  const context = shopifyContext(locale);
  const loadPage = (after: string | null) =>
    budget.read<ShopifyCollectionsData>(
      SHOPIFY_COLLECTIONS_QUERY,
      { ...context, first: COLLECTION_PAGE_SIZE, after },
      fetchOptions,
    );
  const firstPage = await loadPage(null);
  const nodes = await collectConnectionNodes(
    firstPage.collections,
    async (after) => (await loadPage(after)).collections,
    "collections",
  );

  return nodes
    .filter((collection) => collection.products.nodes.length > 0)
    .map(mapCollectionBase);
}

export async function getShopifyCollection(
  handle: string,
  locale: Locale,
  budget = createCatalogReadBudget(),
): Promise<ProductCollection | null> {
  const normalizedHandle = handle.trim();
  if (!normalizedHandle) return null;

  const context = shopifyContext(locale);
  const loadPage = (after: string | null) =>
    budget.read<ShopifyCollectionData>(
      SHOPIFY_COLLECTION_QUERY,
      {
        ...context,
        handle: normalizedHandle,
        first: PRODUCT_PAGE_SIZE,
        after,
      },
      { cache: "no-store" },
    );
  const firstPage = await loadPage(null);
  if (!firstPage.collection) return null;

  const collection = firstPage.collection;
  const products = await collectConnectionNodes(
    collection.products,
    async (after) => {
      const nextPage = await loadPage(after);
      if (!nextPage.collection || nextPage.collection.id !== collection.id) {
        throw new ShopifyCatalogError(
          "invalid-data",
          "Shopify changed the collection while its products were being paginated.",
        );
      }
      return nextPage.collection.products;
    },
    `products for collection ${collection.id}`,
  );
  if (!products.length) return null;

  return {
    ...mapCollectionBase(collection),
    products: products.map(mapShopifyProductSummary),
  };
}

export async function searchShopifyProducts(
  query: string,
  locale: Locale,
  budget = createCatalogReadBudget(),
): Promise<ProductSummary[]> {
  const normalizedQuery = query.trim().slice(0, 100);
  if (!normalizedQuery) return [];

  const context = shopifyContext(locale);
  const loadPage = (after: string | null) =>
    budget.read<ShopifySearchData>(
      SHOPIFY_SEARCH_QUERY,
      {
        ...context,
        query: normalizedQuery,
        first: SEARCH_PAGE_SIZE,
        after,
      },
      { cache: "no-store" },
    );
  const firstPage = await loadPage(null);
  const nodes = await collectConnectionNodes(
    firstPage.search,
    async (after) => (await loadPage(after)).search,
    "product search results",
  );

  return nodes.flatMap((node) =>
    node.__typename === "Product"
      ? [
          mapShopifyProductSummary(
            node as { __typename: "Product" } & ShopifyProductSummaryNode,
          ),
        ]
      : [],
  );
}

export async function getShopifyCatalogNavigation(
  locale: Locale,
  fetchOptions: ShopifyFetchOptions,
  budget = createCatalogReadBudget(),
): Promise<ShopifyCatalogNavigationSnapshot> {
  const context = shopifyContext(locale);
  const loadProductsPage = (after: string | null) =>
    budget.read<ShopifyNavigationProductsData>(
      SHOPIFY_NAVIGATION_PRODUCTS_QUERY,
      { ...context, first: NAVIGATION_PRODUCT_PAGE_SIZE, after },
      fetchOptions,
    );
  const loadCollectionsPage = (after: string | null) =>
    budget.read<ShopifyNavigationCollectionsData>(
      SHOPIFY_NAVIGATION_COLLECTIONS_QUERY,
      { ...context, first: NAVIGATION_COLLECTION_PAGE_SIZE, after },
      fetchOptions,
    );
  const [firstProductsPage, firstCollectionsPage] = await Promise.all([
    loadProductsPage(null),
    loadCollectionsPage(null),
  ]);
  const [products, collections] = await Promise.all([
    collectConnectionNodes(
      firstProductsPage.products,
      async (after) => (await loadProductsPage(after)).products,
      "navigation products",
    ),
    collectConnectionNodes(
      firstCollectionsPage.collections,
      async (after) => (await loadCollectionsPage(after)).collections,
      "navigation collections",
    ),
  ]);

  return {
    productCategoryIds: [
      ...new Set(
        products.flatMap((product) =>
          product.category?.id ? [product.category.id] : [],
        ),
      ),
    ],
    collections: collections.flatMap((collection) => {
      const handle = optionalText(collection.handle);
      const title = optionalText(collection.title);
      if (!handle || !title || collection.products.nodes.length === 0)
        return [];
      return [
        {
          handle,
          title,
          kind: mapCollectionKind(collection.collectionKind),
        },
      ];
    }),
  };
}
