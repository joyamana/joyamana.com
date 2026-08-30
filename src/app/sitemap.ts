import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import {
  getDesignCollections,
  getProducts,
  productCategoriesForProducts,
} from "@/lib/commerce/catalog";
import { blogEntries, crystalGuides } from "@/lib/content/content";
import { getPublishedTrustPagePaths } from "@/lib/content/trust-pages";
import { enabledLocales, localePath } from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!siteConfig.indexable) return [];

  const contentPaths = [
    "/",
    "/crystals",
    "/blog",
    "/about",
    ...crystalGuides.map(({ handle }) => `/crystals/${handle}`),
    ...blogEntries.map(({ handle }) => `/blog/${handle}`),
  ];
  const localizedCatalogs = await Promise.all(
    enabledLocales.map(async (locale) => {
      const [collections, products] = await Promise.all([
        getDesignCollections("us", locale),
        getProducts("us", locale),
      ]);
      const categories = productCategoriesForProducts(products, locale);
      return { categories, collections, locale, products };
    }),
  );

  return localizedCatalogs.flatMap(
    ({ categories, collections, locale, products }) => {
    const paths = [
      ...contentPaths,
      ...(products.length ? ["/shop"] : []),
      ...(collections.length ? ["/collections"] : []),
      ...categories.map(({ handle }) => `/category/${handle}`),
      ...collections.map(({ handle }) => `/collections/${handle}`),
      ...products.map(({ handle }) => `/products/${handle}`),
      ...getPublishedTrustPagePaths(locale),
    ];

    return paths.map((path) => ({
      url: new URL(localePath(locale, path), siteConfig.url).toString(),
      changeFrequency: "weekly" as const,
    }));
    },
  );
}
