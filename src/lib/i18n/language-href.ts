import type { EnabledLocale } from "@/config/locales";
import { commerceLanguageQueryFromSearch } from "@/lib/commerce/catalog-browse";
import { localePath, stripLocalePrefix } from "./locales";

export function languageHref(
  locale: EnabledLocale,
  pathname: string,
  search = "",
) {
  const path = stripLocalePrefix(pathname);
  const query = commerceLanguageQueryFromSearch(path, search);
  return `${localePath(locale, path)}${query ? `?${query}` : ""}`;
}
