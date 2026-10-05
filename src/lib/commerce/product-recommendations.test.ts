import { describe, expect, it } from "vitest";
import type { ProductSummary } from "./types";
import { selectRelatedProducts } from "./product-recommendations";

function product(
  id: string,
  categoryId: string | null = "bracelets",
): ProductSummary {
  return {
    id,
    handle: id,
    title: id,
    availableForSale: true,
    featuredImage: null,
    category: categoryId ? { id: categoryId, name: categoryId } : null,
    priceRange: {
      minVariantPrice: { amount: "68.00", currencyCode: "USD" },
      maxVariantPrice: { amount: "72.00", currencyCode: "USD" },
    },
  };
}

const current = product("current");

describe("related product selection", () => {
  it("keeps Shopify relevance order among same-category products", () => {
    const first = product("first-related");
    const second = product("second-related");
    expect(
      selectRelatedProducts({
        product: current,
        relatedProducts: [first, second],
        catalogProducts: [second, first],
      }),
    ).toEqual([first, second]);
  });

  it("prioritizes the same category, preserving Shopify relevance within it and capped at four", () => {
    const related = [product("r2", "necklaces"), product("r1")];
    const catalog = [
      product("other", "rings"),
      product("c2"),
      product("c1"),
      product("c3"),
    ];
    expect(
      selectRelatedProducts({
        product: current,
        relatedProducts: related,
        catalogProducts: catalog,
      }),
    ).toEqual([related[1], catalog[1], catalog[2], catalog[3]]);
  });

  it("fills insufficient same-category candidates with other Shopify-related products before the catalog", () => {
    const related = [
      product("related-other", "rings"),
      product("related-same"),
    ];
    const catalog = [
      product("catalog-other", "necklaces"),
      product("catalog-same"),
    ];
    expect(
      selectRelatedProducts({
        product: current,
        relatedProducts: related,
        catalogProducts: catalog,
      }),
    ).toEqual([related[1], catalog[1], related[0], catalog[0]]);
  });

  it("excludes the current product, unavailable items and duplicates across sources", () => {
    const available = product("available");
    const unavailable = { ...product("sold-out"), availableForSale: false };
    expect(
      selectRelatedProducts({
        product: current,
        relatedProducts: [current, unavailable, available, available],
        catalogProducts: [available, current, unavailable, product("fallback")],
      }).map((item) => item.id),
    ).toEqual(["available", "fallback"]);
  });

  it("fills from the same taxonomy identity before other categories without matching names", () => {
    const sameName = {
      ...product("other-id", "rings"),
      category: { id: "rings", name: "bracelets" },
    };
    const sameId = {
      ...product("same-id"),
      category: { id: "bracelets", name: "手鏈" },
    };
    expect(
      selectRelatedProducts({
        product: current,
        relatedProducts: [],
        catalogProducts: [sameName, sameId, product("other", "necklaces")],
      }).map((item) => item.id),
    ).toEqual(["same-id", "other-id", "other"]);
  });

  it("does not treat missing categories as a relation", () => {
    expect(
      selectRelatedProducts({
        product: product("current", null),
        relatedProducts: [],
        catalogProducts: [
          product("first", "rings"),
          product("uncategorized", null),
        ],
      }).map((item) => item.id),
    ).toEqual(["first", "uncategorized"]);
  });

  it("returns fewer than four when only a few eligible candidates exist", () => {
    const only = product("only");
    expect(
      selectRelatedProducts({
        product: current,
        relatedProducts: [only],
        catalogProducts: [],
      }),
    ).toEqual([only]);
    expect(
      selectRelatedProducts({
        product: current,
        relatedProducts: [],
        catalogProducts: [current],
      }),
    ).toEqual([]);
  });
});
