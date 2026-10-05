import Link from "next/link";
import { getImageProps } from "next/image";
import { getProducts } from "@/lib/commerce/catalog";
import { getCopy } from "@/lib/i18n/copy";
import type { EnabledLocale as Locale } from "@/config/locales";
import { localePath, marketIdForLocale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { ProductCard } from "@/components/product-card";
import { BrandLogo } from "@/components/brand-logo";

export async function HomePage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const marketId = marketIdForLocale(locale);
  const products = await getProducts(marketId, locale);
  const availableProducts = products.filter(
    (product) => product.availableForSale,
  );
  const heroImageOptions = {
    alt: "",
    fill: true,
    className: "hero__image",
    sizes: "100vw",
    loading: "eager" as const,
    fetchPriority: "high" as const,
  };
  const landscape = getImageProps({
    ...heroImageOptions,
    src: "/images/joya-mana-home-hero-still-life.webp",
  }).props;
  const portrait = getImageProps({
    ...heroImageOptions,
    src: "/images/joya-mana-home-hero-still-life-mobile.webp",
  }).props;
  const portraitMedia = "(max-width: 760px)";

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={portrait.src}
        imageSrcSet={portrait.srcSet}
        imageSizes={portrait.sizes}
        fetchPriority="high"
        media={portraitMedia}
      />
      <link
        rel="preload"
        as="image"
        href={landscape.src}
        imageSrcSet={landscape.srcSet}
        imageSizes={landscape.sizes}
        fetchPriority="high"
        media="(width > 760px)"
      />
      <section className="hero">
        <div className="hero__media">
          <picture>
            <source
              media={portraitMedia}
              srcSet={portrait.srcSet}
              sizes={portrait.sizes}
            />
            <img {...landscape} alt="" />
          </picture>
        </div>
        <div className="hero__inner">
          <div className="hero__content">
            <p className="eyebrow">{copy.home.eyebrow}</p>
            <h1>{copy.home.title}</h1>
            <p>{copy.home.intro}</p>
            <div className="button-row">
              <Link
                className="button button--primary"
                href={localePath(locale, "/shop")}
              >
                {copy.home.cta}
              </Link>
              {availableProducts[0] ? (
                <Link
                  className="button button--secondary"
                  href={localePath(
                    locale,
                    `/products/${availableProducts[0].handle}`,
                  )}
                >
                  {uiText(locale, {
                    zh: "探索精選飾物",
                    en: "Discover a featured piece",
                    es: "Descubrir una pieza destacada",
                  })}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="section section--products">
        <div className="section-heading">
          <div>
            <h2>{copy.home.featured}</h2>
          </div>
          <p>{copy.home.featuredIntro}</p>
        </div>
        {availableProducts.length ? (
          <div className="product-grid">
            {availableProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="empty-state empty-state--compact">
            {uiText(locale, {
              en: "No pieces are currently available. Please check back soon.",
              zh: "暫時沒有可購買的飾物，歡迎稍後再來瀏覽。",
              es: "No hay piezas disponibles en este momento. Vuelve pronto.",
            })}
          </p>
        )}
      </section>

      <section className="manifesto" aria-labelledby="home-intention-heading">
        <div className="manifesto__inner">
          <div className="manifesto__heading">
            <div className="manifesto__signature">
              <BrandLogo variant="symbol" decorative />
              <p className="eyebrow">
                {uiText(locale, {
                  zh: "我們的初衷",
                  en: "Our intention",
                  es: "Nuestro propósito",
                })}
              </p>
            </div>
            <h2 id="home-intention-heading">
              {uiText(locale, {
                zh: "一顆水晶，也可以是回到自己的起點。",
                en: "A crystal can be a way back to yourself.",
                es: "Un cristal puede ser una forma de volver a ti.",
              })}
            </h2>
          </div>
          <div className="manifesto__copy">
            <p>
              {uiText(locale, {
                zh: "我們不將水晶視為個人選擇或行動的替代品，而是富有意義的物件，讓人留意內心、梳理意念，覺察當下。",
                en: "We see crystals not as substitutes for personal choice or action, but as meaningful objects that invite reflection, intention, and awareness.",
                es: "No vemos los cristales como sustitutos de las decisiones o las acciones personales, sino como objetos significativos que invitan a la reflexión, la intención y la conciencia.",
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
                  })}
                </dd>
              </div>
            </dl>
          </div>
          <Link
            className="text-link manifesto__link"
            href={localePath(locale, "/about")}
          >
            <span>
              {uiText(locale, {
                zh: "閱讀我們的故事",
                en: "Read our story",
                es: "Conoce nuestra historia",
              })}
            </span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              aria-hidden="true"
            >
              <path d="M4 12h15m-6-6 6 6-6 6" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
