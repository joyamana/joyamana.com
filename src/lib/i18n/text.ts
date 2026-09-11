import type { Locale } from "./locales";
import { localeRegistry } from "@/config/locales";

export function uiText(
  locale: Locale,
  values: Record<(typeof localeRegistry)[Locale]["textKey"], string>,
) {
  return values[localeRegistry[locale].textKey];
}
