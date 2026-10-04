import { enabledLocales } from "@/lib/i18n/locales";
import type { EnabledLocale } from "@/config/locales";
import { isIndexingEnabledFor } from "@/config/site";
import type { PageSearchParams } from "@/lib/seo";

/** The caller has already established that its own content is ready. */
export async function publishedAlternateLocales(
  locale: EnabledLocale,
  path: string,
  searchParams: PageSearchParams | undefined,
  isReady: (candidate: EnabledLocale) => Promise<boolean>,
) {
  if (
    !isIndexingEnabledFor(locale, path) ||
    Object.keys(searchParams ?? {}).length
  )
    return [];
  const candidates = enabledLocales.filter((candidate) =>
    isIndexingEnabledFor(candidate, path),
  );
  const ready = await Promise.all(
    candidates.map(async (candidate) => {
      if (candidate === locale) return candidate;
      try {
        return (await isReady(candidate)) ? candidate : null;
      } catch {
        return null;
      }
    }),
  );
  return ready.filter(
    (candidate): candidate is EnabledLocale => candidate !== null,
  );
}
