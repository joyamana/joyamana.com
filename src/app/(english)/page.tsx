import { HomePage } from "@/components/pages/home-page";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Modern crystal objects — prototype",
  description:
    "A development prototype for modern crystal jewelry and one-of-a-kind objects.",
  locale: "en-US",
});

export default function Page() {
  return <HomePage locale="en-US" />;
}
