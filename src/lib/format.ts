import type { Money } from "@/lib/commerce/types";

export function formatPrice(
  value: number | string,
  locale: string,
  currency: "USD" | "CAD",
) {
  const numericValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    throw new RangeError("Price amount must be a finite number.");
  }

  const fractionDigits = Number.isInteger(numericValue) ? 0 : 2;
  const amount = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(numericValue);

  return `${amount} ${currency}`;
}

export function formatMoney(money: Money, locale: string) {
  return formatPrice(money.amount, locale, money.currencyCode);
}

export function formatPriceRange(
  range: { minVariantPrice: Money; maxVariantPrice: Money },
  locale: string,
) {
  const { minVariantPrice, maxVariantPrice } = range;
  if (
    minVariantPrice.amount === maxVariantPrice.amount &&
    minVariantPrice.currencyCode === maxVariantPrice.currencyCode
  ) {
    return formatMoney(minVariantPrice, locale);
  }

  return `${formatMoney(minVariantPrice, locale)} – ${formatMoney(maxVariantPrice, locale)}`;
}
