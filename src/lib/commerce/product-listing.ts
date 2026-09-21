import type { PageSearchParams } from "@/lib/seo";
import type { ProductSummary } from "./types";

export function getListingState(params: PageSearchParams = {}) {
  return {
    availableOnly: params.availability === "available",
    sort: params.sort === "price-asc" || params.sort === "price-desc"
      ? params.sort
      : "available",
  } as const;
}

/** Sort the complete current-market set, never a partial cursor page. */
export function listProducts<T extends ProductSummary>(products: T[], params: PageSearchParams = {}): T[] {
  const { availableOnly, sort } = getListingState(params);
  return products
    .filter((product) => !availableOnly || product.availableForSale)
    .sort((a, b) => {
      if (sort === "available") return Number(b.availableForSale) - Number(a.availableForSale);
      // Comparison only: Shopify remains authoritative for all amounts/totals.
      const difference = Number(a.priceRange.minVariantPrice.amount) - Number(b.priceRange.minVariantPrice.amount);
      return sort === "price-asc" ? difference : -difference;
    });
}
