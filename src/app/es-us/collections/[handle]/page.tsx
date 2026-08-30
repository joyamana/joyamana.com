import type { Metadata } from "next";
import { CollectionPage } from "@/components/pages/collection-page";
import { getDesignCollection } from "@/lib/commerce/catalog";
import { buildMetadata, buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getDesignCollection(handle, "us", "es-US");
  const description = collection?.seoDescription || collection?.description;
  if (!collection || !description) {
    return buildNoIndexMetadata({
      title: collection?.title || "Colección no disponible",
      description: "Esta colección no está disponible actualmente.",
    });
  }
  return buildMetadata({
    title: collection.seoTitle || collection.title,
    description,
    locale: "es-US",
    path: `/collections/${handle}`,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  return <CollectionPage locale="es-US" handle={(await params).handle} />;
}
