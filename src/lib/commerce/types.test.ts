import { describe, expect, it } from "vitest";
import {
  DEFAULT_PRODUCT_QUANTITY_RULE,
  isValidProductQuantity,
  isValidQuantityRule,
} from "./types";

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
});
