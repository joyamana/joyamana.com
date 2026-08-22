import Link from "next/link";
import { notFound } from "next/navigation";
import type { EditorialEntry } from "@/lib/content/content";
import { localize } from "@/lib/commerce/types";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";

export function EditorialDetailPage({
  locale,
  entries,
  handle,
  kind,
}: {
  locale: Locale;
  entries: EditorialEntry[];
  handle: string;
  kind: "blog" | "crystals";
}) {
  const entry = entries.find((item) => item.handle === handle);
  if (!entry) notFound();
  const basePath = kind === "blog" ? "/blog" : "/crystals";

  return (
    <article className="article-page">
      <Link className="back-link" href={localePath(locale, basePath)}>
        ← {uiText(locale, { en: "Back to index", es: "Volver al índice", fr: "Retour à l’index" })}
      </Link>
      <p className="eyebrow">{localize(entry.category, locale)}</p>
      <h1>{localize(entry.title, locale)}</h1>
      <p className="article-disclaimer">
        {uiText(locale, {
          en: "Prototype draft and unreviewed translation. Do not publish.",
          es: "Borrador de prototipo y traducción no revisada. No publicar.",
          fr: "Brouillon prototype et traduction non révisée. Ne pas publier.",
        })}
      </p>
      <div className="article-body">
        <p>{localize(entry.body, locale)}</p>
        <h2>{uiText(locale, { en: "Before launch", es: "Antes del lanzamiento", fr: "Avant le lancement" })}</h2>
        <p>
          {uiText(locale, {
            en: "A human editor must verify facts, sources, claim scope, links, translation quality, and relationships to real products.",
            es: "Un editor humano debe verificar hechos, fuentes, alcance de afirmaciones, enlaces, traducción y relación con productos reales.",
            fr: "Une personne responsable doit vérifier les faits, les sources, la portée des allégations, les liens, la traduction et les relations avec les produits réels.",
          })}
        </p>
      </div>
    </article>
  );
}
