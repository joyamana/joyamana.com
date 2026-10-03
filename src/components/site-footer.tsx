import Link from "next/link";
import { brand } from "@/config/brand";
import type { EnabledLocale as Locale } from "@/config/locales";
import { localePath, languageOptionsFor } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="site-footer">
      <div className="footer-statement">
        <p className="eyebrow">{brand.name}</p>
        <p className="footer-tagline">
          {uiText(locale, {
            zh: "現代水晶飾物，清晰而真實地呈現。",
            en: "Modern crystal objects, presented with clarity.",
            es: "Cristales modernos, presentados con claridad.",
          })}
        </p>
        <p className="footer-markets">
          {uiText(locale, {
            zh: "國家／地區",
            en: "Country/region",
            es: "País/región",
          })}
          <br />
          <span>
            {uiText(locale, {
              en: "United States",
              es: "Estados Unidos",
              zh: "美國",
            })}
            :
          </span>{" "}
          {languageOptionsFor(locale).map((item, index) => (
            <span key={item.locale}>
              {index > 0 ? " / " : ""}
              <Link
                href={localePath(item.locale)}
                hrefLang={item.locale}
                lang={item.locale}
              >
                {item.shortLabel}
              </Link>
            </span>
          ))}
        </p>
      </div>
      <div>
        <p className="footer-heading">
          {uiText(locale, { zh: "探索", en: "Explore", es: "Explorar" })}
        </p>
        <Link href={localePath(locale, "/shop")}>
          {uiText(locale, { zh: "選購", en: "Shop", es: "Comprar" })}
        </Link>
        <Link href={localePath(locale, "/collections")}>
          {uiText(locale, { zh: "系列", en: "Collections", es: "Colecciones" })}
        </Link>
        <Link href={localePath(locale, "/crystals")}>
          {uiText(locale, {
            zh: "水晶指南",
            en: "Crystal guide",
            es: "Guía de cristales",
          })}
        </Link>
        <Link href={localePath(locale, "/blog")}>Blog</Link>
      </div>
      <div>
        <p className="footer-heading">
          {uiText(locale, {
            zh: "客戶服務",
            en: "Customer care",
            es: "Atención al cliente",
          })}
        </p>
        <Link href={localePath(locale, "/contact")}>
          {uiText(locale, { zh: "聯絡我們", en: "Contact", es: "Contacto" })}
        </Link>
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
      </div>
      <div>
        <p className="footer-heading">
          {uiText(locale, { en: "Legal", es: "Legal", zh: "法律資訊" })}
        </p>
        <Link href={localePath(locale, "/privacy")}>
          {uiText(locale, { zh: "私隱", en: "Privacy", es: "Privacidad" })}
        </Link>
        <Link href={localePath(locale, "/terms")}>
          {uiText(locale, { zh: "條款", en: "Terms", es: "Términos" })}
        </Link>
        <Link href={localePath(locale, "/accessibility")}>
          {uiText(locale, {
            zh: "無障礙使用",
            en: "Accessibility",
            es: "Accesibilidad",
          })}
        </Link>
        <p className="footer-note">
          © {new Date().getFullYear()} {brand.name}.
        </p>
      </div>
    </footer>
  );
}
