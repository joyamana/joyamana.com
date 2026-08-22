import type { Locale } from "@/lib/i18n/locales";

export type ProductModel = "standard" | "one-of-one";

export interface LocalizedText {
  "en-US": string;
  "es-US": string;
  "en-CA"?: string;
  "fr-CA"?: string;
}

export interface Product {
  id: string;
  handle: string;
  title: LocalizedText;
  description: LocalizedText;
  price: number;
  currency: "USD" | "CAD";
  model: ProductModel;
  collectionHandles: string[];
  crystal: string;
  material: LocalizedText;
  dimensions: LocalizedText;
  care: LocalizedText;
  palette: string;
  available: boolean;
  isPrototype: true;
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  title: LocalizedText;
  image: string;
  imageAlt: LocalizedText;
  available: boolean;
}

export interface Collection {
  handle: string;
  title: LocalizedText;
  description: LocalizedText;
}

export function localize(text: LocalizedText, locale: Locale) {
  if (locale === "en-CA") return text["en-CA"] ?? text["en-US"];
  if (locale === "fr-CA") return text["fr-CA"] ?? text["en-US"];
  return text[locale];
}
