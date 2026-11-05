import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Product, ProductImage, ProductMedia } from "@/lib/commerce/types";
import type { EnabledLocale } from "@/config/locales";
import { ProductGallery } from "./product-gallery";
import { mapProductMedia } from "@/lib/commerce/shopify-catalog-mappers";

const image: ProductImage = {
  url: "https://cdn.shopify.com/s/files/1/product.jpg",
  altText: "Crystal specimen",
  width: 1200,
  height: 1600,
};
const video: Extract<ProductMedia, { kind: "video" }> = {
  id: "video-1",
  kind: "video",
  altText: "Crystal specimen in motion",
  previewImage: {
    ...image,
    url: "https://cdn.shopify.com/s/files/1/poster.jpg",
  },
  sources: [
    {
      url: "https://cdn.shopify.com/videos/crystal.mp4",
      mimeType: "video/mp4",
      format: "mp4",
      width: 1080,
      height: 1920,
    },
  ],
};
const product: Product = {
  id: "product-1",
  handle: "crystal",
  title: "Crystal specimen",
  description: "Natural crystal specimen.",
  descriptionHtml: "",
  availableForSale: true,
  category: null,
  featuredImage: null,
  images: [],
  media: [],
  priceRange: {
    minVariantPrice: { amount: "20", currencyCode: "USD" },
    maxVariantPrice: { amount: "20", currencyCode: "USD" },
  },
  variants: [
    {
      id: "variant-1",
      title: "Default Title",
      availableForSale: true,
      currentlyNotInStock: false,
      quantityAvailable: 2,
      compareAtPrice: null,
      selectedOptions: [],
      price: { amount: "20", currencyCode: "USD" },
      image: null,
      quantityRule: { minimum: 1, maximum: null, increment: 1 },
    },
  ],
};

function renderGallery(
  item: Product,
  locale: EnabledLocale = "en-US",
  initialImageUrl?: string,
) {
  return renderToStaticMarkup(
    <ProductGallery
      product={item}
      locale={locale}
      variant={item.variants[0]}
      initialImageUrl={initialImageUrl}
    />,
  );
}

function mainMarkup(html: string) {
  return html
    .split('class="product-gallery__main"')[1]
    .split('class="product-gallery__thumbs"')[0];
}

describe("PDP mixed media gallery server markup", () => {
  it("keeps an image-only product image-only and avoids redundant thumbnail rows", () => {
    const html = renderGallery({
      ...product,
      media: [{ id: "image-1", kind: "image", image }],
      images: [image],
      featuredImage: image,
      variants: product.variants.map((variant) => ({ ...variant, image })),
    });
    expect(html.match(/<img\b/g)).toHaveLength(1);
    expect(html).toContain('alt="Crystal specimen"');
    expect(html).toContain('fetchPriority="high"');
    expect(html).not.toContain("<video");
    expect(html).not.toContain("product-gallery__thumbs");
    expect(html).not.toContain("product-gallery__play");
  });

  it("shows a real image initially and a labeled play thumbnail without mounting the video", () => {
    const html = renderGallery({
      ...product,
      media: [video, { id: "image-1", kind: "image", image }],
    });
    const main = decodeURIComponent(mainMarkup(html));
    expect(main).toContain("product.jpg");
    expect(main).not.toContain("poster.jpg");
    expect(html).toContain('aria-label="View video 1"');
    expect(html).toContain('aria-label="View image 2"');
    expect(html).toContain('class="product-gallery__play"');
    expect(html).toContain('role="group"');
    expect(html).not.toContain("<video");
    expect(html).not.toContain("crystal.mp4");
  });

  it("keeps an explicit initial product image ahead of the selected variant's image", () => {
    const variantImage = {
      ...image,
      url: "https://cdn.shopify.com/s/files/1/variant.jpg",
    };
    const item = {
      ...product,
      media: [video],
      images: [image],
      featuredImage: image,
      variants: product.variants.map((variant) => ({
        ...variant,
        image: variantImage,
      })),
    };
    const html = renderGallery(item, "en-US", image.url);
    const main = decodeURIComponent(mainMarkup(html));
    expect(main).toContain("product.jpg");
    expect(main).not.toContain("variant.jpg");
    expect(html).not.toContain("<video");
  });

  it("uses the selected variant image when no explicit image was requested", () => {
    const variantImage = {
      ...image,
      url: "https://cdn.shopify.com/s/files/1/variant.jpg",
    };
    const html = renderGallery({
      ...product,
      media: [video, { id: "image-1", kind: "image", image }],
      variants: product.variants.map((variant) => ({
        ...variant,
        image: variantImage,
      })),
    });
    const main = decodeURIComponent(mainMarkup(html));
    expect(main).toContain("variant.jpg");
    expect(main).not.toContain("product.jpg");
  });

  it("renders a native video with its poster, controls, and no automatic loading or playback", () => {
    const html = renderGallery({ ...product, media: [video] });
    expect(html).toContain("<video");
    expect(html).toContain('controls=""');
    expect(html).toContain('playsInline=""');
    expect(html).toContain('preload="none"');
    expect(html).toContain(`poster="${video.previewImage!.url}"`);
    expect(html).toContain('aria-label="Crystal specimen in motion"');
    expect(html).toMatch(
      new RegExp(`<video[^>]+src="${video.sources[0].url}"`),
    );
    expect(html).not.toMatch(/\bautoPlay\b|\bloop\b|\bmuted\b/i);
    expect(html).not.toContain("product-gallery__video-hint");
    expect(html).not.toContain("product-gallery__thumbs");
  });

  it("renders a Shopify MP4 served from the branded checkout domain", () => {
    const source = {
      url: "https://checkout.joyamana.com/cdn/shop/videos/c/vp/stone/HD-1080p.mp4",
      mimeType: "video/mp4",
      format: "mp4",
      width: 1920,
      height: 1080,
    };
    const mapped = mapProductMedia(
      {
        __typename: "Video",
        id: video.id,
        alt: video.altText,
        previewImage: video.previewImage,
        sources: [source],
      },
      product.title,
    );
    expect(mapped?.kind).toBe("video");
    const html = renderGallery({ ...product, media: [mapped!] });
    expect(html).toContain(`src="${source.url}"`);
    expect(html).toContain("<video");
    expect(html).not.toContain("This video is unavailable");
  });

  it("loads an actual MOV URL without a source MIME hint that could skip it", () => {
    const mov = {
      ...video.sources[0],
      url: "https://cdn.shopify.com/videos/c/o/v/stone.mov",
      mimeType: "video/quicktime",
      format: "mov",
    };
    const html = renderGallery({
      ...product,
      media: [{ ...video, sources: [mov] }],
    });
    expect(html).toMatch(new RegExp(`<video[^>]+src="${mov.url}"`));
    expect(html).not.toContain("<source");
    expect(html).not.toContain('type="video/mp4"');
    expect(html).toContain('preload="none"');
  });

  it.each(["mov", "pending"])(
    "keeps the second video beside all five photos when its source is %s",
    (state) => {
      const photos = Array.from({ length: 5 }, (_, index) => ({
        id: `photo-${index}`,
        kind: "image" as const,
        image: {
          ...image,
          url: `https://cdn.shopify.com/s/files/1/photo-${index}.jpg`,
        },
      }));
      const mapped = mapProductMedia(
        {
          __typename: "Video",
          id: video.id,
          alt: video.altText,
          previewImage: video.previewImage,
          sources:
            state === "pending"
              ? []
              : [
                  {
                    ...video.sources[0],
                    url: "https://cdn.shopify.com/videos/c/o/v/b3d89c8a87b64f70a1c98516bbd09b52.mov",
                    mimeType: "video/quicktime",
                    format: "mov",
                  },
                ],
        },
        product.title,
      );
      expect(mapped).not.toBeNull();
      const html = renderGallery({
        ...product,
        media: [photos[0], mapped!, ...photos.slice(1)],
      });
      expect(html.match(/<button\b/g)).toHaveLength(6);
      expect(html).toContain('aria-label="View video 2"');
      expect(html).toContain('aria-label="View image 6"');
      expect(html).not.toContain("<video");
      expect(html).not.toContain("b3d89c8a87b64f70a1c98516bbd09b52.mov");
    },
  );

  it("keeps a video without a poster playable and describes how to start playback", () => {
    const html = renderGallery({
      ...product,
      media: [{ ...video, previewImage: null, altText: "" }],
    });
    expect(html).toContain("<video");
    expect(html).toContain('aria-label="Crystal specimen"');
    expect(html).toContain("aria-describedby=");
    expect(html).toContain("Use the play button to watch the product video");
    expect(html).not.toContain("poster=");
    expect(html).not.toContain("<img");
  });

  it("mounts only the active player when multiple videos are available", () => {
    const html = renderGallery({
      ...product,
      media: [video, { ...video, id: "video-2", previewImage: null }],
    });
    expect(html.match(/<video\b/g)).toHaveLength(1);
    expect(html).toContain('aria-label="View video 2"');
    expect(html.match(/class="product-gallery__play"/g)).toHaveLength(2);
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-pressed="false"');
  });

  it.each([
    [
      "en-US",
      "This video is unavailable. Product details and purchasing options are still available.",
    ],
    ["zh-Hant-US", "影片暫時無法播放。你仍可查看商品詳情及選購選項。"],
  ] as const)(
    "renders a readable no-source state for %s",
    (locale, message) => {
      const html = renderGallery(
        { ...product, media: [{ ...video, sources: [] }] },
        locale,
      );
      expect(html).toContain('role="status"');
      expect(html).toContain(message);
      expect(html).not.toContain("<video");
    },
  );

  it("localizes video selection and no-poster guidance in Traditional Chinese", () => {
    const html = renderGallery(
      {
        ...product,
        media: [
          { ...video, previewImage: null },
          { ...video, id: "video-2" },
        ],
      },
      "zh-Hant-US",
    );
    expect(html).toContain("按播放鍵觀看商品影片");
    expect(html).toContain('aria-label="商品圖片及影片"');
    expect(html).toContain('aria-label="查看影片 1"');
  });

  it("renders an empty state without invented product media", () => {
    const html = renderGallery(product);
    expect(html).toContain("Product images and videos unavailable");
    expect(html).not.toContain("<video");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("product-gallery__thumbs");
  });
});
