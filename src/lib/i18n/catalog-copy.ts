import type { TranslatedLocale as Locale } from "@/config/locales";

const english = {
  filter: "Filter & sort",
  available: "Available only",
  colors: "Color",
  noColors: "No color options for these pieces.",
  sort: "Sort by",
  defaultSort: "Default order",
  priceAsc: "Price: low to high",
  priceDesc: "Price: high to low",
  defaultSortShort: "Default",
  priceAscShort: "Price ↑",
  priceDescShort: "Price ↓",
  clear: "Clear filters",
  clearColors: "Clear",
  selected: "Selected filters",
  remove: "Remove",
  updating: "Updating results…",
  updatingOption: "Updating option…",
  results: "products",
  empty: "No products match these filters.",
  emptyHelp: "Try removing a filter to see more pieces.",
  choose: "Please choose an option.",
  invalidVariant:
    "This option is no longer available. Please choose another option before purchasing.",
};

export function catalogCopy(locale: Locale): typeof english {
  if (locale === "zh-Hant-US")
    return {
      filter: "篩選及排序",
      available: "只顯示可購買",
      colors: "顏色",
      noColors: "這些商品暫無顏色選項。",
      sort: "排序",
      defaultSort: "預設次序",
      priceAsc: "價格：由低至高",
      priceDesc: "價格：由高至低",
      defaultSortShort: "預設",
      priceAscShort: "價格 ↑",
      priceDescShort: "價格 ↓",
      clear: "清除篩選",
      clearColors: "清除",
      selected: "已選條件",
      remove: "移除",
      updating: "正在更新商品…",
      updatingOption: "正在更新款式…",
      results: "件商品",
      empty: "沒有符合篩選條件的商品。",
      emptyHelp: "試試移除篩選條件，瀏覽更多商品。",
      choose: "請選擇款式。",
      invalidVariant: "此款式已無法選購。請先選擇其他款式。",
    };
  if (locale === "es-US")
    return {
      filter: "Filtrar y ordenar",
      available: "Solo disponibles",
      colors: "Color",
      noColors: "No hay opciones de color para estas piezas.",
      sort: "Ordenar por",
      defaultSort: "Orden predeterminado",
      priceAsc: "Precio: de menor a mayor",
      priceDesc: "Precio: de mayor a menor",
      defaultSortShort: "Por defecto",
      priceAscShort: "Precio ↑",
      priceDescShort: "Precio ↓",
      clear: "Quitar filtros",
      clearColors: "Quitar",
      selected: "Filtros seleccionados",
      remove: "Quitar",
      updating: "Actualizando resultados…",
      updatingOption: "Actualizando opción…",
      results: "productos",
      empty: "Ningún producto coincide con estos filtros.",
      emptyHelp: "Prueba a quitar un filtro para ver más piezas.",
      choose: "Elige una opción.",
      invalidVariant:
        "Esta opción ya no está disponible. Elige otra opción antes de comprar.",
    };
  return english;
}

// UI labels only. Membership and canonical keys always come from Shopify.
const colorLabels: Record<string, [string, string]> = {
  black: ["Negro", "黑色"],
  white: ["Blanco", "白色"],
  clear: ["Transparente", "透明"],
  red: ["Rojo", "紅色"],
  orange: ["Naranja", "橙色"],
  yellow: ["Amarillo", "黃色"],
  green: ["Verde", "綠色"],
  blue: ["Azul", "藍色"],
  purple: ["Morado", "紫色"],
  pink: ["Rosa", "粉紅色"],
  brown: ["Marrón", "啡色"],
  grey: ["Gris", "灰色"],
  gray: ["Gris", "灰色"],
  gold: ["Dorado", "金色"],
  silver: ["Plateado", "銀色"],
  multicolor: ["Multicolor", "多色"],
  multicolour: ["Multicolor", "多色"],
};

export function colorLabel(key: string, fallback: string, locale: Locale) {
  const labels = colorLabels[key];
  return labels && locale === "es-US"
    ? labels[0]
    : labels && locale === "zh-Hant-US"
      ? labels[1]
      : fallback;
}
