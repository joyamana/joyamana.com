import type { Locale } from "@/lib/i18n/locales";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function LocaleShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <div lang={locale}>
      <SiteHeader locale={locale} />
      <main id="main-content">{children}</main>
      <SiteFooter locale={locale} />
    </div>
  );
}
