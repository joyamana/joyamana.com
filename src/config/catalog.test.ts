import { describe, expect, it } from "vitest";
import {
  localizeProductCategory,
  productCategoryDefinitionForHandle,
  productCategoryDefinitionForTaxonomyId,
} from "./catalog";

describe("storefront product category configuration", () => {
  it("maps Shopify's Gemstones taxonomy category to a stable public route", () => {
    const definition = productCategoryDefinitionForTaxonomyId(
      "gid://shopify/TaxonomyCategory/ae-2-2-6-2",
    );

    expect(definition).toMatchObject({
      handle: "gemstones",
      taxonomyId: "gid://shopify/TaxonomyCategory/ae-2-2-6-2",
    });
    expect(productCategoryDefinitionForHandle("gemstones")).toBe(definition);
  });

  it("localizes the Gemstones navigation label without changing its handle", () => {
    const definition = productCategoryDefinitionForHandle("gemstones");
    expect(definition).toBeDefined();

    expect(localizeProductCategory(definition!, "en-US")).toMatchObject({
      handle: "gemstones",
      title: "Gemstones",
    });
    expect(localizeProductCategory(definition!, "es-US")).toMatchObject({
      handle: "gemstones",
      title: "Gemas",
    });
  });
});
