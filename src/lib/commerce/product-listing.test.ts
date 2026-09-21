import { describe, expect, it } from "vitest";
import type { ProductSummary } from "./types";
import { getListingState, listProducts } from "./product-listing";

function piece(id: string, price: string, availableForSale = true): ProductSummary {
  const money = { amount: price, currencyCode: "USD" as const };
  return { id, handle: id, title: id, availableForSale, featuredImage: null, images: [], priceRange: { minVariantPrice: money, maxVariantPrice: money } };
}

describe("Complete-catalog filtering and sorting", () => {
  const products = [piece("unavailable", "5", false), piece("first", "30"), piece("second", "10"), piece("same-price", "10")];

  it("keeps unavailable pieces discoverable with a stable available-first order without changing the source", () => {
    expect(listProducts(products).map((p) => p.id)).toEqual(["first", "second", "same-price", "unavailable"]);
    expect(products[0].id).toBe("unavailable");
  });

  it("filters availability and sorts decimal prices numerically over the whole set", () => {
    expect(listProducts(products, { availability: "available", sort: "price-asc" }).map((p) => p.id)).toEqual(["second", "same-price", "first"]);
    expect(listProducts([piece("a", "9.90"), piece("b", "10.10")], { sort: "price-desc" })[0].id).toBe("b");
  });

  it("ignores unsupported and repeated query values and supports empty results", () => {
    expect(getListingState({ availability: ["available", "all"], sort: "random" })).toEqual({ availableOnly: false, sort: "available" });
    expect(listProducts([products[0]], { availability: "available" })).toEqual([]);
  });
});
