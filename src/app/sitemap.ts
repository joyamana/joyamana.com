import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { collections, products } from "@/lib/commerce/mock-data";
import { blogEntries, crystalGuides } from "@/lib/content/content";
import { getPublishedTrustPagePaths } from "@/lib/content/trust-pages";
import { enabledLocales, localePath } from "@/lib/i18n/locales";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteConfig.indexable) return [];

  const basePaths = [
    "/",
    "/collections",
    "/crystals",
    "/blog",
    "/about",
    ...collections.map(({ handle }) => `/collections/${handle}`),
    ...products.map(({ handle }) => `/products/${handle}`),
    ...crystalGuides.map(({ handle }) => `/crystals/${handle}`),
    ...blogEntries.map(({ handle }) => `/blog/${handle}`),
  ];

  return enabledLocales.flatMap((locale) =>
    [...basePaths, ...getPublishedTrustPagePaths(locale)].map((path) => ({
      url: new URL(localePath(locale, path), siteConfig.url).toString(),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
    })),
  );
}
