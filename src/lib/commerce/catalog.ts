import { isEnabledLocale } from "@/config/locales";
import { cache } from "react";
import type { ShopifyCatalogNavigationSnapshot } from "./shopify-catalog-contract";
import {
  compareProductCategories,
  isProductCategoryHandle,
  resolveProductCategory,
} from "@/config/catalog";
import type { MarketId } from "@/config/markets";
import type { Locale } from "@/lib/i18n/locales";
import type {
  Collection,
  Product,
  ProductSummary,
  ProductCollection,
} from "./types";
import {
  createCatalogReadBudget,
  getShopifyCollection,
  getShopifyCollections,
  getShopifyCatalogNavigation,
  getShopifyProduct,
  getShopifyProductRecommendations,
  getShopifyProducts,
  hydrateShopifyBrowseProducts,
  searchShopifyProducts,
} from "./shopify-catalog";

export class CatalogConfigurationError extends Error {
  readonly kind = "configuration";

  constructor(message: string) {
    super(message);
    this.name = "CatalogConfigurationError";
  }
}

export interface StorefrontProductCategory {
  handle: string;
  taxonomyId: string;
  title: string;
  description: string;
  products: ProductSummary[];
}

export interface CatalogNavigationData {
  categories: Array<{ handle: string; title: string }>;
  collections: Array<{ handle: string; title: string }>;
}

function catalogNavigationFromSnapshot(
  navigation: ShopifyCatalogNavigationSnapshot,
  locale: Locale,
): CatalogNavigationData {
  return {
    categories: navigation.productCategories
      .flatMap((category) => {
        const resolved = resolveProductCategory(category, locale);
        return resolved ? [resolved] : [];
      })
      .sort(compareProductCategories)
      .map(({ handle, title }) => ({ handle, title })),
    collections: navigation.collections
      .filter((collection) => collection.kind === "design_series")
      .map(({ handle, title }) => ({ handle, title })),
  };
}

function assertEnabledUsLocale(locale: Locale) {
  if (!isEnabledLocale(locale)) {
    throw new CatalogConfigurationError(
      "This locale is not enabled for the US catalog.",
    );
  }
}

const getProductCatalogSnapshot = cache(
  async (marketId: MarketId, locale: Locale) => {
    const budget = createCatalogReadBudget();
    if (marketId === "ca") return { products: [], budget };
    assertEnabledUsLocale(locale);
    return {
      products: await getShopifyProducts(locale, { cache: "no-store" }, budget),
      budget,
    };
  },
);

export const getProducts = cache(async function getProducts(
  marketId: MarketId = "us",
  locale: Locale = "en-US",
): Promise<ProductSummary[]> {
  return (await getProductCatalogSnapshot(marketId, locale)).products;
});

export const getProduct = cache(async function getProduct(
  handle: string,
  marketId: MarketId = "us",
  locale: Locale = "en-US",
): Promise<Product | null> {
  if (marketId === "ca") return null;
  assertEnabledUsLocale(locale);

  return getShopifyProduct(handle, locale);
});

export const getProductRecommendations = cache(
  async (
    handle: string,
    marketId: MarketId = "us",
    locale: Locale = "en-US",
  ): Promise<ProductSummary[]> => {
    if (marketId === "ca") return [];
    assertEnabledUsLocale(locale);
    return getShopifyProductRecommendations(handle, locale);
  },
);

export const getBrowseProducts = cache(
  async (marketId: MarketId, locale: Locale) => {
    const { products, budget } = await getProductCatalogSnapshot(
      marketId,
      locale,
    );
    return hydrateShopifyBrowseProducts(products, locale, budget);
  },
);

export const getBrowseCategory = cache(
  async (handle: string, marketId: MarketId, locale: Locale) => {
    if (marketId === "ca") return null;
    assertEnabledUsLocale(locale);
    if (!isProductCategoryHandle(handle)) return null;
    const { products, budget } = await getProductCatalogSnapshot(
      marketId,
      locale,
    );
    const category = productCategoriesForProducts(products, locale).find(
      (candidate) => candidate.handle === handle,
    );
    return category
      ? {
          ...category,
          products: await hydrateShopifyBrowseProducts(
            category.products,
            locale,
            budget,
          ),
        }
      : null;
  },
);

export const getBrowseCollection = cache(
  async (handle: string, marketId: MarketId, locale: Locale) => {
    const { collection: candidate, budget } = await getCollectionSnapshot(
      handle,
      marketId,
      locale,
    );
    const collection = candidate?.kind === "design_series" ? candidate : null;
    return collection
      ? {
          ...collection,
          products: await hydrateShopifyBrowseProducts(
            collection.products,
            locale,
            budget,
          ),
        }
      : null;
  },
);

export const getCollections = cache(async function getCollections(
  marketId: MarketId = "us",
  locale: Locale = "en-US",
): Promise<Collection[]> {
  if (marketId === "ca") return [];
  assertEnabledUsLocale(locale);

  return getShopifyCollections(locale);
});

const getCollectionSnapshot = cache(
  async (handle: string, marketId: MarketId, locale: Locale) => {
    const budget = createCatalogReadBudget();
    if (marketId === "ca") return { collection: null, budget };
    assertEnabledUsLocale(locale);
    return {
      collection: await getShopifyCollection(handle, locale, budget),
      budget,
    };
  },
);

export const getCollection = cache(async function getCollection(
  handle: string,
  marketId: MarketId = "us",
  locale: Locale = "en-US",
): Promise<ProductCollection | null> {
  return (await getCollectionSnapshot(handle, marketId, locale)).collection;
});

export const getDesignCollections = cache(async function getDesignCollections(
  marketId: MarketId = "us",
  locale: Locale = "en-US",
) {
  return (await getCollections(marketId, locale)).filter(
    (collection) => collection.kind === "design_series",
  );
});

const getCachedShopifyCatalogNavigation = cache(
  async (locale: Locale): Promise<CatalogNavigationData> => {
    const fetchOptions = {
      buyerIp: null,
      cache: "force-cache" as const,
      revalidate: 300,
      tags: ["shopify-catalog-navigation"],
    };
    const navigation = await getShopifyCatalogNavigation(locale, fetchOptions);
    return catalogNavigationFromSnapshot(navigation, locale);
  },
);

/**
 * Header taxonomy changes much less often than price or inventory. Keep this
 * query cached for five minutes. React cache deduplicates reads within a render;
 * fetch owns the persistent cache so the two layers cannot renew stale data.
 */
export async function getCatalogNavigationData(
  marketId: MarketId = "us",
  locale: Locale = "en-US",
): Promise<CatalogNavigationData> {
  if (marketId === "ca") return { categories: [], collections: [] };
  assertEnabledUsLocale(locale);

  return getCachedShopifyCatalogNavigation(locale);
}

export const getDesignCollection = cache(async function getDesignCollection(
  handle: string,
  marketId: MarketId = "us",
  locale: Locale = "en-US",
): Promise<ProductCollection | null> {
  const collection = await getCollection(handle, marketId, locale);
  return collection?.kind === "design_series" ? collection : null;
});

export function productCategoriesForProducts(
  products: ProductSummary[],
  locale: Locale,
): StorefrontProductCategory[] {
  const categories = new Map<string, StorefrontProductCategory>();
  for (const product of products) {
    const resolved = resolveProductCategory(product.category, locale);
    if (!resolved) continue;
    const existing = categories.get(resolved.taxonomyId);
    if (existing) existing.products.push(product);
    else
      categories.set(resolved.taxonomyId, { ...resolved, products: [product] });
  }
  return [...categories.values()].sort(compareProductCategories);
}

export const getProductCategory = cache(async function getProductCategory(
  handle: string,
  marketId: MarketId = "us",
  locale: Locale = "en-US",
): Promise<StorefrontProductCategory | null> {
  if (marketId === "ca") return null;
  assertEnabledUsLocale(locale);
  if (!isProductCategoryHandle(handle)) return null;

  return (
    productCategoriesForProducts(
      await getProducts(marketId, locale),
      locale,
    ).find((category) => category.handle === handle) ?? null
  );
});

export async function searchCatalog(
  query: string,
  marketId: MarketId = "us",
  locale: Locale = "en-US",
): Promise<ProductSummary[]> {
  if (marketId === "ca") return [];
  assertEnabledUsLocale(locale);
  if (!query.trim()) return [];

  return searchShopifyProducts(query, locale);
}
