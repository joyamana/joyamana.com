import Link from "next/link";
import Image from "next/image";
import type { ProductSummary } from "@/lib/commerce/types";
import { formatMoney, formatPriceRange } from "@/lib/format";
import type { CatalogCard } from "@/lib/commerce/catalog-browse";
import { getCopy } from "@/lib/i18n/copy";
import type { EnabledLocale as Locale } from "@/config/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";

type ProductCardProps = { locale: Locale } & (
  | { product: ProductSummary; presentation?: never }
  | { presentation: CatalogCard; product?: never }
);

export function ProductCard({ locale, ...input }: ProductCardProps) {
  const presentation = input.presentation;
  const product = presentation ? presentation.product : input.product!;
  const copy = getCopy(locale);
  const image = presentation
    ? presentation.variant.image
    : product.featuredImage;
  const unavailable = presentation
    ? !presentation.available
    : !product.availableForSale;
  const state = unavailable
    ? "unavailable"
    : presentation
      ? "available"
      : "options";
  const href = localePath(
    locale,
    presentation?.path ?? `/products/${product.handle}`,
  );
  const variantTitle = presentation?.variant.title;
  const meaningfulTitle =
    variantTitle && variantTitle.toLowerCase() !== "default title";
  const availabilityLabel = unavailable
    ? copy.labels.soldOut
    : presentation
      ? uiText(locale, {
          zh: "可購買",
          en: "Available",
          es: "Disponible",
        })
      : null;

  return (
    <article className={`product-card product-card--${state}`}>
      <Link
        className="product-card__visual"
        href={href}
        aria-label={`${copy.labels.viewPiece}: ${product.title}`}
      >
        {image ? (
          <Image
            className="product-card__image"
            src={image.url}
            alt={image.altText || product.title}
            width={image.width}
            height={image.height}
            sizes="(width < 320px) calc(100vw - 32px), (max-width: 760px) calc(50vw - 22px), (width < 900px) 50vw, 25vw"
          />
        ) : (
          <span className="product-media-unavailable product-media-unavailable--compact">
            {uiText(locale, {
              zh: "暫無圖片",
              en: "Image unavailable",
              es: "Imagen no disponible",
            })}
          </span>
        )}
        {unavailable ? (
          <span className="product-card__availability-badge" aria-hidden="true">
            {availabilityLabel}
          </span>
        ) : null}
      </Link>
      <div className="product-card__body">
        <div className="product-card__meta">
          {availabilityLabel ? (
            <p
              className={`product-card__availability product-card__availability--${state}`}
            >
              <span
                className="product-card__availability-dot"
                aria-hidden="true"
              />
              {availabilityLabel}
            </p>
          ) : null}
          <p className="product-card__price">
            {presentation
              ? formatMoney(presentation.variant.price, locale)
              : formatPriceRange(product.priceRange, locale)}
          </p>
        </div>
        <h3>
          <Link href={href}>{product.title}</Link>
        </h3>
        {meaningfulTitle ? (
          <p className="product-card__variant">{variantTitle}</p>
        ) : null}
      </div>
    </article>
  );
}
