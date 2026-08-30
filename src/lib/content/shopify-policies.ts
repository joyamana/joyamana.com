import type { Locale } from "@/lib/i18n/locales";
import { marketIdForLocale } from "@/lib/i18n/locales";
import { shopifyFetch } from "@/lib/commerce/shopify";

export const shopifyPolicyKinds = [
  "shipping",
  "returns",
  "privacy",
  "terms",
] as const;

export type ShopifyPolicyKind = (typeof shopifyPolicyKinds)[number];

interface ShopifyPolicyNode {
  id: string;
  title: string;
  url: string;
  body: string;
}

interface ShopifyPoliciesData {
  shop: {
    refundPolicy: ShopifyPolicyNode | null;
    privacyPolicy: ShopifyPolicyNode | null;
    shippingPolicy: ShopifyPolicyNode | null;
    termsOfService: ShopifyPolicyNode | null;
  };
}

export interface StorefrontPolicy {
  id: string;
  kind: ShopifyPolicyKind;
  title: string;
  url: string;
  html: string;
  contentLocale: Locale;
  requestedLocale: Locale;
  usedDefaultLanguage: boolean;
}

const storefrontContext: Record<
  Locale,
  { country: "US" | "CA"; language: "EN" | "ES" | "FR" }
> = {
  "en-US": { country: "US", language: "EN" },
  "es-US": { country: "US", language: "ES" },
  "en-CA": { country: "CA", language: "EN" },
  "fr-CA": { country: "CA", language: "FR" },
};

const defaultLocaleForMarket: Record<"us" | "ca", Locale> = {
  us: "en-US",
  ca: "en-CA",
};

export const SHOPIFY_POLICIES_QUERY = `#graphql
  query ShopifyPolicies($country: CountryCode!, $language: LanguageCode!)
    @inContext(country: $country, language: $language) {
    shop {
      refundPolicy { id title url body }
      privacyPolicy { id title url body }
      shippingPolicy { id title url body }
      termsOfService { id title url body }
    }
  }
`;

function selectedPolicy(
  data: ShopifyPoliciesData,
  kind: ShopifyPolicyKind,
) {
  const policyByKind = {
    shipping: data.shop.shippingPolicy,
    returns: data.shop.refundPolicy,
    privacy: data.shop.privacyPolicy,
    terms: data.shop.termsOfService,
  } satisfies Record<ShopifyPolicyKind, ShopifyPolicyNode | null>;

  return policyByKind[kind];
}

async function fetchPolicies(locale: Locale) {
  const context = storefrontContext[locale];
  return shopifyFetch<ShopifyPoliciesData>(
    SHOPIFY_POLICIES_QUERY,
    context,
    {
      buyerIp: null,
      cache: "force-cache",
      revalidate: 300,
      tags: ["shopify-policies"],
    },
  );
}

function hasPublishedBody(policy: ShopifyPolicyNode | null) {
  return Boolean(policy?.id && policy.title.trim() && policy.body.trim());
}

/**
 * Shopify returns the shop's default-language policy when a requested
 * translation is missing. Compare against that default so the route remains
 * usable without pretending the fallback body is translated.
 */
export async function getShopifyPolicy(
  kind: ShopifyPolicyKind,
  locale: Locale,
): Promise<StorefrontPolicy | null> {
  return (await getShopifyPolicies(locale))[kind];
}

export async function getShopifyPolicies(
  locale: Locale,
): Promise<Record<ShopifyPolicyKind, StorefrontPolicy | null>> {
  const marketId = marketIdForLocale(locale);
  const defaultLocale = defaultLocaleForMarket[marketId];
  const [requestedData, defaultData] = await Promise.all([
    fetchPolicies(locale),
    locale === defaultLocale ? null : fetchPolicies(defaultLocale),
  ]);
  return Object.fromEntries(
    shopifyPolicyKinds.map((kind) => {
      const requestedPolicy = selectedPolicy(requestedData, kind);
      if (!hasPublishedBody(requestedPolicy) || !requestedPolicy) {
        return [kind, null];
      }

      const defaultPolicy = defaultData
        ? selectedPolicy(defaultData, kind)
        : requestedPolicy;
      const usedDefaultLanguage = Boolean(
        locale !== defaultLocale &&
          defaultPolicy &&
          requestedPolicy.title === defaultPolicy.title &&
          requestedPolicy.body === defaultPolicy.body,
      );

      return [
        kind,
        {
          id: requestedPolicy.id,
          kind,
          title: requestedPolicy.title.trim(),
          url: requestedPolicy.url,
          html: sanitizeShopifyPolicyHtml(requestedPolicy.body),
          contentLocale: usedDefaultLanguage ? defaultLocale : locale,
          requestedLocale: locale,
          usedDefaultLanguage,
        } satisfies StorefrontPolicy,
      ];
    }),
  ) as Record<ShopifyPolicyKind, StorefrontPolicy | null>;
}

export async function getPublishedShopifyPolicyPaths(locale: Locale) {
  const policies = Object.values(await getShopifyPolicies(locale));

  return policies.flatMap((policy) => {
    if (!policy || policy.usedDefaultLanguage) return [];
    return [`/${policy.kind}`];
  });
}

const allowedTags = new Set([
  "a",
  "blockquote",
  "br",
  "em",
  "h2",
  "h3",
  "h4",
  "li",
  "ol",
  "p",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "ul",
]);

function decodeHtmlEntities(value: string) {
  return value.replace(
    /&(?:#(\d+)|#x([\da-f]+)|(amp|apos|gt|lt|nbsp|quot));/gi,
    (
      entity,
      decimal: string | undefined,
      hex: string | undefined,
      named: string | undefined,
    ) => {
      if (decimal) return String.fromCodePoint(Number.parseInt(decimal, 10));
      if (hex) return String.fromCodePoint(Number.parseInt(hex, 16));
      const values: Record<string, string> = {
        amp: "&",
        apos: "'",
        gt: ">",
        lt: "<",
        nbsp: "\u00a0",
        quot: '"',
      };
      return values[named?.toLowerCase() ?? ""] ?? entity;
    },
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safePolicyHref(value: string) {
  const decoded = decodeHtmlEntities(value.trim());
  if (decoded.startsWith("/") && !decoded.startsWith("//")) return decoded;

  try {
    const url = new URL(decoded);
    return url.protocol === "https:" || url.protocol === "mailto:"
      ? decoded
      : null;
  } catch {
    return null;
  }
}

function isHttpsHref(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Shopify policy bodies are merchant-authored HTML. Rebuild a deliberately
 * small allowlist and discard all source attributes before rendering it.
 */
export function sanitizeShopifyPolicyHtml(source: string) {
  const withoutRawContent = source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(
      /<\s*(script|style|iframe|object|embed|svg|math|template|form)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
      "",
    )
    .replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, "");
  const tagPattern = /<[^>]*>/g;
  let output = "";
  let offset = 0;

  for (const match of withoutRawContent.matchAll(tagPattern)) {
    const index = match.index ?? 0;
    output += escapeHtml(
      decodeHtmlEntities(withoutRawContent.slice(offset, index)),
    );
    offset = index + match[0].length;

    const parsed = match[0].match(/^<\s*(\/?)\s*([a-z0-9]+)\b([^>]*)>$/i);
    if (!parsed) continue;
    const closing = parsed[1] === "/";
    const sourceTag = parsed[2].toLowerCase();
    const tag = sourceTag === "h1" ? "h2" : sourceTag;
    if (!allowedTags.has(tag)) continue;

    if (closing) {
      if (tag !== "br") output += `</${tag}>`;
      continue;
    }

    if (tag === "a") {
      const hrefMatch = parsed[3].match(
        /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i,
      );
      const href = safePolicyHref(
        hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "",
      );
      const targetMatch = parsed[3].match(
        /\btarget\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i,
      );
      const target =
        targetMatch?.[1] ?? targetMatch?.[2] ?? targetMatch?.[3] ?? "";
      const opensNewTab = Boolean(
        href && target === "_blank" && isHttpsHref(href),
      );
      output += href
        ? `<a href="${escapeHtml(href)}"${
            opensNewTab
              ? ' target="_blank" rel="noopener noreferrer"'
              : ""
          }>`
        : "<a>";
      continue;
    }

    output += tag === "br" ? "<br>" : `<${tag}>`;
  }

  output += escapeHtml(decodeHtmlEntities(withoutRawContent.slice(offset)));
  return output.trim();
}
