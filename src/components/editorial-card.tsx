import Link from "next/link";
import type { StorefrontEditorialArticle } from "@/lib/content/shopify-editorial";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";

export function EditorialCard({
  entry,
  locale,
  basePath,
}: {
  entry: StorefrontEditorialArticle;
  locale: Locale;
  basePath: "/blog" | "/crystals";
}) {
  return (
    <article className="editorial-card">
      <p className="eyebrow">
        {entry.tags[0] ||
          uiText(locale, { en: "Article", es: "Artículo", fr: "Article" })}
      </p>
      <h3>
        <Link href={localePath(locale, `${basePath}/${entry.handle}`)}>
          {entry.title}
        </Link>
      </h3>
      <p>{entry.excerpt}</p>
      <Link
        className="text-link"
        href={localePath(locale, `${basePath}/${entry.handle}`)}
      >
        {uiText(locale, { en: "Read", es: "Leer", fr: "Lire" })} →
      </Link>
    </article>
  );
}
