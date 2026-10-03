import {
  shopifyContextForLocale,
  defaultLocaleForMarket,
} from "@/lib/i18n/shopify-context";
import type { Locale } from "@/lib/i18n/locales";
import { marketIdForLocale } from "@/lib/i18n/locales";
import { parseContentPageFields } from "./content-page";
export { renderShopifyRichText } from "./content-page";
import { shopifyFetch } from "@/lib/commerce/shopify";

export const shopifyContentPageHandles = ["accessibility"] as const;
export type ShopifyContentPageHandle =
  (typeof shopifyContentPageHandles)[number];

interface MetaobjectField {
  key: string;
  type: string;
  value: string | null;
}

interface ContentPageData {
  metaobject: {
    id: string;
    type: string;
    handle: string;
    updatedAt: string;
    fields: MetaobjectField[];
  } | null;
}

interface ParsedContentPage {
  id: string;
  handle: ShopifyContentPageHandle;
  title: string;
  richText: string;
  html: string;
  lastUpdated: string;
  seoTitle: string;
  seoDescription: string;
}

export interface StorefrontContentPage extends ParsedContentPage {
  contentLocale: Locale;
  requestedLocale: Locale;
  usedDefaultLanguage: boolean;
}

export const SHOPIFY_CONTENT_PAGE_QUERY = `#graphql
  query ShopifyContentPage(
    $country: CountryCode!
    $language: LanguageCode!
    $type: String!
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    metaobject(handle: { type: $type, handle: $handle }) {
      id
      type
      handle
      updatedAt
      fields { key type value }
    }
  }
`;

async function fetchContentPage(
  handle: ShopifyContentPageHandle,
  locale: Locale,
) {
  return shopifyFetch<ContentPageData>(
    SHOPIFY_CONTENT_PAGE_QUERY,
    {
      ...shopifyContextForLocale(locale),
      type: "content_page",
      handle,
    },
    {
      buyerIp: null,
      cache: "force-cache",
      revalidate: 300,
      tags: ["shopify-content-pages", `shopify-content-page-${handle}`],
    },
  );
}

function parseContentPage(
  data: ContentPageData,
  expectedHandle: ShopifyContentPageHandle,
): ParsedContentPage | null {
  const node = data.metaobject;
  if (!node || node.type !== "content_page" || node.handle !== expectedHandle) {
    return null;
  }

  const fields = new Map(node.fields.map((field) => [field.key, field]));
  const content = parseContentPageFields(fields);
  return content ? { id: node.id, handle: expectedHandle, ...content } : null;
}

export async function getShopifyContentPage(
  handle: ShopifyContentPageHandle,
  locale: Locale,
): Promise<StorefrontContentPage | null> {
  const marketId = marketIdForLocale(locale);
  const defaultLocale = defaultLocaleForMarket[marketId];
  const [requestedData, defaultData] = await Promise.all([
    fetchContentPage(handle, locale),
    locale === defaultLocale ? null : fetchContentPage(handle, defaultLocale),
  ]);
  const requestedPage = parseContentPage(requestedData, handle);
  if (!requestedPage) return null;

  const defaultPage = defaultData
    ? parseContentPage(defaultData, handle)
    : requestedPage;
  const usedDefaultLanguage = Boolean(
    locale !== defaultLocale &&
    defaultPage &&
    (requestedPage.title === defaultPage.title ||
      requestedPage.richText === defaultPage.richText),
  );

  return {
    ...requestedPage,
    contentLocale: usedDefaultLanguage ? defaultLocale : locale,
    requestedLocale: locale,
    usedDefaultLanguage,
  };
}

export async function getPublishedShopifyContentPagePaths(locale: Locale) {
  const pages = await Promise.all(
    shopifyContentPageHandles.map((handle) =>
      getShopifyContentPage(handle, locale),
    ),
  );

  return pages.flatMap((page) =>
    page && !page.usedDefaultLanguage ? [`/${page.handle}`] : [],
  );
}
