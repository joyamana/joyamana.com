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
    title: "Shipping Policy",
    description: "Read the Joya Mana shipping policy for U.S. orders.",
    kind: "shipping",
    locale: "en-US",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <PolicyPage locale="en-US" kind="shipping" />;
}
