import { markets } from "./markets";

const defaultUrl = "http://localhost:3000";

export const siteConfig = {
  url: process.env.NEXT_PUBLIC_SITE_URL || defaultUrl,
  indexable: process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true",
  commerceProvider: process.env.COMMERCE_PROVIDER || "mock",
  defaultMarket: markets.us,
  markets,
} as const;
