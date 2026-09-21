import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";

export function NotFoundContent({ locale }: { locale: Locale }) {
  return (
    <section className="empty-state">
      <p className="eyebrow">404</p>
      <h1>{uiText(locale, {
        en: "We couldn’t find that page.", es: "No pudimos encontrar esa página.",
        zh: "未能找到此頁面。", fr: "Cette page est introuvable.",
      })}</h1>
      <p>{uiText(locale, {
        en: "The page may have moved, or the address may be incorrect.",
        es: "Es posible que la página se haya movido o que la dirección sea incorrecta.",
        zh: "頁面可能已移動，或網址不正確。",
        fr: "La page a peut-être été déplacée ou l’adresse est incorrecte.",
      })}</p>
      <div className="button-row">
        <Link className="button button--primary" href={localePath(locale, "/shop")}>
          {uiText(locale, { en: "Shop all", es: "Ver todo", zh: "選購所有商品", fr: "Tout voir" })}
        </Link>
        <Link className="button button--secondary" href={localePath(locale, "/")}>
          {uiText(locale, { en: "Return home", es: "Volver al inicio", zh: "返回首頁", fr: "Retour à l’accueil" })}
        </Link>
      </div>
    </section>
  );
}
