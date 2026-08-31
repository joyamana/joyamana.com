import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getShopifyEditorialArticle,
  type EditorialKind,
} from "@/lib/content/shopify-editorial";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import {
  buildEditorialStructuredData,
  serializeIndexableStructuredData,
} from "@/lib/structured-data";

export async function EditorialDetailPage({
  locale,
  handle,
  kind,
}: {
  locale: Locale;
  handle: string;
  kind: EditorialKind;
}) {
  const entry = await getShopifyEditorialArticle(kind, handle, locale);
  if (!entry) notFound();
  const basePath = kind === "blog" ? "/blog" : "/crystals";
  const indexLabel =
    kind === "blog"
      ? "Blog"
      : uiText(locale, {
          en: "Crystal guide",
          es: "Guía de cristales",
          fr: "Guide des cristaux",
        });
  const path = `${basePath}/${entry.handle}`;
  const structuredData = entry.usedDefaultLanguage
    ? null
    : serializeIndexableStructuredData(
        buildEditorialStructuredData({
          name: entry.title,
          description: entry.seoDescription,
          path,
          locale,
          breadcrumbs: [
            {
              name: uiText(locale, {
                en: "Home",
                es: "Inicio",
                fr: "Accueil",
              }),
              path: "/",
            },
            { name: indexLabel, path: basePath },
            { name: entry.title, path },
          ],
          kind,
          author: entry.author,
          publishedAt: entry.publishedAt,
          image: entry.image?.url,
        }),
        { locale, path },
      );

  return (
    <article className="article-page">
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
      ) : null}
      <Link className="back-link" href={localePath(locale, basePath)}>
        ← {uiText(locale, { en: "Back to index", es: "Volver al índice", fr: "Retour à l’index" })}
      </Link>
      <p className="eyebrow">
        {entry.tags[0] ||
          uiText(locale, {
            en: kind === "blog" ? "Article" : "Crystal guide",
            es: kind === "blog" ? "Artículo" : "Guía de cristales",
            fr: kind === "blog" ? "Article" : "Guide des cristaux",
          })}
      </p>
      <h1 lang={entry.contentLocale}>{entry.title}</h1>
      <div className="article-byline" lang={entry.contentLocale}>
        {entry.author ? <span>{entry.author}</span> : null}
        <time dateTime={entry.publishedAt}>
          {new Intl.DateTimeFormat(entry.contentLocale, {
            dateStyle: "long",
            timeZone: "UTC",
          }).format(new Date(entry.publishedAt))}
        </time>
      </div>
      {entry.usedDefaultLanguage ? (
        <p className="policy-language-notice">
          {uiText(locale, {
            en: "This article is currently available in English.",
            es: "Este artículo está disponible actualmente en inglés.",
            fr: "Cet article est actuellement disponible en anglais.",
          })}
        </p>
      ) : null}
      {entry.image ? (
        <Image
          alt={entry.image.altText || ""}
          className="article-image"
          height={entry.image.height || 900}
          src={entry.image.url}
          width={entry.image.width || 1440}
        />
      ) : null}
      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: entry.contentHtml }}
        lang={entry.contentLocale}
      />
    </article>
  );
}
