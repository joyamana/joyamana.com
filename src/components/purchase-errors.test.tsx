import { isValidElement, type ReactElement, type ReactNode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AddToCart } from "./add-to-cart";
import { BuyNow } from "./buy-now";
import { emptyCartView } from "@/lib/commerce/cart-types";

// Exercise the controls' handlers and retained state without adding a DOM library.
const hooks = vi.hoisted(() => ({
  states: [] as unknown[],
  cursor: 0,
  cleanup: undefined as (() => void) | undefined,
}));
const mocks = vi.hoisted(() => ({
  useCart: vi.fn(),
  add: vi.fn(),
  buy: vi.fn(),
}));
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useState: (initial: unknown) => {
    const states = hooks.states;
    const index = hooks.cursor++;
    if (!(index in states)) states[index] = initial;
    return [
      states[index],
      (value: unknown) => {
        states[index] = value;
      },
    ];
  },
  useRef: (initial: unknown) => {
    const index = hooks.cursor++;
    if (!(index in hooks.states)) hooks.states[index] = { current: initial };
    return hooks.states[index];
  },
  useEffect: (effect: () => () => void) => {
    hooks.cleanup = effect();
  },
  useId: () => "purchase-message",
}));
vi.mock("./cart-provider", () => ({ useCart: mocks.useCart }));

function elements(node: ReactNode): ReactElement<Record<string, unknown>>[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!isValidElement<Record<string, unknown>>(node)) return [];
  return [node, ...elements(node.props.children as ReactNode)];
}
function control(render: () => ReactNode) {
  const states: unknown[] = [];
  return () => {
    hooks.states = states;
    hooks.cursor = 0;
    return elements(render());
  };
}
const addProps = {
  variantId: "1",
  quantity: 1,
  maximumQuantity: 99,
  available: true,
  label: "Add",
  unavailableLabel: "Unavailable",
  limitReachedLabel: "Limit",
};
const failure = (message: string) => ({
  ok: false,
  error: { code: "SHOPIFY_ERROR", message },
});
const click = async (tree: ReactElement<Record<string, unknown>>[]) => {
  const button = tree.find((element) => element.type === "button")!;
  await (button.props.onClick as () => Promise<void>)();
};

beforeEach(() => {
  vi.useFakeTimers();
  mocks.add.mockReset();
  mocks.buy.mockReset();
  mocks.useCart.mockReturnValue({
    addItem: mocks.add,
    buyNow: mocks.buy,
    cart: emptyCartView(),
    clearError: vi.fn(),
    error: null,
    status: "ready",
    checkoutEnabled: true,
  });
});
afterEach(() => {
  hooks.cleanup?.();
  vi.useRealTimers();
});

it("keeps Add's error when Buy now clears shared feedback and fails separately", async () => {
  const renderAdd = control(() => AddToCart(addProps));
  const renderBuy = control(() =>
    BuyNow({ variantId: "1", quantity: 1, available: true, locale: "en-US" }),
  );
  mocks.add.mockResolvedValue(failure("Add response lost."));
  await click(renderAdd());
  mocks.buy.mockResolvedValue(failure("Checkout unavailable."));
  await click(renderBuy());
  const addTree = renderAdd();
  const buyTree = renderBuy();
  expect(
    addTree.find((element) => element.props.role === "alert")?.props.children,
  ).toBe("Add response lost.");
  expect(
    buyTree.find((element) => element.props.role === "alert")?.props.children,
  ).toBe("Checkout unavailable.");
  expect(
    addTree.find((element) => element.type === "button")?.props[
      "aria-describedby"
    ],
  ).toBe("purchase-message");
  mocks.add.mockResolvedValue({ ok: true, cart: emptyCartView() });
  await click(renderAdd());
  expect(
    renderAdd().find((element) => element.type === "button")?.props[
      "aria-describedby"
    ],
  ).toBeUndefined();
  expect(renderAdd().some((element) => element.props.role === "alert")).toBe(
    false,
  );
});

it("cancels the previous success timer before starting new Add feedback", async () => {
  const render = control(() => AddToCart(addProps));
  mocks.add.mockResolvedValue({ ok: true, cart: emptyCartView() });
  await click(render());
  vi.advanceTimersByTime(1000);
  await click(render());
  vi.advanceTimersByTime(600);
  expect(
    render().find((element) => element.type === "button")?.props.children,
  ).toBe("✓ Added");
  vi.advanceTimersByTime(1000);
  expect(
    render().find((element) => element.type === "button")?.props.children,
  ).toBe("Add");
});
