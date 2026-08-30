import type { Metadata } from "next";
import { PolicyPage } from "@/components/pages/policy-page";
import { getShopifyPolicy } from "@/lib/content/shopify-policies";
import { buildMetadata, buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Terms of Service";
  const description =
    "Read the terms that govern use of Joya Mana and purchases from the store.";

  try {
    if (await getShopifyPolicy("terms", "en-US")) {
      return buildMetadata({
        title,
        description,
        locale: "en-US",
        path: "/terms",
      });
    }
  } catch {
    // Never index an unavailable or unconfigured policy source.
  }

  return buildNoIndexMetadata({ title, description });
}

export default function Page() {
  return <PolicyPage locale="en-US" kind="terms" />;
}
