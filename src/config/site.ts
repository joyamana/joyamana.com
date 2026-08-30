import { markets } from "./markets";

const defaultUrl = "http://localhost:3000";
const indexable = process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true";

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

export const siteConfig = {
  url: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL, indexable),
  indexable,
  defaultMarket: markets.us,
  markets,
} as const;
