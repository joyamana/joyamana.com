import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import { emptyCartView } from "@/lib/commerce/cart-types";
import { CartView } from "./cart-view";

const mocks = vi.hoisted(() => ({ useCart: vi.fn() }));
vi.mock("./cart-provider", () => ({ useCart: mocks.useCart }));

beforeEach(() =>
  mocks.useCart.mockReturnValue({
    cart: emptyCartView(),
    hasLoaded: false,
    status: "ready",
    error: { code: "SHOPIFY_ERROR", message: "Connection failed." },
  }),
);

it("does not describe an unread Bag as empty after its initial read fails", () => {
  const html = renderToStaticMarkup(<CartView locale="en-US" />);
  expect(html).toContain("We couldn’t load your bag.");
  expect(html).toContain("Try again");
  expect(html).not.toContain("Your bag is empty.");
});

it("shows an empty Bag only after its state has been confirmed", () => {
  mocks.useCart.mockReturnValue({
    cart: emptyCartView(),
    hasLoaded: true,
    status: "ready",
    error: null,
  });
  const html = renderToStaticMarkup(<CartView locale="en-US" />);
  expect(html).toContain("Your bag is empty.");
  expect(html).not.toContain("We couldn’t load your bag.");
});
