import type { Metadata } from "next";
import { publishedAlternateLocales } from "./metadata-locales";
import type { EnabledLocale as Locale } from "@/config/locales";
import {
  buildMetadata,
  buildNoIndexMetadata,
  type PageSearchParams,
} from "@/lib/seo";
import {
  getShopifyContentPage,
  type ShopifyContentPageHandle,
} from "./shopify-content-pages";
import { getShopifyPolicy, type ShopifyPolicyKind } from "./shopify-policies";

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
        alternateLocales: await publishedAlternateLocales(
          locale,
          `/${kind}`,
          searchParams,
          async (candidate) => {
            const candidatePolicy = await getShopifyPolicy(kind, candidate);
            return Boolean(
              candidatePolicy && !candidatePolicy.usedDefaultLanguage,
            );
          },
        ),
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
    if (page && page.translationReady) {
      return buildMetadata({
        title: page.seoTitle,
        description: page.seoDescription,
        locale,
        path: `/${handle}`,
        alternateLocales: await publishedAlternateLocales(
          locale,
          `/${handle}`,
          searchParams,
          async (candidate) => {
            const candidatePage = await getShopifyContentPage(
              handle,
              candidate,
            );
            return Boolean(candidatePage && candidatePage.translationReady);
          },
        ),
        searchParams,
      });
    }
  } catch {
    // Unavailable, incomplete, or fallback service content stays noindex.
  }

  return buildNoIndexMetadata({ title, description });
}
