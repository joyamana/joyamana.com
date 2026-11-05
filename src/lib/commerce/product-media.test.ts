import { describe, expect, it } from "vitest";
import {
  buildProductGalleryMedia,
  getInitialGalleryMedia,
  getProductVideoSource,
} from "./product-media";
import type {
  Product,
  ProductImage,
  ProductMedia,
  ProductVideoSource,
} from "./types";

function image(name: string): ProductImage {
  return {
    url: `https://cdn.shopify.com/s/files/1/${name}.jpg`,
    altText: name,
    width: 1200,
    height: 1600,
  };
}

function videoSource(width: number, height: number): ProductVideoSource {
  return {
    url: `https://cdn.shopify.com/videos/${width}x${height}.mp4`,
    mimeType: "video/mp4",
    format: "mp4",
    width,
    height,
  };
}

const selectedImage = image("selected");
const productImage = image("product");
const poster = image("poster");
const video: ProductMedia = {
  id: "video-1",
  kind: "video",
  altText: "Turn the crystal",
  previewImage: poster,
  sources: [videoSource(1280, 720)],
};
const selectedMedia: ProductMedia = {
  id: "image-selected",
  kind: "image",
  image: selectedImage,
};
const productMedia: ProductMedia = {
  id: "image-product",
  kind: "image",
  image: productImage,
};
const baseProduct: Pick<
  Product,
  "media" | "images" | "variants" | "featuredImage"
> = {
  media: [video, productMedia, selectedMedia],
  images: [productImage, selectedImage],
  variants: [],
  featuredImage: productImage,
};

describe("PDP gallery media ordering", () => {
  it("puts the selected variant image first, preserving the remaining Shopify order", () => {
    expect(
      buildProductGalleryMedia(baseProduct, { image: selectedImage }),
    ).toEqual([selectedMedia, video, productMedia]);
  });

  it("deduplicates media images and videos without creating a separate image from the poster", () => {
    const gallery = buildProductGalleryMedia(
      {
        ...baseProduct,
        media: [
          video,
          video,
          productMedia,
          { ...productMedia, id: "duplicate" },
        ],
        images: [productImage, productImage],
      },
      { image: productImage },
    );
    expect(gallery).toEqual([productMedia, video]);
    expect(
      gallery.some(
        (item) => item.kind === "image" && item.image.url === poster.url,
      ),
    ).toBe(false);
  });

  it("appends real product, other variant, and featured images missing from media", () => {
    const otherVariantImage = image("other-variant");
    const featuredImage = image("featured");
    const gallery = buildProductGalleryMedia(
      {
        ...baseProduct,
        media: [video],
        images: [productImage],
        variants: [{ image: otherVariantImage }] as Product["variants"],
        featuredImage,
      },
      { image: selectedImage },
    );
    expect(
      gallery.map((item) => (item.kind === "image" ? item.image.url : item.id)),
    ).toEqual([
      selectedImage.url,
      video.id,
      productImage.url,
      otherVariantImage.url,
      featuredImage.url,
    ]);
  });

  it("keeps video-only products and does not invent a replacement image", () => {
    expect(
      buildProductGalleryMedia(
        { media: [video], images: [], variants: [], featuredImage: null },
        { image: null },
      ),
    ).toEqual([video]);
  });
});

describe("PDP initial media", () => {
  it("uses the explicitly requested image even when another variant image is first", () => {
    expect(
      getInitialGalleryMedia(
        [selectedMedia, video, productMedia],
        productImage.url,
      ),
    ).toEqual(productMedia);
  });

  it("prefers a real image even when Shopify puts a video first", () => {
    expect(getInitialGalleryMedia([video, productMedia])).toEqual(productMedia);
    expect(
      getInitialGalleryMedia([video, productMedia], "missing.jpg"),
    ).toEqual(productMedia);
  });

  it("can use a video with or without its own poster when no real image exists", () => {
    expect(getInitialGalleryMedia([video])).toEqual(video);
    const noPoster = { ...video, previewImage: null };
    expect(getInitialGalleryMedia([noPoster])).toEqual(noPoster);
    expect(getInitialGalleryMedia([])).toBeUndefined();
  });
});

describe("native product video source", () => {
  it("chooses the largest MP4 under the long-edge cap regardless of input order", () => {
    const small = videoSource(640, 360);
    const medium = videoSource(1280, 720);
    const large = videoSource(1920, 1080);
    const original = videoSource(3840, 2160);
    expect(getProductVideoSource([original, medium, large, small])).toEqual(
      large,
    );
  });

  it("applies the same cap to portrait videos", () => {
    const medium = videoSource(720, 1280);
    const large = videoSource(1080, 1920);
    const original = videoSource(2160, 3840);
    expect(getProductVideoSource([original, large, medium])).toEqual(large);
  });

  it("uses the smallest available MP4 when every source exceeds the cap", () => {
    const original = videoSource(3840, 2160);
    const smaller = videoSource(2560, 1440);
    expect(getProductVideoSource([original, smaller])).toEqual(smaller);
  });

  it("ignores HLS and missing URLs, and reports no playable native source", () => {
    const hls = {
      ...videoSource(1920, 1080),
      mimeType: "application/x-mpegURL",
      format: "m3u8",
    };
    const missingUrl = { ...videoSource(1280, 720), url: "" };
    const mp4 = videoSource(640, 360);
    expect(getProductVideoSource([hls, missingUrl, mp4])).toEqual(mp4);
    expect(getProductVideoSource([hls, missingUrl])).toBeUndefined();
    expect(getProductVideoSource([])).toBeUndefined();
  });
});
