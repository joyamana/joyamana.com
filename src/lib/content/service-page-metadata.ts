import type { Metadata } from "next";
import { enabledLocales, type Locale } from "@/lib/i18n/locales";
import {
  buildMetadata,
  buildNoIndexMetadata,
  type PageSearchParams,
} from "@/lib/seo";
import {
  getShopifyContentPage,
  type ShopifyContentPageHandle,
} from "./shopify-content-pages";
import {
  getShopifyPolicy,
  type ShopifyPolicyKind,
} from "./shopify-policies";

async function publishedLocales(
  isReady: (locale: Locale) => Promise<boolean>,
) {
  const locales = await Promise.all(
    enabledLocales.map(async (locale) => {
      try {
        return (await isReady(locale)) ? locale : null;
      } catch {
        return null;
      }
    }),
  );

  return locales.filter((locale): locale is Locale => locale !== null);
}

export async function buildPolicyPageMetadata({
  description,
  kind,
  locale,
  searchParams,
  title,
}: {
  description: string;
  kind: ShopifyPolicyKind;
  locale: Locale;
  searchParams?: PageSearchParams;
  title: string;
}): Promise<Metadata> {
  try {
    const policy = await getShopifyPolicy(kind, locale);
    if (policy && !policy.usedDefaultLanguage) {
      return buildMetadata({
        title,
        description,
        locale,
        path: `/${kind}`,
        alternateLocales: await publishedLocales(async (candidate) => {
          const candidatePolicy = await getShopifyPolicy(kind, candidate);
          return Boolean(candidatePolicy && !candidatePolicy.usedDefaultLanguage);
        }),
        searchParams,
      });
    }
  } catch {
    // Unavailable, incomplete, or fallback policy content stays noindex.
  }

  return buildNoIndexMetadata({ title, description });
}

export async function buildContentPageMetadata({
  description,
  handle,
  locale,
  searchParams,
  title,
}: {
  description: string;
  handle: ShopifyContentPageHandle;
  locale: Locale;
  searchParams?: PageSearchParams;
  title: string;
}): Promise<Metadata> {
  try {
    const page = await getShopifyContentPage(handle, locale);
    if (page && !page.usedDefaultLanguage) {
      return buildMetadata({
        title: page.seoTitle,
        description: page.seoDescription,
        locale,
        path: `/${handle}`,
        alternateLocales: await publishedLocales(async (candidate) => {
          const candidatePage = await getShopifyContentPage(handle, candidate);
          return Boolean(candidatePage && !candidatePage.usedDefaultLanguage);
        }),
        searchParams,
      });
    }
  } catch {
    // Unavailable, incomplete, or fallback service content stays noindex.
  }

  return buildNoIndexMetadata({ title, description });
}
