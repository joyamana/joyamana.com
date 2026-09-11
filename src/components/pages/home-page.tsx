import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/lib/commerce/catalog";
import { getCopy } from "@/lib/i18n/copy";
import type { Locale } from "@/lib/i18n/locales";
import { localePath, marketIdForLocale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { ProductCard } from "@/components/product-card";

export async function HomePage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const marketId = marketIdForLocale(locale);
  const products = await getProducts(marketId, locale);
  const availableProducts = products.filter(
    (product) => product.availableForSale,
  );

  return (
    <>
      <section className="hero">
        <Image
          className="hero__image"
          src="/images/joya-mana-home-hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <div className="hero__content">
          <p className="eyebrow">{copy.home.eyebrow}</p>
          <h1>{copy.home.title}</h1>
          <p>{copy.home.intro}</p>
          <div className="button-row">
            <Link
              className="button button--light"
              href={localePath(locale, "/shop")}
            >
              {copy.home.cta}
            </Link>
            <Link
              className="button button--ghost-light"
              href={localePath(
                locale,
                availableProducts[0]
                  ? `/products/${availableProducts[0].handle}`
                  : "/shop",
              )}
            >
              {uiText(locale, {
                zh: "探索精選飾物",
                en: "Discover a featured piece",
                es: "Descubrir una pieza destacada",
                fr: "Découvrir une pièce vedette",
              })}
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              {marketId === "ca"
                ? uiText(locale, {
                    zh: "加拿大商品目錄 · CAD",
                    en: "Canada catalog · CAD",
                    es: "Canada catalog · CAD",
                    fr: "Catalogue Canada · CAD",
                  })
                : uiText(locale, {
                    zh: "美國商品目錄 · USD",
                    en: "US catalog · USD",
                    es: "Catálogo de EE. UU. · USD",
                    fr: "Catalogue États-Unis · USD",
                  })}
            </p>
            <h2>{copy.home.featured}</h2>
          </div>
          <p>{copy.home.featuredIntro}</p>
        </div>
        <div className="product-grid">
          {availableProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      </section>

      <section className="manifesto">
        <div>
          <p className="eyebrow">
            {uiText(locale, {
              zh: "我們的初衷",
              en: "Our intention",
              es: "Nuestro propósito",
              fr: "Notre intention",
            })}
          </p>
          <h2>
            {uiText(locale, {
              zh: "一顆水晶，也可以是回到自己的起點。",
              en: "A crystal can be a way back to yourself.",
              es: "Un cristal puede ser una forma de volver a ti.",
              fr: "Un cristal peut être un chemin de retour vers soi.",
            })}
          </h2>
        </div>
        <div>
          <p>
            {uiText(locale, {
              zh: "我們不將水晶視為個人選擇或行動的替代品，而是富有意義的物件，讓人留意內心、梳理意念，覺察當下。",
              en: "We see crystals not as substitutes for personal choice or action, but as meaningful objects that invite reflection, intention, and awareness.",
              es: "No vemos los cristales como sustitutos de las decisiones o las acciones personales, sino como objetos significativos que invitan a la reflexión, la intención y la conciencia.",
              fr: "Nous ne voyons pas les cristaux comme des substituts aux choix ou aux actions personnels, mais comme des objets porteurs de sens qui invitent à la réflexion, à l’intention et à la conscience.",
            })}
          </p>
          <dl className="principle-list">
            <div>
              <dt>01</dt>
              <dd>
                {uiText(locale, {
                  zh: "停一停，回到此時此刻。",
                  en: "Pause and return to the present moment.",
                  es: "Haz una pausa y vuelve al momento presente.",
                  fr: "Faire une pause et revenir au moment présent.",
                })}
              </dd>
            </div>
            <div>
              <dt>02</dt>
              <dd>
                {uiText(locale, {
                  zh: "細心聆聽自己的感受。",
                  en: "Listen more closely to what you are feeling.",
                  es: "Escucha con más atención lo que estás sintiendo.",
                  fr: "Écouter plus attentivement ce que l’on ressent.",
                })}
              </dd>
            </div>
            <div>
              <dt>03</dt>
              <dd>
                {uiText(locale, {
                  zh: "讓覺察引導你的選擇與行動。",
                  en: "Let awareness shape your choices and actions.",
                  es: "Deja que la conciencia oriente tus decisiones y acciones.",
                  fr: "Laisser la conscience guider ses choix et ses actions.",
                })}
              </dd>
            </div>
          </dl>
          <Link
            className="text-link"
            href={localePath(locale, "/about")}
          >
            {uiText(locale, {
              zh: "閱讀我們的故事",
              en: "Read our story",
              es: "Conoce nuestra historia",
              fr: "Découvrir notre histoire",
            })}{" "}
            →
          </Link>
        </div>
      </section>
    </>
  );
}
