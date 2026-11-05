import {
  safeShopifyImageSource,
  sanitizeShopifyHtml,
} from "@/lib/content/shopify-html";
import { parseVariantColors } from "./catalog-browse";
import { compareAmounts } from "./money";
import {
  isValidQuantityRule,
  isValidInventory,
  type Collection,
  type Money,
  type Product,
  type ProductSummary,
  type ProductImage,
  type ProductMedia,
  type ProductVideoSource,
  type ProductQuantityRule,
  type ProductVariant,
} from "./types";
import {
  ShopifyCatalogError,
  type ShopifyMoneyV2,
  type ShopifyImage,
  type ShopifyMediaNode,
  type ShopifyVideoSource,
  type ShopifyQuantityRule,
  type ShopifyVariantNode,
  type ShopifyProductNode,
  type ShopifyProductSummaryNode,
  type ShopifyMetafield,
  type ShopifyCollectionBase,
} from "./shopify-catalog-contract";

export function optionalText(value: string | null | undefined) {
  const normalized = typeof value === "string" ? value.trim() : undefined;
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
    typeof image.url !== "string" ||
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

function mapVideoSource(source: ShopifyVideoSource): ProductVideoSource | null {
  const url = optionalText(source?.url);
  const mimeType = optionalText(source?.mimeType)
    ?.split(";", 1)[0]
    .trim()
    .toLowerCase();
  const format = optionalText(source?.format)?.toLowerCase();
  const supportedFormat =
    (mimeType === "video/mp4" && format === "mp4") ||
    (mimeType === "video/quicktime" && format === "mov");
  if (
    !url ||
    /[\u0000-\u001f\u007f\\]/.test(url) ||
    !supportedFormat ||
    !Number.isInteger(source.width) ||
    !Number.isInteger(source.height) ||
    source.width <= 0 ||
    source.height <= 0
  ) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const shopifyVideoPath =
      (parsed.hostname === "cdn.shopify.com" &&
        parsed.pathname.startsWith("/videos/")) ||
      (parsed.hostname === "videos.shopifycdn.com" &&
        parsed.pathname.startsWith("/c/"));
    if (
      parsed.protocol !== "https:" ||
      !shopifyVideoPath ||
      parsed.username ||
      parsed.password ||
      parsed.port
    ) {
      return null;
    }
  } catch {
    return null;
  }

  return {
    url,
    mimeType,
    format,
    width: source.width,
    height: source.height,
  };
}

/** Keep videos visible even when Shopify has no usable source yet. */
export function mapProductMedia(
  node: ShopifyMediaNode,
  productTitle: string,
): ProductMedia | null {
  if (typeof node?.id !== "string" || !node.id.trim()) return null;
  const altText = optionalText(node.alt) ?? productTitle;
  if (node.__typename === "MediaImage") {
    const image = mapImage(node.image, altText);
    return image ? { id: node.id, kind: "image", image } : null;
  }
  if (node.__typename !== "Video" || !Array.isArray(node.sources)) return null;

  const seenUrls = new Set<string>();
  const sources = node.sources.flatMap((source) => {
    const mapped = mapVideoSource(source);
    if (!mapped || seenUrls.has(mapped.url)) return [];
    seenUrls.add(mapped.url);
    return [mapped];
  });
  const previewImage = mapImage(node.previewImage, altText);
  return {
    id: node.id,
    kind: "video",
    altText,
    previewImage:
      previewImage && safeShopifyImageSource(previewImage.url)
        ? previewImage
        : null,
    sources,
  };
}

function mapQuantityRule(
  rule: ShopifyQuantityRule | null | undefined,
  variantId: string,
): ProductQuantityRule {
  if (!rule || !isValidQuantityRule(rule)) {
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
  if (!isValidInventory(variant)) {
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

export function mapShopifyProductSummary(
  node: ShopifyProductSummaryNode,
): ProductSummary {
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    availableForSale: node.availableForSale,
    featuredImage: mapImage(node.featuredImage, node.title),
    category: node.category
      ? { id: node.category.id, name: node.category.name }
      : null,
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
  };
}

export function mapShopifyProduct(node: ShopifyProductNode): Product {
  const media = node.media.nodes.flatMap((item) => {
    const mapped = mapProductMedia(item, node.title);
    return mapped ? [mapped] : [];
  });
  const images = media.flatMap((item) =>
    item.kind === "image" ? [item.image] : [],
  );
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
    ...mapShopifyProductSummary(node),
    description: node.description,
    descriptionHtml: sanitizeShopifyHtml(node.descriptionHtml),
    seoTitle: optionalText(node.seo.title),
    seoDescription: optionalText(node.seo.description),
    featuredImage,
    media,
    images,
    variants,
    model: mapProductModel(node.productModel),
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

export function mapCollectionBase(
  node: ShopifyCollectionBase,
  hasProducts: boolean,
): Collection {
  const image = mapImage(node.image, node.title);
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
    seoTitle: optionalText(node.seo.title),
    seoDescription: optionalText(node.seo.description),
    image,
    hasProducts,
  };
}
