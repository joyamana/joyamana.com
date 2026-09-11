import { ContactPage } from "@/components/pages/contact-page";
import { buildMetadata, type PageSearchParams } from "@/lib/seo";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  return buildMetadata({
    title: "聯絡我們",
    description:
      "如有商品、訂單、退貨或無障礙使用方面的查詢，請聯絡 Joya Mana。",
    locale: "zh-Hant-US",
    path: "/contact",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <ContactPage locale="zh-Hant-US" />;
}
