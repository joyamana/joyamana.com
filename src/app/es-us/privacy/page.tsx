import type { Metadata } from "next";
import { PolicyPage } from "@/components/pages/policy-page";
import { getShopifyPolicy } from "@/lib/content/shopify-policies";
import { buildMetadata, buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Política de privacidad";
  const description =
    "Consulta cómo Joya Mana recopila, utiliza y comparte información personal.";

  try {
    const policy = await getShopifyPolicy("privacy", "es-US");
    if (policy && !policy.usedDefaultLanguage) {
      return buildMetadata({
        title,
        description,
        locale: "es-US",
        path: "/privacy",
      });
    }
  } catch {
    // Keep a readable fallback route out of search results during API errors.
  }

  return buildNoIndexMetadata({ title, description });
}

export default function Page() {
  return <PolicyPage locale="es-US" kind="privacy" />;
}
