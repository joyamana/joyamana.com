import Link from "next/link";
import Image from "next/image";
import { brand } from "@/config/brand";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { LanguageLinks } from "./language-links";

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="site-footer">
      <div className="footer-statement">
        <Link className="footer-logo" href={localePath(locale)}>
          <Image src="/brand/joya-mana-lockup-reverse.svg" alt={brand.name} width={200} height={113} />
        </Link>
        <p className="footer-tagline">
          {uiText(locale, {
            zh: "現代水晶飾物，清晰而真實地呈現。",
            en: "Modern crystal objects, presented with clarity.",
            es: "Cristales modernos, presentados con claridad.",
            fr: "Des objets modernes en cristal, présentés avec clarté.",
          })}
        </p>
        <div className="footer-markets">
          {uiText(locale, {
            zh: "國家／地區",
            en: "Country/region",
            es: "País/región",
            fr: "Pays/région",
          })}
          <br />
          <span>{uiText(locale, { en: "United States", es: "Estados Unidos", fr: "États-Unis", zh: "美國" })}:</span>{" "}
          <LanguageLinks locale={locale} compact />
        </div>
      </div>
      <div>
        <p className="footer-heading">{uiText(locale, { zh: "探索", en: "Explore", es: "Explorar", fr: "Explorer" })}</p>
        <Link href={localePath(locale, "/shop")}>
          {uiText(locale, { zh: "選購", en: "Shop", es: "Comprar", fr: "Boutique" })}
        </Link>
        <Link href={localePath(locale, "/collections")}>
          {uiText(locale, { zh: "系列", en: "Collections", es: "Colecciones", fr: "Collections" })}
        </Link>
        <Link href={localePath(locale, "/crystals")}>
          {uiText(locale, { zh: "水晶指南", en: "Crystal guide", es: "Guía de cristales", fr: "Guide des cristaux" })}
        </Link>
        <Link href={localePath(locale, "/blog")}>
          Blog
        </Link>
      </div>
      <div>
        <p className="footer-heading">
          {uiText(locale, {
            zh: "客戶服務",
            en: "Customer care",
            es: "Atención al cliente",
            fr: "Service à la clientèle",
          })}
        </p>
        <Link href={localePath(locale, "/contact")}>
          {uiText(locale, { zh: "聯絡我們", en: "Contact", es: "Contacto", fr: "Contact" })}
        </Link>
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
      </div>
      <div>
        <p className="footer-heading">{uiText(locale, { en: "Legal", es: "Legal", fr: "Informations légales", zh: "法律資訊" })}</p>
        <Link href={localePath(locale, "/privacy")}>
          {uiText(locale, { zh: "私隱", en: "Privacy", es: "Privacidad", fr: "Confidentialité" })}
        </Link>
        <Link href={localePath(locale, "/terms")}>
          {uiText(locale, { zh: "條款", en: "Terms", es: "Términos", fr: "Conditions" })}
        </Link>
        <Link href={localePath(locale, "/accessibility")}>
          {uiText(locale, {
            zh: "無障礙使用",
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
