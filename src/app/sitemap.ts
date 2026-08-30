import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import {
  getCommerceProvider,
  getDesignCollections,
  getProducts,
  productCategoriesForProducts,
} from "@/lib/commerce/catalog";
import { blogEntries, crystalGuides } from "@/lib/content/content";
import { getPublishedTrustPagePaths } from "@/lib/content/trust-pages";
import { getPublishedShopifyPolicyPaths } from "@/lib/content/shopify-policies";
import { getPublishedShopifyContentPagePaths } from "@/lib/content/shopify-content-pages";
import { enabledLocales, localePath } from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!siteConfig.indexable) return [];

  const contentPaths = [
    "/",
    "/crystals",
    "/blog",
    "/about",
    "/contact",
    ...crystalGuides.map(({ handle }) => `/crystals/${handle}`),
    ...blogEntries.map(({ handle }) => `/blog/${handle}`),
  ];
  const localizedCatalogs = await Promise.all(
    enabledLocales.map(async (locale) => {
      const [collections, products, policyPaths, contentPagePaths] = await Promise.all([
        getDesignCollections("us", locale),
        getProducts("us", locale),
        getCommerceProvider() === "shopify"
          ? getPublishedShopifyPolicyPaths(locale)
          : Promise.resolve([]),
        getCommerceProvider() === "shopify"
          ? getPublishedShopifyContentPagePaths(locale)
          : Promise.resolve([]),
      ]);
      const categories = productCategoriesForProducts(products, locale);
      return {
        categories,
        collections,
        contentPagePaths,
        locale,
        policyPaths,
        products,
      };
    }),
  );

  return localizedCatalogs.flatMap(
    ({
      categories,
      collections,
      contentPagePaths,
      locale,
      policyPaths,
      products,
    }) => {
    const paths = [
      ...contentPaths,
      ...(products.length ? ["/shop"] : []),
      ...(collections.length ? ["/collections"] : []),
      ...categories.map(({ handle }) => `/category/${handle}`),
      ...collections.map(({ handle }) => `/collections/${handle}`),
      ...products.map(({ handle }) => `/products/${handle}`),
      ...getPublishedTrustPagePaths(locale),
      ...policyPaths,
      ...contentPagePaths,
    ];

    return paths.map((path) => ({
      url: new URL(localePath(locale, path), siteConfig.url).toString(),
      changeFrequency: "weekly" as const,
    }));
    },
  );
}
