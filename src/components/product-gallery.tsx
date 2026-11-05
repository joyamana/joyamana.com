"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type {
  Product,
  ProductMedia,
  ProductVariant,
} from "@/lib/commerce/types";
import {
  buildProductGalleryMedia,
  getInitialGalleryMedia,
  getProductVideoSource,
} from "@/lib/commerce/product-media";
import type { EnabledLocale as Locale } from "@/config/locales";
import { uiText } from "@/lib/i18n/text";

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m8 5 11 7-11 7V5Z" fill="currentColor" />
    </svg>
  );
}

function ProductVideo({
  media,
  locale,
  title,
}: {
  media: Extract<ProductMedia, { kind: "video" }>;
  locale: Locale;
  title: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hintId = useId();
  const [failed, setFailed] = useState(false);
  const [started, setStarted] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const source = getProductVideoSource(media.sources);

  useEffect(() => {
    const player = videoRef.current;
    return () => player?.pause();
  }, [attempt]);

  if (!source || failed) {
    return (
      <div className="product-gallery__message" role="status">
        <p>
          {uiText(locale, {
            zh: "影片暫時無法播放。你仍可查看商品詳情及選購選項。",
            en: "This video is unavailable. Product details and purchasing options are still available.",
            es: "Este video no está disponible. Puedes seguir consultando los detalles y las opciones de compra.",
          })}
        </p>
        {source ? (
          <button
            type="button"
            className="button button--secondary"
            onClick={() => {
              setFailed(false);
              setStarted(false);
              setAttempt((value) => value + 1);
            }}
          >
            {uiText(locale, {
              zh: "重試影片",
              en: "Retry video",
              es: "Reintentar video",
            })}
          </button>
        ) : null}
      </div>
    );
  }

  const showHint = !media.previewImage && !started;
  return (
    <div className="product-gallery__video-frame">
      <video
        key={attempt}
        ref={videoRef}
        controls
        playsInline
        preload="none"
        poster={media.previewImage?.url}
        aria-label={media.altText || title}
        aria-describedby={showHint ? hintId : undefined}
        onPlay={() => setStarted(true)}
        onError={() => setFailed(true)}
      >
        <source
          src={source.url}
          type={source.mimeType}
          onError={() => setFailed(true)}
        />
        {uiText(locale, {
          zh: "你的瀏覽器不支援影片播放。你仍可查看商品詳情及選購選項。",
          en: "Your browser does not support video playback. Product details and purchasing options are still available.",
          es: "Tu navegador no admite la reproducción de video. Puedes seguir consultando los detalles y las opciones de compra.",
        })}
      </video>
      {showHint ? (
        <p id={hintId} className="product-gallery__video-hint">
          {uiText(locale, {
            zh: "按播放鍵觀看商品影片",
            en: "Use the play button to watch the product video",
            es: "Pulsa el botón de reproducción para ver el video del producto",
          })}
        </p>
      ) : null}
    </div>
  );
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
  const galleryMedia = useMemo(
    () => buildProductGalleryMedia(product, variant),
    [product, variant],
  );
  const initialMedia = getInitialGalleryMedia(galleryMedia, initialImageUrl);
  const [selectedMediaId, setSelectedMediaId] = useState(
    initialMedia?.id ?? "",
  );
  const activeMedia =
    galleryMedia.find((media) => media.id === selectedMediaId) ?? initialMedia;
  return (
    <div className="product-gallery">
      <div className="product-gallery__sticky">
        <div className="product-gallery__main">
          {activeMedia?.kind === "image" ? (
            <Image
              src={activeMedia.image.url}
              alt={activeMedia.image.altText || product.title}
              width={activeMedia.image.width}
              height={activeMedia.image.height}
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 760px) 100vw, 50vw"
            />
          ) : activeMedia?.kind === "video" ? (
            <ProductVideo
              key={activeMedia.id}
              media={activeMedia}
              locale={locale}
              title={product.title}
            />
          ) : (
            <div className="product-gallery__message">
              {uiText(locale, {
                zh: "暫無商品圖片或影片",
                en: "Product images and videos unavailable",
                es: "Imágenes y videos del producto no disponibles",
              })}
            </div>
          )}
        </div>
        {galleryMedia.length > 1 ? (
          <div
            className="product-gallery__thumbs"
            role="group"
            aria-label={uiText(locale, {
              zh: "商品圖片及影片",
              en: "Product images and videos",
              es: "Imágenes y videos del producto",
            })}
          >
            {galleryMedia.map((media, index) => {
              const image =
                media.kind === "image" ? media.image : media.previewImage;
              return (
                <button
                  type="button"
                  key={media.id}
                  className={media.id === activeMedia?.id ? "is-selected" : ""}
                  onClick={() => setSelectedMediaId(media.id)}
                  aria-label={`${
                    media.kind === "video"
                      ? uiText(locale, {
                          zh: "查看影片",
                          en: "View video",
                          es: "Ver video",
                        })
                      : uiText(locale, {
                          zh: "查看圖片",
                          en: "View image",
                          es: "Ver imagen",
                        })
                  } ${index + 1}`}
                  aria-pressed={media.id === activeMedia?.id}
                >
                  {image ? (
                    <Image
                      src={image.url}
                      alt=""
                      width={image.width}
                      height={image.height}
                      sizes="96px"
                    />
                  ) : null}
                  {media.kind === "video" ? (
                    <span className="product-gallery__play">
                      <PlayIcon />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
