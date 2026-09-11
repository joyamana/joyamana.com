import Link from "next/link";
import { getDesignCollections } from "@/lib/commerce/catalog";
import type { Locale } from "@/lib/i18n/locales";
import { localePath, marketIdForLocale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";

export async function CollectionsPage({ locale }: { locale: Locale }) {
  const collections = await getDesignCollections(
    marketIdForLocale(locale),
    locale,
  );
  const homeLabel = uiText(locale, {
    zh: "首頁",
    en: "Home",
    es: "Inicio",
    fr: "Accueil",
  });
  const collectionsLabel = uiText(locale, {
    zh: "系列",
    en: "Collections",
    es: "Colecciones",
    fr: "Collections",
  });
  const pageTitle = uiText(locale, {
    zh: "原創設計系列",
    en: "Design collections",
    es: "Colecciones de diseño",
    fr: "Collections de design",
  });
  const pageDescription = uiText(locale, {
    zh: "探索 Joya Mana 的原創系列，感受每個設計概念、材質語言與視覺故事。",
    en: "Explore original Joya Mana series shaped by a distinct design idea, material language, and visual story.",
    es: "Explora las series originales de Joya Mana, cada una definida por una idea de diseño, un lenguaje material y una historia visual propios.",
    fr: "Découvrez les séries originales Joya Mana, chacune portée par une idée, un langage matériel et une histoire visuelle distincts.",
  });

  return (
    <>
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
        <span>{collectionsLabel}</span>
      </nav>
      <header className="page-hero">
        <p className="eyebrow">{collectionsLabel}</p>
        <h1>{pageTitle}</h1>
        <p>{pageDescription}</p>
      </header>
      <section className="section">
        {collections.length ? (
          <div className="collection-strip">
            {collections.map((collection, index) => (
              <Link
                href={localePath(locale, `/collections/${collection.handle}`)}
                key={collection.handle}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {collection.title}
                <span>↗</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state empty-state--compact">
            <h2>
              {uiText(locale, {
                zh: "目前沒有已發佈的設計系列。",
                en: "No design collections are published yet.",
                es: "Aún no hay colecciones de diseño publicadas.",
                fr: "Aucune collection de design n’est encore publiée.",
              })}
            </h2>
            <p>
              {uiText(locale, {
                zh: "瀏覽其他商品。",
                en: "A new design series will appear here when it is ready.",
                es: "Una nueva serie de diseño aparecerá aquí cuando esté lista.",
                fr: "Une nouvelle série de design apparaîtra ici lorsqu’elle sera prête.",
              })}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
