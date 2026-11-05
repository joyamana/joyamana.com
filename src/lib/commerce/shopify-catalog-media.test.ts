import { describe, expect, it } from "vitest";
import { mapProductMedia } from "./shopify-catalog-mappers";
import type {
  ShopifyMediaNode,
  ShopifyVideoSource,
} from "./shopify-catalog-contract";

const source: ShopifyVideoSource = {
  url: "https://cdn.shopify.com/videos/c/vp/stone.mp4",
  mimeType: "video/mp4",
  format: "mp4",
  width: 1920,
  height: 1080,
};

const movSource: ShopifyVideoSource = {
  ...source,
  url: "https://cdn.shopify.com/videos/c/o/v/b3d89c8a87b64f70a1c98516bbd09b52.mov",
  mimeType: "video/quicktime",
  format: "mov",
};

function video(): Extract<ShopifyMediaNode, { __typename: "Video" }> {
  return {
    id: "gid://shopify/Video/1",
    __typename: "Video",
    alt: "  Crystal in daylight  ",
    previewImage: {
      url: "https://cdn.shopify.com/s/files/1/1/files/preview_images/stone.jpg",
      altText: null,
      width: 1920,
      height: 1080,
    },
    sources: [source],
  };
}

describe("Shopify hosted product media", () => {
  it("keeps Shopify media IDs and readable alt text for both media kinds", () => {
    expect(mapProductMedia(video(), "Quartz")).toEqual({
      id: "gid://shopify/Video/1",
      kind: "video",
      altText: "Crystal in daylight",
      previewImage: {
        ...video().previewImage,
        altText: "Crystal in daylight",
      },
      sources: [source],
    });
    expect(
      mapProductMedia(
        {
          id: "gid://shopify/MediaImage/2",
          __typename: "MediaImage",
          alt: "Side view",
          previewImage: null,
          image: { ...video().previewImage!, altText: null },
        },
        "Quartz",
      ),
    ).toMatchObject({
      id: "gid://shopify/MediaImage/2",
      kind: "image",
      image: { altText: "Side view" },
    });
  });

  it("does not require a poster and falls back to the product title", () => {
    expect(
      mapProductMedia({ ...video(), alt: " ", previewImage: null }, "Quartz"),
    ).toMatchObject({ kind: "video", altText: "Quartz", previewImage: null });
  });

  it("retains a Shopify MOV source without inventing an MP4 URL", () => {
    expect(
      mapProductMedia({ ...video(), sources: [movSource] }, "Quartz"),
    ).toMatchObject({ kind: "video", sources: [movSource] });
  });

  it("accepts Shopify's video CDN and normalizes MIME parameters", () => {
    const rendition = {
      ...source,
      url: "https://videos.shopifycdn.com/c/vp/stone/SD-360p.mp4?Expires=123",
    };
    expect(
      mapProductMedia(
        {
          ...video(),
          sources: [
            {
              ...rendition,
              mimeType: ' VIDEO/MP4; codecs="avc1.640028" ',
              format: "MP4",
            },
            { ...movSource, mimeType: "VIDEO/QUICKTIME", format: "MOV" },
          ],
        },
        "Quartz",
      ),
    ).toMatchObject({ sources: [rendition, movSource] });
  });

  it("keeps a video and its poster when its sources are not ready", () => {
    expect(
      mapProductMedia({ ...video(), sources: [] }, "Quartz"),
    ).toMatchObject({
      id: video().id,
      kind: "video",
      previewImage: { url: video().previewImage!.url },
      sources: [],
    });
  });

  it("drops unsafe or invalid posters without dropping an otherwise playable video", () => {
    for (const previewImage of [
      { ...video().previewImage!, url: "https://elsewhere.example/stone.jpg" },
      {
        ...video().previewImage!,
        url: "https://cdn.shopify.com/not-an-image.jpg",
      },
      { ...video().previewImage!, width: 0 },
    ]) {
      expect(
        mapProductMedia({ ...video(), previewImage }, "Quartz"),
      ).toMatchObject({
        kind: "video",
        previewImage: null,
        sources: [source],
      });
    }
  });

  it("keeps MP4 renditions in Shopify order and removes duplicate URLs", () => {
    const smaller = {
      ...source,
      url: "https://cdn.shopify.com/videos/c/vp/small.mp4",
      width: 960,
      height: 540,
    };
    expect(
      mapProductMedia(
        {
          ...video(),
          sources: [
            {
              ...source,
              url: "https://cdn.shopify.com/videos/c/vp/stone.m3u8",
              mimeType: "application/x-mpegURL",
              format: "m3u8",
            },
            { ...smaller, format: "MP4", mimeType: "VIDEO/MP4" },
            source,
            smaller,
          ],
        },
        "Quartz",
      ),
    ).toMatchObject({ sources: [smaller, source] });
  });

  it.each([
    { url: "http://cdn.shopify.com/videos/c/vp/stone.mp4" },
    { url: "https://cdn.shopify.com.evil.example/videos/c/vp/stone.mp4" },
    { url: "https://videos.shopifycdn.com.evil.example/c/vp/stone.mp4" },
    { url: "https://videos.shopifycdn.com/not-video/stone.mp4" },
    { url: "https://elsewhere.example/stone.mp4" },
    { url: "https://cdn.shopify.com@elsewhere.example/videos/stone.mp4" },
    { url: "https://user:password@cdn.shopify.com/videos/c/vp/stone.mp4" },
    { url: "https://cdn.shopify.com:8080/videos/c/vp/stone.mp4" },
    { url: "https://cdn.shopify.com/s/files/stone.mp4" },
    { url: "javascript:alert(1)" },
    { url: "https://cdn.shopify.com\\videos\\stone.mp4" },
    { url: "https://cdn.shopify.com/videos/stone\n.mp4" },
    { url: "not a URL" },
    { url: "" },
    { mimeType: "text/html" },
    { mimeType: "video/quicktime" },
    { format: "mov" },
    { format: "m3u8" },
    { width: 0 },
    { height: -1 },
    { width: 1.5 },
    { height: Number.NaN },
  ])("removes an invalid source without hiding its video: %j", (invalid) => {
    expect(
      mapProductMedia(
        { ...video(), sources: [{ ...source, ...invalid }] },
        "Quartz",
      ),
    ).toMatchObject({ kind: "video", sources: [] });
  });

  it("skips unsupported or malformed media while leaving other media usable", () => {
    for (const media of [
      { ...video(), id: " " },
      { ...video(), __typename: "ExternalVideo" as const },
      { ...video(), __typename: "Model3d" as const },
      { ...video(), __typename: "MediaImage" as const, image: null },
      {
        ...video(),
        __typename: "MediaImage" as const,
        image: { ...video().previewImage!, width: 0 },
      },
    ]) {
      expect(mapProductMedia(media, "Quartz")).toBeNull();
    }
    expect(mapProductMedia(video(), "Quartz")?.kind).toBe("video");
  });
});
