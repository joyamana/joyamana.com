import { HomePage } from "@/components/pages/home-page";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Modern crystal jewelry and singular objects",
  description:
    "Modern crystal jewelry and singular objects, selected for their form, symbolism, and natural character.",
  locale: "en-US",
});

export default function Page() {
  return <HomePage locale="en-US" />;
}
