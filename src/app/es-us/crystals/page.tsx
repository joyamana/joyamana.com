import { EditorialIndexPage } from "@/components/pages/editorial-index-page";
import { buildEditorialIndexMetadata } from "@/lib/content/editorial-metadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return buildEditorialIndexMetadata({ kind: "crystals", locale: "es-US" });
}

export default function Page() {
  return <EditorialIndexPage locale="es-US" kind="crystals" />;
}
