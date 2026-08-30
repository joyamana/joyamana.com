import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { brand } from "@/config/brand";
import { isContactFormEnabled } from "@/lib/contact-delivery.server";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";

export function ContactPage({ locale }: { locale: Locale }) {
  const formEnabled = isContactFormEnabled();

  return (
    <section className="form-page">
      <div className="contact-intro">
        <p className="eyebrow">
          {uiText(locale, {
            en: "Customer care",
            es: "Atención al cliente",
            fr: "Service à la clientèle",
          })}
        </p>
        <h1>
          {uiText(locale, {
            en: "How can we help?",
            es: "¿En qué podemos ayudarte?",
            fr: "Comment pouvons-nous vous aider?",
          })}
        </h1>
        <p>
          {uiText(locale, {
            en: "For questions about a product, an order, a return, or accessibility, contact us by email.",
            es: "Para preguntas sobre un producto, un pedido, una devolución o accesibilidad, contáctanos por correo electrónico.",
            fr: "Pour toute question sur un produit, une commande, un retour ou l’accessibilité, écrivez-nous par courriel.",
          })}
        </p>
        <a className="contact-email" href={`mailto:${brand.supportEmail}`}>
          {brand.supportEmail}
        </a>
        <p className="contact-order-note">
          {uiText(locale, {
            en: "For order questions, include your order number and use the email address from checkout. Your confirmation email contains the link to your Order Status page.",
            es: "Para consultas sobre pedidos, incluye el número de pedido y usa el correo del pago. El correo de confirmación contiene el enlace al estado del pedido.",
            fr: "Pour une question sur une commande, indiquez son numéro et utilisez l’adresse courriel fournie au paiement. Le courriel de confirmation contient le lien de suivi.",
          })}
        </p>
        <nav
          aria-label={uiText(locale, {
            en: "Customer care links",
            es: "Enlaces de atención al cliente",
            fr: "Liens du service à la clientèle",
          })}
          className="contact-links"
        >
          <Link href={localePath(locale, "/shipping")}>
            {uiText(locale, { en: "Shipping", es: "Envío", fr: "Expédition" })}
          </Link>
          <Link href={localePath(locale, "/returns")}>
            {uiText(locale, {
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
              en: "Email support",
              es: "Ayuda por correo",
              fr: "Soutien par courriel",
            })}
          </p>
          <h2>
            {uiText(locale, {
              en: "Write to us directly.",
              es: "Escríbenos directamente.",
              fr: "Écrivez-nous directement.",
            })}
          </h2>
          <p>
            {uiText(locale, {
              en: "The online form is not active yet. Email remains the official contact channel.",
              es: "El formulario en línea aún no está activo. El correo sigue siendo el canal oficial de contacto.",
              fr: "Le formulaire en ligne n’est pas encore actif. Le courriel reste le canal officiel.",
            })}
          </p>
          <a className="button button--primary" href={`mailto:${brand.supportEmail}`}>
            {uiText(locale, {
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
