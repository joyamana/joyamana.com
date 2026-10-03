"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type {
  Product,
  ProductImage,
  ProductVariant,
} from "@/lib/commerce/types";
import type { EnabledLocale as Locale } from "@/config/locales";
import { uiText } from "@/lib/i18n/text";

function uniqueImages(images: Array<ProductImage | null | undefined>) {
  const seen = new Set<string>();
  return images.filter((image): image is ProductImage => {
    if (!image || seen.has(image.url)) return false;
    seen.add(image.url);
    return true;
  });
}

export function ProductGallery({
  product,
  locale,
  variant,
  initialImageUrl,
}: {
  product: Product;
  locale: Locale;
  variant: ProductVariant;
  initialImageUrl?: string;
}) {
  const galleryImages = useMemo(
    () =>
      uniqueImages([
        variant?.image,
        ...product.images,
        ...product.variants.map((variant) => variant.image),
        product.featuredImage,
      ]),
    [product.featuredImage, product.images, product.variants, variant?.image],
  );
  const [selectedImageUrl, setSelectedImageUrl] = useState(
    initialImageUrl ?? "",
  );
  const activeImage =
    galleryImages.find((image) => image.url === selectedImageUrl) ??
    galleryImages[0];
  return (
    <div className="product-gallery">
      <div className="product-gallery__sticky">
        <div className="product-gallery__main">
          {activeImage ? (
            <Image
              src={activeImage.url}
              alt={activeImage.altText || product.title}
              width={activeImage.width}
              height={activeImage.height}
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 760px) 100vw, 50vw"
            />
          ) : (
            <div className="product-media-unavailable">
              {uiText(locale, {
                zh: "暫無商品圖片",
                en: "Product image unavailable",
                es: "Imagen del producto no disponible",
              })}
            </div>
          )}
        </div>
        {galleryImages.length > 1 ? (
          <div
            className="product-gallery__thumbs"
            aria-label={uiText(locale, {
              zh: "商品圖片",
              en: "Product images",
              es: "Imágenes del producto",
            })}
          >
            {galleryImages.map((image, index) => (
              <button
                type="button"
                key={image.url}
                className={image.url === activeImage?.url ? "is-selected" : ""}
                onClick={() => setSelectedImageUrl(image.url)}
                aria-label={`${uiText(locale, {
                  zh: "查看圖片",
                  en: "View image",
                  es: "Ver imagen",
                })} ${index + 1}`}
                aria-pressed={image.url === activeImage?.url}
              >
                <Image
                  src={image.url}
                  alt=""
                  width={image.width}
                  height={image.height}
                  sizes="96px"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
