import { cache } from "react";
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
