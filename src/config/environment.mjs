export const defaultSiteUrl = "http://localhost:3000";
export const productionSiteUrl = "https://www.joyamana.com";
export const shopifyStoreDomainPattern = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;
export const shopifyApiVersionPattern = /^\d{4}-(?:01|04|07|10)$/;
export const defaultShopifyApiVersion = "2026-10";

export function isLocalHostname(hostname) {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "0.0.0.0" ||
    hostname === "[::1]" ||
    /^127(?:\.\d{1,3}){3}$/.test(hostname)
  );
}

export function resolveSiteUrl(value, allowIndexing) {
  let url;
  try {
    url = new URL(value?.trim() || defaultSiteUrl);
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
