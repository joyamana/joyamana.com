import { describe, expect, it } from "vitest";
import { formatPrice } from "./format";

describe("formatPrice", () => {
  it("makes the US currency explicit", () => {
    expect(formatPrice(68, "en-US", "USD")).toBe("$68 USD");
  });

  it("makes the Canada currency explicit in every language", () => {
    expect(formatPrice(92, "en-CA", "CAD")).toBe("$92 CAD");
    expect(formatPrice(92, "fr-CA", "CAD")).toMatch(/92.*CAD$/);
  });
});
