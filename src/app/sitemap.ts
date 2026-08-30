import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import {
  getCommerceProvider,
  getDesignCollections,
  getProducts,
  productCategoriesForProducts,
} from "@/lib/commerce/catalog";
import { getPublishedShopifyEditorialPaths } from "@/lib/content/shopify-editorial";
import { getPublishedShopifyAboutPaths } from "@/lib/content/shopify-about-pages";
import { getPublishedTrustPagePaths } from "@/lib/content/trust-pages";
import { getPublishedShopifyPolicyPaths } from "@/lib/content/shopify-policies";
import { getPublishedShopifyContentPagePaths } from "@/lib/content/shopify-content-pages";
import { enabledLocales, localePath } from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!siteConfig.indexable) return [];

  const contentPaths = [
    "/",
    "/contact",
  ];
  const commerceProvider = getCommerceProvider();
  const localizedCatalogs = await Promise.all(
    enabledLocales.map(async (locale) => {
      const [
        collections,
        products,
        policyPaths,
        contentPagePaths,
        aboutPaths,
        blogPaths,
        crystalPaths,
      ] = await Promise.all([
        getDesignCollections("us", locale),
        getProducts("us", locale),
        commerceProvider === "shopify"
          ? getPublishedShopifyPolicyPaths(locale)
          : Promise.resolve([]),
        commerceProvider === "shopify"
          ? getPublishedShopifyContentPagePaths(locale)
          : Promise.resolve([]),
        commerceProvider === "shopify"
          ? getPublishedShopifyAboutPaths(locale)
          : Promise.resolve([]),
        commerceProvider === "shopify"
          ? getPublishedShopifyEditorialPaths("blog", locale)
          : Promise.resolve([]),
        commerceProvider === "shopify"
          ? getPublishedShopifyEditorialPaths("crystals", locale)
          : Promise.resolve([]),
      ]);
      const categories = productCategoriesForProducts(products, locale);
      return {
        aboutPaths,
        blogPaths,
        categories,
        collections,
        contentPagePaths,
        crystalPaths,
        locale,
        policyPaths,
        products,
      };
    }),
  );

  return localizedCatalogs.flatMap(
    ({
      aboutPaths,
      blogPaths,
      categories,
      collections,
      contentPagePaths,
      crystalPaths,
      locale,
      policyPaths,
      products,
    }) => {
      const paths = [
        ...contentPaths,
        ...aboutPaths,
        ...blogPaths,
        ...crystalPaths,
        ...(products.length ? ["/shop"] : []),
        ...(collections.length ? ["/collections"] : []),
        ...categories.map(({ handle }) => `/category/${handle}`),
        ...collections.map(({ handle }) => `/collections/${handle}`),
        ...products.map(({ handle }) => `/products/${handle}`),
        ...getPublishedTrustPagePaths(locale),
        ...policyPaths,
        ...contentPagePaths,
      ];

      return [...new Set(paths)].map((path) => ({
        url: new URL(localePath(locale, path), siteConfig.url).toString(),
        changeFrequency: "weekly" as const,
      }));
    },
  );
}
