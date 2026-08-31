import { ContactPage } from "@/components/pages/contact-page";
import { buildMetadata, type PageSearchParams } from "@/lib/seo";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  return buildMetadata({
    title: "Contact",
    description:
      "Contact Joya Mana about products, orders, returns, or accessibility.",
    locale: "en-US",
    path: "/contact",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <ContactPage locale="en-US" />;
}
