import { localeRegistry } from "@/config/locales";
import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { isIndexingEnabledFor, siteConfig } from "@/config/site";
import { enabledLocales, localePath, type Locale } from "@/lib/i18n/locales";
import type { Collection } from "@/lib/commerce/types";

export type PageSearchParams = Record<
  string,
  string | string[] | undefined
>;

export const defaultOpenGraphImage = {
  url: new URL("/brand/joya-mana-opengraph.png", siteConfig.url).toString(),
  width: 1200,
  height: 630,
  alt: brand.name,
};

/** Shared by collection metadata, sitemap eligibility, and structured data. */
export function getCollectionSeoDescription(
  collection: Pick<Collection, "description" | "seoDescription"> | null,
) {
  return (
    collection?.seoDescription?.trim() ||
    collection?.description.trim() ||
    undefined
  );
}

const trailingBrandPattern = new RegExp(
  `(?:\\s*(?:\\||·|•|—|–|-)\\s*${RegExp.escape(brand.name)})+\\s*$`,
  "i",
);

/**
 * The root layout owns the visible brand suffix through its title template.
 * Shopify SEO titles may already contain that suffix, so remove only a
 * separator-delimited trailing occurrence before Next applies the template.
 */
export function withoutTrailingBrand(title: string) {
  const normalized = title.trim();
  const unbranded = normalized.replace(trailingBrandPattern, "").trim();
  return unbranded || normalized;
}

export function buildNoIndexMetadata({
  title,
  description,
}: {
  title: string;
  description: string;
}): Metadata {
  return {
    title,
    description,
    robots: { index: false, follow: false, noarchive: true },
  };
}

export function buildMetadata({
  title,
  description,
  locale,
  path = "/",
  alternateLocales = enabledLocales,
  searchParams,
  images,
}: {
  title: string;
  description: string;
  locale: Locale;
  path?: string;
  alternateLocales?: readonly Locale[];
  searchParams?: PageSearchParams;
  images?: NonNullable<Metadata["openGraph"]>["images"];
}): Metadata {
  const localizedPath = localePath(locale, path);
  const canonical = new URL(localizedPath, siteConfig.url).toString();
  const normalizedTitle = withoutTrailingBrand(title);
  const parameterized = Boolean(searchParams && Object.keys(searchParams).length);
  const cleanPageIndexable = isIndexingEnabledFor(locale, path);
  const indexable = cleanPageIndexable && !parameterized;
  const indexableAlternateLocales = alternateLocales.filter(
    (alternateLocale) => isIndexingEnabledFor(alternateLocale, path),
  );

  return {
    title: normalizedTitle,
    description,
    metadataBase: new URL(siteConfig.url),
    alternates: cleanPageIndexable
      ? {
          canonical,
          languages: parameterized
            ? undefined
            : Object.fromEntries(
                indexableAlternateLocales.map((enabledLocale) => [
                  enabledLocale,
                  new URL(
                    localePath(enabledLocale, path),
                    siteConfig.url,
                  ).toString(),
                ]),
              ),
        }
      : undefined,
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false, noarchive: true },
    openGraph: {
      title: normalizedTitle,
      description,
      siteName: brand.name,
      locale: localeRegistry[locale].openGraph,
      type: "website",
      url: canonical,
      images: images ?? [defaultOpenGraphImage],
    },
  };
}
