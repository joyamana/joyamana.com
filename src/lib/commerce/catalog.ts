import { isEnabledLocale } from "@/config/locales";
import { cache } from "react";
import {
  localizeProductCategory,
  productCategoryDefinitionForHandle,
  productCategoryDefinitions,
} from "@/config/catalog";
import type { MarketId } from "@/config/markets";
import type { Locale } from "@/lib/i18n/locales";
import type { Collection, Product, ProductCollection, ProductSummary } from "./types";
import {
  getShopifyCollection,
  getShopifyCollections,
  getShopifyCatalogNavigation,
  getShopifyProduct,
  getShopifyProducts,
  getShopifyAvailableProducts,
  getShopifyRelatedProducts,
  searchShopifyProducts,
  type ShopifyCatalogNavigationSnapshot,
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
  products: Product[];
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
    categories: productCategoryDefinitions.flatMap((definition) => {
      if (!navigation.productCategoryIds.includes(definition.taxonomyId)) {
        return [];
      }
      const { handle, title } = localizeProductCategory(definition, locale);
      return [{ handle, title }];
    }),
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

export async function getProducts(
  marketId: MarketId = "us",
  locale: Locale = "en-US",
): Promise<Product[]> {
  // Canada is typed planning context only. Do not access any provider for it.
  if (marketId === "ca") return [];
  assertEnabledUsLocale(locale);

  return getShopifyProducts(locale);
}

export async function getAvailableProducts(
  marketId: MarketId = "us",
  locale: Locale = "en-US",
  limit = 4,
): Promise<ProductSummary[]> {
  if (marketId === "ca") return [];
  assertEnabledUsLocale(locale);
  return getShopifyAvailableProducts(locale, limit);
}

export async function getRelatedProducts(
  productId: string,
  marketId: MarketId = "us",
  locale: Locale = "en-US",
  limit = 3,
): Promise<ProductSummary[]> {
  if (marketId === "ca") return [];
  assertEnabledUsLocale(locale);
  return getShopifyRelatedProducts(productId, locale, limit);
}

export const getProduct = cache(
  async function getProduct(
    handle: string,
    marketId: MarketId = "us",
    locale: Locale = "en-US",
  ): Promise<Product | null> {
    if (marketId === "ca") return null;
    assertEnabledUsLocale(locale);

    return getShopifyProduct(handle, locale);
  },
);

export async function getCollections(
  marketId: MarketId = "us",
  locale: Locale = "en-US",
): Promise<Collection[]> {
  if (marketId === "ca") return [];
  assertEnabledUsLocale(locale);

  return getShopifyCollections(locale);
}

export const getCollection = cache(
  async function getCollection(
    handle: string,
    marketId: MarketId = "us",
    locale: Locale = "en-US",
  ): Promise<ProductCollection | null> {
    if (marketId === "ca") return null;
    assertEnabledUsLocale(locale);

    return getShopifyCollection(handle, locale);
  },
);

export async function getDesignCollections(
  marketId: MarketId = "us",
  locale: Locale = "en-US",
) {
  return (await getCollections(marketId, locale)).filter(
    (collection) => collection.kind === "design_series",
  );
}

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

export const getDesignCollection = cache(
  async function getDesignCollection(
    handle: string,
    marketId: MarketId = "us",
    locale: Locale = "en-US",
  ): Promise<ProductCollection | null> {
    const collection = await getCollection(handle, marketId, locale);
    return collection?.kind === "design_series" ? collection : null;
  },
);

function mapStorefrontCategory(
  definition: (typeof productCategoryDefinitions)[number],
  products: Product[],
  locale: Locale,
): StorefrontProductCategory | null {
  const categoryProducts = products.filter(
    (product) => product.category?.id === definition.taxonomyId,
  );
  if (!categoryProducts.length) return null;

  const localized = localizeProductCategory(definition, locale);
  return { ...localized, products: categoryProducts };
}

export function productCategoriesForProducts(
  products: Product[],
  locale: Locale,
): StorefrontProductCategory[] {
  return productCategoryDefinitions.flatMap((definition) => {
    const category = mapStorefrontCategory(definition, products, locale);
    return category ? [category] : [];
  });
}

export const getProductCategory = cache(
  async function getProductCategory(
    handle: string,
    marketId: MarketId = "us",
    locale: Locale = "en-US",
  ): Promise<StorefrontProductCategory | null> {
    const definition = productCategoryDefinitionForHandle(handle);
    if (!definition) return null;

    return mapStorefrontCategory(
      definition,
      await getProducts(marketId, locale),
      locale,
    );
  },
);

export async function searchCatalog(
  query: string,
  marketId: MarketId = "us",
  locale: Locale = "en-US",
): Promise<Product[]> {
  if (marketId === "ca") return [];
  assertEnabledUsLocale(locale);
  if (!query.trim()) return [];

  return searchShopifyProducts(query, locale);
}
