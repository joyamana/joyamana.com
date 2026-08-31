import { describe, expect, it } from "vitest";
import { checkoutDisabledNote } from "./buy-now";
import { productShippingReturnsSummary } from "./product-purchase";

describe("product policy copy", () => {
  it("summarizes the confirmed US shipping and return terms", () => {
    expect(productShippingReturnsSummary("en-US")).toContain(
      "1–3 business days",
    );
    expect(productShippingReturnsSummary("en-US")).toContain("15 days");
    expect(productShippingReturnsSummary("es-US")).toContain(
      "1 a 3 días hábiles",
    );
    expect(productShippingReturnsSummary("es-US")).toContain("15 días");
  });

  it("does not list approved policies as remaining Checkout blockers", () => {
    expect(checkoutDisabledNote("en-US")).not.toMatch(/shipping|returns/i);
    expect(checkoutDisabledNote("es-US")).not.toMatch(/envío|devoluciones/i);
    expect(checkoutDisabledNote("en-US")).toContain("tax");
    expect(checkoutDisabledNote("es-US")).toContain("impuestos");
  });
});
