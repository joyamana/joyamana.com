import Link from "next/link";
import { notFound } from "next/navigation";
import {
  aboutPageForHandle,
  getShopifyAboutTree,
  type StorefrontAboutPage,
  type StorefrontAboutTree,
} from "@/lib/content/shopify-about-pages";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import {
  buildAboutStructuredData,
  serializeIndexableStructuredData,
  type StructuredBreadcrumb,
} from "@/lib/structured-data";

export async function AboutPage({
  handle,
  locale,
  hasParameters = false,
}: {
  hasParameters?: boolean;
  handle?: string;
  locale: Locale;
}) {
  let tree: StorefrontAboutTree | null;
  try {
    tree = await getShopifyAboutTree(locale);
  } catch (error) {
    if (handle) throw error;
    return <AboutUnavailable locale={locale} />;
  }

  if (!tree) {
    if (handle) notFound();
    return <AboutUnavailable locale={locale} />;
  }

  const page = aboutPageForHandle(tree, handle);
  if (!page) notFound();

  return (
    <AboutContentPage
      handle={handle}
      locale={locale}
      page={page}
      tree={tree}
      hasParameters={hasParameters}
    />
  );
}
export function AboutContentPage({
  handle,
  locale,
  page,
  tree,
  hasParameters = false,
}: {
  hasParameters?: boolean;
  handle?: string;
  locale: Locale;
  page: StorefrontAboutPage;
  tree: StorefrontAboutTree;
}) {
  const isRoot = !handle;
  const path = isRoot ? "/about" : `/about/${page.handle}`;
  const homeLabel = uiText(locale, {
    zh: "首頁",
    en: "Home",
    es: "Inicio",
    fr: "Accueil",
  });
  const aboutLabel = uiText(locale, {
    zh: "關於我們",
    en: "About",
    es: "Nosotros",
    fr: "À propos",
  });
  const breadcrumbs: StructuredBreadcrumb[] = [
    { name: homeLabel, path: "/" },
    { name: aboutLabel, path: "/about" },
    ...(isRoot ? [] : [{ name: page.title, path }]),
  ];
  const structuredData =
    !hasParameters && !tree.root.usedDefaultLanguage && !page.usedDefaultLanguage
      ? serializeIndexableStructuredData(
          buildAboutStructuredData({
            name: page.title,
            description: page.summary || page.seoDescription,
            path,
            locale,
            breadcrumbs,
            isRoot,
          }),
          { locale, path },
        )
      : null;

  return (
    <article className="about-content-page">
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
      ) : null}
      <nav
        aria-label={uiText(locale, {
          zh: "頁面路徑",
          en: "Breadcrumb",
          es: "Ruta de navegación",
          fr: "Fil d’Ariane",
        })}
        className="breadcrumbs"
      >
        <Link href={localePath(locale, "/")}>{homeLabel}</Link>
        <span>/</span>
        {isRoot ? (
          <span>{aboutLabel}</span>
        ) : (
          <>
            <Link href={localePath(locale, "/about")}>{aboutLabel}</Link>
            <span>/</span>
            <span>{page.title}</span>
          </>
        )}
      </nav>
      <AboutSectionNavigation
        activeHandle={handle}
        locale={locale}
        tree={tree}
      />
      <section className="about-content-body">
        <header className="about-content-heading" lang={page.contentLocale}>
          <h1>{page.title}</h1>
          {page.summary ? <p>{page.summary}</p> : null}
        </header>
        {page.usedDefaultLanguage ? (
          <p className="policy-language-notice">
            {uiText(locale, {
              zh: "本頁內容目前以英文提供。",
              en: "This page is currently available in English.",
              es: "Esta página está disponible actualmente en inglés.",
              fr: "Cette page est actuellement disponible en anglais.",
            })}
          </p>
        ) : null}
        <div
          className="about-rich-text"
          dangerouslySetInnerHTML={{ __html: page.html }}
          lang={page.contentLocale}
        />
      </section>
    </article>
  );
}

function AboutSectionNavigation({
  activeHandle,
  locale,
  tree,
}: {
  activeHandle?: string;
  locale: Locale;
  tree: StorefrontAboutTree;
}) {
  const children = tree.children.filter(
    (page) => locale === "zh-Hant-US" || !page.usedDefaultLanguage || page.handle === activeHandle,
  );
  if (!children.length) return null;

  const items = [tree.root, ...children];
  return (
    <nav
      aria-label={uiText(locale, {
        zh: "關於 Joya Mana 的各個章節",
        en: "About Joya Mana sections",
        es: "Secciones sobre Joya Mana",
        fr: "Sections à propos de Joya Mana",
      })}
      className="about-tabs"
    >
      <div className="about-tabs__inner">
        {items.map((item, index) => {
          const itemHandle = index === 0 ? undefined : item.handle;
          const isActive = itemHandle === activeHandle;
          return (
            <Link
              lang={item.contentLocale}
              aria-current={isActive ? "page" : undefined}
              href={localePath(
                locale,
                itemHandle ? `/about/${itemHandle}` : "/about",
              )}
              key={item.id}
            >
              {item.navigationTitle}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function AboutUnavailable({ locale }: { locale: Locale }) {
  return (
    <section className="about-content-body">
      <header className="about-content-heading">
        <h1>
          {uiText(locale, {
            zh: "關於 Joya Mana",
            en: "About Joya Mana",
            es: "Sobre Joya Mana",
            fr: "À propos de Joya Mana",
          })}
        </h1>
        <p>
          {uiText(locale, {
            zh: "品牌故事暫時未能載入，請稍後再試。",
            en: "Our story is temporarily unavailable. Please try again shortly.",
            es: "Nuestra historia no está disponible temporalmente. Inténtalo de nuevo en unos minutos.",
            fr: "Notre histoire est temporairement indisponible. Veuillez réessayer sous peu.",
          })}
        </p>
      </header>
      <div className="button-row">
        <Link className="button button--primary" href={localePath(locale, "/contact")}>
          {uiText(locale, { en: "Contact us", es: "Contáctanos", zh: "聯絡我們", fr: "Nous contacter" })}
        </Link>
        <Link className="button" href={localePath(locale, "/shop")}>
          {uiText(locale, { en: "Shop all", es: "Ver todos los productos", zh: "選購全部商品", fr: "Voir tous les produits" })}
        </Link>
      </div>
    </section>
  );
}
