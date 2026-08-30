import type { Locale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import {
  getTrustPage,
  type TrustContentSource,
  type TrustPageKind,
} from "@/lib/content/trust-pages";

function sourceLabel(source: TrustContentSource, locale: Locale) {
  const labels: Record<TrustContentSource, { en: string; es: string; fr: string }> = {
    "shopify-policy": {
      en: "Shopify Policy",
      es: "Política de Shopify",
      fr: "Politique Shopify",
    },
    "shopify-page": {
      en: "Shopify Page",
      es: "Página de Shopify",
      fr: "Page Shopify",
    },
    "shopify-metaobject": {
      en: "Shopify Metaobject",
      es: "Metaobjeto de Shopify",
      fr: "Métaobjet Shopify",
    },
    "shopify-product-metafields": {
      en: "Product metafields",
      es: "Metacampos de producto",
      fr: "Champs méta de produit",
    },
  };

  return uiText(locale, labels[source]);
}

export function TrustPage({
  locale,
  kind,
}: {
  locale: Locale;
  kind: TrustPageKind;
}) {
  const page = getTrustPage(kind, locale);

  return (
    <article className="policy-page" data-publication-status={page.status}>
      <header className="trust-page__header">
        <p className="eyebrow">
          {uiText(locale, {
            en: "Draft service page · not published content",
            es: "Página de servicio en borrador · contenido no publicado",
            fr: "Page de service provisoire · contenu non publié",
          })}
        </p>
        <h1>{page.title}</h1>
        <p className="trust-page__lede">{page.purpose}</p>
      </header>

      <section className="policy-placeholder" aria-labelledby={`${kind}-status`}>
        <p className="trust-page__status">{page.status}</p>
        <h2 id={`${kind}-status`}>
          {uiText(locale, {
            en: "Approved content pending",
            es: "Contenido pendiente de aprobación",
            fr: "Contenu approuvé en attente",
          })}
        </h2>
        <p>
          {uiText(locale, {
            en: `This local route validates the ${page.marketLabel} prototype experience. It does not currently state timing, fees, rights, warranties, material instructions, or legal commitments.`,
            es: "Esta ruta local valida la experiencia del prototipo para Estados Unidos. Actualmente no establece plazos, tarifas, derechos, garantías, instrucciones de materiales ni compromisos legales.",
            fr: "Cette route locale valide l’expérience prototype pour le Canada. Elle n’énonce actuellement aucun délai, tarif, droit, garantie, conseil matériel ou engagement juridique.",
          })}
        </p>
      </section>

      <section className="trust-page__requirements" aria-labelledby={`${kind}-requirements`}>
        <h2 id={`${kind}-requirements`}>
          {uiText(locale, {
            en: "Required before publication",
            es: "Requisitos antes de publicar",
            fr: "Éléments requis avant publication",
          })}
        </h2>
        <ul>
          {page.requiredInputs.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <footer className="trust-page__source">
        <span>
          {uiText(locale, {
            en: "Planned content source",
            es: "Fuente de contenido prevista",
            fr: "Source de contenu prévue",
          })}
        </span>
        <strong>
          {page.targetSources
            .map((source) => sourceLabel(source, locale))
            .join(" + ")}
        </strong>
      </footer>
    </article>
  );
}
