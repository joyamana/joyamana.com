import type { Locale } from "@/lib/i18n/locales";
import { getCatalogNavigationData } from "@/lib/commerce/catalog";
import { localePath } from "@/lib/i18n/locales";
import type { CatalogNavigationLink } from "@/lib/navigation/catalog-navigation";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export async function LocaleShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const marketId = locale === "en-CA" || locale === "fr-CA" ? "ca" : "us";
  const { categories, collections } = await getCatalogNavigationData(
    marketId,
    locale,
  ).catch(() => ({ categories: [], collections: [] }));
  const categoryLinks: CatalogNavigationLink[] = categories.map(
    ({ handle, title }) => ({
      href: localePath(locale, `/category/${handle}`),
      label: title,
    }),
  );
  const collectionLinks: CatalogNavigationLink[] = collections.map(
    ({ handle, title }) => ({
      href: localePath(locale, `/collections/${handle}`),
      label: title,
    }),
  );

  return (
    <div lang={locale}>
      <SiteHeader
        categoryLinks={categoryLinks}
        collectionLinks={collectionLinks}
        locale={locale}
      />
      <main id="main-content">{children}</main>
      <SiteFooter locale={locale} />
    </div>
  );
}
