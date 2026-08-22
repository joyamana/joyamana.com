import Link from "next/link";
import type { EditorialEntry } from "@/lib/content/content";
import { localize } from "@/lib/commerce/types";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";

export function EditorialIndexPage({
  locale,
  entries,
  kind,
}: {
  locale: Locale;
  entries: EditorialEntry[];
  kind: "blog" | "crystals";
}) {
  const isBlog = kind === "blog";
  const title = isBlog
    ? "Blog"
    : uiText(locale, {
        en: "Crystal guide",
        es: "Guía de cristales",
        fr: "Guide des cristaux",
      });

  return (
    <>
      <header className={`editorial-hub-hero editorial-hub-hero--${kind}`}>
        <p className="eyebrow">
          {uiText(locale, {
            en: "Unreviewed development content",
            es: "Contenido sin revisar",
            fr: "Contenu de développement non révisé",
          })}
        </p>
        <h1 id={`${kind}-index-title`}>{title}</h1>
        <p>
          {isBlog
            ? uiText(locale, {
                en: "Editorial notes on crystal objects, clear buying, and personal meaning. Every draft requires human review before publication.",
                es: "Notas editoriales sobre objetos de cristal, compras claras y significado personal. Cada borrador requiere revisión humana antes de publicarse.",
                fr: "Des notes éditoriales sur les objets en cristal, l’achat éclairé et le sens personnel. Chaque brouillon doit être révisé avant publication.",
              })
            : uiText(locale, {
                en: "A considered index of material facts, visible character, and care. Every draft requires source verification before publication.",
                es: "Un índice cuidado de datos materiales, carácter visible y cuidado. Cada borrador requiere verificar sus fuentes antes de publicarse.",
                fr: "Un index raisonné des faits matériels, du caractère visible et de l’entretien. Chaque brouillon exige une vérification des sources avant publication.",
              })}
        </p>
      </header>
      {isBlog ? (
        <BlogIndex locale={locale} entries={entries} />
      ) : (
        <CrystalDirectory locale={locale} entries={entries} />
      )}
    </>
  );
}

function CrystalDirectory({
  locale,
  entries,
}: {
  locale: Locale;
  entries: EditorialEntry[];
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
            <p className="eyebrow">{localize(entry.category, locale)}</p>
            <h2>
              <Link
                href={localePath(locale, `/crystals/${entry.handle}`)}
              >
                {localize(entry.title, locale)}
              </Link>
            </h2>
            <p>{localize(entry.excerpt, locale)}</p>
          </div>
          <Link
            aria-label={`${uiText(locale, { en: "Read", es: "Leer", fr: "Lire" })}: ${localize(entry.title, locale)}`}
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
  entries: EditorialEntry[];
}) {
  const [featured, ...rest] = entries;
  if (!featured) return null;

  return (
    <section aria-labelledby="blog-index-title" className="blog-index">
      <article className="blog-featured">
        <p className="eyebrow">
          {uiText(locale, {
            en: "Featured draft",
            es: "Borrador destacado",
            fr: "Brouillon en vedette",
          })}{" "}
          · {localize(featured.category, locale)}
        </p>
        <h2>
          <Link href={localePath(locale, `/blog/${featured.handle}`)}>
            {localize(featured.title, locale)}
          </Link>
        </h2>
        <p>{localize(featured.excerpt, locale)}</p>
        <Link
          className="text-link"
          href={localePath(locale, `/blog/${featured.handle}`)}
        >
          {uiText(locale, {
            en: "Read draft",
            es: "Leer borrador",
            fr: "Lire le brouillon",
          })}{" "}
          →
        </Link>
      </article>
      <div className="blog-index__list">
        {rest.map((entry) => (
          <article className="blog-index__item" key={entry.handle}>
            <p className="eyebrow">{localize(entry.category, locale)}</p>
            <div>
              <h3>
                <Link href={localePath(locale, `/blog/${entry.handle}`)}>
                  {localize(entry.title, locale)}
                </Link>
              </h3>
              <p>{localize(entry.excerpt, locale)}</p>
            </div>
            <Link
              aria-label={`${uiText(locale, { en: "Read", es: "Leer", fr: "Lire" })}: ${localize(entry.title, locale)}`}
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
