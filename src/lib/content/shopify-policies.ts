import type { Locale } from "@/lib/i18n/locales";
import { marketIdForLocale } from "@/lib/i18n/locales";
import { shopifyFetch } from "@/lib/commerce/shopify";
import { sanitizeShopifyHtml } from "./shopify-html";

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

/**
 * Shopify policy bodies are merchant-authored HTML. Rebuild a deliberately
 * small allowlist and discard all source attributes before rendering it.
 */
export function sanitizeShopifyPolicyHtml(source: string) {
  return sanitizeShopifyHtml(source, { removeLeadingH1: true });
}
