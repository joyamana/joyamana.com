import type { Metadata } from "next";
import { ProductPage } from "@/components/pages/product-page";
import { getProduct, getProducts } from "@/lib/commerce/catalog";
import { buildMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return (await getProducts()).map(({ handle }) => ({ handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  return buildMetadata({
    title: product?.title["es-US"] || "Producto",
    description: product?.description["es-US"] || "Producto de prototipo.",
    locale: "es-US",
    path: `/products/${handle}`,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  return <ProductPage locale="es-US" handle={(await params).handle} />;
}
