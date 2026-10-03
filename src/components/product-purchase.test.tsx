import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Product } from "@/lib/commerce/types";
import { ProductPurchase } from "./product-purchase";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("./cart-provider", () => ({
  useCart: () => ({
    checkoutEnabled: true,
    cart: { lines: [] },
    status: "ready",
    error: null,
  }),
}));

const product: Product = {
  id: "gid://shopify/Product/1",
  handle: "bracelet",
  title: "Bracelet",
  description: "Natural stone bracelet.",
  descriptionHtml: "",
  availableForSale: true,
  category: null,
  featuredImage: null,
  images: [],
  priceRange: {
    minVariantPrice: { amount: "20", currencyCode: "USD" },
    maxVariantPrice: { amount: "60", currencyCode: "USD" },
  },
  variants: ["11", "12"].map((id, index) => ({
    id: `gid://shopify/ProductVariant/${id}`,
    title: index ? "Purple" : "Blue",
    availableForSale: true,
    currentlyNotInStock: false,
    quantityAvailable: 4,
    compareAtPrice: null,
    selectedOptions: [],
    price: { amount: index ? "60.00" : "20.00", currencyCode: "USD" },
    image: {
      url: `https://cdn.shopify.com/${id}.jpg`,
      altText: `Option ${id}`,
      width: 1200,
      height: 1200,
    },
    quantityRule: { minimum: index ? 2 : 1, maximum: null, increment: 1 },
  })),
};

describe("PDP server initialized option", () => {
  it("uses a real product image when the selected variant has no image", () => {
    const image = product.variants[1].image!;
    const item = {
      ...product,
      images: [image],
      variants: product.variants.map((v) => ({ ...v, image: null })),
    };
    const html = renderToStaticMarkup(
      <ProductPurchase product={item} locale="en-US" />,
    );
    const main = html.split('class="product-gallery__main"')[1];
    expect(decodeURIComponent(main)).toContain("12.jpg");
    expect(html).not.toContain("Product image unavailable");
  });

  it("does not infer inventory policy or display exact scarcity from quantity alone", () => {
    const item = {
      ...product,
      model: "standard" as const,
      variants: product.variants.map((v) => ({ ...v, quantityAvailable: 1 })),
    };
    const html = renderToStaticMarkup(
      <ProductPurchase product={item} locale="en-US" />,
    );
    expect(html).not.toMatch(/Only \d+ left|low-stock-note/);
  });

  it("renders the linked option price, image and minimum quantity before hydration", () => {
    const html = renderToStaticMarkup(
      <ProductPurchase
        product={product}
        locale="en-US"
        initialVariantId={product.variants[1].id}
      />,
    );
    const main = html
      .split('class="product-gallery__main"')[1]
      .split('class="product-gallery__thumbs"')[0];
    expect(decodeURIComponent(main)).toContain("12.jpg");
    expect(decodeURIComponent(main)).not.toContain("11.jpg");
    expect(html).toContain('class="display-price">$60 USD');
    expect(html).toContain('value="2"');
    expect(html).toContain(": <strong>Purple</strong>");
  });

  it("keeps the linked sold-out option and disables both purchase actions", () => {
    const item = {
      ...product,
      variants: product.variants.map((variant, index) =>
        index
          ? { ...variant, availableForSale: false, quantityAvailable: 0 }
          : variant,
      ),
    };
    const html = renderToStaticMarkup(
      <ProductPurchase
        product={item}
        locale="en-US"
        initialVariantId={item.variants[1].id}
      />,
    );
    expect(html).toContain(": <strong>Purple</strong>");
    expect(html).toMatch(
      /class="button button--primary button--wide"[^>]*disabled/,
    );
    expect(html).toMatch(
      /class="button button--secondary button--wide"[^>]*disabled/,
    );
  });

  it.each([null, "gid://shopify/ProductVariant/99999"])(
    "requires an explicit valid selection for a missing or foreign variant (%s)",
    (initialVariantId) => {
      const html = renderToStaticMarkup(
        <ProductPurchase
          product={product}
          locale="en-US"
          initialVariantId={initialVariantId}
        />,
      );
      expect(html).toContain("Please choose an option.");
      const picker =
        html.split('class="variant-picker"')[1]?.split("</div>")[0] ?? "";
      expect(picker).not.toContain('aria-pressed="true"');
      expect(html).toMatch(
        /class="button button--primary button--wide"[^>]*disabled/,
      );
      expect(html).toContain("Natural stone bracelet.");
    },
  );
});
