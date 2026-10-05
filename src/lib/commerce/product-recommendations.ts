import type { ProductSummary } from "./types";

export function selectRelatedProducts({
  product,
  relatedProducts,
  catalogProducts,
}: {
  product: ProductSummary;
  relatedProducts: readonly ProductSummary[];
  catalogProducts: readonly ProductSummary[];
}): ProductSummary[] {
  const selected: ProductSummary[] = [];
  const seenIds = new Set([product.id]);
  const sameCategory = (items: readonly ProductSummary[]) =>
    product.category
      ? items.filter((item) => item.category?.id === product.category?.id)
      : [];

  for (const candidates of [
    sameCategory(relatedProducts),
    sameCategory(catalogProducts),
    relatedProducts,
    catalogProducts,
  ]) {
    for (const item of candidates) {
      if (!item.availableForSale || seenIds.has(item.id)) continue;
      seenIds.add(item.id);
      selected.push(item);
      if (selected.length === 4) return selected;
    }
  }
  return selected;
}
