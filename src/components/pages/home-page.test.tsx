import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Product } from "@/lib/commerce/types";

const mocks = vi.hoisted(() => ({ getAvailableProducts: vi.fn(), getCatalogNavigationData: vi.fn() }));
vi.mock("@/lib/commerce/catalog", () => ({
  getAvailableProducts: mocks.getAvailableProducts,
  getCatalogNavigationData: mocks.getCatalogNavigationData,
}));

import { HomePage } from "./home-page";

function product(
  handle: string,
  title: string,
  availableForSale: boolean,
): Product {
  return {
    id: `product-${handle}`,
    handle,
    title,
    description: "",
    descriptionHtml: "",
    availableForSale,
    priceRange: {
      minVariantPrice: { amount: "35.00", currencyCode: "USD" },
      maxVariantPrice: { amount: "35.00", currencyCode: "USD" },
    },
    compareAtPrice: null,
    featuredImage: null,
    images: [],
    variants: [],
    category: null,
  };
}

beforeEach(() => {
  mocks.getAvailableProducts.mockReset();
  mocks.getCatalogNavigationData.mockResolvedValue({ categories: [], collections: [] });
  mocks.getAvailableProducts.mockResolvedValue([]);
});

describe("Home page", () => {
  it("renders Chinese UI and links while retaining Shopify English product content", async () => {
    mocks.getAvailableProducts.mockResolvedValue([product("english-piece", "English piece", true)]);
    const html = renderToStaticMarkup(await HomePage({ locale: "zh-Hant-US" }));
    expect(mocks.getAvailableProducts).toHaveBeenCalledWith("us", "zh-Hant-US", 4);
    expect(html).toContain("天然形態，自有意義。");
    expect(html).toContain("精選飾物");
    expect(html).toContain("English piece");
    expect(html).toContain('href="/zh-hant-us/products/english-piece"');
    expect(html).toContain('href="/zh-hant-us/about"');
    expect(html).toContain("USD\u00a035");
  });
  it("falls back to the approved editorial image and omits Blog and Collection modules", async () => {
    const html = renderToStaticMarkup(await HomePage({ locale: "en-US" }));

    expect(html).toContain("Natural forms. Personal meaning.");
    expect(html).toContain("Shop all");
    expect(html).toContain("Our story");
    expect(html).toContain("joya-mana-home-hero.webp");
    expect(html).not.toContain("bling-omen-editorial-hero.png");
    expect(html).not.toContain("From the blog");
    expect(html).not.toContain("collection-strip");
    expect(html).not.toContain("Shopify");
  });

  it("presents the About-aligned intention with a localized About link", async () => {
    const english = renderToStaticMarkup(
      await HomePage({ locale: "en-US" }),
    );
    const spanish = renderToStaticMarkup(
      await HomePage({ locale: "es-US" }),
    );

    expect(english).toContain("A crystal can be a way back to yourself.");
    expect(english).toContain('href="/about"');
    expect(english).toContain("Read our story");
    expect(spanish).toContain("Un cristal puede ser una forma de volver a ti.");
    expect(spanish).toContain('href="/es-us/about"');
    expect(spanish).toContain("Conoce nuestra historia");
  });

  it("excludes unavailable products from featured cards", async () => {
    mocks.getAvailableProducts.mockResolvedValue([
      product("unavailable-piece", "Unavailable piece", false),
      product("available-piece", "Available piece", true),
    ]);

    const html = renderToStaticMarkup(await HomePage({ locale: "en-US" }));

    expect(html).toContain("Available piece");
    expect(html).toContain('href="/products/available-piece"');
    expect(html).not.toContain("Unavailable piece");
    expect(html).not.toContain('href="/products/unavailable-piece"');
  });
  it("keeps empty inventory honest and category links based on the full navigation source", async () => {
    mocks.getCatalogNavigationData.mockResolvedValue({ categories: [{ handle: "gemstones", title: "Gemstones" }], collections: [] });
    const html = renderToStaticMarkup(await HomePage({ locale: "en-US" }));
    expect(html).toContain("No pieces are available to purchase");
    expect(html).toContain('href="/category/gemstones"');
    expect(html).not.toContain("product-card__price");
  });

});
