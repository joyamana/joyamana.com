import Image from "next/image";
import Link from "next/link";
import { getDesignCollections, getProducts } from "@/lib/commerce/catalog";
import { blogEntries } from "@/lib/content/content";
import { getCopy } from "@/lib/i18n/copy";
import type { Locale } from "@/lib/i18n/locales";
import { localePath, marketIdForLocale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { EditorialCard } from "@/components/editorial-card";
import { ProductCard } from "@/components/product-card";

export async function HomePage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const marketId = marketIdForLocale(locale);
  const [products, collections] = await Promise.all([
    getProducts(marketId, locale),
    getDesignCollections(marketId, locale),
  ]);

  return (
    <>
      <section className="hero">
        <Image
          className="hero__image"
          src="/images/bling-omen-editorial-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <div className="hero__veil" />
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
                products[0] ? `/products/${products[0].handle}` : "/shop",
              )}
            >
              {uiText(locale, {
                en: "View the featured piece",
                es: "Ver la pieza destacada",
                fr: "Voir la pièce vedette",
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
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      </section>

      <section className="manifesto">
        <div>
          <p className="eyebrow">{copy.home.principles}</p>
          <h2>
            {uiText(locale, {
              en: "Natural does not have to mean vague.",
              es: "Natural no tiene por qué significar ambiguo.",
              fr: "Naturel ne veut pas dire ambigu.",
            })}
          </h2>
        </div>
        <div>
          <p>{copy.home.principlesIntro}</p>
          <dl className="principle-list">
            <div>
              <dt>01</dt>
              <dd>
                {uiText(locale, {
                  en: "An exact piece is shown as an exact piece.",
                  es: "Una pieza exacta se muestra como pieza exacta.",
                  fr: "Une pièce exacte est présentée comme telle.",
                })}
              </dd>
            </div>
            <div>
              <dt>02</dt>
              <dd>
                {uiText(locale, {
                  en: "Natural variation is explained before purchase.",
                  es: "La variación natural se explica antes de comprar.",
                  fr: "La variation naturelle est expliquée avant l’achat.",
                })}
              </dd>
            </div>
            <div>
              <dt>03</dt>
              <dd>
                {uiText(locale, {
                  en: "Symbolism stays interpretation—not medical fact.",
                  es: "El simbolismo se presenta como interpretación, no como hecho médico.",
                  fr: "Le symbolisme reste une interprétation, pas un fait médical.",
                })}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section section--tint">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              {uiText(locale, {
                en: "Journal",
                es: "Historias",
                fr: "Journal",
              })}
            </p>
            <h2>{copy.home.blog}</h2>
          </div>
        </div>
        <div className="editorial-grid">
          {blogEntries.map((entry) => (
            <EditorialCard
              key={entry.handle}
              entry={entry}
              locale={locale}
              basePath="/blog"
            />
          ))}
        </div>
      </section>

      {collections.length ? (
        <section
          className="collection-strip"
          aria-label={uiText(locale, {
            en: "Collections",
            es: "Colecciones",
            fr: "Collections",
          })}
        >
          {collections.map((collection, index) => (
            <Link
              key={collection.handle}
              href={localePath(locale, `/collections/${collection.handle}`)}
            >
              <span>0{index + 1}</span>
              {collection.title}
              <span>↗</span>
            </Link>
          ))}
        </section>
      ) : null}
    </>
  );
}
