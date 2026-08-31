import type { Locale } from "@/lib/i18n/locales";

export type CurrencyCode = "USD" | "CAD";
export type ProductModel = "standard" | "natural-variation" | "one-of-one";
export type CollectionKind =
  | "category"
  | "design_series"
  | "merchandising";

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
export const LOW_STOCK_THRESHOLD = 3;

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

/**
 * Returns the largest quantity the storefront should offer right now.
 * Shopify Cart remains authoritative because inventory can change after the
 * catalog response is rendered.
 */
export function getProductQuantityMaximum(
  rule: ProductQuantityRule,
  quantityAvailable: number | null,
  currentlyNotInStock: boolean,
) {
  const ruleMaximum = Math.min(
    rule.maximum ?? STOREFRONT_MAX_QUANTITY,
    STOREFRONT_MAX_QUANTITY,
  );

  // Shopify uses this flag for backorders. A null inventory quantity also
  // represents inventory for which an exact storefront cap is unavailable.
  if (currentlyNotInStock || quantityAvailable === null) return ruleMaximum;

  if (!Number.isInteger(quantityAvailable) || quantityAvailable < 0) return 0;

  const inventoryMaximum =
    Math.floor(quantityAvailable / rule.increment) * rule.increment;
  return Math.min(ruleMaximum, inventoryMaximum);
}

export function isValidAvailableProductQuantity(
  quantity: number,
  rule: ProductQuantityRule,
  quantityAvailable: number | null,
  currentlyNotInStock: boolean,
) {
  return (
    isValidProductQuantity(quantity, rule) &&
    quantity <=
      getProductQuantityMaximum(
        rule,
        quantityAvailable,
        currentlyNotInStock,
      )
  );
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  currentlyNotInStock: boolean;
  quantityAvailable: number | null;
  price: Money;
  compareAtPrice: Money | null;
  image: ProductImage | null;
  selectedOptions: SelectedOption[];
  quantityRule: ProductQuantityRule;
}

export function getLowStockCount(
  model: ProductModel | undefined,
  variant: ProductVariant,
) {
  if (model !== "standard" && model !== "natural-variation") return null;
  if (
    !variant.availableForSale ||
    variant.currentlyNotInStock ||
    variant.quantityAvailable === null ||
    variant.quantityRule.increment !== 1 ||
    !isValidAvailableProductQuantity(
      variant.quantityRule.minimum,
      variant.quantityRule,
      variant.quantityAvailable,
      variant.currentlyNotInStock,
    )
  ) {
    return null;
  }

  return variant.quantityAvailable >= 1 &&
    variant.quantityAvailable <= LOW_STOCK_THRESHOLD
    ? variant.quantityAvailable
    : null;
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

export interface ProductCategory {
  id: string;
  name: string;
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
  descriptionHtml: string;
  seoTitle?: string;
  seoDescription?: string;
  availableForSale: boolean;
  priceRange: ProductPriceRange;
  compareAtPrice: Money | null;
  featuredImage: ProductImage | null;
  images: ProductImage[];
  variants: ProductVariant[];
  category: ProductCategory | null;
  model?: ProductModel;
  facts?: ProductFacts;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  image: ProductImage | null;
  kind?: CollectionKind;
}

export interface ProductCollection extends Collection {
  products: Product[];
}

/**
 * Content entities still use localized records. Commerce entities above do
 * not: their strings are already resolved by the Shopify adapter.
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
