/** Language identity, display conventions, and provider codes are separate. */
export const localeRegistry = {
  "en-US": {
    prefix: "", market: "us", enabled: true,
    label: "English", shortLabel: "EN", textKey: "en",
    formatLocale: "en-US", openGraph: "en_US",
    shopify: { country: "US", language: "EN" },
  },
  "es-US": {
    prefix: "/es-us", market: "us", enabled: true,
    label: "Español", shortLabel: "ES", textKey: "es",
    formatLocale: "es-US", openGraph: "es_US",
    shopify: { country: "US", language: "ES" },
  },
  "zh-Hant-US": {
    prefix: "/zh-hant-us", market: "us", enabled: true,
    label: "繁體中文", shortLabel: "繁中", textKey: "zh",
    formatLocale: "zh-HK", openGraph: "zh_US",
    shopify: { country: "US", language: "ZH_TW" },
  },
  "en-CA": {
    prefix: "/en-ca", market: "ca", enabled: false,
    label: "English", shortLabel: "EN", textKey: "en",
    formatLocale: "en-CA", openGraph: "en_CA",
    shopify: { country: "CA", language: "EN" },
  },
  "fr-CA": {
    prefix: "/fr-ca", market: "ca", enabled: false,
    label: "Français", shortLabel: "FR", textKey: "fr",
    formatLocale: "fr-CA", openGraph: "fr_CA",
    shopify: { country: "CA", language: "FR" },
  },
} as const;

export type SupportedLocale = keyof typeof localeRegistry;
export type EnabledLocale = {
  [L in SupportedLocale]: (typeof localeRegistry)[L]["enabled"] extends true ? L : never;
}[SupportedLocale];
export type StorefrontLanguage = (typeof localeRegistry)[EnabledLocale]["shopify"]["language"];

export function isSupportedLocale(value: string): value is SupportedLocale {
  return Object.hasOwn(localeRegistry, value);
}

export function isEnabledLocale(value: string): value is EnabledLocale {
  return isSupportedLocale(value) && localeRegistry[value].enabled;
}

export function shopifyContextForLocale(locale: SupportedLocale) {
  return localeRegistry[locale].shopify;
}
