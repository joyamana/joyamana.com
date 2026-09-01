import type {
  CartActionErrorCode,
  CartActionFailure,
  CartMoney,
  CartView,
  CartWarningView,
} from "./cart-types";
import { cartErrorMessage } from "./cart-types";
import { shopifyFetch } from "./shopify";
import {
  STOREFRONT_MAX_QUANTITY,
  isValidProductQuantity,
  isValidQuantityRule,
  type ProductQuantityRule,
} from "./types";

const MAX_CART_LINES = 250;
export type ShopifyCartLanguage = "EN" | "ES";

interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  currentlyNotInStock: boolean;
  quantityAvailable: number | null;
  image: ShopifyImage | null;
  price: ShopifyMoney;
  quantityRule: ProductQuantityRule;
  product: {
    handle: string;
    title: string;
  };
}

interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: ShopifyProductVariant;
  cost: {
    totalAmount: ShopifyMoney;
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: ShopifyMoney;
  };
  lines: {
    nodes: ShopifyCartLine[];
  };
}

interface ShopifyCartUserError {
  code?: string | null;
  field?: string[] | null;
  message: string;
}

interface ShopifyCartWarning {
  code: string;
  message: string;
}

interface ShopifyCartMutationPayload {
  cart: ShopifyCart | null;
  userErrors: ShopifyCartUserError[];
  warnings: ShopifyCartWarning[];
}

interface ShopifyCartMutationResult {
  cart: ShopifyCart;
  warnings: ShopifyCartWarning[];
}

export interface ShopifyCartLineInput {
  merchandiseId: string;
  quantity: number;
}

export interface ShopifyCartLineUpdateInput {
  id: string;
  quantity: number;
}

export interface ShopifyCartRecoveryResult extends ShopifyCartMutationResult {
  replacedCart: boolean;
}

export class ShopifyCartError extends Error {
  readonly code: CartActionErrorCode;

  constructor(code: CartActionErrorCode, message?: string) {
    super(message ?? safeCartErrorMessage(code));
    this.name = "ShopifyCartError";
    this.code = code;
  }
}

const cartFields = `#graphql
  fragment JoyaManaCartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
    }
    lines(first: ${MAX_CART_LINES}) {
      nodes {
        id
        quantity
        cost {
          totalAmount { amount currencyCode }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            currentlyNotInStock
            quantityAvailable
            price { amount currencyCode }
            quantityRule { minimum maximum increment }
            image { url altText width height }
            product { handle title }
          }
        }
      }
    }
  }
`;

const cartQuery = `#graphql
  ${cartFields}
  query JoyaManaCart($id: ID!, $language: LanguageCode!)
    @inContext(country: US, language: $language) {
    cart(id: $id) { ...JoyaManaCartFields }
  }
`;

const cartCreateMutation = `#graphql
  ${cartFields}
  mutation JoyaManaCartCreate($input: CartInput!, $language: LanguageCode!)
    @inContext(country: US, language: $language) {
    cartCreate(input: $input) {
      cart { ...JoyaManaCartFields }
      userErrors { code field message }
      warnings { code message }
    }
  }
`;

const cartLinesAddMutation = `#graphql
  ${cartFields}
  mutation JoyaManaCartLinesAdd(
    $cartId: ID!
    $lines: [CartLineInput!]!
    $language: LanguageCode!
  ) @inContext(country: US, language: $language) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...JoyaManaCartFields }
      userErrors { code field message }
      warnings { code message }
    }
  }
`;

const cartLinesUpdateMutation = `#graphql
  ${cartFields}
  mutation JoyaManaCartLinesUpdate(
    $cartId: ID!
    $lines: [CartLineUpdateInput!]!
    $language: LanguageCode!
  ) @inContext(country: US, language: $language) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...JoyaManaCartFields }
      userErrors { code field message }
      warnings { code message }
    }
  }
`;

const cartLinesRemoveMutation = `#graphql
  ${cartFields}
  mutation JoyaManaCartLinesRemove(
    $cartId: ID!
    $lineIds: [ID!]!
    $language: LanguageCode!
  ) @inContext(country: US, language: $language) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...JoyaManaCartFields }
      userErrors { code field message }
      warnings { code message }
    }
  }
`;

export function isValidCartQuantity(quantity: number) {
  return (
    Number.isInteger(quantity) &&
    quantity >= 1 &&
    quantity <= STOREFRONT_MAX_QUANTITY
  );
}

export function assertValidCartQuantity(quantity: number) {
  if (!isValidCartQuantity(quantity)) {
    throw new ShopifyCartError("INVALID_QUANTITY");
  }
}

export function isShopifyCartId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > "gid://shopify/Cart/".length &&
    value.length <= 2048 &&
    value.startsWith("gid://shopify/Cart/") &&
    !/[\r\n]/.test(value)
  );
}

export function isShopifyVariantId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^gid:\/\/shopify\/ProductVariant\/[A-Za-z0-9_-]+$/.test(value)
  );
}

export function isShopifyCartLineId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > "gid://shopify/CartLine/".length &&
    value.length <= 2048 &&
    value.startsWith("gid://shopify/CartLine/") &&
    !/[\r\n]/.test(value)
  );
}

function assertCartId(cartId: string) {
  if (!isShopifyCartId(cartId)) {
    throw new ShopifyCartError("CART_NOT_FOUND");
  }
}

function assertVariantId(merchandiseId: string) {
  if (!isShopifyVariantId(merchandiseId)) {
    throw new ShopifyCartError("INVALID_INPUT");
  }
}

function assertLineId(lineId: string) {
  if (!isShopifyCartLineId(lineId)) {
    throw new ShopifyCartError("INVALID_INPUT");
  }
}

function assertLineInput(line: ShopifyCartLineInput) {
  assertVariantId(line.merchandiseId);
  assertValidCartQuantity(line.quantity);
}

function normalizeMoney(money: ShopifyMoney): CartMoney {
  if (
    !/^\d+(?:\.\d+)?$/.test(money.amount) ||
    money.currencyCode !== "USD"
  ) {
    throw new ShopifyCartError("SHOPIFY_ERROR");
  }

  return {
    amount: money.amount,
    currencyCode: "USD",
  };
}

function normalizeQuantityRule(rule: ProductQuantityRule) {
  if (!isValidQuantityRule(rule)) {
    throw new ShopifyCartError("SHOPIFY_ERROR");
  }
  return { ...rule };
}

function normalizeInventory(variant: ShopifyProductVariant) {
  if (
    typeof variant.currentlyNotInStock !== "boolean" ||
    (variant.quantityAvailable !== null &&
      (!Number.isInteger(variant.quantityAvailable) ||
        variant.quantityAvailable < 0))
  ) {
    throw new ShopifyCartError("SHOPIFY_ERROR");
  }

  return {
    currentlyNotInStock: variant.currentlyNotInStock,
    quantityAvailable: variant.quantityAvailable,
  };
}

function safeWarningMessage(message: string) {
  if (
    /gid:\/\/shopify\/Cart\//i.test(message) ||
    /https:\/\/\S+(?:\/cart\/c\/|\/checkouts\/)/i.test(message)
  ) {
    return "Your bag was updated. Review the items before checkout.";
  }

  return message.replace(/\bShopify\b/gi, "The store").slice(0, 500);
}

function mapWarnings(warnings: ShopifyCartWarning[]): CartWarningView[] {
  return warnings.map((warning) => ({
    code: warning.code,
    message: safeWarningMessage(warning.message),
  }));
}

function mapCartLine(line: ShopifyCartLine) {
  const quantityRule = normalizeQuantityRule(line.merchandise.quantityRule);
  if (!isValidProductQuantity(line.quantity, quantityRule)) {
    throw new ShopifyCartError("SHOPIFY_ERROR");
  }

  return {
    id: line.id,
    merchandiseId: line.merchandise.id,
    productHandle: line.merchandise.product.handle,
    productTitle: line.merchandise.product.title,
    variantTitle: line.merchandise.title,
    image: line.merchandise.image
      ? {
          url: line.merchandise.image.url,
          altText: line.merchandise.image.altText,
          width: line.merchandise.image.width,
          height: line.merchandise.image.height,
        }
      : null,
    availableForSale: line.merchandise.availableForSale,
    ...normalizeInventory(line.merchandise),
    quantity: line.quantity,
    quantityRule,
    unitPrice: normalizeMoney(line.merchandise.price),
    totalPrice: normalizeMoney(line.cost.totalAmount),
  };
}

export function mapShopifyCart(
  cart: ShopifyCart,
  warnings: ShopifyCartWarning[] = [],
): CartView {
  return {
    lines: cart.lines.nodes.map(mapCartLine),
    totalQuantity: cart.totalQuantity,
    subtotal: normalizeMoney(cart.cost.subtotalAmount),
    warnings: mapWarnings(warnings),
  };
}

export function emptyCartView(): CartView {
  return {
    lines: [],
    totalQuantity: 0,
    subtotal: { amount: "0.0", currencyCode: "USD" },
    warnings: [],
  };
}

function classifyUserErrors(errors: ShopifyCartUserError[]) {
  const cartError = errors.find(
    (error) =>
      error.field?.some((field) => field.toLowerCase().includes("cartid")) ||
      /\bcart\b.*\b(?:expired|invalid|not found|does not exist)\b/i.test(
        error.message,
      ),
  );
  if (cartError) return "CART_EXPIRED" as const;

  const unavailableCodes = new Set([
    "INVALID_MERCHANDISE_LINE",
    "MERCHANDISE_NOT_APPLICABLE",
    "VARIANT_REQUIRES_SELLING_PLAN",
    "SELLING_PLAN_NOT_APPLICABLE",
  ]);
  const unavailableError = errors.find(
    (error) =>
      /(?:sold out|not available|unavailable|insufficient|inventory)/i.test(
        error.message,
      ) || (error.code ? unavailableCodes.has(error.code) : false),
  );
  if (unavailableError) return "UNAVAILABLE" as const;

  const quantityCodes = new Set([
    "LESS_THAN",
    "INVALID_INCREMENT",
    "MINIMUM_NOT_MET",
    "MAXIMUM_EXCEEDED",
  ]);
  const quantityError = errors.find(
    (error) =>
      error.field?.some((field) => field.toLowerCase().includes("quantity")) ||
      /quantity/i.test(error.message) ||
      (error.code ? quantityCodes.has(error.code) : false),
  );
  if (quantityError) return "INVALID_QUANTITY" as const;

  return "SHOPIFY_ERROR" as const;
}

function unwrapMutation(
  payload: ShopifyCartMutationPayload,
): ShopifyCartMutationResult {
  if (payload.userErrors.length > 0) {
    throw new ShopifyCartError(classifyUserErrors(payload.userErrors));
  }

  if (!payload.cart || !isShopifyCartId(payload.cart.id)) {
    throw new ShopifyCartError("SHOPIFY_ERROR");
  }

  return { cart: payload.cart, warnings: payload.warnings };
}

const noStore = { cache: "no-store" } as const;

export async function getShopifyCart(
  cartId: string,
  language: ShopifyCartLanguage = "EN",
) {
  assertCartId(cartId);
  const data = await shopifyFetch<{ cart: ShopifyCart | null }>(
    cartQuery,
    { id: cartId, language },
    noStore,
  );
  return data.cart;
}

export async function createShopifyCart(
  lines: ShopifyCartLineInput[] = [],
  language: ShopifyCartLanguage = "EN",
): Promise<ShopifyCartMutationResult> {
  lines.forEach(assertLineInput);

  const data = await shopifyFetch<{
    cartCreate: ShopifyCartMutationPayload;
  }>(
    cartCreateMutation,
    {
      input: {
        buyerIdentity: { countryCode: "US" },
        lines,
      },
      language,
    },
    noStore,
  );

  return unwrapMutation(data.cartCreate);
}

export async function addShopifyCartLines(
  cartId: string,
  lines: ShopifyCartLineInput[],
  language: ShopifyCartLanguage = "EN",
): Promise<ShopifyCartMutationResult> {
  assertCartId(cartId);
  if (lines.length === 0) throw new ShopifyCartError("INVALID_INPUT");
  lines.forEach(assertLineInput);

  const data = await shopifyFetch<{
    cartLinesAdd: ShopifyCartMutationPayload;
  }>(cartLinesAddMutation, { cartId, lines, language }, noStore);

  return unwrapMutation(data.cartLinesAdd);
}

export async function updateShopifyCartLines(
  cartId: string,
  lines: ShopifyCartLineUpdateInput[],
  language: ShopifyCartLanguage = "EN",
): Promise<ShopifyCartMutationResult> {
  assertCartId(cartId);
  if (lines.length === 0) throw new ShopifyCartError("INVALID_INPUT");
  lines.forEach((line) => {
    assertLineId(line.id);
    assertValidCartQuantity(line.quantity);
  });

  const data = await shopifyFetch<{
    cartLinesUpdate: ShopifyCartMutationPayload;
  }>(cartLinesUpdateMutation, { cartId, lines, language }, noStore);

  return unwrapMutation(data.cartLinesUpdate);
}

export async function removeShopifyCartLines(
  cartId: string,
  lineIds: string[],
  language: ShopifyCartLanguage = "EN",
): Promise<ShopifyCartMutationResult> {
  assertCartId(cartId);
  if (lineIds.length === 0) throw new ShopifyCartError("INVALID_INPUT");
  lineIds.forEach(assertLineId);

  const data = await shopifyFetch<{
    cartLinesRemove: ShopifyCartMutationPayload;
  }>(cartLinesRemoveMutation, { cartId, lineIds, language }, noStore);

  return unwrapMutation(data.cartLinesRemove);
}

export async function clearShopifyCart(
  cartId: string,
  language: ShopifyCartLanguage = "EN",
) {
  const cart = await getShopifyCart(cartId, language);
  if (!cart) throw new ShopifyCartError("CART_EXPIRED");

  const lineIds = cart.lines.nodes.map((line) => line.id);
  if (lineIds.length === 0) return { cart, warnings: [] };

  return removeShopifyCartLines(cartId, lineIds, language);
}

export async function addShopifyCartLineWithRecovery(
  cartId: string | null,
  line: ShopifyCartLineInput,
  language: ShopifyCartLanguage = "EN",
): Promise<ShopifyCartRecoveryResult> {
  assertLineInput(line);

  if (!cartId || !isShopifyCartId(cartId)) {
    return {
      ...(await createShopifyCart([line], language)),
      replacedCart: true,
    };
  }

  try {
    return {
      ...(await addShopifyCartLines(cartId, [line], language)),
      replacedCart: false,
    };
  } catch (error) {
    if (error instanceof ShopifyCartError && error.code === "CART_EXPIRED") {
      return {
        ...(await createShopifyCart([line], language)),
        replacedCart: true,
      };
    }
    throw error;
  }
}

function normalizeConfiguredHost(value: string | undefined) {
  if (!value) return null;

  try {
    const url = value.includes("://")
      ? new URL(value)
      : new URL(`https://${value}`);
    return url.hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function validateCheckoutUrl(
  checkoutUrl: string,
  config: {
    checkoutDomain?: string;
    storeDomain?: string;
  } = {
    checkoutDomain: process.env.SHOPIFY_CHECKOUT_DOMAIN,
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN,
  },
) {
  let url: URL;
  try {
    url = new URL(checkoutUrl);
  } catch {
    throw new ShopifyCartError("CHECKOUT_URL_INVALID");
  }

  const hostname = url.hostname.toLowerCase();
  const allowedConfiguredHosts = [
    normalizeConfiguredHost(config.checkoutDomain),
    normalizeConfiguredHost(config.storeDomain),
  ].filter((host): host is string => Boolean(host));
  const hasCheckoutPath = /^\/(?:es\/)?(?:cart\/c|checkouts)(?:\/|$)/.test(
    url.pathname,
  );

  if (
    url.protocol !== "https:" ||
    url.username !== "" ||
    url.password !== "" ||
    (url.port !== "" && url.port !== "443") ||
    url.hash !== "" ||
    !allowedConfiguredHosts.includes(hostname) ||
    !hasCheckoutPath
  ) {
    throw new ShopifyCartError("CHECKOUT_URL_INVALID");
  }

  return url.toString();
}

export function safeCartErrorMessage(
  code: CartActionErrorCode,
  language: ShopifyCartLanguage = "EN",
) {
  return cartErrorMessage(code, language);
}

export function toSafeCartFailure(
  error: unknown,
  language: ShopifyCartLanguage = "EN",
): CartActionFailure {
  const code =
    error instanceof ShopifyCartError ? error.code : "SHOPIFY_ERROR";
  return {
    ok: false,
    error: {
      code,
      message: safeCartErrorMessage(code, language),
    },
  };
}
