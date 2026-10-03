import Link from "next/link";
import { brand } from "@/config/brand";
import type { EnabledLocale as Locale } from "@/config/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";

export function ContactPage({ locale }: { locale: Locale }) {
  return (
    <section className="form-page">
      <div className="contact-intro">
        <p className="eyebrow">
          {uiText(locale, {
            zh: "客戶服務",
            en: "Customer care",
            es: "Atención al cliente",
          })}
        </p>
        <h1>
          {uiText(locale, {
            zh: "有甚麼可以幫到你？",
            en: "How can we help?",
            es: "¿En qué podemos ayudarte?",
          })}
        </h1>
        <p>
          {uiText(locale, {
            zh: "如有商品、訂單、退貨或無障礙使用方面的查詢，歡迎透過電郵聯絡我們。",
            en: "For questions about a product, an order, a return, or accessibility, contact us by email.",
            es: "Para preguntas sobre un producto, un pedido, una devolución o accesibilidad, contáctanos por correo electrónico.",
          })}
        </p>
        <a className="contact-email" href={`mailto:${brand.supportEmail}`}>
          {brand.supportEmail}
        </a>
        <p className="contact-order-note">
          {uiText(locale, {
            zh: "查詢訂單時，請提供訂單編號，並使用結帳時填寫的電郵地址。訂單確認電郵內附有訂單狀態頁面的連結。",
            en: "For order questions, include your order number and use the email address from checkout. Your confirmation email contains the link to your Order Status page.",
            es: "Para consultas sobre pedidos, incluye el número de pedido y usa el correo del pago. El correo de confirmación contiene el enlace al estado del pedido.",
          })}
        </p>
        <nav
          aria-label={uiText(locale, {
            zh: "客戶服務連結",
            en: "Customer care links",
            es: "Enlaces de atención al cliente",
          })}
          className="contact-links"
        >
          <Link href={localePath(locale, "/shipping")}>
            {uiText(locale, { zh: "送貨", en: "Shipping", es: "Envío" })}
          </Link>
          <Link href={localePath(locale, "/returns")}>
            {uiText(locale, {
              zh: "退貨及退款",
              en: "Returns & refunds",
              es: "Devoluciones y reembolsos",
            })}
          </Link>
        </nav>
      </div>
      <div className="contact-email-fallback">
        <p className="eyebrow">
          {uiText(locale, {
            zh: "電郵支援",
            en: "Email support",
            es: "Ayuda por correo",
          })}
        </p>
        <h2>
          {uiText(locale, {
            zh: "直接傳送電郵給我們。",
            en: "Write to us directly.",
            es: "Escríbenos directamente.",
          })}
        </h2>
        <a
          className="button button--primary"
          href={`mailto:${brand.supportEmail}`}
        >
          {uiText(locale, {
            zh: `電郵至 ${brand.supportEmail}`,
            en: `Email ${brand.supportEmail}`,
            es: `Escribir a ${brand.supportEmail}`,
          })}
        </a>
      </div>
    </section>
  );
}
