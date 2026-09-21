import type { Money } from "@/lib/commerce/types";
import { localeRegistry, type SupportedLocale } from "@/config/locales";

export function formatPrice(
  value: number | string,
  locale: SupportedLocale,
  currency: "USD" | "CAD",
) {
  const numericValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    throw new RangeError("Price amount must be a finite number.");
  }

  const fractionDigits = Number.isInteger(numericValue) ? 0 : 2;
  return new Intl.NumberFormat(localeRegistry[locale].formatLocale, {
    style: "currency",
    currency,
    currencyDisplay: "code",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(numericValue);
}

export function formatMoney(money: Money, locale: SupportedLocale) {
  return formatPrice(money.amount, locale, money.currencyCode);
}

export function formatPriceRange(
  range: { minVariantPrice: Money; maxVariantPrice: Money },
  locale: SupportedLocale,
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

export function formatDate(value: string, locale: SupportedLocale) {
  return new Intl.DateTimeFormat(localeRegistry[locale].formatLocale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(value));
}
