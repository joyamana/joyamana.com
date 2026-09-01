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
                    en: "Canada catalog · CAD",
                    es: "Canada catalog · CAD",
                    fr: "Catalogue Canada · CAD",
                  })
                : uiText(locale, {
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
              en: "Our intention",
              es: "Nuestro propósito",
              fr: "Notre intention",
            })}
          </p>
          <h2>
            {uiText(locale, {
              en: "A crystal can be a way back to yourself.",
              es: "Un cristal puede ser una forma de volver a ti.",
              fr: "Un cristal peut être un chemin de retour vers soi.",
            })}
          </h2>
        </div>
        <div>
          <p>
            {uiText(locale, {
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
