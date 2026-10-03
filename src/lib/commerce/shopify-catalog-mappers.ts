import { sanitizeShopifyHtml } from "@/lib/content/shopify-html";
import { parseVariantColors } from "./catalog-browse";
import { compareAmounts } from "./money";
import {
  isValidQuantityRule,
  type Collection,
  type CollectionKind,
  type Money,
  type Product,
  type ProductImage,
  type ProductQuantityRule,
  type ProductVariant,
} from "./types";
import {
  ShopifyCatalogError,
  type ShopifyMoneyV2,
  type ShopifyImage,
  type ShopifyQuantityRule,
  type ShopifyVariantNode,
  type ShopifyProductNode,
  type ShopifyMetafield,
  type ShopifyCollectionBase,
} from "./shopify-catalog-contract";

export function optionalText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
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

export function mapVariant(
  variant: ShopifyVariantNode,
  productTitle: string,
  displayOrder: number,
): ProductVariant {
  const price = mapMoney(variant.price, `variant ${variant.id} price`);
  const compareAtCandidate = variant.compareAtPrice
    ? mapMoney(variant.compareAtPrice, `variant ${variant.id} compare-at price`)
    : null;
  return {
    id: variant.id,
    title: variant.title,
    availableForSale: variant.availableForSale,
    ...mapInventory(variant),
    price,
    compareAtPrice:
      compareAtCandidate &&
      compareAmounts(compareAtCandidate.amount, price.amount) > 0
        ? compareAtCandidate
        : null,
    // Shopify may itself return a product image; do not add another fallback here.
    image: mapImage(variant.image, `${productTitle} — ${variant.title}`),
    selectedOptions: variant.selectedOptions.map(({ name, value }) => ({
      name,
      value,
    })),
    quantityRule: mapQuantityRule(variant.quantityRule, variant.id),
    colors: parseVariantColors(variant.colors),
    displayOrder,
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

  const variants = node.variants.nodes.map((variant, index) =>
    mapVariant(variant, node.title, index),
  );

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
    descriptionHtml: sanitizeShopifyHtml(node.descriptionHtml),
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
    featuredImage,
    images,
    variants,
    model: mapProductModel(node.productModel),
    category: node.category
      ? { id: node.category.id, name: node.category.name }
      : null,
  };
}

function mapProductModel(
  metafield: ShopifyMetafield | null | undefined,
): Product["model"] {
  const value = optionalText(metafield?.value);
  if (value === "standard") return "standard";
  if (value === "natural_variation") return "natural-variation";
  if (value === "one_of_one") return "one-of-one";
  return undefined;
}

export function mapCollectionKind(
  metafield: ShopifyMetafield | null | undefined,
): CollectionKind | undefined {
  const value = optionalText(metafield?.value);
  return value === "category" ||
    value === "design_series" ||
    value === "merchandising"
    ? value
    : undefined;
}

export function mapCollectionBase(node: ShopifyCollectionBase): Collection {
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
