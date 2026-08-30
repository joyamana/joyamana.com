import type { Locale } from "@/lib/i18n/locales";
import { marketIdForLocale } from "@/lib/i18n/locales";
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
  lastUpdated: string;
  seoTitle: string;
  seoDescription: string;
}

export interface StorefrontContentPage extends ParsedContentPage {
  html: string;
  contentLocale: Locale;
  requestedLocale: Locale;
  usedDefaultLanguage: boolean;
}

const storefrontContext: Record<
  Locale,
  { country: "US" | "CA"; language: "EN" | "ES" | "FR" }
> = {
  "en-US": { country: "US", language: "EN" },
  "es-US": { country: "US", language: "ES" },
  "en-CA": { country: "CA", language: "EN" },
  "fr-CA": { country: "CA", language: "FR" },
};

const defaultLocaleForMarket: Record<"us" | "ca", Locale> = {
  us: "en-US",
  ca: "en-CA",
};

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
      ...storefrontContext[locale],
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
  if (
    !node ||
    node.type !== "content_page" ||
    node.handle !== expectedHandle
  ) {
    return null;
  }

  const fields = new Map(node.fields.map((field) => [field.key, field]));
  const value = (key: string, type: string) => {
    const field = fields.get(key);
    return field?.type === type ? field.value?.trim() ?? "" : "";
  };
  const title = value("title", "single_line_text_field");
  const richText = value("body", "rich_text_field");
  const lastUpdated = value("last_updated", "date");
  const seoTitle = value("seo_title", "single_line_text_field");
  const seoDescription = value("seo_description", "multi_line_text_field");

  if (!title || !richText || !lastUpdated || !seoTitle || !seoDescription) {
    return null;
  }

  return {
    id: node.id,
    handle: expectedHandle,
    title,
    richText,
    lastUpdated,
    seoTitle,
    seoDescription,
  };
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
    html: renderShopifyRichText(requestedPage.richText),
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

interface RichTextNode {
  type?: unknown;
  value?: unknown;
  bold?: unknown;
  italic?: unknown;
  level?: unknown;
  listType?: unknown;
  url?: unknown;
  target?: unknown;
  children?: unknown;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeHref(value: unknown) {
  if (typeof value !== "string") return null;
  const candidate = value.trim();
  if (candidate.startsWith("/") && !candidate.startsWith("//")) {
    return candidate;
  }

  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "mailto:"
      ? candidate
      : null;
  } catch {
    return null;
  }
}

function isHttpsHref(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function childNodes(node: RichTextNode) {
  return Array.isArray(node.children)
    ? (node.children as RichTextNode[])
    : [];
}

function renderNode(node: RichTextNode): string {
  if (typeof node.type !== "string") return "";

  if (node.type === "text") {
    if (typeof node.value !== "string") return "";
    let output = escapeHtml(node.value);
    if (node.italic === true) output = `<em>${output}</em>`;
    if (node.bold === true) output = `<strong>${output}</strong>`;
    return output;
  }

  const children = childNodes(node).map(renderNode).join("");
  if (node.type === "root") return children;
  if (node.type === "paragraph") return `<p>${children}</p>`;
  if (node.type === "heading") {
    const level = typeof node.level === "number" ? node.level : 2;
    const safeLevel = level <= 2 ? 2 : level === 3 ? 3 : 4;
    return `<h${safeLevel}>${children}</h${safeLevel}>`;
  }
  if (node.type === "list") {
    const tag = node.listType === "ordered" ? "ol" : "ul";
    return `<${tag}>${children}</${tag}>`;
  }
  if (node.type === "list-item") return `<li>${children}</li>`;
  if (node.type === "link") {
    const href = safeHref(node.url);
    if (!href) return children;
    const opensNewTab = node.target === "_blank" && isHttpsHref(href);
    return `<a href="${escapeHtml(href)}"${
      opensNewTab ? ' target="_blank" rel="noopener noreferrer"' : ""
    }>${children}</a>`;
  }

  return "";
}

export function renderShopifyRichText(source: string) {
  let parsed: RichTextNode;
  try {
    parsed = JSON.parse(source) as RichTextNode;
  } catch {
    return "";
  }

  return parsed.type === "root" ? renderNode(parsed).trim() : "";
}
