import { markets, type MarketId } from "@/config/markets";

export const locales = ["en-US", "es-US", "en-CA", "fr-CA"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en-US";
export const localePrefixes: Record<Locale, string> = {
  "en-US": "",
  "es-US": "/es-us",
  "en-CA": "/en-ca",
  "fr-CA": "/fr-ca",
};

export function localePath(locale: Locale, path = "/") {
  const prefix = localePrefixes[locale];
  const normalizedPath = path === "/" ? "" : path;
  return prefix ? `${prefix}${normalizedPath}` || prefix : path;
}

export function alternateLanguageLocale(locale: Locale): Locale | null {
  if (locale === "en-US") return "es-US";
  if (locale === "es-US") return "en-US";
  if (locale === "en-CA") return "fr-CA";
  if (locale === "fr-CA") return "en-CA";
  return null;
}

export function marketForLocale(locale: Locale) {
  const market = Object.values(markets).find((item) =>
    (item.locales as readonly string[]).includes(locale),
  );
  if (!market) throw new Error(`No market is configured for locale ${locale}.`);
  return market;
}

export function marketIdForLocale(locale: Locale): MarketId {
  return marketForLocale(locale).id as MarketId;
}

export function isLocaleEnabled(locale: Locale) {
  return marketForLocale(locale).status !== "planned";
}

export const enabledLocales = locales.filter(isLocaleEnabled);

export function stripLocalePrefix(pathname: string) {
  for (const prefix of Object.values(localePrefixes).filter(Boolean)) {
    if (pathname === prefix) return "/";
    if (pathname.startsWith(`${prefix}/`)) {
      return pathname.slice(prefix.length);
    }
  }
  return pathname;
}
