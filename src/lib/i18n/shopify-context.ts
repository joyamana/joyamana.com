import { markets } from "@/config/markets";
export { shopifyContextForLocale } from "@/config/locales";

export const defaultLocaleForMarket = {
  us: markets.us.defaultLocale,
  ca: markets.ca.defaultLocale,
} as const;
