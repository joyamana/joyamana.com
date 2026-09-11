import type { Locale } from "@/lib/i18n/locales";
import {
  getShopifyPolicy,
  type ShopifyPolicyKind,
} from "@/lib/content/shopify-policies";
import { uiText } from "@/lib/i18n/text";

const policyTitles = {
  shipping: {
    zh: "送貨政策",
    en: "Shipping Policy",
    es: "Política de envíos",
    fr: "Politique d’expédition",
  },
  returns: {
    zh: "退貨及退款",
    en: "Returns & Refunds",
    es: "Devoluciones y reembolsos",
    fr: "Retours et remboursements",
  },
  privacy: {
    zh: "私隱政策",
    en: "Privacy Policy",
    es: "Política de privacidad",
    fr: "Politique de confidentialité",
  },
  terms: {
    zh: "服務條款",
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
            zh: "商店政策",
            en: "Store policy",
            es: "Política de la tienda",
            fr: "Politique de la boutique",
          })}
        </p>
        <h1>{pageTitle}</h1>
      </header>

      {policy.usedDefaultLanguage ? (
        <p className="policy-language-notice">
          {uiText(locale, { en: "This policy is currently available in English.", es: "Esta política está disponible actualmente en inglés.", fr: "Cette politique est actuellement disponible en anglais.", zh: "本政策目前以英文提供。" })}
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
            zh: "商店政策",
            en: "Store policy",
            es: "Política de la tienda",
            fr: "Politique de la boutique",
          })}
        </p>
        <h1>{title}</h1>
        <p className="trust-page__lede">
          {uiText(locale, {
            zh: "此政策暫時未能載入，請稍後再試。",
            en: "This policy is temporarily unavailable. Please try again shortly.",
            es: "Esta política no está disponible temporalmente. Inténtalo de nuevo en unos minutos.",
            fr: "Cette politique est temporairement indisponible. Veuillez réessayer sous peu.",
          })}
        </p>
      </header>
    </article>
  );
}
