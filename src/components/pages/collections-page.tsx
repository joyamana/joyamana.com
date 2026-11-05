import Link from "next/link";
import { getCollections } from "@/lib/commerce/catalog";
import type { EnabledLocale as Locale } from "@/config/locales";
import { localePath, marketIdForLocale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";

export async function CollectionsPage({ locale }: { locale: Locale }) {
  const collections = await getCollections(marketIdForLocale(locale), locale);
  const homeLabel = uiText(locale, {
    zh: "首頁",
    en: "Home",
    es: "Inicio",
  });
  const collectionsLabel = uiText(locale, {
    zh: "系列",
    en: "Collections",
    es: "Colecciones",
  });
  const pageTitle = uiText(locale, {
    zh: "所有系列",
    en: "Collections",
    es: "Colecciones",
  });
  const pageDescription = uiText(locale, {
    zh: "瀏覽 Joya Mana 的所有系列，探索不同主題與精選商品。",
    en: "Browse all Joya Mana collections and explore their themes and selected pieces.",
    es: "Explora todas las colecciones de Joya Mana, sus temas y sus piezas seleccionadas.",
  });

  return (
    <>
      <nav
        className="breadcrumbs"
        aria-label={uiText(locale, {
          zh: "頁面路徑",
          en: "Breadcrumb",
          es: "Ruta de navegación",
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
                zh: "目前沒有已發佈的系列。",
                en: "No collections are published yet.",
                es: "Aún no hay colecciones publicadas.",
              })}
            </h2>
            <p>
              {uiText(locale, {
                zh: "新系列發佈後將會顯示於此。",
                en: "New collections will appear here when they are published.",
                es: "Las nuevas colecciones aparecerán aquí cuando se publiquen.",
              })}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
