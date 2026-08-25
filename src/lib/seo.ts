import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { siteConfig } from "@/config/site";
import { enabledLocales, localePath, type Locale } from "@/lib/i18n/locales";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const trailingBrandPattern = new RegExp(
  `(?:\\s*(?:\\||·|•|—|–|-)\\s*${escapeRegExp(brand.name)})+\\s*$`,
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
}: {
  title: string;
  description: string;
  locale: Locale;
  path?: string;
}): Metadata {
  const localizedPath = localePath(locale, path);
  const canonical = new URL(localizedPath, siteConfig.url).toString();
  const normalizedTitle = withoutTrailingBrand(title);

  return {
    title: normalizedTitle,
    description,
    metadataBase: new URL(siteConfig.url),
    alternates: siteConfig.indexable
      ? {
          canonical,
          languages: Object.fromEntries(
            enabledLocales.map((enabledLocale) => [
              enabledLocale,
              new URL(localePath(enabledLocale, path), siteConfig.url).toString(),
            ]),
          ),
        }
      : undefined,
    robots: siteConfig.indexable
      ? { index: true, follow: true }
      : { index: false, follow: false, noarchive: true },
    openGraph: {
      title: normalizedTitle,
      description,
      siteName: brand.name,
      locale:
        locale === "es-US"
          ? "es_US"
          : locale === "en-CA"
            ? "en_CA"
            : locale === "fr-CA"
              ? "fr_CA"
            : "en_US",
      type: "website",
      url: canonical,
    },
  };
}
