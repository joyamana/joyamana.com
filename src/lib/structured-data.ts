import { siteConfig } from "@/config/site";
import type { Product } from "@/lib/commerce/types";
import { localePath, type Locale } from "@/lib/i18n/locales";

export interface StructuredBreadcrumb {
  name: string;
  path: string;
}

interface ProductStructuredDataInput {
  product: Product;
  locale: Locale;
  breadcrumbs: StructuredBreadcrumb[];
}

interface CollectionStructuredDataInput {
  name: string;
  description?: string;
  path: string;
  products: Product[];
  locale: Locale;
  breadcrumbs: StructuredBreadcrumb[];
}

interface AboutStructuredDataInput {
  name: string;
  description?: string;
  path: string;
  locale: Locale;
  breadcrumbs: StructuredBreadcrumb[];
  isRoot: boolean;
}

interface EditorialStructuredDataInput {
  name: string;
  description: string;
  path: string;
  locale: Locale;
  breadcrumbs: StructuredBreadcrumb[];
  kind: "blog" | "crystals";
  author?: string;
  publishedAt: string;
  image?: string;
}

function absoluteStorefrontUrl(locale: Locale, path: string) {
  return new URL(localePath(locale, path), siteConfig.url).toString();
}

function nonEmptyText(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function stableFragment(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

function productImages(product: Product) {
  const seen = new Set<string>();
  return [
    product.featuredImage,
    ...product.images,
    ...product.variants.map((variant) => variant.image),
  ].flatMap((image) => {
    if (!image || seen.has(image.url)) return [];
    seen.add(image.url);
    return [image.url];
  });
}

function productCardImage(product: Product) {
  return (
    product.featuredImage ?? product.images[0] ?? product.variants[0]?.image ?? null
  );
}

function buildBreadcrumbList(
  pageUrl: string,
  locale: Locale,
  breadcrumbs: StructuredBreadcrumb[],
) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb-list`,
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.name,
      item: absoluteStorefrontUrl(locale, breadcrumb.path),
    })),
  };
}

function buildProductOffers(product: Product, pageUrl: string) {
  return product.variants.map((variant) => ({
    "@type": "Offer",
    "@id": `${pageUrl}#offer-${stableFragment(variant.id)}`,
    url: pageUrl,
    price: variant.price.amount,
    priceCurrency: variant.price.currencyCode,
    availability:
      product.availableForSale && variant.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
  }));
}

export function buildProductStructuredData({
  product,
  locale,
  breadcrumbs,
}: ProductStructuredDataInput) {
  const pageUrl = absoluteStorefrontUrl(
    locale,
    `/products/${product.handle}`,
  );
  const images = productImages(product);
  const description = nonEmptyText(product.description);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${pageUrl}#product`,
        url: pageUrl,
        name: product.title,
        ...(description ? { description } : {}),
        ...(images.length ? { image: images } : {}),
        offers: buildProductOffers(product, pageUrl),
      },
      buildBreadcrumbList(pageUrl, locale, breadcrumbs),
    ],
  };
}

export function buildCollectionStructuredData({
  name,
  description,
  path,
  products,
  locale,
  breadcrumbs,
}: CollectionStructuredDataInput) {
  const pageUrl = absoluteStorefrontUrl(locale, path);
  const itemListId = `${pageUrl}#item-list`;
  const normalizedDescription = nonEmptyText(description);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#collection-page`,
        url: pageUrl,
        name,
        ...(normalizedDescription
          ? { description: normalizedDescription }
          : {}),
        mainEntity: { "@id": itemListId },
      },
      {
        "@type": "ItemList",
        "@id": itemListId,
        name,
        numberOfItems: products.length,
        itemListElement: products.map((product, index) => {
          const productUrl = absoluteStorefrontUrl(
            locale,
            `/products/${product.handle}`,
          );
          const image = productCardImage(product);
          return {
            "@type": "ListItem",
            position: index + 1,
            url: productUrl,
            item: {
              "@type": "Product",
              "@id": `${productUrl}#product`,
              url: productUrl,
              name: product.title,
              ...(image ? { image: image.url } : {}),
            },
          };
        }),
      },
      buildBreadcrumbList(pageUrl, locale, breadcrumbs),
    ],
  };
}

export function buildAboutStructuredData({
  name,
  description,
  path,
  locale,
  breadcrumbs,
  isRoot,
}: AboutStructuredDataInput) {
  const pageUrl = absoluteStorefrontUrl(locale, path);
  const normalizedDescription = nonEmptyText(description);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": isRoot ? "AboutPage" : "WebPage",
        "@id": `${pageUrl}#web-page`,
        url: pageUrl,
        name,
        ...(normalizedDescription
          ? { description: normalizedDescription }
          : {}),
      },
      buildBreadcrumbList(pageUrl, locale, breadcrumbs),
    ],
  };
}

export function buildEditorialStructuredData({
  name,
  description,
  path,
  locale,
  breadcrumbs,
  kind,
  author,
  publishedAt,
  image,
}: EditorialStructuredDataInput) {
  const pageUrl = absoluteStorefrontUrl(locale, path);
  const normalizedAuthor = nonEmptyText(author);
  const normalizedImage = nonEmptyText(image);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": kind === "blog" ? "BlogPosting" : "Article",
        "@id": `${pageUrl}#article`,
        url: pageUrl,
        headline: name,
        description,
        datePublished: publishedAt,
        ...(normalizedAuthor
          ? { author: { "@type": "Person", name: normalizedAuthor } }
          : {}),
        ...(normalizedImage ? { image: normalizedImage } : {}),
      },
      buildBreadcrumbList(pageUrl, locale, breadcrumbs),
    ],
  };
}

export function serializeStructuredData(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** Returns no markup while the prototype-wide noindex gate is closed. */
export function serializeIndexableStructuredData(value: unknown) {
  return siteConfig.indexable ? serializeStructuredData(value) : null;
}
