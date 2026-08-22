import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { siteConfig } from "@/config/site";
import { enabledLocales, localePath, type Locale } from "@/lib/i18n/locales";

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

  return {
    title,
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
      title,
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
