import { describe, expect, it } from "vitest";
import {
  compareProductCategories,
  isProductCategoryHandle,
  localizeProductCategory,
  productCategoryDefinitionForHandle,
  productCategoryDefinitionForTaxonomyId,
  productCategoryDefinitions,
  resolveProductCategory,
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
    expect(localizeProductCategory(definition!, "zh-Hant-US")).toMatchObject({
      handle: "gemstones",
      title: "寶石",
    });
  });
});

describe("public product categories", () => {
  it("preserves established URLs and approved translated copy", () => {
    const category = {
      id: "gid://shopify/TaxonomyCategory/aa-6-3",
      name: "Shopify category name",
    };
    expect(resolveProductCategory(category, "en-US")).toMatchObject({
      handle: "bracelets",
      taxonomyId: category.id,
      title: "Bracelets",
    });
    expect(resolveProductCategory(category, "zh-Hant-US")).toMatchObject({
      handle: "bracelets",
      title: "手鏈",
    });
  });

  it("uses taxonomy identity for new URLs and Shopify names for display", () => {
    const category = {
      id: "gid://shopify/TaxonomyCategory/rc-2",
      name: " Religious Items ",
    };
    expect(resolveProductCategory(category, "en-US")).toEqual({
      handle: "taxonomy-rc-2",
      taxonomyId: category.id,
      title: "Religious Items",
      description:
        "Explore published products in this category from Joya Mana.",
    });
    expect(
      resolveProductCategory({ ...category, name: "宗教物品" }, "zh-Hant-US"),
    ).toEqual({
      handle: "taxonomy-rc-2",
      taxonomyId: category.id,
      title: "宗教物品",
      description: "探索 Joya Mana 在此類別已發佈的商品。",
    });
    expect(
      resolveProductCategory(
        { ...category, name: "Renamed category" },
        "en-US",
      ),
    ).toMatchObject({ handle: "taxonomy-rc-2" });
    expect(
      resolveProductCategory(
        { id: "gid://shopify/TaxonomyCategory/rc-3", name: category.name },
        "en-US",
      ),
    ).toMatchObject({ handle: "taxonomy-rc-3" });
  });

  it.each([
    "gid://shopify/Product/rc-2",
    "gid://shopify/TaxonomyCategory/RC-2",
    "gid://shopify/TaxonomyCategory/rc--2",
    "gid://shopify/TaxonomyCategory/rc-2/other",
    "gid://shopify/TaxonomyCategory/rc-2?key=secret",
    "gid://shopify/TaxonomyCategory/../rc-2",
    "gid://shopify/TaxonomyCategory/rc-2\n",
  ])("rejects an invalid taxonomy identity: %s", (id) => {
    expect(
      resolveProductCategory({ id, name: "A category" }, "en-US"),
    ).toBeNull();
  });

  it("does not invent a category for missing or empty Shopify names", () => {
    expect(resolveProductCategory(null, "en-US")).toBeNull();
    for (const id of [
      "gid://shopify/TaxonomyCategory/rc-2",
      "gid://shopify/TaxonomyCategory/aa-6-3",
    ]) {
      expect(resolveProductCategory({ id, name: "  " }, "en-US")).toBeNull();
    }
  });

  it("accepts valid routes and rejects malformed routes and established URL aliases", () => {
    expect(isProductCategoryHandle("taxonomy-rc-2")).toBe(true);
    expect(isProductCategoryHandle("taxonomy-rc")).toBe(true);
    for (const definition of productCategoryDefinitions) {
      expect(isProductCategoryHandle(definition.handle)).toBe(true);
      const token = definition.taxonomyId.split("/").at(-1);
      expect(isProductCategoryHandle(`taxonomy-${token}`)).toBe(false);
    }
    for (const handle of [
      "religious-items",
      "taxonomy-RC-2",
      "taxonomy-rc--2",
      "taxonomy-rc-2/other",
      "taxonomy-rc-2?sort=price",
      "taxonomy-rc-2\n",
      "taxonomy-",
      "",
    ]) {
      expect(isProductCategoryHandle(handle)).toBe(false);
    }
  });

  it("orders established categories first and new categories by stable identity", () => {
    const ids = ["rc-3", "aa-6-9", "aa-1", "ae-2-2-6-2", "rc-2", "aa-6-3"];
    expect(
      ids
        .map((id) => ({ taxonomyId: `gid://shopify/TaxonomyCategory/${id}` }))
        .sort(compareProductCategories)
        .map(({ taxonomyId }) => taxonomyId.split("/").at(-1)),
    ).toEqual(["aa-6-3", "aa-6-9", "ae-2-2-6-2", "aa-1", "rc-2", "rc-3"]);
  });
});
