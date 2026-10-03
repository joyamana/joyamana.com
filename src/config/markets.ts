import type { SupportedLocale } from "./locales";

export interface MarketDefinition {
  id: string;
  regions: readonly string[];
  defaultLocale: SupportedLocale;
  locales: readonly SupportedLocale[];
  defaultCurrency: string;
  currencies: readonly string[];
  catalog: string;
  status: "active" | "planned";
}

export const markets = {
  us: {
    id: "us",
    regions: ["US"],
    defaultLocale: "en-US",
    locales: ["en-US", "es-US", "zh-Hant-US"],
    defaultCurrency: "USD",
    currencies: ["USD"],
    catalog: "us",
    status: "active",
  },
  ca: {
    id: "ca",
    regions: ["CA"],
    defaultLocale: "en-CA",
    locales: ["en-CA", "fr-CA"],
    defaultCurrency: "CAD",
    currencies: ["CAD"],
    catalog: "ca",
    status: "planned",
  },
} as const satisfies Record<string, MarketDefinition>;

export type MarketId = keyof typeof markets;

/**
 * Market and language are deliberately separate:
 * - A market is a commercial operating unit, not a country or a currency.
 * - All US languages share the catalog, USD prices, inventory, and policies.
 * - en-CA and fr-CA share the separate CA catalog and CAD context.
 * - A future Spain market would receive its own market record, EUR context,
 *   catalog publication rules, inventory, tax, shipping, and legal profiles.
 *   It is not represented by the current /es-us route.
 * - Currency is a display/transaction context and never creates an SEO URL.
 */
