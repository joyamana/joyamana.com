import type { Locale } from "./locales";

export function uiText(
  locale: Locale,
  values: { en: string; es: string; fr: string },
) {
  if (locale === "es-US") return values.es;
  if (locale === "fr-CA") return values.fr;
  return values.en;
}
