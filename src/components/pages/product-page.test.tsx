import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const catalog = vi.hoisted(() => ({
  getProduct: vi.fn(),
  getProducts: vi.fn(),
}));
vi.mock("@/lib/commerce/catalog", () => catalog);
vi.mock("@/components/product-purchase", () => ({
  ProductPurchase: () => <div>Purchase controls</div>,
}));
vi.mock("@/lib/structured-data", () => ({
  buildProductStructuredData: () => ({}),
  serializeIndexableStructuredData: () => null,
}));

import { ProductPage } from "./product-page";

afterEach(() => vi.resetAllMocks());

describe("product detail availability", () => {
  it("keeps a valid product purchasable when recommendations fail", async () => {
    catalog.getProduct.mockResolvedValue({
      id: "product-1",
      handle: "bracelet",
      title: "Bracelet",
      variants: [],
      category: null,
    });
    catalog.getProducts.mockRejectedValue(new Error("Catalog unavailable"));
    const html = renderToStaticMarkup(
      await ProductPage({ locale: "en-US", handle: "bracelet" }),
    );
    expect(html).toContain("Purchase controls");
    expect(html).not.toContain("product-grid");
  });

  it("still propagates a failure reading the product itself", async () => {
    const error = new Error("Product unavailable");
    catalog.getProduct.mockRejectedValue(error);
    catalog.getProducts.mockResolvedValue([]);
    await expect(
      ProductPage({ locale: "en-US", handle: "bracelet" }),
    ).rejects.toBe(error);
  });
});
