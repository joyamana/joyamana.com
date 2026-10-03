import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/commerce/types";
import { formatMoney, formatPriceRange } from "@/lib/format";
import type { CatalogCard } from "@/lib/commerce/catalog-browse";
import { getCopy } from "@/lib/i18n/copy";
import type { EnabledLocale as Locale } from "@/config/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";

export function ProductCard({
  product,
  locale,
  presentation,
}: {
  product: Product;
  locale: Locale;
  presentation?: CatalogCard;
}) {
  const copy = getCopy(locale);
  const image = presentation
    ? presentation.variant.image
    : (product.featuredImage ??
      product.images[0] ??
      product.variants[0]?.image);
  const available = presentation?.available ?? product.availableForSale;
  const href = localePath(
    locale,
    presentation?.path ?? `/products/${product.handle}`,
  );
  const variantTitle = presentation?.variant.title;
  const meaningfulTitle =
    variantTitle && variantTitle.toLowerCase() !== "default title";
  const availabilityLabel = available
    ? uiText(locale, {
        zh: "可購買",
        en: "Available",
        es: "Disponible",
      })
    : copy.labels.soldOut;

  return (
    <article
      className={`product-card product-card--${
        available ? "available" : "unavailable"
      }`}
    >
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
            sizes="(max-width: 760px) 100vw, (max-width: 1050px) 50vw, 25vw"
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
        {!available ? (
          <span className="product-card__availability-badge" aria-hidden="true">
            {availabilityLabel}
          </span>
        ) : null}
      </Link>
      <div className="product-card__body">
        <div className="product-card__meta">
          <p
            className={`product-card__availability product-card__availability--${
              available ? "available" : "unavailable"
            }`}
          >
            <span
              className="product-card__availability-dot"
              aria-hidden="true"
            />
            {availabilityLabel}
          </p>
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
