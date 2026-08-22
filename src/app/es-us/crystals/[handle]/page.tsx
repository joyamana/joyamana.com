import { EditorialDetailPage } from "@/components/pages/editorial-detail-page";
import { crystalGuides } from "@/lib/content/content";

export function generateStaticParams() {
  return crystalGuides.map(({ handle }) => ({ handle }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  return (
    <EditorialDetailPage
      locale="es-US"
      entries={crystalGuides}
      handle={(await params).handle}
      kind="crystals"
    />
  );
}
