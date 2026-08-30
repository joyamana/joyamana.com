import Link from "next/link";
import { notFound } from "next/navigation";
import { getCommerceProvider } from "@/lib/commerce/catalog";
import {
  aboutPageForHandle,
  getShopifyAboutTree,
  type StorefrontAboutPage,
  type StorefrontAboutTree,
} from "@/lib/content/shopify-about-pages";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import {
  buildAboutStructuredData,
  serializeIndexableStructuredData,
  type StructuredBreadcrumb,
} from "@/lib/structured-data";

export async function AboutPage({
  handle,
  locale,
}: {
  handle?: string;
  locale: Locale;
}) {
  if (getCommerceProvider() !== "shopify") {
    if (handle) notFound();
    return <AboutPrototypePage locale={locale} />;
  }

  let tree: StorefrontAboutTree | null;
  try {
    tree = await getShopifyAboutTree(locale);
  } catch (error) {
    if (handle) throw error;
    return <AboutUnavailable locale={locale} />;
  }

  if (!tree) {
    if (handle) notFound();
    return <AboutPrototypePage locale={locale} />;
  }

  const page = aboutPageForHandle(tree, handle);
  if (!page) notFound();

  return (
    <AboutContentPage
      handle={handle}
      locale={locale}
      page={page}
      tree={tree}
    />
  );
}

export function AboutContentPage({
  handle,
  locale,
  page,
  tree,
}: {
  handle?: string;
  locale: Locale;
  page: StorefrontAboutPage;
  tree: StorefrontAboutTree;
}) {
  const isRoot = !handle;
  const path = isRoot ? "/about" : `/about/${page.handle}`;
  const homeLabel = uiText(locale, {
    en: "Home",
    es: "Inicio",
    fr: "Accueil",
  });
  const aboutLabel = uiText(locale, {
    en: "About",
    es: "Nosotros",
    fr: "À propos",
  });
  const breadcrumbs: StructuredBreadcrumb[] = [
    { name: homeLabel, path: "/" },
    { name: aboutLabel, path: "/about" },
    ...(isRoot ? [] : [{ name: page.title, path }]),
  ];
  const structuredData =
    !tree.root.usedDefaultLanguage && !page.usedDefaultLanguage
      ? serializeIndexableStructuredData(
          buildAboutStructuredData({
            name: page.title,
            description: page.summary || page.seoDescription,
            path,
            locale,
            breadcrumbs,
            isRoot,
          }),
        )
      : null;

  return (
    <article className="about-content-page">
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
      ) : null}
      <nav
        aria-label={uiText(locale, {
          en: "Breadcrumb",
          es: "Ruta de navegación",
          fr: "Fil d’Ariane",
        })}
        className="breadcrumbs"
      >
        <Link href={localePath(locale, "/")}>{homeLabel}</Link>
        <span>/</span>
        {isRoot ? (
          <span>{aboutLabel}</span>
        ) : (
          <>
            <Link href={localePath(locale, "/about")}>{aboutLabel}</Link>
            <span>/</span>
            <span>{page.title}</span>
          </>
        )}
      </nav>
      <AboutSectionNavigation
        activeHandle={handle}
        locale={locale}
        tree={tree}
      />
      <section className="about-content-body">
        <header className="about-content-heading" lang={page.contentLocale}>
          <h1>{page.title}</h1>
          {page.summary ? <p>{page.summary}</p> : null}
        </header>
        {page.usedDefaultLanguage ? (
          <p className="policy-language-notice">
            {uiText(locale, {
              en: "This page is currently available in English.",
              es: "Esta página está disponible actualmente en inglés.",
              fr: "Cette page est actuellement disponible en anglais.",
            })}
          </p>
        ) : null}
        <div
          className="about-rich-text"
          dangerouslySetInnerHTML={{ __html: page.html }}
          lang={page.contentLocale}
        />
      </section>
    </article>
  );
}

function AboutSectionNavigation({
  activeHandle,
  locale,
  tree,
}: {
  activeHandle?: string;
  locale: Locale;
  tree: StorefrontAboutTree;
}) {
  const children = tree.children.filter(
    (page) => !page.usedDefaultLanguage || page.handle === activeHandle,
  );
  if (!children.length) return null;

  const items = [tree.root, ...children];
  return (
    <nav
      aria-label={uiText(locale, {
        en: "About Joya Mana sections",
        es: "Secciones sobre Joya Mana",
        fr: "Sections à propos de Joya Mana",
      })}
      className="about-tabs"
    >
      <div className="about-tabs__inner">
        {items.map((item, index) => {
          const itemHandle = index === 0 ? undefined : item.handle;
          const isActive = itemHandle === activeHandle;
          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              href={localePath(
                locale,
                itemHandle ? `/about/${itemHandle}` : "/about",
              )}
              key={item.id}
            >
              {item.navigationTitle}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function AboutUnavailable({ locale }: { locale: Locale }) {
  return (
    <section className="about-content-body">
      <header className="about-content-heading">
        <h1>
          {uiText(locale, {
            en: "About Joya Mana",
            es: "Sobre Joya Mana",
            fr: "À propos de Joya Mana",
          })}
        </h1>
        <p>
          {uiText(locale, {
            en: "Our story is temporarily unavailable. Please try again shortly.",
            es: "Nuestra historia no está disponible temporalmente. Inténtalo de nuevo en unos minutos.",
            fr: "Notre histoire est temporairement indisponible. Veuillez réessayer sous peu.",
          })}
        </p>
      </header>
    </section>
  );
}

function AboutPrototypePage({ locale }: { locale: Locale }) {
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
            en: "Design collections",
            es: "Colecciones de diseño",
            fr: "Collections de design",
          })}
        </p>
        <h2>
          {uiText(locale, {
            en: "Each series begins with a distinct design idea.",
            es: "Cada serie comienza con una idea de diseño propia.",
            fr: "Chaque série commence par une idée de design distincte.",
          })}
        </h2>
        <div className="button-row">
          <Link
            className="button button--primary"
            href={localePath(locale, "/collections")}
          >
            {uiText(locale, {
              en: "Explore collections",
              es: "Explorar colecciones",
              fr: "Explorer les collections",
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
