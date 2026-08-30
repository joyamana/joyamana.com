import type { Locale } from "@/lib/i18n/locales";
import { marketIdForLocale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";

export const trustPageKinds = [
  "shipping",
  "returns",
  "privacy",
  "terms",
  "accessibility",
] as const;

export type TrustPageKind = (typeof trustPageKinds)[number];
export type PublicationStatus = "draft" | "approved" | "published";
export type TrustContentSource =
  | "shopify-policy"
  | "shopify-page"
  | "shopify-metaobject"
  | "shopify-product-metafields";

type LocalizedValue = { en: string; es: string; fr: string };

interface TrustPageDefinition {
  handle: TrustPageKind;
  status: PublicationStatus;
  targetSources: readonly TrustContentSource[];
  title: LocalizedValue;
  purpose: LocalizedValue;
  requiredInputs: readonly LocalizedValue[];
}

export interface TrustPageContent {
  handle: TrustPageKind;
  status: PublicationStatus;
  targetSources: readonly TrustContentSource[];
  title: string;
  purpose: string;
  requiredInputs: readonly string[];
  marketLabel: string;
}

const definitions: Record<TrustPageKind, TrustPageDefinition> = {
  shipping: {
    handle: "shipping",
    status: "draft",
    targetSources: ["shopify-policy"],
    title: { en: "Shipping", es: "Envío", fr: "Expédition" },
    purpose: {
      en: "This page will explain where orders can ship, how fulfillment works, and what customers can expect before delivery.",
      es: "Esta página explicará dónde se pueden enviar los pedidos, cómo funciona la preparación y qué pueden esperar los clientes antes de la entrega.",
      fr: "Cette page expliquera les destinations desservies, le traitement des commandes et ce que les clients peuvent attendre avant la livraison.",
    },
    requiredInputs: [
      {
        en: "Fulfillment origin, handling time, carriers, rates, and any free-shipping threshold",
        es: "Origen del envío, tiempo de preparación, transportistas, tarifas y cualquier umbral de envío gratuito",
        fr: "Origine d’expédition, délai de traitement, transporteurs, tarifs et tout seuil de livraison gratuite",
      },
      {
        en: "Coverage for Alaska, Hawaii, Puerto Rico, PO boxes, APO/FPO, and other exceptions",
        es: "Cobertura para Alaska, Hawái, Puerto Rico, apartados postales, APO/FPO y otras excepciones",
        fr: "Couverture pour l’Alaska, Hawaï, Porto Rico, les cases postales, APO/FPO et autres exceptions",
      },
      {
        en: "Tracking, address changes, delays, lost packages, and damaged-delivery process",
        es: "Seguimiento, cambios de dirección, retrasos, paquetes perdidos y proceso por daños durante la entrega",
        fr: "Suivi, changements d’adresse, retards, colis perdus et procédure en cas de dommages à la livraison",
      },
    ],
  },
  returns: {
    handle: "returns",
    status: "draft",
    targetSources: ["shopify-policy"],
    title: {
      en: "Returns & Refunds",
      es: "Devoluciones y reembolsos",
      fr: "Retours et remboursements",
    },
    purpose: {
      en: "This page will define the complete return, exchange, cancellation, and refund process.",
      es: "Esta página definirá el proceso completo de devoluciones, cambios, cancelaciones y reembolsos.",
      fr: "Cette page définira le processus complet de retour, d’échange, d’annulation et de remboursement.",
    },
    requiredInputs: [
      {
        en: "Return window, item condition, exclusions, and authorization process",
        es: "Plazo de devolución, estado del artículo, exclusiones y proceso de autorización",
        fr: "Délai de retour, état de l’article, exclusions et processus d’autorisation",
      },
      {
        en: "Return shipping responsibility, exchanges, restocking rules, and cancellation handling",
        es: "Responsabilidad del envío de devolución, cambios, reposición y cancelaciones",
        fr: "Responsabilité des frais de retour, échanges, remise en stock et annulations",
      },
      {
        en: "Refund method and timing, original shipping treatment, and damaged or incorrect orders",
        es: "Método y plazo de reembolso, tratamiento del envío original y pedidos dañados o incorrectos",
        fr: "Mode et délai de remboursement, traitement des frais initiaux et commandes endommagées ou incorrectes",
      },
    ],
  },
  privacy: {
    handle: "privacy",
    status: "draft",
    targetSources: ["shopify-policy"],
    title: { en: "Privacy", es: "Privacidad", fr: "Confidentialité" },
    purpose: {
      en: "This page will describe the personal data used by the storefront, Shopify Checkout, and approved service providers.",
      es: "Esta página describirá los datos personales utilizados por la tienda, Shopify Checkout y los proveedores aprobados.",
      fr: "Cette page décrira les données personnelles utilisées par la boutique, Shopify Checkout et les fournisseurs approuvés.",
    },
    requiredInputs: [
      {
        en: "Legal entity, privacy contact, applicable audiences, and effective date",
        es: "Entidad legal, contacto de privacidad, públicos aplicables y fecha de vigencia",
        fr: "Entité juridique, contact de confidentialité, publics concernés et date d’entrée en vigueur",
      },
      {
        en: "Data inventory for commerce, analytics, marketing, support, cookies, and retention",
        es: "Inventario de datos de comercio, analítica, marketing, soporte, cookies y conservación",
        fr: "Inventaire des données liées au commerce, à l’analytique, au marketing, au soutien, aux témoins et à la conservation",
      },
      {
        en: "Applicable consumer rights, request process, disclosures, and approved service providers",
        es: "Derechos aplicables, proceso de solicitud, divulgaciones y proveedores aprobados",
        fr: "Droits applicables, processus de demande, divulgations et fournisseurs approuvés",
      },
    ],
  },
  terms: {
    handle: "terms",
    status: "draft",
    targetSources: ["shopify-policy"],
    title: { en: "Terms", es: "Términos", fr: "Conditions" },
    purpose: {
      en: "This page will contain the approved terms governing use of the storefront and purchases.",
      es: "Esta página contendrá los términos aprobados que rigen el uso de la tienda y las compras.",
      fr: "Cette page contiendra les conditions approuvées régissant l’utilisation de la boutique et les achats.",
    },
    requiredInputs: [
      {
        en: "Legal entity, governing terms, eligibility, order acceptance, and payment rules",
        es: "Entidad legal, condiciones aplicables, elegibilidad, aceptación de pedidos y reglas de pago",
        fr: "Entité juridique, conditions applicables, admissibilité, acceptation des commandes et règles de paiement",
      },
      {
        en: "Product information, pricing corrections, prohibited use, and intellectual property",
        es: "Información de producto, correcciones de precio, usos prohibidos y propiedad intelectual",
        fr: "Information produit, corrections de prix, usages interdits et propriété intellectuelle",
      },
      {
        en: "Liability, dispute, termination, change-notice, and contact provisions approved for the market",
        es: "Responsabilidad, disputas, terminación, avisos de cambios y contacto aprobados para el mercado",
        fr: "Responsabilité, différends, résiliation, avis de modification et coordonnées approuvés pour le marché",
      },
    ],
  },
  accessibility: {
    handle: "accessibility",
    status: "draft",
    targetSources: ["shopify-metaobject"],
    title: { en: "Accessibility", es: "Accesibilidad", fr: "Accessibilité" },
    purpose: {
      en: "This page will describe the storefront’s actual accessibility practices and a verified way to request assistance.",
      es: "Esta página describirá las prácticas reales de accesibilidad de la tienda y una forma verificada de solicitar ayuda.",
      fr: "Cette page décrira les pratiques d’accessibilité réelles de la boutique et un moyen vérifié de demander de l’aide.",
    },
    requiredInputs: [
      {
        en: "Completed accessibility review, known limitations, and remediation ownership",
        es: "Revisión de accesibilidad completada, limitaciones conocidas y responsable de correcciones",
        fr: "Évaluation d’accessibilité terminée, limites connues et responsable des correctifs",
      },
      {
        en: "Verified accessible support channel and expected response process",
        es: "Canal de soporte accesible verificado y proceso de respuesta previsto",
        fr: "Canal de soutien accessible vérifié et processus de réponse prévu",
      },
      {
        en: "Approved statement date and wording that does not overstate conformance",
        es: "Fecha y texto aprobados que no exageren el nivel de conformidad",
        fr: "Date et texte approuvés sans exagérer le niveau de conformité",
      },
    ],
  },
};

export function getTrustPage(
  kind: TrustPageKind,
  locale: Locale,
): TrustPageContent {
  const definition = definitions[kind];
  const market = marketIdForLocale(locale);

  return {
    handle: definition.handle,
    status: definition.status,
    targetSources: definition.targetSources,
    title: uiText(locale, definition.title),
    purpose: uiText(locale, definition.purpose),
    requiredInputs: definition.requiredInputs.map((item) =>
      uiText(locale, item),
    ),
    marketLabel: market === "ca" ? "Canada" : "United States",
  };
}

export function getPublishedTrustPagePaths(locale: Locale) {
  return trustPageKinds
    .filter((kind) => definitions[kind].status === "published")
    .map((kind) => `/${getTrustPage(kind, locale).handle}`);
}
