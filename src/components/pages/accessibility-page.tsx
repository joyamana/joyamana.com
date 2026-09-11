import type { Locale } from "@/lib/i18n/locales";
import { getShopifyContentPage } from "@/lib/content/shopify-content-pages";
import { uiText } from "@/lib/i18n/text";
import { formatDate } from "@/lib/format";

export async function AccessibilityPage({ locale }: { locale: Locale }) {
  let page;
  try {
    page = await getShopifyContentPage("accessibility", locale);
  } catch {
    return <AccessibilityUnavailable locale={locale} />;
  }

  if (!page || !page.html) return <AccessibilityUnavailable locale={locale} />;

  const formattedDate = formatDate(`${page.lastUpdated}T00:00:00Z`, locale);

  return (
    <article className="policy-page policy-page--published">
      <header className="trust-page__header">
        <p className="eyebrow">
          {uiText(locale, {
            zh: "無障礙使用聲明",
            en: "Accessibility statement",
            es: "Declaración de accesibilidad",
            fr: "Déclaration d’accessibilité",
          })}
        </p>
        <h1 lang={page.contentLocale}>{page.title}</h1>
      </header>

      {page.usedDefaultLanguage ? (
        <p className="policy-language-notice">
          {uiText(locale, { en: "This statement is currently available in English.", es: "Esta declaración está disponible actualmente en inglés.", fr: "Cette déclaration est actuellement disponible en anglais.", zh: "本聲明目前以英文提供。" })}
        </p>
      ) : null}

      <div className="policy-rich-text" lang={page.contentLocale}>
        <p lang={locale}>
          <strong>
            {uiText(locale, {
              zh: "最後更新：",
              en: "Last updated:",
              es: "Última actualización:",
              fr: "Dernière mise à jour :",
            })}{" "}
            <time dateTime={page.lastUpdated}>{formattedDate}</time>
          </strong>
        </p>
        <div dangerouslySetInnerHTML={{ __html: page.html }} />
      </div>
    </article>
  );
}

function AccessibilityUnavailable({ locale }: { locale: Locale }) {
  return (
    <article className="policy-page">
      <header className="trust-page__header">
        <p className="eyebrow">
          {uiText(locale, {
            zh: "無障礙使用聲明",
            en: "Accessibility statement",
            es: "Declaración de accesibilidad",
            fr: "Déclaration d’accessibilité",
          })}
        </p>
        <h1>
          {uiText(locale, {
            zh: "無障礙使用",
            en: "Accessibility",
            es: "Accesibilidad",
            fr: "Accessibilité",
          })}
        </h1>
        <p className="trust-page__lede">
          {uiText(locale, {
            zh: "此聲明暫時未能載入。請稍後再試，或電郵至 info@joyamana.com 尋求協助。",
            en: "This statement is temporarily unavailable. Please try again shortly or contact info@joyamana.com for assistance.",
            es: "Esta declaración no está disponible temporalmente. Inténtalo de nuevo en unos minutos o contacta con info@joyamana.com para obtener ayuda.",
            fr: "Cette déclaration est temporairement indisponible. Veuillez réessayer sous peu ou contacter info@joyamana.com pour obtenir de l’aide.",
          })}
        </p>
      </header>
    </article>
  );
}
