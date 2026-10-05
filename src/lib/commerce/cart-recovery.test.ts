import { describe, expect, it, vi } from "vitest";
import { recoverCartMutation } from "./cart-recovery";
import { emptyCartView, type CartActionFailure } from "./cart-types";

const failure: CartActionFailure = {
  ok: false,
  error: { code: "SHOPIFY_ERROR", message: "Connection failed." },
};

describe("Bag mutation response recovery", () => {
  it("reads the actual Bag after a lost response without repeating the mutation", async () => {
    const action = vi.fn().mockRejectedValue(new Error("Response lost"));
    const cart = { ...emptyCartView(), totalQuantity: 3 };
    const read = vi.fn().mockResolvedValue({ ok: true, cart });
    expect(await recoverCartMutation(action, read, failure)).toEqual({
      ...failure,
      cart,
    });
    expect(action).toHaveBeenCalledTimes(1);
    expect(read).toHaveBeenCalledTimes(1);
  });

  it("uses the newer read after a partial business failure and retains its original error", async () => {
    const original: CartActionFailure = {
      ...failure,
      cart: { ...emptyCartView(), totalQuantity: 4 },
    };
    const latest = { ...emptyCartView(), totalQuantity: 2 };
    expect(
      await recoverCartMutation(
        async () => original,
        async () => ({ ok: true, cart: latest }),
        failure,
      ),
    ).toEqual({ ...original, cart: latest });
  });

  it("keeps the previous Bag when neither the mutation response nor recovery read succeeds", async () => {
    const read = vi.fn().mockRejectedValue(new Error("Read failed"));
    const result = await recoverCartMutation(
      async () => failure,
      read,
      failure,
    );
    expect(result).toEqual(failure);
    expect(result).not.toHaveProperty("cart");
  });

  it("clears stale lines when recovery confirms that the Bag expired", async () => {
    expect(
      await recoverCartMutation(
        async () => failure,
        async () => ({
          ok: false,
          error: { code: "CART_EXPIRED", message: "Expired" },
        }),
        failure,
      ),
    ).toEqual({ ...failure, cart: emptyCartView() });
  });

  it("does not perform recovery for successful or confirmed-expired operations", async () => {
    const read = vi.fn();
    const success = { ok: true as const, cart: emptyCartView() };
    expect(await recoverCartMutation(async () => success, read, failure)).toBe(
      success,
    );
    const expired = {
      ...failure,
      error: { code: "CART_EXPIRED" as const, message: "Expired" },
    };
    expect(await recoverCartMutation(async () => expired, read, failure)).toBe(
      expired,
    );
    expect(read).not.toHaveBeenCalled();
  });
});
