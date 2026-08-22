import type { MarketId } from "@/config/markets";
import { collections, marketCatalogs, products } from "./mock-data";

export function getCatalogProducts(marketId: MarketId = "us") {
  const catalog = marketCatalogs[marketId];
  return products
    .filter((product) => catalog.productHandles.includes(product.handle))
    .map((product) => ({
      ...product,
      price: catalog.prices[product.handle],
      currency: catalog.currency,
      available: catalog.availability[product.handle],
    }));
}

export async function getProducts(marketId: MarketId = "us") {
  return getCatalogProducts(marketId);
}

export async function getProduct(handle: string, marketId: MarketId = "us") {
  return (
    getCatalogProducts(marketId).find(
      (product) => product.handle === handle,
    ) ?? null
  );
}

export async function getCollections() {
  return collections;
}

export async function getCollection(handle: string, marketId: MarketId = "us") {
  const collection = collections.find((item) => item.handle === handle);
  if (!collection) return null;
  return {
    ...collection,
    products: getCatalogProducts(marketId).filter((product) =>
      product.collectionHandles.includes(handle),
    ),
  };
}

export async function searchCatalog(query: string, marketId: MarketId = "us") {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return getCatalogProducts(marketId).filter((product) =>
    [
      product.title["en-US"],
      product.title["es-US"],
      product.description["en-US"],
      product.description["es-US"],
      product.title["fr-CA"] || "",
      product.description["fr-CA"] || "",
      product.crystal,
    ].some((value) => value.toLowerCase().includes(normalized)),
  );
}
