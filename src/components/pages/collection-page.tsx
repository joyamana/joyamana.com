import { notFound } from "next/navigation";
import { getCollection } from "@/lib/commerce/catalog";
import { localize } from "@/lib/commerce/types";
import type { Locale } from "@/lib/i18n/locales";
import { marketIdForLocale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { ProductCard } from "@/components/product-card";

export async function CollectionPage({
  locale,
  handle,
}: {
  locale: Locale;
  handle: string;
}) {
  const collection = await getCollection(handle, marketIdForLocale(locale));
  if (!collection) notFound();

  return (
    <>
      <header className="page-hero">
        <p className="eyebrow">
          {uiText(locale, {
            en: "Prototype collection",
            es: "Colección de prototipo",
            fr: "Collection prototype",
          })}
        </p>
        <h1>{localize(collection.title, locale)}</h1>
        <p>{localize(collection.description, locale)}</p>
      </header>
      <section className="section">
        {collection.products.length ? (
          <div className="product-grid">
            {collection.products.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        ) : (
          <p>{uiText(locale, { en: "No samples yet.", es: "Aún no hay muestras.", fr: "Aucun échantillon pour le moment." })}</p>
        )}
      </section>
    </>
  );
}
