import { CartView } from "@/components/cart-view";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Bag",
  description: "Review the items in your Joya Mana bag.",
});

export default function Page() {
  return (
    <section className="section">
      <CartView locale="en-US" />
    </section>
  );
}
