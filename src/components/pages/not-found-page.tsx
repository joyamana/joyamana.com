import Link from "next/link";
import type { EnabledLocale } from "@/config/locales";
import { localePath } from "@/lib/i18n/locales";
import { notFoundCopy } from "@/lib/i18n/not-found-copy";

export function NotFoundPage({ locale }: { locale: EnabledLocale }) {
  const copy = notFoundCopy(locale);
  return (
    <section className="empty-state">
      <p className="eyebrow">404 · {copy.label}</p>
      <h1>{copy.title}</h1>
      <p>{copy.description}</p>
      <div className="button-row">
        <Link
          className="button button--primary"
          href={localePath(locale, "/shop")}
        >
          {copy.shop}
        </Link>
        <Link className="button" href={localePath(locale, "/")}>
          {copy.home}
        </Link>
      </div>
    </section>
  );
}
