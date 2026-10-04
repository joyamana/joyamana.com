import type { SupportedLocale } from "./locales";

export interface MarketDefinition {
  id: string;
  regions: readonly string[];
  defaultLocale: SupportedLocale;
  /** Membership only; public languages come from isEnabledLocale. */
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
