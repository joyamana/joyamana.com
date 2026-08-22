import Link from "next/link";
import type { EditorialEntry } from "@/lib/content/content";
import { localize } from "@/lib/commerce/types";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";

export function EditorialCard({
  entry,
  locale,
  basePath,
}: {
  entry: EditorialEntry;
  locale: Locale;
  basePath: "/blog" | "/crystals";
}) {
  return (
    <article className="editorial-card">
      <p className="eyebrow">{localize(entry.category, locale)}</p>
      <h3>
        <Link href={localePath(locale, `${basePath}/${entry.handle}`)}>
          {localize(entry.title, locale)}
        </Link>
      </h3>
      <p>{localize(entry.excerpt, locale)}</p>
      <Link
        className="text-link"
        href={localePath(locale, `${basePath}/${entry.handle}`)}
      >
        {uiText(locale, { en: "Read draft", es: "Leer borrador", fr: "Lire le brouillon" })} →
      </Link>
    </article>
  );
}
