import Link from "next/link";
import Image from "next/image";
import { getAvailableProducts, getCatalogNavigationData } from "@/lib/commerce/catalog";
import { getCopy } from "@/lib/i18n/copy";
import { localePath, marketIdForLocale, type Locale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { ProductCard } from "@/components/product-card";
import { buildBrandStructuredData, serializeIndexableStructuredData } from "@/lib/structured-data";

export async function HomePage({ locale, hasParameters = false }: { locale: Locale; hasParameters?: boolean }) {
  const copy = getCopy(locale);
  const marketId = marketIdForLocale(locale);
  const [products, navigation] = await Promise.all([
    getAvailableProducts(marketId, locale, 4),
    getCatalogNavigationData(marketId, locale).catch(() => ({ categories: [], collections: [] })),
  ]);
  const availableProducts = products.filter((product) => product.availableForSale);
  const featured = availableProducts.find((product) => product.featuredImage);
  const viewAll = uiText(locale, { en: "View all", es: "Ver todo", zh: "查看全部", fr: "Tout voir" });
  const story = uiText(locale, { en: "Our story", es: "Nuestra historia", zh: "我們的故事", fr: "Notre histoire" });
  const structuredData = hasParameters ? null : serializeIndexableStructuredData(
    buildBrandStructuredData({ locale, path: "/", name: copy.home.title, description: copy.home.intro, type: "WebPage" }),
    { locale, path: "/" },
  );

  return (
    <>
      {structuredData ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} /> : null}
      <section className="hero">
        <div className="hero__content">
          <p className="eyebrow">{copy.home.eyebrow}</p>
          <h1>{copy.home.title}</h1>
          <p>{copy.home.intro}</p>
          <div className="button-row">
            <Link className="button button--primary" href={localePath(locale, "/shop")}>{copy.home.cta}</Link>
            <Link className="text-link" href={localePath(locale, "/about")}>{story} <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <div className={`hero__media${featured ? " hero__media--product" : ""}`}>
          {featured?.featuredImage ? (
            <Link href={localePath(locale, `/products/${featured.handle}`)} className="hero__piece">
              <Image
                src={featured.featuredImage.url}
                alt={featured.featuredImage.altText || featured.title}
                fill
                preload
                sizes="(max-width: 760px) 100vw, 55vw"
                className="hero__image"
              />
              <span className="hero__caption">{featured.title}<span aria-hidden="true">↗</span></span>
            </Link>
          ) : (
            <Image className="hero__image" src="/images/joya-mana-home-hero.webp" alt="" fill preload sizes="(max-width: 760px) 100vw, 55vw" />
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>{copy.home.featured}</h2>
          <Link className="text-link" href={localePath(locale, "/shop")}>{viewAll} <span aria-hidden="true">→</span></Link>
        </div>
        {availableProducts.length ? (
          <div className="product-grid">
            {availableProducts.map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}
          </div>
        ) : (
          <div className="empty-state empty-state--compact">
            <p>{uiText(locale, {
              en: "No pieces are available to purchase at the moment.", es: "En este momento no hay piezas disponibles para comprar.",
              zh: "目前暫無可購買的飾物。", fr: "Aucune pièce n’est disponible à l’achat pour le moment.",
            })}</p>
            <Link className="text-link" href={localePath(locale, "/shop")}>{viewAll}</Link>
          </div>
        )}
      </section>

      {navigation.categories.length ? (
        <section className="category-entry" aria-label={uiText(locale, { en: "Shop by category", es: "Comprar por categoría", zh: "按類別選購", fr: "Acheter par catégorie" })}>
          {navigation.categories.map((category) => (
            <Link href={localePath(locale, `/category/${category.handle}`)} key={category.handle}>
              <span className="eyebrow">{copy.nav.shop}</span>
              <h2>{category.title}</h2>
              <span className="text-link">{viewAll} <span aria-hidden="true">→</span></span>
            </Link>
          ))}
        </section>
      ) : null}

      <section className="manifesto">
        <div className="manifesto__heading">
          <Image src="/brand/joya-mana-symbol.svg" alt="" width={96} height={54} />
          <p className="eyebrow">{uiText(locale, { en: "Our intention", es: "Nuestro propósito", zh: "我們的初衷", fr: "Notre intention" })}</p>
          <h2>{uiText(locale, {
            en: "A crystal can be a way back to yourself.", es: "Un cristal puede ser una forma de volver a ti.",
            zh: "一顆水晶，也可以是回到自己的起點。", fr: "Un cristal peut être un chemin de retour vers soi.",
          })}</h2>
        </div>
        <div>
          <p>{uiText(locale, {
            en: "We see crystals not as substitutes for personal choice or action, but as meaningful objects that invite reflection, intention, and awareness.",
            es: "No vemos los cristales como sustitutos de las decisiones o las acciones personales, sino como objetos significativos que invitan a la reflexión, la intención y la conciencia.",
            zh: "我們不將水晶視為個人選擇或行動的替代品，而是富有意義的物件，讓人留意內心、梳理意念，覺察當下。",
            fr: "Nous voyons les cristaux comme des objets porteurs de sens qui invitent à la réflexion, à l’intention et à la conscience.",
          })}</p>
          <ol className="principle-list">
            <li>{uiText(locale, { en: "Pause and notice.", es: "Haz una pausa y observa.", zh: "停一停，留意當下。", fr: "Faites une pause et observez." })}</li>
            <li>{uiText(locale, { en: "Make room for reflection.", es: "Deja espacio para reflexionar.", zh: "留一點空間，聆聽自己。", fr: "Laissez place à la réflexion." })}</li>
            <li>{uiText(locale, { en: "Choose your next step.", es: "Elige tu próximo paso.", zh: "選擇自己的下一步。", fr: "Choisissez votre prochain pas." })}</li>
          </ol>
          <Link className="text-link" href={localePath(locale, "/about")}>{uiText(locale, { en: "Read our story", es: "Conoce nuestra historia", zh: "閱讀我們的故事", fr: "Découvrir notre histoire" })} <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </>
  );
}
