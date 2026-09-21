import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getProduct: vi.fn(), getRelatedProducts: vi.fn() }));
vi.mock("@/lib/commerce/catalog", () => ({
  getProduct: mocks.getProduct,
  getRelatedProducts: mocks.getRelatedProducts,
}));
vi.mock("@/lib/structured-data", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/structured-data")>(),
  serializeIndexableStructuredData: (data: unknown) => JSON.stringify(data),
}));

import { ProductDescription, ProductPage, RelatedProducts } from "./product-page";

beforeEach(() => { mocks.getRelatedProducts.mockReset(); });

describe("Product server content", () => {
  it("preserves the full approved HTML instead of extracting or duplicating local facts", () => {
    const html = renderToStaticMarkup(<ProductDescription
      description="Plain summary"
      descriptionHtml="<h2>Materials</h2><p>Heat-treated quartz.</p><ul><li>12 mm beads</li></ul>"
    />);
    expect(html).toContain("<p>Heat-treated quartz.</p>");
    expect(html).toContain("<ul><li>12 mm beads</li></ul>");
    expect(html).not.toContain("Plain summary");
  });

  it("isolates recommendation failures from the main product", async () => {
    mocks.getRelatedProducts.mockRejectedValue(new Error("Upstream unavailable"));
    expect(await RelatedProducts({ productId: "product-1", locale: "es-US" })).toBeNull();
    expect(mocks.getRelatedProducts).toHaveBeenCalledWith("product-1", "us", "es-US", 3);
  });

  it("omits an empty recommendation section", async () => {
    mocks.getRelatedProducts.mockResolvedValue([]);
    expect(await RelatedProducts({ productId: "product-1", locale: "en-US" })).toBeNull();
  });

  it("omits Product JSON-LD for parameter requests even when the clean page is indexable", async () => {
    mocks.getProduct.mockResolvedValue({
      id: "product-1", handle: "bracelet", title: "Quartz bracelet",
      description: "Full disclosure", descriptionHtml: "<p>Full disclosure</p>",
      availableForSale: false,
      priceRange: {
        minVariantPrice: { amount: "29", currencyCode: "USD" },
        maxVariantPrice: { amount: "29", currencyCode: "USD" },
      },
      compareAtPrice: null, featuredImage: null, images: [], variants: [], category: null,
    });
    mocks.getRelatedProducts.mockResolvedValue([]);
    const clean = renderToStaticMarkup(await ProductPage({ locale: "en-US", handle: "bracelet" }));
    const parameterized = renderToStaticMarkup(await ProductPage({ locale: "en-US", handle: "bracelet", hasParameters: true }));
    expect(clean).toContain('type="application/ld+json"');
    expect(parameterized).not.toContain('type="application/ld+json"');
    expect(parameterized).toContain("Full disclosure");
  });
});
