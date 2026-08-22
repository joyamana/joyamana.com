export interface MarketDefinition {
  id: string;
  regions: readonly string[];
  defaultLocale: string;
  locales: readonly string[];
  defaultCurrency: string;
  currencies: readonly string[];
  catalog: string;
  shippingZone: string;
  taxProfile: string;
  legalProfile: string;
  status: "prototype" | "active" | "planned";
}

export const markets = {
  us: {
    id: "us",
    regions: ["US"],
    defaultLocale: "en-US",
    locales: ["en-US", "es-US"],
    defaultCurrency: "USD",
    currencies: ["USD"],
    catalog: "us",
    shippingZone: "us-pending",
    taxProfile: "us-pending",
    legalProfile: "us-pending",
    status: "prototype",
  },
  ca: {
    id: "ca",
    regions: ["CA"],
    defaultLocale: "en-CA",
    locales: ["en-CA", "fr-CA"],
    defaultCurrency: "CAD",
    currencies: ["CAD"],
    catalog: "ca",
    shippingZone: "ca-pending",
    taxProfile: "ca-pending",
    legalProfile: "ca-pending",
    status: "planned",
  },
} as const satisfies Record<string, MarketDefinition>;

export type MarketId = keyof typeof markets;

/**
 * Market and language are deliberately separate:
 * - A market is a commercial operating unit, not a country or a currency.
 * - en-US and es-US share the US catalog, USD prices, inventory, and policies.
 * - en-CA and fr-CA share the separate CA catalog and CAD context.
 * - A future Spain market would receive its own market record, EUR context,
 *   catalog publication rules, inventory, tax, shipping, and legal profiles.
 *   It is not represented by the current /es-us route.
 * - Currency is a display/transaction context and never creates an SEO URL.
 */
export const activeMarket = markets.us;
