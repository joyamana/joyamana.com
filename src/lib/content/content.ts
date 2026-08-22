import type { LocalizedText } from "@/lib/commerce/types";

export interface EditorialEntry {
  handle: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedText;
  category: LocalizedText;
  reviewed: false;
}

export const blogEntries: EditorialEntry[] = [
  {
    handle: "how-to-read-a-crystal-listing",
    title: {
      "en-US": "How to read a crystal listing",
      "es-US": "Cómo leer una ficha de cristal",
    },
    excerpt: {
      "en-US": "A draft guide to exact-piece photography, natural variation, dimensions, and care.",
      "es-US": "Una guía preliminar sobre fotos de pieza exacta, variación natural, medidas y cuidado.",
    },
    body: {
      "en-US":
        "A useful listing separates what is exact from what is representative. For a one-of-one object, the photographs and measurements should describe the piece that will ship. For a repeatable style, the listing should explain which natural differences may appear. Materials, scale, care, price, and fulfillment should be visible without relying on symbolic language.",
      "es-US":
        "Una ficha útil distingue lo exacto de lo representativo. En un objeto único, las fotos y medidas deben describir la pieza que se enviará. En un diseño repetible, la ficha debe explicar qué diferencias naturales pueden aparecer. Los materiales, la escala, el cuidado, el precio y la entrega deben ser visibles sin depender de lenguaje simbólico.",
    },
    category: { "en-US": "Buying clearly", "es-US": "Comprar con claridad" },
    reviewed: false,
  },
  {
    handle: "objects-for-a-quiet-desk",
    title: {
      "en-US": "Objects for a quiet desk",
      "es-US": "Objetos para un escritorio tranquilo",
    },
    excerpt: {
      "en-US": "An editorial study of scale, light, and placement—not a wellness claim.",
      "es-US": "Un estudio editorial de escala, luz y ubicación, sin afirmaciones de bienestar.",
    },
    body: {
      "en-US":
        "A small natural object can give a desk a visual anchor. Consider reflected light, a stable surface, and enough clear space around the piece. This is a styling idea only; it does not promise a health, mood, or performance outcome.",
      "es-US":
        "Un pequeño objeto natural puede crear un punto focal visual en el escritorio. Considera la luz reflejada, una superficie estable y suficiente espacio libre alrededor. Es solo una idea de estilo; no promete resultados de salud, ánimo o rendimiento.",
    },
    category: { "en-US": "Objects & space", "es-US": "Objetos y espacio" },
    reviewed: false,
  },
  {
    handle: "a-modern-language-of-symbols",
    title: {
      "en-US": "A modern language of symbols",
      "es-US": "Un lenguaje moderno de símbolos",
    },
    excerpt: {
      "en-US": "How personal meaning can stay open-ended, specific, and free of promises.",
      "es-US": "Cómo mantener el significado personal abierto, específico y sin promesas.",
    },
    body: {
      "en-US":
        "Symbolism can be an invitation rather than a prediction. A form, color, or material may remind someone of a place or intention, but that response is personal. Our final editorial standard will distinguish cultural or historical sources from contemporary interpretation and will never present spiritual language as medical fact.",
      "es-US":
        "El simbolismo puede ser una invitación en lugar de una predicción. Una forma, color o material puede recordar un lugar o una intención, pero esa respuesta es personal. El estándar editorial final distinguirá las fuentes culturales o históricas de la interpretación contemporánea y nunca presentará lenguaje espiritual como hecho médico.",
    },
    category: { "en-US": "Meaning", "es-US": "Significado" },
    reviewed: false,
  },
];

export const crystalGuides: EditorialEntry[] = [
  {
    handle: "clear-quartz",
    title: { "en-US": "Clear quartz", "es-US": "Cuarzo transparente" },
    excerpt: {
      "en-US": "A development-page model for material facts, visual character, and care.",
      "es-US": "Un modelo preliminar para datos del material, carácter visual y cuidado.",
    },
    body: {
      "en-US":
        "This prototype page demonstrates the structure of a future expert-reviewed material guide. Mineral facts, origin, sourcing, care, and symbolism must be verified before publication. Personal or traditional meanings will be labeled as interpretation, never as treatment advice.",
      "es-US":
        "Esta página de prototipo demuestra la estructura de una futura guía revisada por expertos. Los datos minerales, el origen, el abastecimiento, el cuidado y el simbolismo deben verificarse antes de publicar. Los significados personales o tradicionales se identificarán como interpretación, nunca como consejo de tratamiento.",
    },
    category: { "en-US": "Material guide", "es-US": "Guía de material" },
    reviewed: false,
  },
  {
    handle: "amethyst",
    title: { "en-US": "Amethyst", "es-US": "Amatista" },
    excerpt: {
      "en-US": "A prototype guide for a violet quartz variety.",
      "es-US": "Una guía de prototipo para una variedad violeta de cuarzo.",
    },
    body: {
      "en-US":
        "Final mineral identification, color treatment disclosures, origin, and care guidance require review. The visual description and product associations shown in this test site are placeholders.",
      "es-US":
        "La identificación mineral, las declaraciones de tratamiento de color, el origen y el cuidado finales requieren revisión. La descripción visual y las asociaciones de producto de este sitio son provisionales.",
    },
    category: { "en-US": "Material guide", "es-US": "Guía de material" },
    reviewed: false,
  },
  {
    handle: "smoky-quartz",
    title: { "en-US": "Smoky quartz", "es-US": "Cuarzo ahumado" },
    excerpt: {
      "en-US": "A prototype guide focused on exact-piece presentation.",
      "es-US": "Una guía de prototipo centrada en la presentación de piezas exactas.",
    },
    body: {
      "en-US":
        "Naturally varied objects benefit from individual photography, scale references, and exact measurements. Any future statements about formation, locality, treatment, or sourcing must be tied to verified supplier and editorial records.",
      "es-US":
        "Los objetos con variación natural se benefician de fotografía individual, referencias de escala y medidas exactas. Toda afirmación futura sobre formación, localidad, tratamiento o abastecimiento debe basarse en registros verificados.",
    },
    category: { "en-US": "Material guide", "es-US": "Guía de material" },
    reviewed: false,
  },
];
