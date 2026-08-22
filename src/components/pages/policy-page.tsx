import type { Locale } from "@/lib/i18n/locales";
import { TrustPage } from "./trust-page";

export function PolicyPage({
  locale,
  kind,
}: {
  locale: Locale;
  kind: "shipping" | "returns" | "privacy" | "terms";
}) {
  return <TrustPage locale={locale} kind={kind} />;
}
