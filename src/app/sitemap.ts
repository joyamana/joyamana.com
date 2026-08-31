import type { MetadataRoute } from "next";
import {
  isIndexGroupEnabled,
  isIndexingEnabledFor,
  siteConfig,
} from "@/config/site";
import {
  getDesignCollections,
  getProducts,
  productCategoriesForProducts,
} from "@/lib/commerce/catalog";
import { getPublishedShopifyEditorialPaths } from "@/lib/content/shopify-editorial";
import { getPublishedShopifyAboutPaths } from "@/lib/content/shopify-about-pages";
import { getPublishedShopifyPolicyPaths } from "@/lib/content/shopify-policies";
import { getPublishedShopifyContentPagePaths } from "@/lib/content/shopify-content-pages";
import { enabledLocales, localePath } from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!siteConfig.indexable) return [];

  const localizedCatalogs = await Promise.all(
    enabledLocales.map(async (locale) => {
      const coreEnabled = isIndexGroupEnabled(locale, "core");
      const commerceEnabled = isIndexGroupEnabled(locale, "commerce");
      const policiesEnabled = isIndexGroupEnabled(locale, "policies");
      const editorialEnabled = isIndexGroupEnabled(locale, "editorial");
      const [
        collections,
        products,
        policyPaths,
        contentPagePaths,
        aboutPaths,
        blogPaths,
        crystalPaths,
      ] = await Promise.all([
        commerceEnabled
          ? getDesignCollections("us", locale)
          : Promise.resolve([]),
        commerceEnabled ? getProducts("us", locale) : Promise.resolve([]),
        policiesEnabled
          ? getPublishedShopifyPolicyPaths(locale)
          : Promise.resolve([]),
        coreEnabled
          ? getPublishedShopifyContentPagePaths(locale)
          : Promise.resolve([]),
        coreEnabled ? getPublishedShopifyAboutPaths(locale) : Promise.resolve([]),
        editorialEnabled
          ? getPublishedShopifyEditorialPaths("blog", locale)
          : Promise.resolve([]),
        editorialEnabled
          ? getPublishedShopifyEditorialPaths("crystals", locale)
          : Promise.resolve([]),
      ]);
      const categories = commerceEnabled
        ? productCategoriesForProducts(products, locale)
        : [];
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
        ...(isIndexGroupEnabled(locale, "core") ? ["/", "/contact"] : []),
        ...aboutPaths,
        ...blogPaths,
        ...crystalPaths,
        ...(products.length ? ["/shop"] : []),
        ...(collections.length ? ["/collections"] : []),
        ...categories.map(({ handle }) => `/category/${handle}`),
        ...collections.map(({ handle }) => `/collections/${handle}`),
        ...products.map(({ handle }) => `/products/${handle}`),
        ...policyPaths,
        ...contentPagePaths,
      ];

      return [...new Set(paths)]
        .filter((path) => isIndexingEnabledFor(locale, path))
        .map((path) => ({
          url: new URL(localePath(locale, path), siteConfig.url).toString(),
          changeFrequency: "weekly" as const,
        }));
    },
  );
}
