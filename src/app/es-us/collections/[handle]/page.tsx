import type { Metadata } from "next";
import { CollectionPage } from "@/components/pages/collection-page";
import { getCollection, getCollections } from "@/lib/commerce/catalog";
import { buildMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return (await getCollections()).map(({ handle }) => ({ handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollection(handle);
  return buildMetadata({
    title: collection?.title["es-US"] || "Colección",
    description: collection?.description["es-US"] || "Colección de prototipo.",
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
