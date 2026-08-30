import type { Locale } from "@/lib/i18n/locales";
import { getCommerceProvider } from "@/lib/commerce/catalog";
import { getShopifyContentPage } from "@/lib/content/shopify-content-pages";
import { uiText } from "@/lib/i18n/text";
import { TrustPage } from "./trust-page";

export async function AccessibilityPage({ locale }: { locale: Locale }) {
  if (getCommerceProvider() !== "shopify") {
    return <TrustPage locale={locale} kind="accessibility" />;
  }

  let page;
  try {
    page = await getShopifyContentPage("accessibility", locale);
  } catch {
    return <AccessibilityUnavailable locale={locale} />;
  }

  if (!page || !page.html) return <AccessibilityUnavailable locale={locale} />;

  const formattedDate = new Intl.DateTimeFormat(page.contentLocale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${page.lastUpdated}T00:00:00Z`));

  return (
    <article className="policy-page policy-page--published">
      <header className="trust-page__header">
        <p className="eyebrow">
          {uiText(locale, {
            en: "Accessibility statement",
            es: "Declaración de accesibilidad",
            fr: "Déclaration d’accessibilité",
          })}
        </p>
        <h1>{page.title}</h1>
      </header>

      {page.usedDefaultLanguage ? (
        <p className="policy-language-notice" lang="en-US">
          This statement is currently available in English.
        </p>
      ) : null}

      <div className="policy-rich-text" lang={page.contentLocale}>
        <p>
          <strong>
            {uiText(page.contentLocale, {
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
            en: "Accessibility statement",
            es: "Declaración de accesibilidad",
            fr: "Déclaration d’accessibilité",
          })}
        </p>
        <h1>
          {uiText(locale, {
            en: "Accessibility",
            es: "Accesibilidad",
            fr: "Accessibilité",
          })}
        </h1>
        <p className="trust-page__lede">
          {uiText(locale, {
            en: "This statement is temporarily unavailable. Please try again shortly or contact info@joyamana.com for assistance.",
            es: "Esta declaración no está disponible temporalmente. Inténtalo de nuevo en unos minutos o contacta con info@joyamana.com para obtener ayuda.",
            fr: "Cette déclaration est temporairement indisponible. Veuillez réessayer sous peu ou contacter info@joyamana.com pour obtenir de l’aide.",
          })}
        </p>
      </header>
    </article>
  );
}
