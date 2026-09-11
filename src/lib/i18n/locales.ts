import { markets, type MarketId } from "@/config/markets";
import { localeRegistry, type SupportedLocale } from "@/config/locales";

export type Locale = SupportedLocale;
export const locales = Object.keys(localeRegistry) as Locale[];

export const defaultLocale: Locale = "en-US";
export const localePrefixes = Object.fromEntries(
  locales.map((locale) => [locale, localeRegistry[locale].prefix]),
) as Record<Locale, string>;

export function localePath(locale: Locale, path = "/") {
  const prefix = localePrefixes[locale];
  const normalizedPath = path === "/" ? "" : path;
  return prefix ? `${prefix}${normalizedPath}` || prefix : path;
}

export function marketForLocale(locale: Locale) {
  return markets[localeRegistry[locale].market];
}

export function marketIdForLocale(locale: Locale): MarketId {
  return localeRegistry[locale].market;
}

export function isLocaleEnabled(locale: Locale) {
  return (
    localeRegistry[locale].enabled && marketForLocale(locale).status !== "planned"
  );
}

export const enabledLocales = locales.filter(isLocaleEnabled);

export function languageOptionsFor(locale: Locale) {
  return enabledLocales
    .filter((candidate) => marketIdForLocale(candidate) === marketIdForLocale(locale))
    .map((candidate) => ({
      locale: candidate,
      label: localeRegistry[candidate].label,
      shortLabel: localeRegistry[candidate].shortLabel,
    }));
}

export function localeForPath(pathname: string): Locale {
  return (
    locales.find((locale) => {
      const prefix = localePrefixes[locale];
      return prefix && (pathname === prefix || pathname.startsWith(`${prefix}/`));
    }) ?? defaultLocale
  );
}

export function stripLocalePrefix(pathname: string) {
  for (const prefix of Object.values(localePrefixes).filter(Boolean)) {
    if (pathname === prefix) return "/";
    if (pathname.startsWith(`${prefix}/`)) {
      return pathname.slice(prefix.length);
    }
  }
  return pathname;
}
