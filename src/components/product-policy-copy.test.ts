import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { checkoutDisabledNote } from "./buy-now";
import {
  lowStockMessage,
  ProductDescription,
  productShippingReturnsSummary,
} from "./product-purchase";

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

  it("keeps a disabled Buy-now explanation customer-facing", () => {
    expect(checkoutDisabledNote("en-US")).toContain(
      "temporarily unavailable",
    );
    expect(checkoutDisabledNote("es-US")).toContain(
      "no está disponible temporalmente",
    );
    expect(checkoutDisabledNote("en-US")).not.toMatch(
      /code|integration|approval|shopify/i,
    );
    expect(checkoutDisabledNote("es-US")).not.toMatch(
      /código|integración|aprobación|shopify/i,
    );
  });

  it("localizes exact low-stock counts", () => {
    expect(lowStockMessage("en-US", 1)).toBe("Only 1 left");
    expect(lowStockMessage("en-US", 3)).toBe("Only 3 left");
    expect(lowStockMessage("es-US", 1)).toBe("Solo queda 1");
    expect(lowStockMessage("es-US", 3)).toBe("Solo quedan 3");
  });

  it("preserves sanitized Shopify product description structure", () => {
    const html = renderToStaticMarkup(
      createElement(ProductDescription, {
        description: "Plain fallback",
        descriptionHtml: "<h2>Details</h2><ul><li>Natural stone</li></ul>",
      }),
    );

    expect(html).toContain("<h2>Details</h2>");
    expect(html).toContain("<ul><li>Natural stone</li></ul>");
    expect(html).not.toContain("Plain fallback");
  });
});
