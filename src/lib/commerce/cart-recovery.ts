import {
  cartForFailure,
  type CartActionFailure,
  type CartActionResult,
} from "./cart-types";

/** A lost mutation response may still have changed the Bag. Read, never replay. */
export async function recoverCartMutation(
  action: () => Promise<CartActionResult>,
  readCart: () => Promise<CartActionResult>,
  connectionFailure: CartActionFailure,
): Promise<CartActionResult> {
  let result: CartActionResult;
  try {
    result = await action();
  } catch {
    result = connectionFailure;
  }
  if (
    result.ok ||
    result.error.code === "CART_EXPIRED" ||
    result.error.code === "CART_NOT_FOUND"
  )
    return result;

  try {
    const latest = await readCart();
    const cart = latest.ok ? latest.cart : cartForFailure(latest);
    return cart ? { ...result, cart } : result;
  } catch {
    return result;
  }
}
