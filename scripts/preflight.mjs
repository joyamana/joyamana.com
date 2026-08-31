import { pathToFileURL } from "node:url";

const productionSiteUrl = "https://www.joyamana.com";
const booleanVariables = [
  "NEXT_PUBLIC_SITE_INDEXABLE",
  "SHOPIFY_CHECKOUT_ENABLED",
  "CONTACT_FORM_ENABLED",
];

function isLocalHostname(hostname) {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "0.0.0.0" ||
    hostname === "[::1]" ||
    /^127(?:\.\d{1,3}){3}$/.test(hostname)
  );
}

function parseOrigin(value, variable, errors) {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) {
      throw new Error();
    }
    return url;
  } catch {
    errors.push(`${variable} must be an absolute HTTP(S) origin.`);
    return null;
  }
}

function parseHostname(value, variable, errors) {
  if (!value?.trim()) return null;

  try {
    const candidate = value.includes("://") ? value : `https://${value}`;
    const url = new URL(candidate);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) {
      throw new Error();
    }
    return url.hostname.toLowerCase();
  } catch {
    errors.push(`${variable} must be a bare hostname or HTTPS origin.`);
    return null;
  }
}

export function validateEnvironment(env = process.env) {
  const errors = [];
  const isVercel = env.VERCEL === "1";
  const isProduction = env.VERCEL_ENV === "production";
  const isPreview = env.VERCEL_ENV === "preview";
  const indexable = env.NEXT_PUBLIC_SITE_INDEXABLE === "true";
  const checkoutEnabled = env.SHOPIFY_CHECKOUT_ENABLED === "true";
  const contactEnabled = env.CONTACT_FORM_ENABLED === "true";

  for (const variable of booleanVariables) {
    const value = env[variable]?.trim();
    if (value && value !== "true" && value !== "false") {
      errors.push(`${variable} must be either true or false.`);
    }
  }

  if (isVercel && !env.NEXT_PUBLIC_SITE_URL?.trim()) {
    errors.push("NEXT_PUBLIC_SITE_URL is required for Vercel deployments.");
  }
  const siteUrl = parseOrigin(
    env.NEXT_PUBLIC_SITE_URL,
    "NEXT_PUBLIC_SITE_URL",
    errors,
  );
  if (
    siteUrl &&
    (indexable || isProduction) &&
    (siteUrl.protocol !== "https:" || isLocalHostname(siteUrl.hostname))
  ) {
    errors.push(
      "Production or indexable deployments require a non-local HTTPS NEXT_PUBLIC_SITE_URL.",
    );
  }
  if (isProduction && siteUrl?.origin !== productionSiteUrl) {
    errors.push(
      `Vercel Production NEXT_PUBLIC_SITE_URL must be ${productionSiteUrl}.`,
    );
  }
  if (isPreview && indexable) {
    errors.push("Vercel Preview deployments must remain noindex.");
  }
  const storeDomain = env.SHOPIFY_STORE_DOMAIN?.trim().toLowerCase();
  const storefrontToken = env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
  if (isVercel && (!storeDomain || !storefrontToken)) {
    errors.push(
      "SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN are required for Vercel deployments.",
    );
  }
  if (
    storeDomain &&
    !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(storeDomain)
  ) {
    errors.push("SHOPIFY_STORE_DOMAIN must be a bare myshopify.com hostname.");
  }
  const apiVersion = (env.SHOPIFY_STOREFRONT_API_VERSION || "2026-07").trim();
  if (!/^\d{4}-(?:01|04|07|10)$/.test(apiVersion)) {
    errors.push(
      "SHOPIFY_STOREFRONT_API_VERSION must be a dated quarterly API version.",
    );
  }

  parseHostname(
    env.SHOPIFY_CHECKOUT_DOMAIN,
    "SHOPIFY_CHECKOUT_DOMAIN",
    errors,
  );
  if (checkoutEnabled && (!storeDomain || !storefrontToken)) {
    errors.push(
      "Shopify credentials are required when SHOPIFY_CHECKOUT_ENABLED is true.",
    );
  }
  if (contactEnabled && !env.RESEND_API_KEY?.trim()) {
    errors.push("RESEND_API_KEY is required when CONTACT_FORM_ENABLED is true.");
  }

  return errors;
}

function run() {
  const errors = validateEnvironment();
  if (errors.length) {
    console.error("Environment preflight failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log("Environment preflight passed.");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  run();
}
