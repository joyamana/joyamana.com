import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductCategory } from "@/lib/commerce/catalog";
import type { Locale } from "@/lib/i18n/locales";
import { localePath, marketIdForLocale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import {
  buildCollectionStructuredData,
  serializeIndexableStructuredData,
  type StructuredBreadcrumb,
} from "@/lib/structured-data";
import { ProductCard } from "@/components/product-card";

export async function CategoryPage({
  locale,
  handle,
}: {
  locale: Locale;
  handle: string;
}) {
  const category = await getProductCategory(
    handle,
    marketIdForLocale(locale),
    locale,
  );
  if (!category) notFound();

  const homeLabel = uiText(locale, {
    en: "Home",
    es: "Inicio",
    fr: "Accueil",
  });
  const shopLabel = uiText(locale, {
    en: "Shop",
    es: "Comprar",
    fr: "Boutique",
  });
  const breadcrumbs: StructuredBreadcrumb[] = [
    { name: homeLabel, path: "/" },
    { name: shopLabel, path: "/shop" },
    { name: category.title, path: `/category/${category.handle}` },
  ];
  const structuredData = serializeIndexableStructuredData(
    buildCollectionStructuredData({
      name: category.title,
      description: category.description,
      path: `/category/${category.handle}`,
      products: category.products,
      locale,
      breadcrumbs,
    }),
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
        <Link href={localePath(locale, "/shop")}>{shopLabel}</Link>
        <span>/</span>
        <span>{category.title}</span>
      </nav>
      <header className="page-hero">
        <p className="eyebrow">
          {uiText(locale, {
            en: "Shop by category",
            es: "Comprar por categoría",
            fr: "Acheter par catégorie",
          })}
        </p>
        <h1>{category.title}</h1>
        <p>{category.description}</p>
      </header>
      <section className="section">
        <div className="product-grid">
          {category.products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      </section>
    </>
  );
}
