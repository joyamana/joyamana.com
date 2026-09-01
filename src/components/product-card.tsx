import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/commerce/types";
import { formatPriceRange } from "@/lib/format";
import { getCopy } from "@/lib/i18n/copy";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";

export function ProductCard({
  product,
  locale,
}: {
  product: Product;
  locale: Locale;
}) {
  const copy = getCopy(locale);
  const image =
    product.featuredImage ?? product.images[0] ?? product.variants[0]?.image;
  const availabilityLabel = product.availableForSale
    ? uiText(locale, {
        en: "Available",
        es: "Disponible",
        fr: "Disponible",
      })
    : copy.labels.soldOut;

  return (
    <article
      className={`product-card product-card--${
        product.availableForSale ? "available" : "unavailable"
      }`}
    >
      <Link
        className="product-card__visual"
        href={localePath(locale, `/products/${product.handle}`)}
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
              en: "Image unavailable",
              es: "Imagen no disponible",
              fr: "Image indisponible",
            })}
          </span>
        )}
        {!product.availableForSale ? (
          <span className="product-card__availability-badge" aria-hidden="true">
            {availabilityLabel}
          </span>
        ) : null}
      </Link>
      <div className="product-card__body">
        <div className="product-card__meta">
          <p
            className={`product-card__availability product-card__availability--${
              product.availableForSale ? "available" : "unavailable"
            }`}
          >
            <span
              className="product-card__availability-dot"
              aria-hidden="true"
            />
            {availabilityLabel}
          </p>
          <p className="product-card__price">
            {formatPriceRange(product.priceRange, locale)}
          </p>
        </div>
        <h3>
          <Link href={localePath(locale, `/products/${product.handle}`)}>
            {product.title}
          </Link>
        </h3>
      </div>
    </article>
  );
}
