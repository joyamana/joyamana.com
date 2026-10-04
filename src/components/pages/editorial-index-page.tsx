import Link from "next/link";
import {
  getShopifyEditorialIndex,
  type EditorialKind,
  type StorefrontEditorialArticle,
} from "@/lib/content/shopify-editorial";
import type { EnabledLocale as Locale } from "@/config/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { editorialCopy } from "@/lib/i18n/editorial-copy";

export async function EditorialIndexPage({
  locale,
  kind,
}: {
  locale: Locale;
  kind: EditorialKind;
}) {
  const index = await getShopifyEditorialIndex(kind, locale);
  if (!index?.articles.length) {
    return <EditorialUnavailable kind={kind} locale={locale} />;
  }

  const isBlog = kind === "blog";
  const { title, description } = editorialCopy(kind, locale);

  return (
    <>
      <header className={`editorial-hub-hero editorial-hub-hero--${kind}`}>
        <p className="eyebrow">
          {isBlog
            ? uiText(locale, {
                zh: "故事與指南",
                en: "Stories & guidance",
                es: "Historias y orientación",
              })
            : uiText(locale, {
                zh: "材質參考",
                en: "Material reference",
                es: "Referencia de materiales",
              })}
        </p>
        <h1 id={`${kind}-index-title`}>{title}</h1>
        <p lang={index.seoDescription ? index.descriptionLocale : locale}>
          {index.seoDescription || description}
        </p>
      </header>
      {index.usedDefaultLanguage ? (
        <p className="policy-language-notice editorial-language-notice">
          {uiText(locale, {
            zh: "本欄目內容目前以英文提供。",
            en: "This section is currently available in English.",
            es: "Esta sección está disponible actualmente en inglés.",
          })}
        </p>
      ) : null}
      {isBlog ? (
        <BlogIndex locale={locale} entries={index.articles} />
      ) : (
        <CrystalDirectory locale={locale} entries={index.articles} />
      )}
    </>
  );
}

function CrystalDirectory({
  locale,
  entries,
}: {
  locale: Locale;
  entries: StorefrontEditorialArticle[];
}) {
  return (
    <section
      aria-labelledby="crystals-index-title"
      className="crystal-directory"
    >
      {entries.map((entry, index) => (
        <article className="crystal-directory__item" key={entry.handle}>
          <span aria-hidden="true" className="crystal-directory__number">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <p className="eyebrow">
              <span lang={entry.tags.length ? entry.tagsLocale : locale}>
                {entryCategory(entry, locale, "crystals")}
              </span>
            </p>
            <h2>
              <Link
                lang={entry.titleLocale}
                href={localePath(locale, `/crystals/${entry.handle}`)}
              >
                {entry.title}
              </Link>
            </h2>
            <p lang={entry.excerptLocale}>{entry.excerpt}</p>
          </div>
          <Link
            aria-label={`${uiText(locale, { zh: "閱讀", en: "Read", es: "Leer" })}: ${entry.title}`}
            className="editorial-arrow"
            href={localePath(locale, `/crystals/${entry.handle}`)}
          >
            →
          </Link>
        </article>
      ))}
    </section>
  );
}

function BlogIndex({
  locale,
  entries,
}: {
  locale: Locale;
  entries: StorefrontEditorialArticle[];
}) {
  const [featured, ...rest] = entries;
  if (!featured) return null;

  return (
    <section aria-labelledby="blog-index-title" className="blog-index">
      <article className="blog-featured">
        <p className="eyebrow">
          {uiText(locale, {
            zh: "精選",
            en: "Featured",
            es: "Destacado",
          })}{" "}
          ·{" "}
          <span lang={featured.tags.length ? featured.tagsLocale : locale}>
            {entryCategory(featured, locale, "blog")}
          </span>
        </p>
        <h2>
          <Link
            lang={featured.titleLocale}
            href={localePath(locale, `/blog/${featured.handle}`)}
          >
            {featured.title}
          </Link>
        </h2>
        <p lang={featured.excerptLocale}>{featured.excerpt}</p>
        <Link
          className="text-link"
          href={localePath(locale, `/blog/${featured.handle}`)}
        >
          {uiText(locale, {
            zh: "閱讀文章",
            en: "Read article",
            es: "Leer artículo",
          })}{" "}
          →
        </Link>
      </article>
      <div className="blog-index__list">
        {rest.map((entry) => (
          <article className="blog-index__item" key={entry.handle}>
            <p className="eyebrow">
              <span lang={entry.tags.length ? entry.tagsLocale : locale}>
                {entryCategory(entry, locale, "blog")}
              </span>
            </p>
            <div>
              <h3>
                <Link
                  lang={entry.titleLocale}
                  href={localePath(locale, `/blog/${entry.handle}`)}
                >
                  {entry.title}
                </Link>
              </h3>
              <p lang={entry.excerptLocale}>{entry.excerpt}</p>
            </div>
            <Link
              aria-label={`${uiText(locale, { zh: "閱讀", en: "Read", es: "Leer" })}: ${entry.title}`}
              className="editorial-arrow"
              href={localePath(locale, `/blog/${entry.handle}`)}
            >
              →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function entryCategory(
  entry: StorefrontEditorialArticle,
  locale: Locale,
  kind: EditorialKind,
) {
  return (
    entry.tags[0] ||
    (kind === "blog"
      ? uiText(locale, { zh: "文章", en: "Article", es: "Artículo" })
      : uiText(locale, {
          zh: "水晶指南",
          en: "Crystal guide",
          es: "Guía de cristales",
        }))
  );
}

function EditorialUnavailable({
  kind,
  locale,
}: {
  kind: EditorialKind;
  locale: Locale;
}) {
  return (
    <section className="editorial-hub-hero">
      <p className="eyebrow">{editorialCopy(kind, locale).title}</p>
      <h1>
        {uiText(locale, {
          zh: "目前沒有文章。",
          en: "New stories are on the way.",
          es: "Próximamente habrá nuevas historias.",
        })}
      </h1>
      <p>
        {uiText(locale, {
          zh: "瀏覽其他內容。",
          en: "Please check back soon.",
          es: "Vuelve a visitarnos pronto.",
        })}
      </p>
    </section>
  );
}
