import type { Locale } from "@/lib/i18n/locales";
import { shopifyFetch, type ShopifyFetchOptions } from "./shopify";
import {
  isValidQuantityRule,
  type Collection,
  type CollectionKind,
  type Money,
  type Product,
  type ProductCollection,
  type ProductImage,
  type ProductQuantityRule,
  type ProductVariant,
} from "./types";

const PRODUCT_PAGE_SIZE = 100;
const COLLECTION_PAGE_SIZE = 100;
const SUMMARY_VARIANT_PAGE_SIZE = 1;
const VARIANT_PAGE_SIZE = 100;
const SEARCH_PAGE_SIZE = 24;

interface ShopifyMoneyV2 {
  amount: string;
  currencyCode: string;
}

interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

interface ShopifySeo {
  title: string | null;
  description: string | null;
}

interface ShopifyTaxonomyCategory {
  id: string;
  name: string;
}

interface ShopifyMetafield {
  value: string;
}

interface ShopifyPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface ShopifyConnection<T> {
  nodes: T[];
  pageInfo: ShopifyPageInfo;
}

interface ShopifyQuantityRule {
  minimum: number;
  maximum: number | null;
  increment: number;
}

interface ShopifyVariantNode {
  id: string;
  title: string;
  availableForSale: boolean;
  currentlyNotInStock: boolean;
  quantityAvailable: number | null;
  price: ShopifyMoneyV2;
  compareAtPrice: ShopifyMoneyV2 | null;
  image: ShopifyImage | null;
  selectedOptions: Array<{ name: string; value: string }>;
  quantityRule: ShopifyQuantityRule;
}

export interface ShopifyProductNode {
  id: string;
  handle: string;
  title: string;
  description: string;
  availableForSale: boolean;
  category: ShopifyTaxonomyCategory | null;
  seo: ShopifySeo;
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  priceRange: {
    minVariantPrice: ShopifyMoneyV2;
    maxVariantPrice: ShopifyMoneyV2;
  };
  variants: ShopifyConnection<ShopifyVariantNode>;
}

interface ShopifyCollectionBase {
  id: string;
  handle: string;
  title: string;
  description: string;
  seo: ShopifySeo;
  image: ShopifyImage | null;
  collectionKind: ShopifyMetafield | null;
}

interface ShopifyCollectionSummaryNode extends ShopifyCollectionBase {
  products: { nodes: Array<{ id: string }> };
}

interface ShopifyCollectionNode extends ShopifyCollectionBase {
  products: ShopifyConnection<ShopifyProductNode>;
}

interface ShopifyProductsData {
  products: ShopifyConnection<ShopifyProductNode>;
}

interface ShopifyProductData {
  product: ShopifyProductNode | null;
}

interface ShopifyCollectionsData {
  collections: ShopifyConnection<ShopifyCollectionSummaryNode>;
}

interface ShopifyCollectionData {
  collection: ShopifyCollectionNode | null;
}

interface ShopifyProductVariantsData {
  product: {
    id: string;
    variants: ShopifyConnection<ShopifyVariantNode>;
  } | null;
}

interface ShopifySearchData {
  search: ShopifyConnection<
    | ({ __typename: "Product" } & ShopifyProductNode)
    | { __typename: string; id: string }
  >;
}

export type ShopifyCatalogErrorKind = "unsupported-locale" | "invalid-data";

export class ShopifyCatalogError extends Error {
  readonly kind: ShopifyCatalogErrorKind;

  constructor(kind: ShopifyCatalogErrorKind, message: string) {
    super(message);
    this.name = "ShopifyCatalogError";
    this.kind = kind;
  }
}

const imageFields = `#graphql
  fragment CatalogImageFields on Image {
    url
    altText
    width
    height
  }
`;

const moneyFields = `#graphql
  fragment CatalogMoneyFields on MoneyV2 {
    amount
    currencyCode
  }
`;

const variantFields = `#graphql
  fragment CatalogVariantFields on ProductVariant {
    id
    title
    availableForSale
    currentlyNotInStock
    quantityAvailable
    price {
      ...CatalogMoneyFields
    }
    compareAtPrice {
      ...CatalogMoneyFields
    }
    image {
      ...CatalogImageFields
    }
    selectedOptions {
      name
      value
    }
    quantityRule {
      minimum
      maximum
      increment
    }
  }
  ${moneyFields}
  ${imageFields}
`;

const productFields = `#graphql
  fragment CatalogProductFields on Product {
    id
    handle
    title
    description
    availableForSale
    category {
      id
      name
    }
    seo {
      title
      description
    }
    featuredImage {
      ...CatalogImageFields
    }
    images(first: 10) {
      nodes {
        ...CatalogImageFields
      }
    }
    priceRange {
      minVariantPrice {
        ...CatalogMoneyFields
      }
      maxVariantPrice {
        ...CatalogMoneyFields
      }
    }
    variants(first: ${SUMMARY_VARIANT_PAGE_SIZE}) {
      nodes {
        ...CatalogVariantFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${variantFields}
`;

export const SHOPIFY_PRODUCTS_QUERY = `#graphql
  query CatalogProducts(
    $country: CountryCode!
    $language: LanguageCode!
    $first: Int!
    $after: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, after: $after) {
      nodes {
        ...CatalogProductFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${productFields}
`;

export const SHOPIFY_PRODUCT_QUERY = `#graphql
  query CatalogProduct(
    $country: CountryCode!
    $language: LanguageCode!
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...CatalogProductFields
    }
  }
  ${productFields}
`;

export const SHOPIFY_PRODUCT_VARIANTS_QUERY = `#graphql
  query CatalogProductVariants(
    $country: CountryCode!
    $language: LanguageCode!
    $id: ID!
    $first: Int!
    $after: String!
  ) @inContext(country: $country, language: $language) {
    product(id: $id) {
      id
      variants(first: $first, after: $after) {
        nodes {
          ...CatalogVariantFields
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  ${variantFields}
`;

export const SHOPIFY_COLLECTIONS_QUERY = `#graphql
  query CatalogCollections(
    $country: CountryCode!
    $language: LanguageCode!
    $first: Int!
    $after: String
  ) @inContext(country: $country, language: $language) {
    collections(first: $first, after: $after) {
      nodes {
        id
        handle
        title
        description
        seo {
          title
          description
        }
        image {
          ...CatalogImageFields
        }
        collectionKind: metafield(namespace: "custom", key: "collection_kind") {
          value
        }
        products(first: 1) {
          nodes {
            id
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${imageFields}
`;

export const SHOPIFY_COLLECTION_QUERY = `#graphql
  query CatalogCollection(
    $country: CountryCode!
    $language: LanguageCode!
    $handle: String!
    $first: Int!
    $after: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      seo {
        title
        description
      }
      image {
        ...CatalogImageFields
      }
      collectionKind: metafield(namespace: "custom", key: "collection_kind") {
        value
      }
      products(first: $first, after: $after) {
        nodes {
          ...CatalogProductFields
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  ${productFields}
`;

export const SHOPIFY_SEARCH_QUERY = `#graphql
  query CatalogSearch(
    $country: CountryCode!
    $language: LanguageCode!
    $query: String!
    $first: Int!
    $after: String
  ) @inContext(country: $country, language: $language) {
    search(first: $first, after: $after, query: $query, types: [PRODUCT]) {
      nodes {
        __typename
        ... on Product {
          ...CatalogProductFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${productFields}
`;

function shopifyContext(locale: Locale) {
  if (locale === "en-US") return { country: "US", language: "EN" } as const;
  if (locale === "es-US") return { country: "US", language: "ES" } as const;

  throw new ShopifyCatalogError(
    "unsupported-locale",
    "The enabled Shopify catalog only supports en-US and es-US.",
  );
}

function optionalText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

async function collectConnectionNodes<T extends { id: string }>(
  firstPage: ShopifyConnection<T>,
  loadNextPage: (after: string) => Promise<ShopifyConnection<T>>,
  connectionName: string,
) {
  const nodes: T[] = [];
  const seenNodeIds = new Set<string>();
  const seenCursors = new Set<string>();
  let page: ShopifyConnection<T> | null | undefined = firstPage;

  while (page) {
    if (!Array.isArray(page.nodes) || !page.pageInfo) {
      throw new ShopifyCatalogError(
        "invalid-data",
        `Shopify returned an invalid ${connectionName} connection.`,
      );
    }

    for (const node of page.nodes) {
      if (!node?.id || seenNodeIds.has(node.id)) {
        throw new ShopifyCatalogError(
          "invalid-data",
          `Shopify returned duplicate or invalid nodes while paginating ${connectionName}.`,
        );
      }
      seenNodeIds.add(node.id);
      nodes.push(node);
    }

    const { endCursor, hasNextPage } = page.pageInfo;
    if (typeof hasNextPage !== "boolean") {
      throw new ShopifyCatalogError(
        "invalid-data",
        `Shopify returned invalid page information for ${connectionName}.`,
      );
    }
    if (!hasNextPage) return nodes;

    if (
      typeof endCursor !== "string" ||
      endCursor.trim().length === 0 ||
      seenCursors.has(endCursor)
    ) {
      throw new ShopifyCatalogError(
        "invalid-data",
        `Shopify returned a missing or repeated cursor while paginating ${connectionName}.`,
      );
    }

    seenCursors.add(endCursor);
    page = await loadNextPage(endCursor);
  }

  throw new ShopifyCatalogError(
    "invalid-data",
    `Shopify returned an invalid ${connectionName} page.`,
  );
}

function mapMoney(value: ShopifyMoneyV2, field: string): Money {
  if (!/^\d+(?:\.\d+)?$/.test(value.amount)) {
    throw new ShopifyCatalogError(
      "invalid-data",
      `Shopify returned an invalid amount for ${field}.`,
    );
  }

  if (value.currencyCode !== "USD") {
    throw new ShopifyCatalogError(
      "invalid-data",
      `Shopify returned a currency outside the US USD context for ${field}.`,
    );
  }

  return {
    amount: value.amount,
    currencyCode: "USD",
  };
}

function isStrictlyHigherAmount(compareAt: string, price: string) {
  const [compareWholeRaw, compareFraction = ""] = compareAt.split(".");
  const [priceWholeRaw, priceFraction = ""] = price.split(".");
  const compareWhole = compareWholeRaw.replace(/^0+(?=\d)/, "");
  const priceWhole = priceWholeRaw.replace(/^0+(?=\d)/, "");

  if (compareWhole.length !== priceWhole.length) {
    return compareWhole.length > priceWhole.length;
  }
  if (compareWhole !== priceWhole) return compareWhole > priceWhole;

  const fractionLength = Math.max(
    compareFraction.length,
    priceFraction.length,
  );
  return (
    compareFraction.padEnd(fractionLength, "0") >
    priceFraction.padEnd(fractionLength, "0")
  );
}

function mapImage(
  image: ShopifyImage | null | undefined,
  fallbackAlt: string,
): ProductImage | null {
  if (
    !image ||
    !image.url ||
    !Number.isInteger(image.width) ||
    !Number.isInteger(image.height) ||
    image.width <= 0 ||
    image.height <= 0
  ) {
    return null;
  }

  return {
    url: image.url,
    altText: optionalText(image.altText) ?? fallbackAlt,
    width: image.width,
    height: image.height,
  };
}

function mapQuantityRule(
  rule: ShopifyQuantityRule | null | undefined,
  variantId: string,
): ProductQuantityRule {
  if (!rule) {
    throw new ShopifyCatalogError(
      "invalid-data",
      `Shopify returned an invalid quantity rule for variant ${variantId}.`,
    );
  }

  if (!isValidQuantityRule(rule)) {
    throw new ShopifyCatalogError(
      "invalid-data",
      `Shopify returned an invalid quantity rule for variant ${variantId}.`,
    );
  }

  return {
    minimum: rule.minimum,
    maximum: rule.maximum,
    increment: rule.increment,
  };
}

function mapInventory(
  variant: ShopifyVariantNode,
): Pick<ProductVariant, "currentlyNotInStock" | "quantityAvailable"> {
  if (
    typeof variant.currentlyNotInStock !== "boolean" ||
    (variant.quantityAvailable !== null &&
      (!Number.isInteger(variant.quantityAvailable) ||
        variant.quantityAvailable < 0))
  ) {
    throw new ShopifyCatalogError(
      "invalid-data",
      `Shopify returned invalid inventory for variant ${variant.id}.`,
    );
  }

  return {
    currentlyNotInStock: variant.currentlyNotInStock,
    quantityAvailable: variant.quantityAvailable,
  };
}

export function mapShopifyProduct(node: ShopifyProductNode): Product {
  const images = node.images.nodes.flatMap((image) => {
    const mapped = mapImage(image, node.title);
    return mapped ? [mapped] : [];
  });
  const featuredImage =
    mapImage(node.featuredImage, node.title) ?? images[0] ?? null;

  if (!node.variants.nodes.length) {
    throw new ShopifyCatalogError(
      "invalid-data",
      "Shopify returned a product without a merchandise variant.",
    );
  }

  const variants: ProductVariant[] = node.variants.nodes.map((variant) => {
    const price = mapMoney(variant.price, `variant ${variant.id} price`);
    const compareAtCandidate = variant.compareAtPrice
      ? mapMoney(
          variant.compareAtPrice,
          `variant ${variant.id} compare-at price`,
        )
      : null;
    const compareAtPrice =
      compareAtCandidate?.currencyCode === price.currencyCode &&
      isStrictlyHigherAmount(compareAtCandidate.amount, price.amount)
        ? compareAtCandidate
        : null;

    return {
      id: variant.id,
      title: variant.title,
      availableForSale: variant.availableForSale,
      ...mapInventory(variant),
      price,
      compareAtPrice,
      image:
        mapImage(variant.image, `${node.title} — ${variant.title}`) ??
        featuredImage ??
        images[0] ??
        null,
      selectedOptions: variant.selectedOptions.map(({ name, value }) => ({
        name,
        value,
      })),
      quantityRule: mapQuantityRule(variant.quantityRule, variant.id),
    };
  });
  const compareAtPrice =
    variants.find(
      (variant) => variant.availableForSale && variant.compareAtPrice,
    )?.compareAtPrice ??
    variants.find((variant) => variant.compareAtPrice)?.compareAtPrice ??
    null;

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
    seoTitle: optionalText(node.seo.title),
    seoDescription: optionalText(node.seo.description),
    availableForSale: node.availableForSale,
    priceRange: {
      minVariantPrice: mapMoney(
        node.priceRange.minVariantPrice,
        `product ${node.id} minimum price`,
      ),
      maxVariantPrice: mapMoney(
        node.priceRange.maxVariantPrice,
        `product ${node.id} maximum price`,
      ),
    },
    compareAtPrice,
    featuredImage,
    images,
    variants,
    category: node.category
      ? { id: node.category.id, name: node.category.name }
      : null,
  };
}

function mapCollectionKind(
  metafield: ShopifyMetafield | null | undefined,
): CollectionKind | undefined {
  const value = optionalText(metafield?.value);
  return value === "category" ||
    value === "design_series" ||
    value === "merchandising"
    ? value
    : undefined;
}

function mapCollectionBase(node: ShopifyCollectionBase): Collection {
  const image = mapImage(node.image, node.title);
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
    seoTitle: optionalText(node.seo.title),
    seoDescription: optionalText(node.seo.description),
    image,
    kind: mapCollectionKind(node.collectionKind),
  };
}

export async function getShopifyProducts(
  locale: Locale,
  fetchOptions: ShopifyFetchOptions = { cache: "no-store" },
): Promise<Product[]> {
  const context = shopifyContext(locale);
  const loadPage = (after: string | null) =>
    shopifyFetch<ShopifyProductsData>(
      SHOPIFY_PRODUCTS_QUERY,
      { ...context, first: PRODUCT_PAGE_SIZE, after },
      fetchOptions,
    );
  const firstPage = await loadPage(null);
  const nodes = await collectConnectionNodes(
    firstPage.products,
    async (after) => (await loadPage(after)).products,
    "products",
  );
  return nodes.map(mapShopifyProduct);
}

export async function getShopifyProduct(
  handle: string,
  locale: Locale,
): Promise<Product | null> {
  const normalizedHandle = handle.trim();
  if (!normalizedHandle) return null;

  const context = shopifyContext(locale);
  const data = await shopifyFetch<ShopifyProductData>(
    SHOPIFY_PRODUCT_QUERY,
    { ...context, handle: normalizedHandle },
    { cache: "no-store" },
  );
  if (!data.product) return null;

  const product = data.product;
  const variants = await collectConnectionNodes(
    product.variants,
    async (after) => {
      const nextPage = await shopifyFetch<ShopifyProductVariantsData>(
        SHOPIFY_PRODUCT_VARIANTS_QUERY,
        {
          ...context,
          id: product.id,
          first: VARIANT_PAGE_SIZE,
          after,
        },
        { cache: "no-store" },
      );
      if (!nextPage.product || nextPage.product.id !== product.id) {
        throw new ShopifyCatalogError(
          "invalid-data",
          "Shopify changed the product while its variants were being paginated.",
        );
      }
      return nextPage.product.variants;
    },
    `variants for product ${product.id}`,
  );

  return mapShopifyProduct({
    ...product,
    variants: { ...product.variants, nodes: variants },
  });
}

export async function getShopifyCollections(
  locale: Locale,
  fetchOptions: ShopifyFetchOptions = { cache: "no-store" },
): Promise<Collection[]> {
  const context = shopifyContext(locale);
  const loadPage = (after: string | null) =>
    shopifyFetch<ShopifyCollectionsData>(
      SHOPIFY_COLLECTIONS_QUERY,
      { ...context, first: COLLECTION_PAGE_SIZE, after },
      fetchOptions,
    );
  const firstPage = await loadPage(null);
  const nodes = await collectConnectionNodes(
    firstPage.collections,
    async (after) => (await loadPage(after)).collections,
    "collections",
  );

  return nodes
    .filter((collection) => collection.products.nodes.length > 0)
    .map(mapCollectionBase);
}

export async function getShopifyCollection(
  handle: string,
  locale: Locale,
): Promise<ProductCollection | null> {
  const normalizedHandle = handle.trim();
  if (!normalizedHandle) return null;

  const context = shopifyContext(locale);
  const loadPage = (after: string | null) =>
    shopifyFetch<ShopifyCollectionData>(
      SHOPIFY_COLLECTION_QUERY,
      {
        ...context,
        handle: normalizedHandle,
        first: PRODUCT_PAGE_SIZE,
        after,
      },
      { cache: "no-store" },
    );
  const firstPage = await loadPage(null);
  if (!firstPage.collection) return null;

  const collection = firstPage.collection;
  const products = await collectConnectionNodes(
    collection.products,
    async (after) => {
      const nextPage = await loadPage(after);
      if (!nextPage.collection || nextPage.collection.id !== collection.id) {
        throw new ShopifyCatalogError(
          "invalid-data",
          "Shopify changed the collection while its products were being paginated.",
        );
      }
      return nextPage.collection.products;
    },
    `products for collection ${collection.id}`,
  );
  if (!products.length) return null;

  return {
    ...mapCollectionBase(collection),
    products: products.map(mapShopifyProduct),
  };
}

export async function searchShopifyProducts(
  query: string,
  locale: Locale,
): Promise<Product[]> {
  const normalizedQuery = query.trim().slice(0, 100);
  if (!normalizedQuery) return [];

  const context = shopifyContext(locale);
  const loadPage = (after: string | null) =>
    shopifyFetch<ShopifySearchData>(
      SHOPIFY_SEARCH_QUERY,
      {
        ...context,
        query: normalizedQuery,
        first: SEARCH_PAGE_SIZE,
        after,
      },
      { cache: "no-store" },
    );
  const firstPage = await loadPage(null);
  const nodes = await collectConnectionNodes(
    firstPage.search,
    async (after) => (await loadPage(after)).search,
    "product search results",
  );

  return nodes.flatMap((node) =>
    node.__typename === "Product"
      ? [
          mapShopifyProduct(
            node as { __typename: "Product" } & ShopifyProductNode,
          ),
        ]
      : [],
  );
}
