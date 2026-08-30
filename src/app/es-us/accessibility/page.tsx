import type { Metadata } from "next";
import { AccessibilityPage } from "@/components/pages/accessibility-page";
import { getShopifyContentPage } from "@/lib/content/shopify-content-pages";
import { buildMetadata, buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getShopifyContentPage("accessibility", "es-US");
    if (page && !page.usedDefaultLanguage) {
      return buildMetadata({
        title: page.seoTitle,
        description: page.seoDescription,
        locale: "es-US",
        path: "/accessibility",
      });
    }
  } catch {
    // Keep an English fallback route out of search results.
  }

  return buildNoIndexMetadata({
    title: "Accesibilidad",
    description: "Conoce el enfoque de accesibilidad de Joya Mana.",
  });
}

export default function Page() {
  return <AccessibilityPage locale="es-US" />;
}
