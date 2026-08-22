import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPage } from "@/components/pages/product-page";
import { getProduct, getProducts } from "@/lib/commerce/catalog";
import { localize } from "@/lib/commerce/types";
import {
  canadaLocaleFromSegment,
  enabledCanadaLocaleSegments,
} from "@/lib/i18n/locales";
import { buildMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const products = await getProducts("ca");
  return enabledCanadaLocaleSegments.flatMap((marketLocale) =>
    products.map(({ handle }) => ({ marketLocale, handle })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ marketLocale: string; handle: string }>;
}): Promise<Metadata> {
  const { marketLocale, handle } = await params;
  const locale = canadaLocaleFromSegment(marketLocale);
  if (!locale) notFound();
  const product = await getProduct(handle, "ca");
  return buildMetadata({
    title: product ? localize(product.title, locale) : "Product",
    description: product
      ? localize(product.description, locale)
      : "Prototype product.",
    locale,
    path: `/products/${handle}`,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ marketLocale: string; handle: string }>;
}) {
  const { marketLocale, handle } = await params;
  const locale = canadaLocaleFromSegment(marketLocale);
  if (!locale) notFound();
  return <ProductPage locale={locale} handle={handle} />;
}
