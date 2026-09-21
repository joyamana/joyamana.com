"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  languageOptionsFor,
  localePath,
  stripLocalePrefix,
  type Locale,
} from "@/lib/i18n/locales";

/** The footer and mobile menu preserve the same page when switching US language. */
export function LanguageLinks({
  locale,
  compact = false,
  onNavigate,
}: {
  locale: Locale;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const path = stripLocalePrefix(usePathname());

  return (
    <div className={`language-links${compact ? " language-links--compact" : ""}`}>
      {languageOptionsFor(locale).map((item) => (
        <Link
          aria-current={item.locale === locale ? "page" : undefined}
          aria-label={item.label}
          href={localePath(item.locale, path)}
          hrefLang={item.locale}
          key={item.locale}
          lang={item.locale}
          onClick={onNavigate}
        >
          {compact ? item.shortLabel : <><span>{item.label}</span><span>{item.shortLabel}</span></>}
        </Link>
      ))}
    </div>
  );
}
