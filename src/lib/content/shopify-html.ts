import sanitizeHtml from "sanitize-html";

const allowedTags = [
  "a",
  "blockquote",
  "br",
  "em",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "li",
  "ol",
  "p",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "ul",
];

export function safeContentHref(value: unknown) {
  if (typeof value !== "string") return null;
  const candidate = value.trim();
  if (!candidate || /[\u0000-\u001f\u007f\\]/.test(candidate)) return null;
  try {
    const url = new URL(candidate, "https://content.invalid");
    if (candidate.startsWith("/") || candidate.startsWith("#")) {
      return url.origin === "https://content.invalid" ? candidate : null;
    }
    const absolute = new URL(candidate);
    return absolute.protocol === "https:" || absolute.protocol === "mailto:"
      ? candidate
      : null;
  } catch {
    return null;
  }
}

export function safeShopifyImageSource(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "cdn.shopify.com" &&
      !url.username &&
      !url.password &&
      !url.port &&
      url.pathname.startsWith("/s/files/")
    );
  } catch {
    return false;
  }
}

/** Inspect already-sanitized HTML with the parser, including decoded entities. */
export function hasVisibleHtmlText(html: string) {
  let visible = false;
  sanitizeHtml(`<div>${html}</div>`, {
    allowedTags: ["div"],
    exclusiveFilter: (frame) => {
      if (frame.tag === "div" && frame.text.trim()) visible = true;
      return false;
    },
  });
  return visible;
}

/** One server-side HTML boundary for merchant-authored content. */
export function sanitizeShopifyHtml(
  source: string,
  {
    removeLeadingH1 = false,
    allowImages = false,
  }: { removeLeadingH1?: boolean; allowImages?: boolean } = {},
) {
  const normalizedSource = removeLeadingH1
    ? source.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, "")
    : source;
  return sanitizeHtml(normalizedSource, {
    allowedTags: allowImages
      ? [...allowedTags, "img", "figure", "figcaption"]
      : allowedTags,
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
    },
    allowedSchemes: ["https", "mailto"],
    allowProtocolRelative: false,
    nonTextTags: [
      "script",
      "style",
      "iframe",
      "object",
      "embed",
      "svg",
      "math",
      "template",
      "form",
    ],
    transformTags: {
      h1: "h2",
      a: (_tag, attributes) => {
        const href = safeContentHref(attributes.href);
        const opensNewTab =
          href?.startsWith("https:") && attributes.target === "_blank";
        return {
          tagName: "a",
          attribs: href
            ? {
                href,
                ...(opensNewTab
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {}),
              }
            : {},
        };
      },
      img: (_tag, attributes) => ({
        tagName: "img",
        attribs: {
          src: attributes.src ?? "",
          alt: attributes.alt ?? "",
          loading: "lazy",
          ...(/^\d+$/.test(attributes.width ?? "")
            ? { width: attributes.width }
            : {}),
          ...(/^\d+$/.test(attributes.height ?? "")
            ? { height: attributes.height }
            : {}),
        },
      }),
    },
    exclusiveFilter: (frame) =>
      frame.tag === "img" && !safeShopifyImageSource(frame.attribs.src),
  }).trim();
}
