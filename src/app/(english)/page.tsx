import { HomePage } from "@/components/pages/home-page";
import { buildMetadata, type PageSearchParams } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  return buildMetadata({
    title: "Modern crystal jewelry and singular objects",
    description:
      "Modern crystal jewelry and singular objects, selected for their form, symbolism, and natural character.",
    locale: "en-US",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <HomePage locale="en-US" />;
}
