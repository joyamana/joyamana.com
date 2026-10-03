import type { CollectionKind } from "./types";

export const PRODUCT_PAGE_SIZE = 100;
export const COLLECTION_PAGE_SIZE = 100;
export const SUMMARY_VARIANT_PAGE_SIZE = 1;
export const VARIANT_PAGE_SIZE = 100;
export const SEARCH_PAGE_SIZE = 24;
export const NAVIGATION_PRODUCT_PAGE_SIZE = 250;
export const NAVIGATION_COLLECTION_PAGE_SIZE = 100;

export interface ShopifyMoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ShopifySeo {
  title: string | null;
  description: string | null;
}

export interface ShopifyTaxonomyCategory {
  id: string;
  name: string;
}

export interface ShopifyMetafield {
  value: string;
}

export interface ShopifyPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface ShopifyConnection<T> {
  nodes: T[];
  pageInfo: ShopifyPageInfo;
}

export interface ShopifyQuantityRule {
  minimum: number;
  maximum: number | null;
  increment: number;
}

export interface ShopifyVariantNode {
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
  colors?: { type: string; value: string } | null;
}

export interface ShopifyProductNode {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  productModel: ShopifyMetafield | null;
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

export interface ShopifyCollectionBase {
  id: string;
  handle: string;
  title: string;
  description: string;
  seo: ShopifySeo;
  image: ShopifyImage | null;
  collectionKind: ShopifyMetafield | null;
}

export interface ShopifyCollectionSummaryNode extends ShopifyCollectionBase {
  products: { nodes: Array<{ id: string }> };
}

export interface ShopifyCollectionNode extends ShopifyCollectionBase {
  products: ShopifyConnection<ShopifyProductNode>;
}

export interface ShopifyProductsData {
  products: ShopifyConnection<ShopifyProductNode>;
}

export interface ShopifyProductData {
  product: ShopifyProductNode | null;
}

export interface ShopifyCollectionsData {
  collections: ShopifyConnection<ShopifyCollectionSummaryNode>;
}

export interface ShopifyCollectionData {
  collection: ShopifyCollectionNode | null;
}

export interface ShopifyProductVariantsData {
  product: {
    id: string;
    variants: ShopifyConnection<ShopifyVariantNode>;
  } | null;
}

export interface ShopifySearchData {
  search: ShopifyConnection<
    | ({ __typename: "Product" } & ShopifyProductNode)
    | { __typename: string; id: string }
  >;
}

export interface ShopifyNavigationProductNode {
  id: string;
  category: { id: string } | null;
}

export interface ShopifyNavigationCollectionNode {
  id: string;
  handle: string;
  title: string;
  collectionKind: ShopifyMetafield | null;
  products: { nodes: Array<{ id: string }> };
}

export interface ShopifyNavigationProductsData {
  products: ShopifyConnection<ShopifyNavigationProductNode>;
}

export interface ShopifyNavigationCollectionsData {
  collections: ShopifyConnection<ShopifyNavigationCollectionNode>;
}

export interface ShopifyCatalogNavigationSnapshot {
  productCategoryIds: string[];
  collections: Array<{
    handle: string;
    title: string;
    kind: CollectionKind | undefined;
  }>;
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
    colors: metafield(namespace: "custom", key: "colors") {
      type
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
    descriptionHtml
    availableForSale
    productModel: metafield(namespace: "custom", key: "product_model") {
      value
    }
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
    variants(first: ${SUMMARY_VARIANT_PAGE_SIZE}, sortKey: POSITION, reverse: false) {
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
      variants(first: $first, after: $after, sortKey: POSITION, reverse: false) {
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

export const SHOPIFY_NAVIGATION_PRODUCTS_QUERY = `#graphql
  query CatalogNavigationProducts(
    $country: CountryCode!
    $language: LanguageCode!
    $first: Int!
    $after: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, after: $after) {
      nodes {
        id
        category { id }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const SHOPIFY_NAVIGATION_COLLECTIONS_QUERY = `#graphql
  query CatalogNavigationCollections(
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
        collectionKind: metafield(namespace: "custom", key: "collection_kind") {
          value
        }
        products(first: 1) { nodes { id } }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/** A dedicated light query: summary consumers do not hydrate every variant. */
export const SHOPIFY_BROWSE_VARIANTS_QUERY = `#graphql
  query CatalogBrowseVariants($country: CountryCode!, $language: LanguageCode!, $ids: [ID!]!)
  @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      ... on Product {
        id
        variants(first: ${VARIANT_PAGE_SIZE}, sortKey: POSITION, reverse: false) {
          nodes { ...CatalogVariantFields }
          pageInfo { hasNextPage endCursor }
        }
      }
    }
  }
  ${variantFields}
`;
