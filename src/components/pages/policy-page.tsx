import type { Locale } from "@/lib/i18n/locales";
import {
  getShopifyPolicy,
  type ShopifyPolicyKind,
} from "@/lib/content/shopify-policies";
import { uiText } from "@/lib/i18n/text";

const policyTitles = {
  shipping: {
    en: "Shipping Policy",
    es: "Política de envíos",
    fr: "Politique d’expédition",
  },
  returns: {
    en: "Returns & Refunds",
    es: "Devoluciones y reembolsos",
    fr: "Retours et remboursements",
  },
  privacy: {
    en: "Privacy Policy",
    es: "Política de privacidad",
    fr: "Politique de confidentialité",
  },
  terms: {
    en: "Terms of Service",
    es: "Términos del servicio",
    fr: "Conditions d’utilisation",
  },
} as const;

export async function PolicyPage({
  locale,
  kind,
}: {
  locale: Locale;
  kind: "shipping" | "returns" | "privacy" | "terms";
}) {
  let policy;
  try {
    policy = await getShopifyPolicy(kind, locale);
  } catch {
    return <PolicyUnavailable locale={locale} kind={kind} />;
  }

  if (!policy) return <PolicyUnavailable locale={locale} kind={kind} />;

  const pageTitle = uiText(locale, policyTitles[kind]);

  return (
    <article className="policy-page policy-page--published">
      <header className="trust-page__header">
        <p className="eyebrow">
          {uiText(locale, {
            en: "Store policy",
            es: "Política de la tienda",
            fr: "Politique de la boutique",
          })}
        </p>
        <h1>{pageTitle}</h1>
      </header>

      {policy.usedDefaultLanguage ? (
        <p className="policy-language-notice" lang="en-US">
          This policy is currently available in English.
        </p>
      ) : null}

      <div
        className="policy-rich-text"
        lang={policy.contentLocale}
        dangerouslySetInnerHTML={{ __html: policy.html }}
      />
    </article>
  );
}

function PolicyUnavailable({
  locale,
  kind,
}: {
  locale: Locale;
  kind: ShopifyPolicyKind;
}) {
  const title = uiText(locale, policyTitles[kind]);

  return (
    <article className="policy-page">
      <header className="trust-page__header">
        <p className="eyebrow">
          {uiText(locale, {
            en: "Store policy",
            es: "Política de la tienda",
            fr: "Politique de la boutique",
          })}
        </p>
        <h1>{title}</h1>
        <p className="trust-page__lede">
          {uiText(locale, {
            en: "This policy is temporarily unavailable. Please try again shortly.",
            es: "Esta política no está disponible temporalmente. Inténtalo de nuevo en unos minutos.",
            fr: "Cette politique est temporairement indisponible. Veuillez réessayer sous peu.",
          })}
        </p>
      </header>
    </article>
  );
}
