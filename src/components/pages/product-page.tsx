import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/commerce/catalog";
import { getCopy } from "@/lib/i18n/copy";
import type { Locale } from "@/lib/i18n/locales";
import { localePath, marketIdForLocale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { ProductCard } from "@/components/product-card";
import { ProductPurchase } from "@/components/product-purchase";
import {
  buildProductStructuredData,
  serializeIndexableStructuredData,
  type StructuredBreadcrumb,
} from "@/lib/structured-data";

export async function ProductPage({
  locale,
  handle,
}: {
  locale: Locale;
  handle: string;
}) {
  const marketId = marketIdForLocale(locale);
  const [product, allProducts] = await Promise.all([
    getProduct(handle, marketId, locale),
    getProducts(marketId, locale),
  ]);
  if (!product) notFound();
  const copy = getCopy(locale);
  const homeLabel = uiText(locale, {
    en: "Home",
    es: "Inicio",
    fr: "Accueil",
  });
  const collectionsLabel = uiText(locale, {
    en: "Collections",
    es: "Colecciones",
    fr: "Collections",
  });
  const breadcrumbs: StructuredBreadcrumb[] = [
    { name: homeLabel, path: "/" },
    { name: collectionsLabel, path: "/collections" },
    { name: product.title, path: `/products/${product.handle}` },
  ];
  const structuredData = serializeIndexableStructuredData(
    buildProductStructuredData({ product, locale, breadcrumbs }),
  );

  return (
    <>
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
      ) : null}
      <nav
        className="breadcrumbs"
        aria-label={uiText(locale, {
          en: "Breadcrumb",
          es: "Ruta de navegación",
          fr: "Fil d’Ariane",
        })}
      >
        <Link href={localePath(locale, "/")}>{homeLabel}</Link>
        <span>/</span>
        <Link href={localePath(locale, "/collections")}>
          {collectionsLabel}
        </Link>
        <span>/</span>
        <span>{product.title}</span>
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
