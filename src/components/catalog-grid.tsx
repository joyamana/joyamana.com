import Link from "next/link";
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
  return entries.length ? (
    <div className="product-grid">
      {entries.map((entry) => (
        <ProductCard
          key={entry.product.id}
          product={entry.product}
          presentation={entry}
          locale={locale}
        />
      ))}
    </div>
  ) : (
    <div className="empty-state empty-state--compact">
      <h2>{copy.empty}</h2>
      <p>{copy.emptyHelp}</p>
      <Link
        className="button button--secondary"
        href={catalogPath(path, { ...query, availableOnly: false, colors: [] })}
      >
        {copy.clear}
      </Link>
    </div>
  );
}
