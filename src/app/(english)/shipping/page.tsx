import type { Metadata } from "next";
import { PolicyPage } from "@/components/pages/policy-page";
import { getShopifyPolicy } from "@/lib/content/shopify-policies";
import { buildMetadata, buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Shipping Policy";
  const description = "Read the Joya Mana shipping policy for U.S. orders.";

  try {
    if (await getShopifyPolicy("shipping", "en-US")) {
      return buildMetadata({
        title,
        description,
        locale: "en-US",
        path: "/shipping",
      });
    }
  } catch {
    // Never index an unavailable or unconfigured policy source.
  }

  return buildNoIndexMetadata({ title, description });
}

export default function Page() {
  return <PolicyPage locale="en-US" kind="shipping" />;
}
