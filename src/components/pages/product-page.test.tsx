import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Product, ProductSummary } from "@/lib/commerce/types";

const catalog = vi.hoisted(() => ({
  getProduct: vi.fn(),
  getProductRecommendations: vi.fn(),
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

const product: Product = {
  id: "product-1",
  handle: "bracelet",
  title: "Bracelet",
  description: "",
  descriptionHtml: "",
  availableForSale: true,
  featuredImage: null,
  images: [],
  variants: [],
  category: { id: "bracelets", name: "Bracelets" },
  priceRange: {
    minVariantPrice: { amount: "68.00", currencyCode: "USD" },
    maxVariantPrice: { amount: "72.00", currencyCode: "USD" },
  },
};
const related: ProductSummary = {
  ...product,
  id: "product-2",
  handle: "related-bracelet",
  title: "Related bracelet",
};

beforeEach(() => {
  catalog.getProduct.mockResolvedValue(product);
  catalog.getProducts.mockResolvedValue([]);
  catalog.getProductRecommendations.mockResolvedValue([]);
});
afterEach(() => vi.resetAllMocks());

describe("product detail availability", () => {
  it("keeps a valid product purchasable when recommendations fail", async () => {
    catalog.getProducts.mockRejectedValue(new Error("Catalog unavailable"));
    catalog.getProductRecommendations.mockRejectedValue(
      new Error("Recommendations unavailable"),
    );
    const html = renderToStaticMarkup(
      await ProductPage({ locale: "en-US", handle: "bracelet" }),
    );
    expect(html).toContain("Purchase controls");
    expect(html).not.toContain("product-grid");
  });

  it("renders localized recommendations when the full catalog fails", async () => {
    catalog.getProducts.mockRejectedValue(new Error("Catalog unavailable"));
    catalog.getProductRecommendations.mockResolvedValue([related]);
    const html = renderToStaticMarkup(
      await ProductPage({ locale: "zh-Hant-US", handle: "bracelet" }),
    );
    expect(html).toContain("Purchase controls");
    expect(html).toContain('href="/zh-hant-us/products/related-bracelet"');
    expect(catalog.getProductRecommendations).toHaveBeenCalledWith(
      "bracelet",
      "us",
      "zh-Hant-US",
    );
  });

  it("uses category fallback when Shopify recommendations fail and excludes unavailable products", async () => {
    catalog.getProductRecommendations.mockRejectedValue(
      new Error("Recommendations unavailable"),
    );
    catalog.getProducts.mockResolvedValue([
      product,
      {
        ...related,
        id: "sold-out",
        handle: "sold-out",
        availableForSale: false,
      },
      related,
    ]);
    const html = renderToStaticMarkup(
      await ProductPage({ locale: "en-US", handle: "bracelet" }),
    );
    expect(html).toContain("Purchase controls");
    expect(html).toContain('href="/products/related-bracelet"');
    expect(html).not.toContain('href="/products/sold-out"');
    expect(
      (html.match(/class="product-card product-card--/g) ?? []).length,
    ).toBe(1);
  });

  it("omits the recommendation section if no eligible product exists", async () => {
    catalog.getProducts.mockResolvedValue([product]);
    catalog.getProductRecommendations.mockResolvedValue([
      { ...related, availableForSale: false },
    ]);
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
