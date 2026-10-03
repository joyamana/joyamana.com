import { compareAmounts } from "./money";
import { describe, expect, it } from "vitest";
import {
  browseCatalog,
  catalogQueryString,
  commerceLanguageQueryFromSearch,
  initialProductVariant,
  parseCatalogQuery,
  parseVariantColors,
  selectCatalogVariant,
} from "./catalog-browse";
import {
  isProductVariantPurchasable,
  type Product,
  type ProductVariant,
} from "./types";

export function variant(
  id: string,
  overrides: Partial<ProductVariant> = {},
): ProductVariant {
  return {
    id: `gid://shopify/ProductVariant/${id}`,
    title: `Option ${id}`,
    availableForSale: true,
    currentlyNotInStock: false,
    quantityAvailable: 4,
    price: { amount: "60", currencyCode: "USD" },
    compareAtPrice: null,
    image: null,
    selectedOptions: [],
    colors: ["Red"],
    quantityRule: { minimum: 1, maximum: null, increment: 1 },
    ...overrides,
  };
}

export function product(variants: ProductVariant[], id = "1"): Product {
  return {
    id: `gid://shopify/Product/${id}`,
    handle: `piece-${id}`,
    title: `Piece ${id}`,
    description: "",
    descriptionHtml: "",
    availableForSale: true,
    priceRange: {
      minVariantPrice: { amount: "20", currencyCode: "USD" },
      maxVariantPrice: { amount: "60", currencyCode: "USD" },
    },
    featuredImage: null,
    images: [],
    variants,
    category: null,
  };
}

describe("catalog variant matching", () => {
  it("does not combine the color of a sold-out variant with another variant's availability", () => {
    const item = product([
      variant("11", { availableForSale: false, quantityAvailable: 0 }),
      variant("12", { colors: ["Blue"] }),
    ]);
    expect(
      browseCatalog([item], parseCatalogQuery({ color: "red", available: "1" }))
        .entries,
    ).toHaveLength(0);
    const result = browseCatalog([item], parseCatalogQuery({ color: "red" }));
    expect(result.entries[0].variant.id).toContain("/11");
    expect(result.entries[0].available).toBe(false);
  });

  it("matches multiple colors with OR, returns one product, and prefers purchasable POSITION order", () => {
    const item = product([
      variant("11", { displayOrder: 0, quantityAvailable: 0 }),
      variant("12", { displayOrder: 2, colors: ["Blue", "Red"] }),
      variant("13", { displayOrder: 1, colors: ["Blue"] }),
    ]);
    const result = browseCatalog(
      [item],
      parseCatalogQuery({ color: ["RED", "blue"] }),
    );
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].variant.id).toContain("/13");
    expect(result.colors.map((facet) => [facet.key, facet.count])).toEqual([
      ["blue", 1],
      ["red", 1],
    ]);
  });

  it("does not claim purchase availability below minimum, but respects unknown inventory and backorders", () => {
    const option = variant("11", {
      quantityAvailable: 1,
      quantityRule: { minimum: 2, maximum: null, increment: 2 },
    });
    const item = product([option]);
    expect(isProductVariantPurchasable(item, option)).toBe(false);
    expect(
      isProductVariantPurchasable(item, {
        ...option,
        currentlyNotInStock: true,
      }),
    ).toBe(true);
    expect(
      isProductVariantPurchasable(item, { ...option, quantityAvailable: null }),
    ).toBe(true);
    expect(
      isProductVariantPurchasable({ ...item, availableForSale: false }, option),
    ).toBe(false);
    expect(
      isProductVariantPurchasable(item, {
        ...option,
        quantityRule: { minimum: 100, maximum: null, increment: 1 },
      }),
    ).toBe(false);
  });

  it("sorts all matched cards by their chosen price without changing representatives", () => {
    const items = [
      product([
        variant("11"),
        variant("12", {
          colors: ["Blue"],
          price: { amount: "20", currencyCode: "USD" },
        }),
      ]),
      product(
        [variant("21", { price: { amount: "45", currencyCode: "USD" } })],
        "2",
      ),
    ];
    const asc = browseCatalog(
      items,
      parseCatalogQuery({ color: "red", sort: "price-asc" }),
    ).entries;
    const desc = browseCatalog(
      items,
      parseCatalogQuery({ color: "red", sort: "price-desc" }),
    ).entries;
    expect(asc.map((entry) => entry.variant.id)).toEqual([
      "gid://shopify/ProductVariant/21",
      "gid://shopify/ProductVariant/11",
    ]);
    expect(desc.map((entry) => entry.variant.id)).toEqual(
      [...asc.map((entry) => entry.variant.id)].reverse(),
    );
  });

  it("uses exact decimals and stable source order for equal prices", () => {
    expect(compareAmounts("10", "9.99")).toBeGreaterThan(0);
    expect(compareAmounts("0009.500", "9.50")).toBe(0);
    expect(
      compareAmounts("9007199254740993.01", "9007199254740993.00"),
    ).toBeGreaterThan(0);
    const items = [
      product([
        variant("11", { price: { amount: "9.5", currencyCode: "USD" } }),
      ]),
      product(
        [variant("21", { price: { amount: "9.50", currencyCode: "USD" } })],
        "2",
      ),
    ];
    expect(
      browseCatalog(
        items,
        parseCatalogQuery({ sort: "price-desc" }),
      ).entries.map((entry) => entry.product.id),
    ).toEqual(items.map((item) => item.id));
  });

  it("counts facets by products and retains stale selected filters with zero results", () => {
    const items = [
      product([variant("11"), variant("12")]),
      product([variant("21")], "2"),
    ];
    const result = browseCatalog(items, parseCatalogQuery({ color: "purple" }));
    expect(result.entries).toHaveLength(0);
    expect(result.colors.find((facet) => facet.key === "red")?.count).toBe(2);
    expect(result.colors.find((facet) => facet.key === "purple")?.count).toBe(
      0,
    );
    expect(
      selectCatalogVariant(
        product([variant("11", { colors: [] })]),
        parseCatalogQuery({ color: "red" }),
      ),
    ).toBeUndefined();
  });
});

describe("color list and URL contracts", () => {
  it("parses only JSON text lists, trims and deduplicates without splitting comma-containing labels", () => {
    expect(
      parseVariantColors({
        type: "list.single_line_text_field",
        value: '[" Purple ","purple","Blue, green",""]',
      }),
    ).toEqual(["Purple", "Blue, green"]);
    for (const value of [
      '"Red,Blue"',
      '["Red",2]',
      '{"color":"red"}',
      "invalid",
    ]) {
      expect(
        parseVariantColors({ type: "list.single_line_text_field", value }),
      ).toEqual([]);
    }
    expect(
      parseVariantColors({ type: "single_line_text_field", value: "Red" }),
    ).toEqual([]);
    expect(parseVariantColors(null)).toEqual([]);
  });

  it("normalizes filters while preserving OR selection and removing unrelated parameters", () => {
    const query = parseCatalogQuery({
      color: [" Purple ", "pink", "PURPLE"],
      available: "1",
      sort: "price-asc",
    });
    expect(catalogQueryString(query)).toBe(
      "available=1&color=pink&color=purple&sort=price-asc",
    );
    expect(parseCatalogQuery({ sort: "bad" }).sort).toBe("default");
    expect(
      commerceLanguageQueryFromSearch(
        "/shop",
        "?color=red&color=blue&available=1&utm_source=x",
      ),
    ).toBe("available=1&color=blue&color=red");
    expect(
      commerceLanguageQueryFromSearch(
        "/products/piece",
        "?variant=90071992547409931&color=red",
      ),
    ).toBe("variant=90071992547409931");
    expect(commerceLanguageQueryFromSearch("/about", "?variant=11")).toBe("");
  });

  it("resolves requested sold-out variants without switching and rejects foreign or duplicate IDs", () => {
    const item = product([
      variant("11", { availableForSale: false, quantityAvailable: 0 }),
      variant("12"),
    ]);
    expect(initialProductVariant(item)?.id).toContain("/12");
    expect(initialProductVariant(item, { variant: "11" })?.id).toContain("/11");
    expect(initialProductVariant(item, { variant: "999" })).toBeNull();
    expect(initialProductVariant(item, { variant: ["11", "12"] })).toBeNull();
    expect(
      initialProductVariant(item, {
        variant: "gid://shopify/ProductVariant/11",
      }),
    ).toBeNull();
  });
});
