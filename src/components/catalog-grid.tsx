import Link from "next/link";
import { uiText } from "@/lib/i18n/text";
import {
  catalogPath,
  type CatalogCard,
  type CatalogQuery,
} from "@/lib/commerce/catalog-browse";
import { catalogCopy } from "@/lib/i18n/catalog-copy";
import type { EnabledLocale as Locale } from "@/config/locales";
import { ProductCard } from "./product-card";

export function CatalogGrid({
  entries,
  locale,
  path,
  query,
}: {
  entries: CatalogCard[];
  locale: Locale;
  path: string;
  query: CatalogQuery;
}) {
  const copy = catalogCopy(locale);
  const filtered = query.availableOnly || query.colors.length > 0;
  return entries.length ? (
    <div className="product-grid">
      {entries.map((entry) => (
        <ProductCard
          key={entry.product.id}
          presentation={entry}
          locale={locale}
        />
      ))}
    </div>
  ) : (
    <div className="empty-state empty-state--compact">
      <h2>
        {filtered
          ? copy.empty
          : uiText(locale, {
              en: "No products yet.",
              zh: "暫時沒有商品。",
              es: "Aún no hay productos.",
            })}
      </h2>
      {filtered ? <p>{copy.emptyHelp}</p> : null}
      {filtered ? (
        <Link
          className="button button--secondary"
          href={catalogPath(path, {
            ...query,
            availableOnly: false,
            colors: [],
          })}
        >
          {copy.clear}
        </Link>
      ) : null}
    </div>
  );
}
