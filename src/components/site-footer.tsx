import Link from "next/link";
import { brand } from "@/config/brand";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="site-footer">
      <div className="footer-statement">
        <p className="eyebrow">{brand.name}</p>
        <p className="footer-tagline">
          {uiText(locale, {
            en: "Modern crystal objects, presented with clarity.",
            es: "Cristales modernos, presentados con claridad.",
            fr: "Des objets modernes en cristal, présentés avec clarté.",
          })}
        </p>
        <p className="footer-markets">
          {uiText(locale, {
            en: "Country/region",
            es: "País/región",
            fr: "Pays/région",
          })}
          <br />
          <span>United States:</span>{" "}
          <Link href="/" hrefLang="en-US">
            EN
          </Link>
          {" / "}
          <Link href="/es-us" hrefLang="es-US">
            ES
          </Link>
        </p>
      </div>
      <div>
        <p className="footer-heading">{uiText(locale, { en: "Explore", es: "Explorar", fr: "Explorer" })}</p>
        <Link href={localePath(locale, "/shop")}>
          {uiText(locale, { en: "Shop", es: "Comprar", fr: "Boutique" })}
        </Link>
        <Link href={localePath(locale, "/collections")}>
          {uiText(locale, { en: "Collections", es: "Colecciones", fr: "Collections" })}
        </Link>
        <Link href={localePath(locale, "/crystals")}>
          {uiText(locale, { en: "Crystal guide", es: "Guía de cristales", fr: "Guide des cristaux" })}
        </Link>
        <Link href={localePath(locale, "/blog")}>
          Blog
        </Link>
      </div>
      <div>
        <p className="footer-heading">
          {uiText(locale, {
            en: "Customer care",
            es: "Atención al cliente",
            fr: "Service à la clientèle",
          })}
        </p>
        <Link href={localePath(locale, "/contact")}>
          {uiText(locale, { en: "Contact", es: "Contacto", fr: "Contact" })}
        </Link>
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
      </div>
      <div>
        <p className="footer-heading">Legal</p>
        <Link href={localePath(locale, "/privacy")}>
          {uiText(locale, { en: "Privacy", es: "Privacidad", fr: "Confidentialité" })}
        </Link>
        <Link href={localePath(locale, "/terms")}>
          {uiText(locale, { en: "Terms", es: "Términos", fr: "Conditions" })}
        </Link>
        <Link href={localePath(locale, "/accessibility")}>
          {uiText(locale, {
            en: "Accessibility",
            es: "Accesibilidad",
            fr: "Accessibilité",
          })}
        </Link>
        <p className="footer-note">
          © {new Date().getFullYear()} {brand.name}.
        </p>
      </div>
    </footer>
  );
}
