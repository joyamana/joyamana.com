import { CartView } from "@/components/cart-view";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Bolsa",
  description: "Revisa los artículos de tu bolsa de Joya Mana.",
});

export default function Page() {
  return (
    <section className="section">
      <CartView locale="es-US" />
    </section>
  );
}
