import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/format";
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
  hasParameters = false,
}: {
  hasParameters?: boolean;
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
          zh: "水晶指南",
          en: "Crystal guide",
          es: "Guía de cristales",
          fr: "Guide des cristaux",
        });
  const path = `${basePath}/${entry.handle}`;
  const structuredData = hasParameters || entry.usedDefaultLanguage
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
                zh: "首頁",
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
        ← {uiText(locale, { zh: "返回目錄", en: "Back to index", es: "Volver al índice", fr: "Retour à l’index" })}
      </Link>
      <p className="eyebrow">
        {entry.tags[0] ||
          uiText(locale, {
            zh: kind === "blog" ? "文章" : "水晶指南",
            en: kind === "blog" ? "Article" : "Crystal guide",
            es: kind === "blog" ? "Artículo" : "Guía de cristales",
            fr: kind === "blog" ? "Article" : "Guide des cristaux",
          })}
      </p>
      <h1 lang={entry.contentLocale}>{entry.title}</h1>
      <div className="article-byline" lang={entry.contentLocale}>
        {entry.author ? <span>{entry.author}</span> : null}
        <time dateTime={entry.publishedAt} lang={locale}>
          {formatDate(entry.publishedAt, locale)}
        </time>
      </div>
      {entry.usedDefaultLanguage ? (
        <p className="policy-language-notice">
          {uiText(locale, {
            zh: "本文目前以英文提供。",
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
