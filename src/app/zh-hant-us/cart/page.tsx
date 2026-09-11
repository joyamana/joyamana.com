import { CartView } from "@/components/cart-view";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "購物袋",
  description: "查看 Joya Mana 購物袋內的商品。",
});

export default function Page() {
  return (
    <section className="section">
      <CartView locale="zh-Hant-US" />
    </section>
  );
}
