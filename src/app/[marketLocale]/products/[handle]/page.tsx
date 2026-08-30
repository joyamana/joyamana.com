import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPage } from "@/components/pages/product-page";
import { getProduct, getProducts } from "@/lib/commerce/catalog";
import {
  canadaLocaleFromSegment,
  enabledCanadaLocaleSegments,
} from "@/lib/i18n/locales";
import { buildMetadata, buildNoIndexMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  if (enabledCanadaLocaleSegments.length === 0) return [];

  const products = await getProducts("ca", "en-CA");
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
  const product = await getProduct(handle, "ca", locale);
  if (!product) {
    return buildNoIndexMetadata({
      title: "Product unavailable",
      description: "This product is not available.",
    });
  }
  return buildMetadata({
    title: product.seoTitle || product.title,
    description: product.seoDescription || product.description,
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
