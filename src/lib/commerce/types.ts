import type { Locale } from "@/lib/i18n/locales";

export type CurrencyCode = "USD" | "CAD";
export type CommerceSource = "shopify" | "mock";
export type ProductModel = "standard" | "one-of-one";

/**
 * Shopify MoneyV2 amounts remain decimal strings throughout the commerce
 * layer. Consumers may format them for display, but must not derive commerce
 * totals with floating-point arithmetic.
 */
export interface Money {
  amount: string;
  currencyCode: CurrencyCode;
}

export interface ProductImage {
  url: string;
  altText: string;
  width: number;
  height: number;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface ProductQuantityRule {
  minimum: number;
  maximum: number | null;
  increment: number;
}

export const DEFAULT_PRODUCT_QUANTITY_RULE: ProductQuantityRule = {
  minimum: 1,
  maximum: null,
  increment: 1,
};

export const SHOPIFY_MAX_QUANTITY = 2_147_483_647;
export const STOREFRONT_MAX_QUANTITY = 99;

export function isValidQuantityRule(rule: ProductQuantityRule) {
  return (
    Number.isInteger(rule.minimum) &&
    rule.minimum >= 1 &&
    rule.minimum <= SHOPIFY_MAX_QUANTITY &&
    Number.isInteger(rule.increment) &&
    rule.increment >= 1 &&
    rule.minimum % rule.increment === 0 &&
    (rule.maximum === null ||
      (Number.isInteger(rule.maximum) &&
        rule.maximum >= rule.minimum &&
        rule.maximum <= SHOPIFY_MAX_QUANTITY &&
        rule.maximum % rule.increment === 0))
  );
}

export function isValidProductQuantity(
  quantity: number,
  rule: ProductQuantityRule,
) {
  return (
    Number.isInteger(quantity) &&
    quantity >= rule.minimum &&
    quantity <=
      Math.min(
        rule.maximum ?? STOREFRONT_MAX_QUANTITY,
        STOREFRONT_MAX_QUANTITY,
      ) &&
    quantity % rule.increment === 0
  );
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  image: ProductImage | null;
  selectedOptions: SelectedOption[];
  quantityRule: ProductQuantityRule;
}

export interface ProductFacts {
  material?: string;
  dimensions?: string;
  care?: string;
}

export interface ProductPriceRange {
  minVariantPrice: Money;
  maxVariantPrice: Money;
}

/**
 * A locale-specific, storefront-safe product entity. Shopify queries return a
 * single requested language, so commerce strings are deliberately not stored
 * as a map of every locale.
 */
export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  availableForSale: boolean;
  priceRange: ProductPriceRange;
  compareAtPrice: Money | null;
  featuredImage: ProductImage | null;
  images: ProductImage[];
  variants: ProductVariant[];
  model?: ProductModel;
  facts?: ProductFacts;
  source: CommerceSource;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  image: ProductImage | null;
  source: CommerceSource;
}

export interface ProductCollection extends Collection {
  products: Product[];
}

/**
 * Content entities still use localized records. Commerce entities above do
 * not: their strings are already resolved by the Shopify/mock adapter.
 */
export interface LocalizedText {
  "en-US": string;
  "es-US": string;
  "en-CA"?: string;
  "fr-CA"?: string;
}

export function localize(text: LocalizedText, locale: Locale) {
  if (locale === "en-CA") return text["en-CA"] ?? text["en-US"];
  if (locale === "fr-CA") return text["fr-CA"] ?? text["en-US"];
  return text[locale];
}
