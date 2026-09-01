import { markets } from "./markets";
import { indexingPolicy, type IndexGroup } from "./indexing";

const defaultUrl = "http://localhost:3000";
const indexingMasterEnabled =
  process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true";

const indexScopeEnabled: Readonly<
  Record<string, Readonly<Record<IndexGroup, boolean>>>
> = indexingPolicy;

const anyIndexingEnabled =
  indexingMasterEnabled &&
  Object.values(indexScopeEnabled).some((groups) =>
    Object.values(groups).some(Boolean),
  );

function isLocalHostname(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "0.0.0.0" ||
    hostname === "[::1]" ||
    /^127(?:\.\d{1,3}){3}$/.test(hostname)
  );
}

export function resolveSiteUrl(value: string | undefined, allowIndexing: boolean) {
  let url: URL;
  try {
    url = new URL(value || defaultUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute HTTP(S) origin.");
  }

  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute HTTP(S) origin.");
  }

  if (
    allowIndexing &&
    (url.protocol !== "https:" || isLocalHostname(url.hostname))
  ) {
    throw new Error(
      "An indexable storefront requires a non-local HTTPS NEXT_PUBLIC_SITE_URL.",
    );
  }

  return url.origin;
}

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
    indexingMasterEnabled && indexScopeEnabled[locale]?.[group],
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
