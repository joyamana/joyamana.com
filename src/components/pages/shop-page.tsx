import Link from "next/link";
import {
  getProducts,
  productCategoriesForProducts,
} from "@/lib/commerce/catalog";
import type { Locale } from "@/lib/i18n/locales";
import { localePath, marketIdForLocale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import {
  buildCollectionStructuredData,
  serializeIndexableStructuredData,
  type StructuredBreadcrumb,
} from "@/lib/structured-data";
import { ProductListing } from "@/components/product-listing";
import { listProducts } from "@/lib/commerce/product-listing";
import type { PageSearchParams } from "@/lib/seo";

export async function ShopPage({ locale, searchParams = {} }: { locale: Locale; searchParams?: PageSearchParams }) {
  const marketId = marketIdForLocale(locale);
  const allProducts = await getProducts(marketId, locale);
  const categories = productCategoriesForProducts(allProducts, locale);
  const products = listProducts(allProducts, searchParams);
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
  const pageDescription = uiText(locale, {
    zh: "探索水晶首飾與天然飾物，尋找屬於你的選擇。",
    en: "Crystal jewelry and natural objects. Find a piece that speaks to you.",
    es: "Joyería con cristales y objetos naturales. Encuentra una pieza con significado para ti.",
    fr: "Découvrez tous les produits actuellement publiés dans la boutique américaine Joya Mana.",
  });
  const breadcrumbs: StructuredBreadcrumb[] = [
    { name: homeLabel, path: "/" },
    { name: shopLabel, path: "/shop" },
  ];
  const structuredData = Object.keys(searchParams).length ? null : serializeIndexableStructuredData(
    buildCollectionStructuredData({
      name: shopLabel,
      description: pageDescription,
      path: "/shop",
      products,
      locale,
      breadcrumbs,
    }),
    { locale, path: "/shop" },
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
        <span>{shopLabel}</span>
      </nav>
      <header className="page-hero">
        <h1>{shopLabel}</h1>
        <p>{pageDescription}</p>
      </header>
      {categories.length ? (
        <nav
          className="filter-row"
          aria-label={uiText(locale, {
            zh: "商品類別",
            en: "Product categories",
            es: "Categorías de productos",
            fr: "Catégories de produits",
          })}
        >
          <a href="#products">
            {uiText(locale, { zh: "全部", en: "All", es: "Todo", fr: "Tout" })}
          </a>
          {categories.map((category) => (
            <Link
              href={localePath(locale, `/category/${category.handle}`)}
              key={category.handle}
            >
              {category.title}
            </Link>
          ))}
        </nav>
      ) : null}
      <ProductListing products={products} locale={locale} path="/shop" searchParams={searchParams} />
    </>
  );
}
