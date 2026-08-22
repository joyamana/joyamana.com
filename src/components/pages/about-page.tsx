import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";

export function AboutPage({ locale }: { locale: Locale }) {
  const principles = [
    {
      title: uiText(locale, { en: "Form", es: "Forma", fr: "Forme" }),
      body: uiText(locale, {
        en: "Objects considered for visible character, proportion, and how they live with the person who wears them.",
        es: "Objetos considerados por su carácter visible, proporción y forma de convivir con quien los lleva.",
        fr: "Des objets considérés pour leur caractère visible, leurs proportions et leur relation avec la personne qui les porte.",
      }),
    },
    {
      title: uiText(locale, {
        en: "Meaning",
        es: "Significado",
        fr: "Signification",
      }),
      body: uiText(locale, {
        en: "Symbolism remains personal and open-ended. It is never presented as a prediction, treatment, or guaranteed outcome.",
        es: "El simbolismo sigue siendo personal y abierto. Nunca se presenta como predicción, tratamiento o resultado garantizado.",
        fr: "Le symbolisme reste personnel et ouvert. Il n’est jamais présenté comme une prédiction, un traitement ou un résultat garanti.",
      }),
    },
    {
      title: uiText(locale, {
        en: "Clarity",
        es: "Claridad",
        fr: "Clarté",
      }),
      body: uiText(locale, {
        en: "Materials, natural variation, dimensions, care, price, and fulfillment should be understandable before purchase.",
        es: "Los materiales, la variación natural, las medidas, el cuidado, el precio y la entrega deben comprenderse antes de comprar.",
        fr: "Les matériaux, les variations naturelles, les dimensions, l’entretien, le prix et la livraison doivent être compréhensibles avant l’achat.",
      }),
    },
  ];

  const standards = [
    uiText(locale, {
      en: "Exact-piece or representative photography",
      es: "Fotografía de la pieza exacta o representativa",
      fr: "Photographie de la pièce exacte ou représentative",
    }),
    uiText(locale, {
      en: "Natural variation made explicit",
      es: "Variación natural explicada claramente",
      fr: "Variations naturelles clairement expliquées",
    }),
    uiText(locale, {
      en: "Material and treatment disclosure",
      es: "Información sobre materiales y tratamientos",
      fr: "Information sur les matériaux et les traitements",
    }),
    uiText(locale, {
      en: "Dimensions and care before purchase",
      es: "Medidas y cuidado antes de comprar",
      fr: "Dimensions et entretien avant l’achat",
    }),
    uiText(locale, {
      en: "Shipping and returns without hidden assumptions",
      es: "Envíos y devoluciones sin supuestos ocultos",
      fr: "Expédition et retours sans suppositions cachées",
    }),
  ];

  return (
    <>
      <header className="about-hero">
        <p className="eyebrow">
          {uiText(locale, {
            en: "About Joya Mana · working story",
            es: "Sobre Joya Mana · historia provisional",
            fr: "À propos de Joya Mana · histoire provisoire",
          })}
        </p>
        <h1>{uiText(locale, { en: "Objects with presence.", es: "Objetos con presencia.", fr: "Des objets qui ont une présence." })}</h1>
        <p>
          {uiText(locale, {
            en: "A modern approach to crystal jewelry, personal symbolism, and clear product facts.",
            es: "Un enfoque moderno de la joyería con cristales, el simbolismo personal y la información clara del producto.",
            fr: "Une approche moderne des bijoux en cristal, du symbolisme personnel et de la clarté des informations produit.",
          })}
        </p>
      </header>
      <section className="about-perspective">
        <div>
          <p className="eyebrow">
            {uiText(locale, {
              en: "Our perspective",
              es: "Nuestra perspectiva",
              fr: "Notre perspective",
            })}
          </p>
          <h2>
            {uiText(locale, {
              en: "We begin with the object.",
              es: "Empezamos por el objeto.",
              fr: "Nous commençons par l’objet.",
            })}
          </h2>
        </div>
        <div className="about-perspective__copy">
          <p>
            {uiText(locale, {
              en: "Joya Mana is a modern crystal brand spanning jewelry, gifts, and singular objects. We approach crystals through form, natural character, and personal meaning—without turning symbolism into a promise.",
              es: "Joya Mana es una marca moderna de cristales que abarca joyería, regalos y objetos singulares. Abordamos los cristales desde la forma, el carácter natural y el significado personal, sin convertir el simbolismo en una promesa.",
              fr: "Joya Mana est une marque moderne de cristaux couvrant bijoux, cadeaux et objets singuliers. Nous abordons les cristaux par la forme, le caractère naturel et le sens personnel, sans transformer le symbolisme en promesse.",
            })}
          </p>
          <p>
            {uiText(locale, {
              en: "This is a working brand statement. Materials, sourcing records, and factual claims still require approval.",
              es: "Esta es una declaración provisional de marca. Los materiales, los registros de abastecimiento y las afirmaciones factuales aún requieren aprobación.",
              fr: "Il s’agit d’une déclaration de marque provisoire. Les matériaux, les dossiers d’approvisionnement et les affirmations factuelles doivent encore être approuvés.",
            })}
          </p>
        </div>
      </section>
      <section className="about-principles">
        <div className="about-section-heading">
          <p className="eyebrow">
            {uiText(locale, {
              en: "Three principles",
              es: "Tres principios",
              fr: "Trois principes",
            })}
          </p>
          <h2>
            {uiText(locale, {
              en: "Form. Meaning. Clarity.",
              es: "Forma. Significado. Claridad.",
              fr: "Forme. Signification. Clarté.",
            })}
          </h2>
        </div>
        <div className="about-principles__grid">
          {principles.map((principle, index) => (
            <article key={principle.title}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="about-standard">
        <div>
          <p className="eyebrow">
            {uiText(locale, {
              en: "Our product standard",
              es: "Nuestro estándar de producto",
              fr: "Notre norme produit",
            })}
          </p>
          <h2>
            {uiText(locale, {
              en: "What clarity means to us.",
              es: "Lo que significa la claridad para nosotros.",
              fr: "Ce que la clarté signifie pour nous.",
            })}
          </h2>
        </div>
        <ol>
          {standards.map((standard, index) => (
            <li key={standard}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>{standard}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="about-cta">
        <p className="eyebrow">
          {uiText(locale, {
            en: "The first collection",
            es: "La primera colección",
            fr: "La première collection",
          })}
        </p>
        <h2>
          {uiText(locale, {
            en: "Seven Chakras, presented with clarity.",
            es: "Siete Chakras, presentados con claridad.",
            fr: "Sept Chakras, présentés avec clarté.",
          })}
        </h2>
        <div className="button-row">
          <Link
            className="button button--primary"
            href={localePath(locale, "/collections/seven-chakra")}
          >
            {uiText(locale, {
              en: "Discover Seven Chakras",
              es: "Descubrir Siete Chakras",
              fr: "Découvrir Sept Chakras",
            })}
          </Link>
          <Link
            className="button"
            href={localePath(locale, "/crystals")}
          >
            {uiText(locale, {
              en: "Explore the Crystal Guide",
              es: "Explorar la guía de cristales",
              fr: "Explorer le guide des cristaux",
            })}
          </Link>
        </div>
      </section>
    </>
  );
}
