import { EditorialIndexPage } from "@/components/pages/editorial-index-page";
import { buildEditorialIndexMetadata } from "@/lib/content/editorial-metadata";
import type { PageSearchParams } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  return buildEditorialIndexMetadata({
    kind: "crystals",
    locale: "es-US",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <EditorialIndexPage locale="es-US" kind="crystals" />;
}
