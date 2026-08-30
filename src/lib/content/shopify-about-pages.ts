import type { Locale } from "@/lib/i18n/locales";
import { marketIdForLocale } from "@/lib/i18n/locales";
import { shopifyFetch } from "@/lib/commerce/shopify";
import { renderShopifyRichText } from "./shopify-content-pages";

export const shopifyAboutRootHandle = "about";

interface MetaobjectField {
  key: string;
  type: string;
  value: string | null;
}

interface ContentPageNode {
  id: string;
  type: string;
  handle: string;
  updatedAt: string;
  fields: MetaobjectField[];
}

interface MetaobjectReferenceField {
  type: string;
  references: {
    nodes: ContentPageNode[];
    pageInfo: { hasNextPage: boolean };
  } | null;
}

interface AboutTreeData {
  metaobject:
    | (ContentPageNode & {
        childPages: MetaobjectReferenceField | null;
      })
    | null;
}

interface ParsedAboutPage {
  id: string;
  handle: string;
  title: string;
  navigationTitle: string;
  summary: string;
  richText: string;
  html: string;
  lastUpdated: string;
  seoTitle: string;
  seoDescription: string;
}

export interface StorefrontAboutPage extends ParsedAboutPage {
  contentLocale: Locale;
  requestedLocale: Locale;
  usedDefaultLanguage: boolean;
}

export interface StorefrontAboutTree {
  root: StorefrontAboutPage;
  children: StorefrontAboutPage[];
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

export const SHOPIFY_ABOUT_TREE_QUERY = `#graphql
  query ShopifyAboutTree(
    $country: CountryCode!
    $language: LanguageCode!
    $type: String!
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    metaobject(handle: { type: $type, handle: $handle }) {
      ...ContentPageFields
      childPages: field(key: "child_pages") {
        type
        references(first: 50) {
          nodes {
            ... on Metaobject {
              ...ContentPageFields
            }
          }
          pageInfo { hasNextPage }
        }
      }
    }
  }

  fragment ContentPageFields on Metaobject {
    id
    type
    handle
    updatedAt
    fields { key type value }
  }
`;

async function fetchAboutTree(locale: Locale) {
  return shopifyFetch<AboutTreeData>(
    SHOPIFY_ABOUT_TREE_QUERY,
    {
      ...storefrontContext[locale],
      type: "content_page",
      handle: shopifyAboutRootHandle,
    },
    {
      buyerIp: null,
      cache: "force-cache",
      revalidate: 300,
      tags: ["shopify-content-pages", "shopify-about-pages"],
    },
  );
}

function fieldValue(
  fields: Map<string, MetaobjectField>,
  key: string,
  type: string,
) {
  const field = fields.get(key);
  return field?.type === type ? field.value?.trim() ?? "" : "";
}

function richTextExcerpt(source: string, maximumLength = 180) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    return "";
  }

  function textNodes(value: unknown): string[] {
    if (!value || typeof value !== "object") return [];
    const node = value as { type?: unknown; value?: unknown; children?: unknown };
    if (node.type === "text" && typeof node.value === "string") {
      return [node.value];
    }
    return Array.isArray(node.children)
      ? node.children.flatMap(textNodes)
      : [];
  }

  const normalized = textNodes(parsed).join(" ").replace(/\s+/g, " ").trim();
  if (normalized.length <= maximumLength) return normalized;

  const candidate = normalized.slice(0, maximumLength + 1);
  const lastWordBoundary = candidate.lastIndexOf(" ");
  const truncated = candidate
    .slice(0, lastWordBoundary >= maximumLength * 0.65 ? lastWordBoundary : maximumLength)
    .trimEnd();
  return `${truncated}…`;
}

function parseAboutPage(
  node: ContentPageNode | null | undefined,
  expectedHandle?: string,
): ParsedAboutPage | null {
  if (
    !node ||
    node.type !== "content_page" ||
    (expectedHandle && node.handle !== expectedHandle) ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(node.handle)
  ) {
    return null;
  }

  const fields = new Map(node.fields.map((field) => [field.key, field]));
  const title = fieldValue(fields, "title", "single_line_text_field");
  const richText = fieldValue(fields, "body", "rich_text_field");
  const lastUpdated = fieldValue(fields, "last_updated", "date");
  const seoTitle = fieldValue(
    fields,
    "seo_title",
    "single_line_text_field",
  );
  const seoDescription = fieldValue(
    fields,
    "seo_description",
    "multi_line_text_field",
  );
  const html = renderShopifyRichText(richText);
  const bodyExcerpt = richTextExcerpt(richText);

  if (
    !title ||
    !richText ||
    !html ||
    !bodyExcerpt ||
    !/^\d{4}-\d{2}-\d{2}$/.test(lastUpdated) ||
    !seoTitle
  ) {
    return null;
  }

  return {
    id: node.id,
    handle: node.handle,
    title,
    navigationTitle:
      fieldValue(fields, "navigation_title", "single_line_text_field") ||
      title,
    summary: fieldValue(fields, "summary", "multi_line_text_field"),
    richText,
    html,
    lastUpdated,
    seoTitle,
    seoDescription: seoDescription || bodyExcerpt,
  };
}

function usesDefaultLanguage(
  requested: ParsedAboutPage,
  defaultPage: ParsedAboutPage | null,
  locale: Locale,
  defaultLocale: Locale,
) {
  if (locale === defaultLocale || !defaultPage) return false;

  // Titles and navigation labels may intentionally remain brand names. Body,
  // summary, and SEO description must be independently translated before the
  // localized page is allowed into hreflang or the sitemap.
  return (
    requested.richText === defaultPage.richText ||
    requested.seoDescription === defaultPage.seoDescription ||
    Boolean(
      defaultPage.summary &&
        (!requested.summary || requested.summary === defaultPage.summary),
    )
  );
}

function localizePage(
  requested: ParsedAboutPage,
  defaultPage: ParsedAboutPage | null,
  locale: Locale,
  defaultLocale: Locale,
): StorefrontAboutPage {
  const usedDefaultLanguage = usesDefaultLanguage(
    requested,
    defaultPage,
    locale,
    defaultLocale,
  );

  return {
    ...requested,
    contentLocale: usedDefaultLanguage ? defaultLocale : locale,
    requestedLocale: locale,
    usedDefaultLanguage,
  };
}

function referencedChildren(data: AboutTreeData) {
  const root = data.metaobject;
  const references =
    root?.childPages?.type === "list.metaobject_reference"
      ? root.childPages.references
      : null;
  if (!references) return [];

  // The storefront UI is intentionally capped well below this query limit.
  // Treat an unexpectedly paginated relationship as invalid instead of
  // silently exposing only part of the configured navigation.
  if (references.pageInfo.hasNextPage) return [];

  const seen = new Set([shopifyAboutRootHandle]);
  return references.nodes.flatMap((node) => {
    const page = parseAboutPage(node);
    if (!page || seen.has(page.handle)) return [];
    seen.add(page.handle);
    return [page];
  });
}

export async function getShopifyAboutTree(
  locale: Locale,
): Promise<StorefrontAboutTree | null> {
  const defaultLocale = defaultLocaleForMarket[marketIdForLocale(locale)];
  const [requestedData, defaultData] = await Promise.all([
    fetchAboutTree(locale),
    locale === defaultLocale ? null : fetchAboutTree(defaultLocale),
  ]);
  const requestedRoot = parseAboutPage(
    requestedData.metaobject,
    shopifyAboutRootHandle,
  );
  if (!requestedRoot) return null;

  const defaultRoot = defaultData
    ? parseAboutPage(defaultData.metaobject, shopifyAboutRootHandle)
    : requestedRoot;
  if (locale !== defaultLocale && !defaultRoot) return null;

  const defaultChildren = new Map(
    (
      defaultData
        ? referencedChildren(defaultData)
        : referencedChildren(requestedData)
    ).map((page) => [page.handle, page]),
  );
  const children = referencedChildren(requestedData).flatMap((page) => {
    const defaultPage = defaultChildren.get(page.handle) ?? null;
    if (locale !== defaultLocale && !defaultPage) return [];
    return [localizePage(page, defaultPage, locale, defaultLocale)];
  });

  return {
    root: localizePage(requestedRoot, defaultRoot, locale, defaultLocale),
    children,
  };
}

export function aboutPageForHandle(
  tree: StorefrontAboutTree,
  handle?: string,
) {
  return handle
    ? tree.children.find((page) => page.handle === handle) ?? null
    : tree.root;
}

export async function getPublishedShopifyAboutPaths(locale: Locale) {
  const tree = await getShopifyAboutTree(locale);
  if (!tree || tree.root.usedDefaultLanguage) return [];

  return [
    "/about",
    ...tree.children.flatMap((page) =>
      page.usedDefaultLanguage ? [] : [`/about/${page.handle}`],
    ),
  ];
}
