import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/commerce/catalog";
import { localize } from "@/lib/commerce/types";
import { getCopy } from "@/lib/i18n/copy";
import type { Locale } from "@/lib/i18n/locales";
import { localePath, marketIdForLocale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { ProductCard } from "@/components/product-card";
import { ProductPurchase } from "@/components/product-purchase";

export async function ProductPage({
  locale,
  handle,
}: {
  locale: Locale;
  handle: string;
}) {
  const marketId = marketIdForLocale(locale);
  const [product, allProducts] = await Promise.all([
    getProduct(handle, marketId),
    getProducts(marketId),
  ]);
  if (!product) notFound();
  const copy = getCopy(locale);

  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href={localePath(locale, "/collections")}>
          {uiText(locale, {
            en: "Collections",
            es: "Colecciones",
            fr: "Collections",
          })}
        </Link>
        <span>/</span>
        <span>{localize(product.title, locale)}</span>
      </nav>
      <ProductPurchase product={product} locale={locale} />
      {allProducts.some((item) => item.id !== product.id) ? (
        <section className="section section--bordered">
          <div className="section-heading">
            <h2>{copy.labels.related}</h2>
          </div>
          <div className="product-grid product-grid--three">
            {allProducts
              .filter((item) => item.id !== product.id)
              .slice(0, 3)
              .map((item) => (
                <ProductCard key={item.id} product={item} locale={locale} />
              ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
