import type {
  Product,
  ProductImage,
  ProductMedia,
  ProductVariant,
  ProductVideoSource,
} from "./types";

/** Keep the selected option first, then Shopify's order, then real image fallbacks. */
export function buildProductGalleryMedia(
  product: Pick<Product, "media" | "images" | "variants" | "featuredImage">,
  variant: Pick<ProductVariant, "image">,
): ProductMedia[] {
  const gallery: ProductMedia[] = [];
  const imageUrls = new Set<string>();
  const videoIds = new Set<string>();
  const mediaByImageUrl = new Map<
    string,
    Extract<ProductMedia, { kind: "image" }>
  >();
  for (const media of product.media) {
    if (media.kind === "image" && !mediaByImageUrl.has(media.image.url)) {
      mediaByImageUrl.set(media.image.url, media);
    }
  }

  function addImage(image: ProductImage | null) {
    if (!image || imageUrls.has(image.url)) return;
    imageUrls.add(image.url);
    gallery.push(
      mediaByImageUrl.get(image.url) ?? {
        id: `image:${image.url}`,
        kind: "image",
        image,
      },
    );
  }

  addImage(variant.image);
  for (const media of product.media) {
    if (media.kind === "image") {
      addImage(media.image);
    } else if (!videoIds.has(media.id)) {
      videoIds.add(media.id);
      gallery.push(media);
    }
  }
  for (const image of product.images) addImage(image);
  for (const option of product.variants) addImage(option.image);
  addImage(product.featuredImage);
  return gallery;
}

/** A video can lead the merchandising order without replacing a real initial image. */
export function getInitialGalleryMedia(
  media: ProductMedia[],
  initialImageUrl?: string,
) {
  return (
    media.find(
      (item) => item.kind === "image" && item.image.url === initialImageUrl,
    ) ??
    media.find((item) => item.kind === "image") ??
    media[0]
  );
}

/** Prefer MP4 renditions, then an actual MOV source; never guess a transcode URL. */
export function getProductVideoSource(sources: ProductVideoSource[]) {
  const mp4 = sources.filter(
    (source) =>
      source.mimeType === "video/mp4" && source.format === "mp4" && source.url,
  );
  const native = mp4.length
    ? mp4
    : sources.filter(
        (source) =>
          source.mimeType === "video/quicktime" &&
          source.format === "mov" &&
          source.url,
      );
  const preferred = native.filter(
    (source) => Math.max(source.width, source.height) <= 1920,
  );
  const candidates = preferred.length ? preferred : native;
  return candidates.reduce<ProductVideoSource | undefined>(
    (selected, source) => {
      if (!selected) return source;
      const area = source.width * source.height;
      const selectedArea = selected.width * selected.height;
      return (preferred.length ? area > selectedArea : area < selectedArea)
        ? source
        : selected;
    },
    undefined,
  );
}
