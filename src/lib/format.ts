export function formatPrice(
  value: number,
  locale: string,
  currency: "USD" | "CAD",
) {
  const amount = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

  return `${amount} ${currency}`;
}
