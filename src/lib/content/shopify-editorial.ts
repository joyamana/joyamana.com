import { shopifyFetch } from "@/lib/commerce/shopify";
import type { Locale } from "@/lib/i18n/locales";
import { marketIdForLocale } from "@/lib/i18n/locales";

export const editorialKinds = ["blog", "crystals"] as const;
export type EditorialKind = (typeof editorialKinds)[number];

const shopifyBlogHandles: Record<EditorialKind, string> = {
  blog: "blog",
  crystals: "crystals",
};

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

interface ShopifyImageNode {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

interface ShopifyArticleNode {
  id: string;
  handle: string;
  title: string;
  excerpt: string | null;
  content: string;
  contentHtml: string;
  publishedAt: string;
  image: ShopifyImageNode | null;
  seo: { title: string | null; description: string | null };
  tags: string[];
  authorV2: { name: string } | null;
}

interface ShopifyBlogNode {
  id: string;
  handle: string;
  title: string;
  seo: { title: string | null; description: string | null };
}

interface ShopifyBlogPageData {
  blog:
    | (ShopifyBlogNode & {
        articles: {
          nodes: ShopifyArticleNode[];
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
        };
      })
    | null;
}

interface ShopifyArticleData {
  blog:
    | (ShopifyBlogNode & {
        articleByHandle: ShopifyArticleNode | null;
      })
    | null;
}

interface ParsedArticle {
  id: string;
  handle: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  publishedAt: string;
  image: ShopifyImageNode | null;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  author: string;
}

interface ParsedBlog {
  id: string;
  handle: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  articles: ParsedArticle[];
}

export interface StorefrontEditorialArticle extends ParsedArticle {
  contentLocale: Locale;
  requestedLocale: Locale;
  usedDefaultLanguage: boolean;
}

export interface StorefrontEditorialIndex
  extends Omit<ParsedBlog, "articles"> {
  articles: StorefrontEditorialArticle[];
  requestedLocale: Locale;
  usedDefaultLanguage: boolean;
}

const ARTICLE_FIELDS = `#graphql
  fragment EditorialArticleFields on Article {
    id
    handle
    title
    excerpt
    content
    contentHtml
    publishedAt
    image { url altText width height }
    seo { title description }
    tags
    authorV2 { name }
  }
`;

export const SHOPIFY_EDITORIAL_INDEX_QUERY = `#graphql
  ${ARTICLE_FIELDS}
  query ShopifyEditorialIndex(
    $country: CountryCode!
    $language: LanguageCode!
    $blogHandle: String!
    $after: String
  ) @inContext(country: $country, language: $language) {
    blog(handle: $blogHandle) {
      id
      handle
      title
      seo { title description }
      articles(first: 50, after: $after, sortKey: PUBLISHED_AT, reverse: true) {
        nodes { ...EditorialArticleFields }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

export const SHOPIFY_EDITORIAL_ARTICLE_QUERY = `#graphql
  ${ARTICLE_FIELDS}
  query ShopifyEditorialArticle(
    $country: CountryCode!
    $language: LanguageCode!
    $blogHandle: String!
    $articleHandle: String!
  ) @inContext(country: $country, language: $language) {
    blog(handle: $blogHandle) {
      id
      handle
      title
      seo { title description }
      articleByHandle(handle: $articleHandle) { ...EditorialArticleFields }
    }
  }
`;

function normalizedText(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function excerptFromContent(value: string, maximumLength = 220) {
  const normalized = normalizedText(value);
  if (normalized.length <= maximumLength) return normalized;
  const candidate = normalized.slice(0, maximumLength + 1);
  const wordBoundary = candidate.lastIndexOf(" ");
  const end =
    wordBoundary >= maximumLength * 0.65 ? wordBoundary : maximumLength;
  return `${candidate.slice(0, end).trimEnd()}…`;
}

function parseArticle(node: ShopifyArticleNode | null | undefined) {
  if (
    !node ||
    !node.id ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(node.handle) ||
    !node.title.trim() ||
    !node.contentHtml.trim() ||
    !/^\d{4}-\d{2}-\d{2}T/.test(node.publishedAt)
  ) {
    return null;
  }

  const excerpt =
    normalizedText(node.excerpt) || excerptFromContent(node.content);
  if (!excerpt) return null;

  const author = normalizedText(node.authorV2?.name);
  const image =
    node.image?.url.startsWith("https://") &&
    node.image.url.includes("cdn.shopify.com/")
      ? node.image
      : null;

  return {
    id: node.id,
    handle: node.handle,
    title: node.title.trim(),
    excerpt,
    contentHtml: node.contentHtml.trim(),
    publishedAt: node.publishedAt,
    image,
    seoTitle: normalizedText(node.seo.title) || node.title.trim(),
    seoDescription: normalizedText(node.seo.description) || excerpt,
    tags: [...new Set(node.tags.map(normalizedText).filter(Boolean))],
    author,
  } satisfies ParsedArticle;
}

function parseBlog(
  node: ShopifyBlogNode | null | undefined,
  expectedHandle: string,
  articles: ParsedArticle[],
): ParsedBlog | null {
  if (
    !node ||
    node.handle !== expectedHandle ||
    !node.id ||
    !node.title.trim()
  ) {
    return null;
  }

  return {
    id: node.id,
    handle: node.handle,
    title: node.title.trim(),
    seoTitle: normalizedText(node.seo.title),
    seoDescription: normalizedText(node.seo.description),
    articles,
  };
}

async function fetchBlog(kind: EditorialKind, locale: Locale) {
  const blogHandle = shopifyBlogHandles[kind];
  const articles: ParsedArticle[] = [];
  let after: string | null = null;
  let blogNode: ShopifyBlogNode | null = null;

  for (let page = 0; page < 20; page += 1) {
    const data: ShopifyBlogPageData = await shopifyFetch<ShopifyBlogPageData>(
      SHOPIFY_EDITORIAL_INDEX_QUERY,
      {
        ...storefrontContext[locale],
        blogHandle,
        after,
      },
      {
        buyerIp: null,
        cache: "force-cache",
        revalidate: 300,
        tags: ["shopify-editorial", `shopify-blog-${blogHandle}`],
      },
    );
    if (!data.blog) return null;
    blogNode = data.blog;
    articles.push(
      ...data.blog.articles.nodes.flatMap((node) => {
        const article = parseArticle(node);
        return article ? [article] : [];
      }),
    );

    const { hasNextPage, endCursor } = data.blog.articles.pageInfo;
    if (!hasNextPage) break;
    if (!endCursor || page === 19) {
      throw new Error("Shopify editorial pagination is incomplete.");
    }
    after = endCursor;
  }

  return parseBlog(blogNode, blogHandle, articles);
}

async function fetchArticle(
  kind: EditorialKind,
  handle: string,
  locale: Locale,
) {
  const normalizedHandle = handle.trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedHandle)) return null;
  const blogHandle = shopifyBlogHandles[kind];
  const data = await shopifyFetch<ShopifyArticleData>(
    SHOPIFY_EDITORIAL_ARTICLE_QUERY,
    {
      ...storefrontContext[locale],
      blogHandle,
      articleHandle: normalizedHandle,
    },
    {
      buyerIp: null,
      cache: "force-cache",
      revalidate: 300,
      tags: [
        "shopify-editorial",
        `shopify-blog-${blogHandle}`,
        `shopify-article-${normalizedHandle}`,
      ],
    },
  );
  if (!data.blog || data.blog.handle !== blogHandle) return null;
  return parseArticle(data.blog.articleByHandle);
}

function usesDefaultLanguage(
  requested: ParsedArticle,
  defaultArticle: ParsedArticle | null,
  locale: Locale,
  defaultLocale: Locale,
) {
  if (locale === defaultLocale || !defaultArticle) return false;
  return requested.contentHtml === defaultArticle.contentHtml;
}

function localizeArticle(
  requested: ParsedArticle,
  defaultArticle: ParsedArticle | null,
  locale: Locale,
  defaultLocale: Locale,
): StorefrontEditorialArticle {
  const usedDefaultLanguage = usesDefaultLanguage(
    requested,
    defaultArticle,
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

export async function getShopifyEditorialIndex(
  kind: EditorialKind,
  locale: Locale,
): Promise<StorefrontEditorialIndex | null> {
  const defaultLocale = defaultLocaleForMarket[marketIdForLocale(locale)];
  const [requestedBlog, defaultBlog] = await Promise.all([
    fetchBlog(kind, locale),
    locale === defaultLocale ? null : fetchBlog(kind, defaultLocale),
  ]);
  if (!requestedBlog) return null;
  const canonicalBlog = defaultBlog ?? requestedBlog;
  const defaultArticles = new Map(
    canonicalBlog.articles.map((article) => [article.handle, article]),
  );
  const articles = requestedBlog.articles.flatMap((article) => {
    const defaultArticle = defaultArticles.get(article.handle) ?? null;
    if (locale !== defaultLocale && !defaultArticle) return [];
    return [localizeArticle(article, defaultArticle, locale, defaultLocale)];
  });
  const usedDefaultLanguage =
    locale !== defaultLocale &&
    (!articles.length || articles.every((article) => article.usedDefaultLanguage));

  return {
    id: requestedBlog.id,
    handle: requestedBlog.handle,
    title: requestedBlog.title,
    seoTitle: requestedBlog.seoTitle,
    seoDescription: requestedBlog.seoDescription,
    articles,
    requestedLocale: locale,
    usedDefaultLanguage,
  };
}

export async function getShopifyEditorialArticle(
  kind: EditorialKind,
  handle: string,
  locale: Locale,
): Promise<StorefrontEditorialArticle | null> {
  const defaultLocale = defaultLocaleForMarket[marketIdForLocale(locale)];
  const [requestedArticle, defaultArticle] = await Promise.all([
    fetchArticle(kind, handle, locale),
    locale === defaultLocale ? null : fetchArticle(kind, handle, defaultLocale),
  ]);
  if (!requestedArticle) return null;
  const canonicalArticle = defaultArticle ?? requestedArticle;
  if (locale !== defaultLocale && !defaultArticle) return null;
  return localizeArticle(
    requestedArticle,
    canonicalArticle,
    locale,
    defaultLocale,
  );
}

export async function getPublishedShopifyEditorialPaths(
  kind: EditorialKind,
  locale: Locale,
) {
  const index = await getShopifyEditorialIndex(kind, locale);
  if (!index) return [];
  const basePath = kind === "blog" ? "/blog" : "/crystals";
  const publishedArticles = index.articles.filter(
    (article) => !article.usedDefaultLanguage,
  );
  if (!publishedArticles.length) return [];
  return [
    basePath,
    ...publishedArticles.map((article) => `${basePath}/${article.handle}`),
  ];
}
