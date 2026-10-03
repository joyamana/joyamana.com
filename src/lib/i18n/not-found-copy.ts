import type { EnabledLocale } from "@/config/locales";

const copy = {
  "en-US": {
    label: "Page not found",
    title: "We couldn’t find that page.",
    description: "The page may have moved, or the address may be incorrect.",
    shop: "Shop all",
    home: "Return home",
  },
  "es-US": {
    label: "Página no encontrada",
    title: "No pudimos encontrar esta página.",
    description:
      "La página puede haberse movido o la dirección puede ser incorrecta.",
    shop: "Ver todos los productos",
    home: "Volver al inicio",
  },
  "zh-Hant-US": {
    label: "找不到頁面",
    title: "未能找到此頁面。",
    description: "頁面可能已移動，或網址不正確。",
    shop: "選購所有商品",
    home: "返回首頁",
  },
} as const;

export function notFoundCopy(locale: EnabledLocale) {
  return copy[locale];
}
