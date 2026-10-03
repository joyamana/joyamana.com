import { compareAmounts } from "./money";
import type { PageSearchParams } from "@/lib/seo";
import {
  isProductVariantPurchasable,
  type Product,
  type ProductVariant,
} from "./types";

export type CatalogSort = "default" | "price-asc" | "price-desc";
export interface CatalogQuery {
  availableOnly: boolean;
  colors: string[];
  sort: CatalogSort;
}
export interface CatalogCard {
  product: Product;
  variant: ProductVariant;
  available: boolean;
  path: string;
}
export interface ColorFacet {
  key: string;
  label: string;
  count: number;
}

export function colorKey(value: string) {
  return value.normalize("NFC").trim().toLowerCase();
}

export function parseVariantColors(
  field: { type?: string; value: string } | null | undefined,
): string[] {
  if (field?.type !== "list.single_line_text_field") return [];
  try {
    const values: unknown = JSON.parse(field.value);
    if (
      !Array.isArray(values) ||
      values.some((value) => typeof value !== "string")
    )
      return [];
    const seen = new Set<string>();
    return values.flatMap((value: string) => {
      const label = value.normalize("NFC").trim();
      const key = colorKey(label);
      if (!key || seen.has(key)) return [];
      seen.add(key);
      return [label];
    });
  } catch {
    return [];
  }
}

export function parseCatalogQuery(params: PageSearchParams = {}): CatalogQuery {
  const rawColors = Array.isArray(params.color)
    ? params.color
    : params.color
      ? [params.color]
      : [];
  // An oversized query fails closed instead of silently broadening a filter.
  const invalidColors =
    rawColors.length > 32 ||
    rawColors.some((value) => value.length > 100 || !colorKey(value));
  return {
    availableOnly: params.available === "1",
    colors: invalidColors
      ? ["invalid-color-filter"]
      : [...new Set(rawColors.map(colorKey))].sort(),
    sort:
      params.sort === "price-asc" || params.sort === "price-desc"
        ? params.sort
        : "default",
  };
}

export function catalogQueryString(query: CatalogQuery) {
  const params = new URLSearchParams();
  if (query.availableOnly) params.set("available", "1");
  for (const color of query.colors) params.append("color", color);
  if (query.sort !== "default") params.set("sort", query.sort);
  return params.toString();
}

export function catalogPath(path: string, query: CatalogQuery) {
  const search = catalogQueryString(query);
  return search ? `${path}?${search}` : path;
}

export function publicVariantId(id: string) {
  return /^gid:\/\/shopify\/ProductVariant\/(\d+)$/.exec(id)?.[1] ?? null;
}

export function variantPath(
  product: Pick<Product, "handle">,
  variant: ProductVariant,
) {
  const id = publicVariantId(variant.id);
  if (!id) throw new Error("Invalid storefront variant identifier.");
  return `/products/${product.handle}?variant=${id}`;
}

export function selectCatalogVariant(
  product: Product,
  query: CatalogQuery,
): ProductVariant | undefined {
  return product.variants
    .map((variant, index) => ({
      variant,
      order: variant.displayOrder ?? index,
    }))
    .filter(
      ({ variant }) =>
        (!query.colors.length ||
          variant.colors?.some((color) =>
            query.colors.includes(colorKey(color)),
          )) &&
        (!query.availableOnly || isProductVariantPurchasable(product, variant)),
    )
    .sort(
      (a, b) =>
        Number(isProductVariantPurchasable(product, b.variant)) -
          Number(isProductVariantPurchasable(product, a.variant)) ||
        a.order - b.order ||
        compareText(a.variant.id, b.variant.id),
    )[0]?.variant;
}

function compareText(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function browseCatalog(products: Product[], query: CatalogQuery) {
  const entries = products.flatMap((product, order) => {
    const variant = selectCatalogVariant(product, query);
    return variant
      ? [
          {
            product,
            variant,
            order,
            available: isProductVariantPurchasable(product, variant),
            path: variantPath(product, variant),
          },
        ]
      : [];
  });
  if (query.sort !== "default") {
    const direction = query.sort === "price-asc" ? 1 : -1;
    entries.sort(
      (a, b) =>
        direction *
          compareAmounts(a.variant.price.amount, b.variant.price.amount) ||
        a.order - b.order ||
        compareText(a.product.id, b.product.id),
    );
  }

  const facets = new Map<string, ColorFacet>();
  for (const product of products) {
    const colors = new Map<string, string>();
    for (const variant of product.variants) {
      if (query.availableOnly && !isProductVariantPurchasable(product, variant))
        continue;
      for (const label of variant.colors ?? [])
        colors.set(colorKey(label), label);
    }
    for (const [key, label] of colors) {
      const facet = facets.get(key) ?? { key, label, count: 0 };
      facet.count++;
      facets.set(key, facet);
    }
  }
  for (const key of query.colors) {
    if (!facets.has(key)) facets.set(key, { key, label: key, count: 0 });
  }
  return {
    entries,
    colors: [...facets.values()].sort((a, b) => compareText(a.key, b.key)),
  };
}

export function initialProductVariant(
  product: Product,
  params: PageSearchParams = {},
) {
  if (params.variant !== undefined) {
    const requested = params.variant;
    return typeof requested === "string" && /^\d{1,30}$/.test(requested)
      ? (product.variants.find(
          (variant) => publicVariantId(variant.id) === requested,
        ) ?? null)
      : null;
  }
  return selectCatalogVariant(product, parseCatalogQuery()) ?? null;
}

/** Only preserve the business parameters applicable to the destination page. */
export function commerceLanguageQuery(path: string, params: PageSearchParams) {
  if (/^\/products\/[^/]+$/.test(path)) {
    const id = params.variant;
    return typeof id === "string" && /^\d{1,30}$/.test(id)
      ? `variant=${id}`
      : "";
  }
  if (path === "/shop" || /^\/(category|collections)\/[^/]+$/.test(path)) {
    return catalogQueryString(parseCatalogQuery(params));
  }
  return "";
}

export function commerceLanguageQueryFromSearch(path: string, search: string) {
  const params: PageSearchParams = {};
  for (const [key, value] of new URLSearchParams(search)) {
    const previous = params[key];
    params[key] =
      previous === undefined
        ? value
        : Array.isArray(previous)
          ? [...previous, value]
          : [previous, value];
  }
  return commerceLanguageQuery(path, params);
}
