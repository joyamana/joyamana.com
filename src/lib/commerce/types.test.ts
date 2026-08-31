import { describe, expect, it } from "vitest";
import {
  DEFAULT_PRODUCT_QUANTITY_RULE,
  LOW_STOCK_THRESHOLD,
  getLowStockCount,
  getProductQuantityMaximum,
  isValidAvailableProductQuantity,
  isValidProductQuantity,
  isValidQuantityRule,
  type ProductVariant,
} from "./types";

function variant(
  overrides: Partial<ProductVariant> = {},
): ProductVariant {
  return {
    id: "variant-1",
    title: "Default",
    availableForSale: true,
    currentlyNotInStock: false,
    quantityAvailable: 3,
    price: { amount: "35.00", currencyCode: "USD" },
    compareAtPrice: null,
    image: null,
    selectedOptions: [],
    quantityRule: { minimum: 1, maximum: null, increment: 1 },
    ...overrides,
  };
}

describe("Shopify quantity rules", () => {
  it("accepts the default one-at-a-time quantity contract", () => {
    expect(isValidQuantityRule(DEFAULT_PRODUCT_QUANTITY_RULE)).toBe(true);
    expect(isValidProductQuantity(1, DEFAULT_PRODUCT_QUANTITY_RULE)).toBe(true);
    expect(isValidProductQuantity(99, DEFAULT_PRODUCT_QUANTITY_RULE)).toBe(
      true,
    );
    expect(isValidProductQuantity(100, DEFAULT_PRODUCT_QUANTITY_RULE)).toBe(
      false,
    );
  });

  it("enforces contextual minimum, maximum, and increment values", () => {
    const rule = { minimum: 2, maximum: 10, increment: 2 };

    expect(isValidQuantityRule(rule)).toBe(true);
    expect(isValidProductQuantity(2, rule)).toBe(true);
    expect(isValidProductQuantity(10, rule)).toBe(true);
    expect(isValidProductQuantity(1, rule)).toBe(false);
    expect(isValidProductQuantity(3, rule)).toBe(false);
    expect(isValidProductQuantity(12, rule)).toBe(false);
  });

  it("rejects incoherent upstream rules", () => {
    expect(
      isValidQuantityRule({ minimum: 2, maximum: 3, increment: 2 }),
    ).toBe(false);
  });

  it("keeps valid Shopify rules inside the storefront safety cap", () => {
    const highMinimumRule = {
      minimum: 100,
      maximum: null,
      increment: 1,
    };

    expect(isValidQuantityRule(highMinimumRule)).toBe(true);
    expect(isValidProductQuantity(100, highMinimumRule)).toBe(false);
  });

  it("caps selectable quantities at tracked Shopify inventory", () => {
    const rule = { minimum: 1, maximum: null, increment: 1 };

    expect(getProductQuantityMaximum(rule, 1, false)).toBe(1);
    expect(isValidAvailableProductQuantity(1, rule, 1, false)).toBe(true);
    expect(isValidAvailableProductQuantity(2, rule, 1, false)).toBe(false);
  });

  it("aligns inventory to increments and permits Shopify backorders", () => {
    const rule = { minimum: 2, maximum: 10, increment: 2 };

    expect(getProductQuantityMaximum(rule, 3, false)).toBe(2);
    expect(getProductQuantityMaximum(rule, 0, true)).toBe(10);
  });

  it("shows exact low stock only for explicitly classified repeatable models", () => {
    expect(LOW_STOCK_THRESHOLD).toBe(3);
    expect(getLowStockCount("standard", variant())).toBe(3);
    expect(
      getLowStockCount(
        "natural-variation",
        variant({ quantityAvailable: 1 }),
      ),
    ).toBe(1);
    expect(
      getLowStockCount("standard", variant({ quantityAvailable: 4 })),
    ).toBeNull();
  });

  it("suppresses urgency for one-of-one, unknown, backorder, and unsupported inventory", () => {
    expect(getLowStockCount("one-of-one", variant())).toBeNull();
    expect(getLowStockCount(undefined, variant())).toBeNull();
    expect(
      getLowStockCount(
        "standard",
        variant({ currentlyNotInStock: true }),
      ),
    ).toBeNull();
    expect(
      getLowStockCount("standard", variant({ quantityAvailable: null })),
    ).toBeNull();
    expect(
      getLowStockCount(
        "standard",
        variant({ quantityRule: { minimum: 2, maximum: null, increment: 2 } }),
      ),
    ).toBeNull();
  });
});
