import type { EnabledLocale as Locale, TranslationKey } from "@/config/locales";
import { localeRegistry } from "@/config/locales";

export function uiText(locale: Locale, values: Record<TranslationKey, string>) {
  return values[localeRegistry[locale].textKey];
}
