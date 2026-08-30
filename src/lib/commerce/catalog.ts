import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
  localizeProductCategory,
  productCategoryDefinitionForHandle,
  productCategoryDefinitions,
} from "@/config/catalog";
import type { MarketId } from "@/config/markets";
import type { Locale } from "@/lib/i18n/locales";
import type { Collection, Product, ProductCollection } from "./types";
import {
  getMockCollection,
  getMockCollections,
  getMockProducts,
  searchMockProducts,
} from "./mock-data";
import {
  getShopifyCollection,
  getShopifyCollections,
  getShopifyProduct,
  getShopifyProducts,
  searchShopifyProducts,
} from "./shopify-catalog";

export type CommerceProvider = "mock" | "shopify";

export class CommerceProviderError extends Error {
  readonly kind = "configuration";

  constructor(message: string) {
    super(message);
    this.name = "CommerceProviderError";
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
  categories: StorefrontProductCategory[];
  collections: Collection[];
}

export function getCommerceProvider(): CommerceProvider {
  const provider =
    process.env.COMMERCE_PROVIDER?.trim().toLowerCase() || "shopify";
  if (provider === "mock" || provider === "shopify") return provider;

  throw new CommerceProviderError(
    "COMMERCE_PROVIDER must be either mock or shopify.",
  );
}

function assertEnabledUsLocale(locale: Locale) {
  if (locale !== "en-US" && locale !== "es-US") {
    throw new CommerceProviderError(
      "The enabled US catalog only supports en-US and es-US.",
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

  return getCommerceProvider() === "shopify"
    ? getShopifyProducts(locale)
    : getMockProducts(marketId, locale);
}

export const getProduct = cache(
  async function getProduct(
    handle: string,
    marketId: MarketId = "us",
    locale: Locale = "en-US",
  ): Promise<Product | null> {
    if (marketId === "ca") return null;
    assertEnabledUsLocale(locale);

    return getCommerceProvider() === "shopify"
      ? getShopifyProduct(handle, locale)
      : (getMockProducts(marketId, locale).find(
          (product) => product.handle === handle,
        ) ?? null);
  },
);

export async function getCollections(
  marketId: MarketId = "us",
  locale: Locale = "en-US",
): Promise<Collection[]> {
  if (marketId === "ca") return [];
  assertEnabledUsLocale(locale);

  return getCommerceProvider() === "shopify"
    ? getShopifyCollections(locale)
    : getMockCollections(marketId, locale);
}

export const getCollection = cache(
  async function getCollection(
    handle: string,
    marketId: MarketId = "us",
    locale: Locale = "en-US",
  ): Promise<ProductCollection | null> {
    if (marketId === "ca") return null;
    assertEnabledUsLocale(locale);

    return getCommerceProvider() === "shopify"
      ? getShopifyCollection(handle, locale)
      : getMockCollection(handle, marketId, locale);
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

const getCachedShopifyCatalogNavigation = unstable_cache(
  async (locale: Locale): Promise<CatalogNavigationData> => {
    const fetchOptions = {
      buyerIp: null,
      cache: "force-cache" as const,
      revalidate: 300,
      tags: ["shopify-catalog-navigation"],
    };
    const [products, collections] = await Promise.all([
      getShopifyProducts(locale, fetchOptions),
      getShopifyCollections(locale, fetchOptions),
    ]);
    return {
      categories: productCategoriesForProducts(products, locale),
      collections: collections.filter(
        (collection) => collection.kind === "design_series",
      ),
    };
  },
  ["shopify-catalog-navigation-v1"],
  { revalidate: 300, tags: ["shopify-catalog-navigation"] },
);

/**
 * Header taxonomy changes much less often than price or inventory. Keep this
 * server-only projection briefly cached so a page build or traffic burst does
 * not multiply identical Storefront API requests for every route.
 */
export async function getCatalogNavigationData(
  marketId: MarketId = "us",
  locale: Locale = "en-US",
): Promise<CatalogNavigationData> {
  if (marketId === "ca") return { categories: [], collections: [] };
  assertEnabledUsLocale(locale);

  if (getCommerceProvider() === "shopify") {
    return getCachedShopifyCatalogNavigation(locale);
  }

  const products = getMockProducts(marketId, locale);
  return {
    categories: productCategoriesForProducts(products, locale),
    collections: getMockCollections(marketId, locale).filter(
      (collection) => collection.kind === "design_series",
    ),
  };
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

export async function getProductCategories(
  marketId: MarketId = "us",
  locale: Locale = "en-US",
): Promise<StorefrontProductCategory[]> {
  const products = await getProducts(marketId, locale);
  return productCategoriesForProducts(products, locale);
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

  return getCommerceProvider() === "shopify"
    ? searchShopifyProducts(query, locale)
    : searchMockProducts(query, marketId, locale);
}
