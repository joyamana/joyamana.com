"use client";

import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";

export function PageErrorContent({ locale, retry }: { locale: Locale; retry: () => void }) {
  return (
    <section className="empty-state">
      <h1>{uiText(locale, {
        en: "We couldn’t load this page.", es: "No pudimos cargar esta página.",
        zh: "暫時未能載入此頁面。", fr: "Cette page n’a pas pu être chargée.",
      })}</h1>
      <p>{uiText(locale, {
        en: "Please try again. If the problem continues, return home and try again later.",
        es: "Inténtalo de nuevo. Si el problema continúa, vuelve al inicio e inténtalo más tarde.",
        zh: "請再試一次。如問題持續，請返回首頁，稍後再試。",
        fr: "Réessayez. Si le problème persiste, revenez à l’accueil et réessayez plus tard.",
      })}</p>
      <div className="button-row">
        <button className="button button--primary" type="button" onClick={retry}>
          {uiText(locale, { en: "Try again", es: "Intentar de nuevo", zh: "再試一次", fr: "Réessayer" })}
        </button>
        <Link className="button" href={localePath(locale, "/")}>
          {uiText(locale, { en: "Return home", es: "Volver al inicio", zh: "返回首頁", fr: "Retour à l’accueil" })}
        </Link>
      </div>
    </section>
  );
}
