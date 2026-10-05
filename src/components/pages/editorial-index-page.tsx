import Link from "next/link";
import {
  getShopifyEditorialIndex,
  type EditorialKind,
  type StorefrontEditorialArticle,
} from "@/lib/content/shopify-editorial";
import type { EnabledLocale as Locale } from "@/config/locales";
import { formatDate } from "@/lib/format";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { editorialCopy, editorialIndexCount } from "@/lib/i18n/editorial-copy";

export async function EditorialIndexPage({
  locale,
  kind,
}: {
  locale: Locale;
  kind: EditorialKind;
}) {
  const index = await getShopifyEditorialIndex(kind, locale);
  const { title, description } = editorialCopy(kind, locale);
  const otherKind = kind === "blog" ? "crystals" : "blog";
  const otherColumn = (
    <Link href={localePath(locale, `/${otherKind}`)}>
      {editorialCopy(otherKind, locale).title}
      <span aria-hidden="true">→</span>
    </Link>
  );

  return (
    <div className="editorial-index-page">
      <header className="editorial-index-header">
        <h1 id={`${kind}-index-title`}>{title}</h1>
        <p lang={index?.seoDescription ? index.descriptionLocale : locale}>
          {index?.seoDescription || description}
        </p>
      </header>
      {index?.articles.length ? (
        <>
          {index.usedDefaultLanguage ? (
            <p className="policy-language-notice editorial-language-notice">
              {uiText(locale, {
                zh: "本欄目內容目前以英文提供。",
                en: "This section is currently available in English.",
                es: "Esta sección está disponible actualmente en inglés.",
              })}
            </p>
          ) : null}
          <section
            aria-labelledby={`${kind}-index-title`}
            className={kind === "blog" ? "blog-index" : "crystal-directory"}
          >
            {index.articles.map((entry) => (
              <EditorialEntry
                key={entry.handle}
                entry={entry}
                kind={kind}
                locale={locale}
              />
            ))}
          </section>
          <div className="editorial-index-footer">
            <span>
              {editorialIndexCount(kind, index.articles.length, locale)}
            </span>
            {otherColumn}
          </div>
        </>
      ) : (
        <div className="editorial-index-empty">
          <p>
            {uiText(locale, {
              zh: "目前沒有文章。",
              en: "New stories are on the way.",
              es: "Próximamente habrá nuevas historias.",
            })}
          </p>
          <p>
            {uiText(locale, {
              zh: "瀏覽其他內容。",
              en: "Please check back soon.",
              es: "Vuelve a visitarnos pronto.",
            })}
          </p>
          {otherColumn}
        </div>
      )}
    </div>
  );
}

function EditorialEntry({
  entry,
  kind,
  locale,
}: {
  entry: StorefrontEditorialArticle;
  kind: EditorialKind;
  locale: Locale;
}) {
  const titleId = `${kind}-${entry.handle}-title`;
  const isBlog = kind === "blog";
  const tag = isBlog
    ? entry.tags.find((value) => value.trim())
    : crystalTag(entry, locale);

  return (
    <article className="editorial-entry">
      <Link
        className="editorial-entry__link"
        href={localePath(locale, `/${kind}/${entry.handle}`)}
        aria-labelledby={titleId}
      >
        <div className="editorial-entry__copy">
          {isBlog ? (
            <div className="editorial-entry__meta">
              {tag ? (
                <>
                  <span
                    className="editorial-entry__tag"
                    lang={entry.tagsLocale}
                  >
                    {tag}
                  </span>
                  <span aria-hidden="true">·</span>
                </>
              ) : null}
              <time dateTime={entry.publishedAt}>
                {formatDate(entry.publishedAt, locale)}
              </time>
            </div>
          ) : null}
          <h2
            id={titleId}
            className="editorial-entry__title"
            lang={entry.titleLocale}
          >
            {entry.title}
          </h2>
          <p className="editorial-entry__excerpt" lang={entry.excerptLocale}>
            {entry.excerpt}
          </p>
          {!isBlog && tag ? (
            <p className="editorial-entry__tag" lang={entry.tagsLocale}>
              {tag}
            </p>
          ) : null}
        </div>
        <span className="editorial-entry__arrow" aria-hidden="true">
          →
        </span>
      </Link>
    </article>
  );
}

function crystalTag(entry: StorefrontEditorialArticle, locale: Locale) {
  const normalize = (value: string) =>
    value.trim().replace(/\s+/g, " ").toLowerCase();
  const repeated = [
    entry.title,
    editorialCopy("crystals", locale).title,
    "Crystal guide",
    "水晶指南",
  ].map(normalize);
  return entry.tags.find((tag) => {
    const value = normalize(tag);
    return value && !repeated.includes(value);
  });
}
