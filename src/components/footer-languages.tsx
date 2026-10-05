"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { EnabledLocale } from "@/config/locales";
import { languageOptionsFor } from "@/lib/i18n/locales";
import { languageHref } from "@/lib/i18n/language-href";

function LanguageLinks({
  locale,
  pathname,
  search = "",
}: {
  locale: EnabledLocale;
  pathname: string;
  search?: string;
}) {
  return languageOptionsFor(locale).map((item, index) => (
    <span key={item.locale}>
      {index > 0 ? " / " : ""}
      <Link
        href={languageHref(item.locale, pathname, search)}
        hrefLang={item.locale}
        lang={item.locale}
        aria-current={item.locale === locale ? "true" : undefined}
      >
        {item.shortLabel}
      </Link>
    </span>
  ));
}

function CurrentLanguageLinks(props: {
  locale: EnabledLocale;
  pathname: string;
}) {
  const search = useSearchParams();
  return <LanguageLinks {...props} search={search.toString()} />;
}

export function FooterLanguages({ locale }: { locale: EnabledLocale }) {
  const pathname = usePathname();
  const props = { locale, pathname };
  return (
    <span className="footer-markets__languages">
      <Suspense fallback={<LanguageLinks {...props} />}>
        <CurrentLanguageLinks {...props} />
      </Suspense>
    </span>
  );
}
