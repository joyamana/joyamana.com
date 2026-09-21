import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  localizeProductCategory,
  productCategoryDefinitionForTaxonomyId,
} from "@/config/catalog";
import { getProduct, getRelatedProducts } from "@/lib/commerce/catalog";
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

export function ProductDescription({
  description,
  descriptionHtml,
}: {
  description: string;
  descriptionHtml: string;
}) {
  if (descriptionHtml) {
    return (
      <div
        className="product-description"
        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
      />
    );
  }

  return (
    <div className="product-description">
      {description.split(/\n{2,}/).filter(Boolean).map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

export async function RelatedProducts({
  productId,
  locale,
}: {
  productId: string;
  locale: Locale;
}) {
  // Recommendations are optional. A failure must not hide the primary product
  // or prevent a shopper from choosing a variant and using the purchase actions.
  const products = await getRelatedProducts(
    productId,
    marketIdForLocale(locale),
    locale,
    3,
  ).catch(() => []);
  if (!products.length) return null;

  return (
    <section className="section section--bordered">
      <div className="section-heading">
        <h2>{getCopy(locale).labels.related}</h2>
      </div>
      <div className="product-grid product-grid--three">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} locale={locale} />
        ))}
      </div>
    </section>
  );
}

export async function ProductPage({
  locale,
  handle,
  hasParameters = false,
}: {
  locale: Locale;
  handle: string;
  hasParameters?: boolean;
}) {
  const marketId = marketIdForLocale(locale);
  const product = await getProduct(handle, marketId, locale);
  if (!product) notFound();
  const { description, descriptionHtml, ...purchaseProduct } = product;
  const homeLabel = uiText(locale, {
    zh: "首頁",
    en: "Home",
    es: "Inicio",
    fr: "Accueil",
  });
  const shopLabel = uiText(locale, {
    zh: "選購",
    en: "Shop",
    es: "Comprar",
    fr: "Boutique",
  });
  const categoryDefinition = product.category
    ? productCategoryDefinitionForTaxonomyId(product.category.id)
    : undefined;
  const category = categoryDefinition
    ? localizeProductCategory(categoryDefinition, locale)
    : null;
  const breadcrumbs: StructuredBreadcrumb[] = [
    { name: homeLabel, path: "/" },
    { name: shopLabel, path: "/shop" },
    ...(category
      ? [
          {
            name: category.title,
            path: `/category/${category.handle}`,
          },
        ]
      : []),
    { name: product.title, path: `/products/${product.handle}` },
  ];
  const structuredData = hasParameters ? null : serializeIndexableStructuredData(
    buildProductStructuredData({ product, locale, breadcrumbs }),
    { locale, path: `/products/${product.handle}` },
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
          zh: "頁面路徑",
          en: "Breadcrumb",
          es: "Ruta de navegación",
          fr: "Fil d’Ariane",
        })}
      >
        <Link href={localePath(locale, "/")}>{homeLabel}</Link>
        <span>/</span>
        <Link href={localePath(locale, "/shop")}>{shopLabel}</Link>
        {category ? (
          <>
            <span>/</span>
            <Link
              href={localePath(locale, `/category/${category.handle}`)}
            >
              {category.title}
            </Link>
          </>
        ) : null}
        <span>/</span>
        <span>{product.title}</span>
      </nav>
      <ProductPurchase
        product={purchaseProduct}
        locale={locale}
        description={
          <ProductDescription description={description} descriptionHtml={descriptionHtml} />
        }
      />
      <Suspense fallback={null}>
        <RelatedProducts productId={product.id} locale={locale} />
      </Suspense>
    </>
  );
}
