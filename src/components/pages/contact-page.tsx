import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { brand } from "@/config/brand";
import { isContactFormEnabled } from "@/lib/contact-delivery.server";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import {
  buildBrandStructuredData,
  serializeIndexableStructuredData,
} from "@/lib/structured-data";

export function ContactPage({
  locale,
  hasParameters = false,
}: {
  locale: Locale;
  hasParameters?: boolean;
}) {
  const formEnabled = isContactFormEnabled();
  const title = uiText(locale, {
    zh: "有甚麼可以幫到你？",
    en: "How can we help?",
    es: "¿En qué podemos ayudarte?",
    fr: "Comment pouvons-nous vous aider?",
  });
  const description = uiText(locale, {
    zh: "如有商品、訂單、退貨或無障礙使用方面的查詢，歡迎透過電郵聯絡我們。",
    en: "For questions about a product, an order, a return, or accessibility, contact us by email.",
    es: "Para preguntas sobre un producto, un pedido, una devolución o accesibilidad, contáctanos por correo electrónico.",
    fr: "Pour toute question sur un produit, une commande, un retour ou l’accessibilité, écrivez-nous par courriel.",
  });
  const structuredData = hasParameters ? null : serializeIndexableStructuredData(
    buildBrandStructuredData({ locale, path: "/contact", name: title, description, type: "ContactPage" }),
    { locale, path: "/contact" },
  );

  return (
    <section className="form-page">
      {structuredData ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      ) : null}
      <div className="contact-intro">
        <p className="eyebrow">
          {uiText(locale, {
            zh: "客戶服務",
            en: "Customer care",
            es: "Atención al cliente",
            fr: "Service à la clientèle",
          })}
        </p>
        <h1>{title}</h1>
        <p>{description}</p>
        <a className="contact-email" href={`mailto:${brand.supportEmail}`}>
          {brand.supportEmail}
        </a>
        <p className="contact-order-note">
          {uiText(locale, {
            zh: "查詢訂單時，請提供訂單編號，並使用結帳時填寫的電郵地址。訂單確認電郵內附有訂單狀態頁面的連結。",
            en: "For order questions, include your order number and use the email address from checkout. Your confirmation email contains the link to your Order Status page.",
            es: "Para consultas sobre pedidos, incluye el número de pedido y usa el correo del pago. El correo de confirmación contiene el enlace al estado del pedido.",
            fr: "Pour une question sur une commande, indiquez son numéro et utilisez l’adresse courriel fournie au paiement. Le courriel de confirmation contient le lien de suivi.",
          })}
        </p>
        <nav
          aria-label={uiText(locale, {
            zh: "客戶服務連結",
            en: "Customer care links",
            es: "Enlaces de atención al cliente",
            fr: "Liens du service à la clientèle",
          })}
          className="contact-links"
        >
          <Link href={localePath(locale, "/shipping")}>
            {uiText(locale, { zh: "送貨", en: "Shipping", es: "Envío", fr: "Expédition" })}
          </Link>
          <Link href={localePath(locale, "/returns")}>
            {uiText(locale, {
              zh: "退貨及退款",
              en: "Returns & refunds",
              es: "Devoluciones y reembolsos",
              fr: "Retours et remboursements",
            })}
          </Link>
        </nav>
      </div>
      {formEnabled ? (
        <ContactForm locale={locale} />
      ) : (
        <div className="contact-email-fallback">
          <p className="eyebrow">
            {uiText(locale, {
              zh: "電郵支援",
              en: "Email support",
              es: "Ayuda por correo",
              fr: "Soutien par courriel",
            })}
          </p>
          <h2>
            {uiText(locale, {
              zh: "直接傳送電郵給我們。",
              en: "Write to us directly.",
              es: "Escríbenos directamente.",
              fr: "Écrivez-nous directement.",
            })}
          </h2>
          <p>
            {uiText(locale, {
              zh: "請透過電郵聯絡我們。電郵是目前的正式聯絡渠道。",
              en: "The online form is not active yet. Email remains the official contact channel.",
              es: "El formulario en línea aún no está activo. El correo sigue siendo el canal oficial de contacto.",
              fr: "Le formulaire en ligne n’est pas encore actif. Le courriel reste le canal officiel.",
            })}
          </p>
          <a className="button button--primary" href={`mailto:${brand.supportEmail}`}>
            {uiText(locale, {
              zh: `電郵至 ${brand.supportEmail}`,
              en: `Email ${brand.supportEmail}`,
              es: `Escribir a ${brand.supportEmail}`,
              fr: `Écrire à ${brand.supportEmail}`,
            })}
          </a>
        </div>
      )}
    </section>
  );
}
