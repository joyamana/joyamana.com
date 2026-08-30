import { ContactPage } from "@/components/pages/contact-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact",
  description: "Contact Joya Mana about products, orders, returns, or accessibility.",
  locale: "en-US",
  path: "/contact",
});

export default function Page() {
  return <ContactPage locale="en-US" />;
}
