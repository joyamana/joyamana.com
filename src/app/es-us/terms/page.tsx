import type { Metadata } from "next";
import { PolicyPage } from "@/components/pages/policy-page";
import { getShopifyPolicy } from "@/lib/content/shopify-policies";
import { buildMetadata, buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Términos del servicio";
  const description =
    "Consulta los términos que rigen el uso de Joya Mana y las compras en la tienda.";

  try {
    const policy = await getShopifyPolicy("terms", "es-US");
    if (policy && !policy.usedDefaultLanguage) {
      return buildMetadata({
        title,
        description,
        locale: "es-US",
        path: "/terms",
      });
    }
  } catch {
    // Keep a readable fallback route out of search results during API errors.
  }

  return buildNoIndexMetadata({ title, description });
}

export default function Page() {
  return <PolicyPage locale="es-US" kind="terms" />;
}
