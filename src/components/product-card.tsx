import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/commerce/types";
import { localize } from "@/lib/commerce/types";
import { formatPrice } from "@/lib/format";
import { getCopy } from "@/lib/i18n/copy";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";

export function ProductCard({
  product,
  locale,
}: {
  product: Product;
  locale: Locale;
}) {
  const copy = getCopy(locale);

  return (
    <article className="product-card">
      <Link
        className="product-card__visual"
        href={localePath(locale, `/products/${product.handle}`)}
        aria-label={`${copy.labels.viewPiece}: ${localize(product.title, locale)}`}
      >
        <Image
          className="product-card__image"
          src={product.variants[0].image}
          alt={localize(product.variants[0].imageAlt, locale)}
          width={1024}
          height={1024}
          sizes="(max-width: 760px) 100vw, (max-width: 1050px) 50vw, 25vw"
        />
        <span className="sample-stamp">{copy.labels.developmentSample}</span>
      </Link>
      <div className="product-card__body">
        <div>
          <p className="microcopy">
            {product.model === "one-of-one"
              ? copy.labels.exactPiece
              : copy.labels.naturalVariation}
          </p>
          <h3>
            <Link href={localePath(locale, `/products/${product.handle}`)}>
              {localize(product.title, locale)}
            </Link>
          </h3>
        </div>
        <p className="product-card__price">
          {copy.labels.testPrice} ·{" "}
          {formatPrice(product.price, locale, product.currency)}
        </p>
      </div>
    </article>
  );
}
