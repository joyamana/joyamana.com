import type { Metadata } from "next";
import { PolicyPage } from "@/components/pages/policy-page";
import { buildPolicyPageMetadata } from "@/lib/content/service-page-metadata";
import type { PageSearchParams } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}): Promise<Metadata> {
  return buildPolicyPageMetadata({
    title: "Política de privacidad",
    description:
      "Consulta cómo Joya Mana recopila, utiliza y comparte información personal.",
    kind: "privacy",
    locale: "es-US",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <PolicyPage locale="es-US" kind="privacy" />;
}
