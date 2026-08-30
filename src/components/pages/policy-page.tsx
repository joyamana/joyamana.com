import type { Locale } from "@/lib/i18n/locales";
import { getCommerceProvider } from "@/lib/commerce/catalog";
import {
  getShopifyPolicy,
  type ShopifyPolicyKind,
} from "@/lib/content/shopify-policies";
import { uiText } from "@/lib/i18n/text";
import { TrustPage } from "./trust-page";

export async function PolicyPage({
  locale,
  kind,
}: {
  locale: Locale;
  kind: "shipping" | "returns" | "privacy" | "terms";
}) {
  if (
    getCommerceProvider() !== "shopify" ||
    (kind !== "returns" && kind !== "privacy")
  ) {
    return <TrustPage locale={locale} kind={kind} />;
  }

  let policy;
  try {
    policy = await getShopifyPolicy(kind as ShopifyPolicyKind, locale);
  } catch {
    return <PolicyUnavailable locale={locale} kind={kind} />;
  }

  if (!policy) return <PolicyUnavailable locale={locale} kind={kind} />;

  const pageTitle = uiText(locale, {
    en: kind === "returns" ? "Returns & Refunds" : "Privacy Policy",
    es:
      kind === "returns"
        ? "Devoluciones y reembolsos"
        : "Política de privacidad",
    fr:
      kind === "returns"
        ? "Retours et remboursements"
        : "Politique de confidentialité",
  });

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
  const title = uiText(locale, {
    en: kind === "returns" ? "Returns & Refunds" : "Privacy Policy",
    es:
      kind === "returns"
        ? "Devoluciones y reembolsos"
        : "Política de privacidad",
    fr:
      kind === "returns"
        ? "Retours et remboursements"
        : "Politique de confidentialité",
  });

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
