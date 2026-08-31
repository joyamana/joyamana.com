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

  return (
    <article className="product-card">
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
      </Link>
      <div className="product-card__body">
        <div className="product-card__meta">
          <p className="microcopy">
            {product.availableForSale
              ? uiText(locale, {
                  en: "Available",
                  es: "Disponible",
                  fr: "Disponible",
                })
              : copy.labels.soldOut}
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
