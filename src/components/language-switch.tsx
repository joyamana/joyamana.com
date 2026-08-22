"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import {
  localePath,
  marketIdForLocale,
  stripLocalePrefix,
} from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";

const optionsByMarket = {
  us: [
    { locale: "en-US", label: "English" },
    { locale: "es-US", label: "Español" },
  ],
  ca: [
    { locale: "en-CA", label: "English" },
    { locale: "fr-CA", label: "Français" },
  ],
} satisfies Record<string, Array<{ locale: Locale; label: string }>>;

const localeLabels: Record<Locale, string> = {
  "en-US": "EN",
  "es-US": "ES",
  "en-CA": "EN",
  "fr-CA": "FR",
};

function LanguageIcon() {
  return (
    <svg
      aria-hidden="true"
      className="language-switch__icon"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" />
    </svg>
  );
}

export function LanguageSwitch({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const basePath = stripLocalePrefix(pathname);
  const options = optionsByMarket[marketIdForLocale(locale)];
  const selectorLabel = uiText(locale, {
    en: "Choose language",
    es: "Elegir idioma",
    fr: "Choisir la langue",
  });

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        containerRef.current
          ?.querySelector<HTMLButtonElement>(".language-switch__trigger")
          ?.focus();
      }
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="language-switch" ref={containerRef}>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`${selectorLabel}: ${localeLabels[locale]}`}
        className="language-switch__trigger"
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <LanguageIcon />
        <span>{localeLabels[locale]}</span>
        <span aria-hidden="true" className="language-switch__chevron">
          ▾
        </span>
      </button>

      {open ? (
        <nav
          aria-label={selectorLabel}
          className="language-switch__panel"
          id={panelId}
        >
          <p className="language-switch__title">
            {selectorLabel}
          </p>
          <div className="language-switch__options">
            {options.map((item) => (
              <Link
                aria-current={item.locale === locale ? "page" : undefined}
                href={localePath(item.locale, basePath)}
                hrefLang={item.locale}
                key={item.locale}
                lang={item.locale}
                onClick={() => setOpen(false)}
              >
                <span>{item.label}</span>
                <span aria-hidden="true">
                  {item.locale === locale ? "✓" : "→"}
                </span>
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
