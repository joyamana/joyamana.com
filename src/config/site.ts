import { markets } from "./markets";
import { isEnabledLocale } from "./locales";
import { indexingPolicy, type IndexGroup } from "./indexing";

import { resolveSiteUrl } from "./environment.mjs";
export { resolveSiteUrl } from "./environment.mjs";
const indexingMasterEnabled = process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true";

const indexScopeEnabled: Readonly<
  Record<string, Readonly<Record<IndexGroup, boolean>>>
> = indexingPolicy;

const anyIndexingEnabled =
  indexingMasterEnabled &&
  Object.entries(indexScopeEnabled).some(
    ([locale, groups]) =>
      isEnabledLocale(locale) && Object.values(groups).some(Boolean),
  );

export function indexGroupForPath(path: string): IndexGroup | null {
  if (
    path === "/shop" ||
    path === "/collections" ||
    path.startsWith("/category/") ||
    path.startsWith("/collections/") ||
    path.startsWith("/products/")
  ) {
    return "commerce";
  }
  if (
    path === "/shipping" ||
    path === "/returns" ||
    path === "/privacy" ||
    path === "/terms"
  ) {
    return "policies";
  }
  if (
    path === "/blog" ||
    path.startsWith("/blog/") ||
    path === "/crystals" ||
    path.startsWith("/crystals/")
  ) {
    return "editorial";
  }
  if (
    path === "/" ||
    path === "/contact" ||
    path === "/about" ||
    path.startsWith("/about/") ||
    path === "/accessibility"
  ) {
    return "core";
  }
  return null;
}

export function isIndexGroupEnabled(locale: string, group: IndexGroup) {
  return Boolean(
    indexingMasterEnabled &&
    isEnabledLocale(locale) &&
    indexScopeEnabled[locale]?.[group],
  );
}

export function isIndexingEnabledFor(locale: string, path: string) {
  const group = indexGroupForPath(path);
  return group ? isIndexGroupEnabled(locale, group) : false;
}

export const siteConfig = {
  url: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL, indexingMasterEnabled),
  indexable: anyIndexingEnabled,
  indexing: {
    masterEnabled: indexingMasterEnabled,
    scopes: indexScopeEnabled,
  },
  defaultMarket: markets.us,
  markets,
} as const;
