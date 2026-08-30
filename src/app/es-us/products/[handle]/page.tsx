import type { Metadata } from "next";
import { ProductPage } from "@/components/pages/product-page";
import { getProduct } from "@/lib/commerce/catalog";
import { buildMetadata, buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle, "us", "es-US");
  if (!product) {
    return buildNoIndexMetadata({
      title: "Producto no disponible",
      description: "Este producto no está disponible.",
    });
  }
  return buildMetadata({
    title: product.seoTitle || product.title,
    description: product.seoDescription || product.description,
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
