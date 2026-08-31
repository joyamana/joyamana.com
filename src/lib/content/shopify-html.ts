const allowedTags = new Set([
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
]);

function decodeHtmlEntities(value: string) {
  return value.replace(
    /&(?:#(\d+)|#x([\da-f]+)|(amp|apos|gt|lt|nbsp|quot));/gi,
    (
      entity,
      decimal: string | undefined,
      hex: string | undefined,
      named: string | undefined,
    ) => {
      if (decimal) return String.fromCodePoint(Number.parseInt(decimal, 10));
      if (hex) return String.fromCodePoint(Number.parseInt(hex, 16));
      const values: Record<string, string> = {
        amp: "&",
        apos: "'",
        gt: ">",
        lt: "<",
        nbsp: "\u00a0",
        quot: '"',
      };
      return values[named?.toLowerCase() ?? ""] ?? entity;
    },
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeShopifyHref(value: string) {
  const decoded = decodeHtmlEntities(value.trim());
  if (decoded.startsWith("/") && !decoded.startsWith("//")) return decoded;

  try {
    const url = new URL(decoded);
    return url.protocol === "https:" || url.protocol === "mailto:"
      ? decoded
      : null;
  } catch {
    return null;
  }
}

function isHttpsHref(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Rebuild merchant-authored Shopify HTML from a small allowlist. Source
 * attributes are discarded except for safe link destinations.
 */
export function sanitizeShopifyHtml(
  source: string,
  { removeLeadingH1 = false }: { removeLeadingH1?: boolean } = {},
) {
  const normalizedSource = removeLeadingH1
    ? source.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, "")
    : source;
  const withoutRawContent = normalizedSource
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(
      /<\s*(script|style|iframe|object|embed|svg|math|template|form)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
      "",
    );
  const tagPattern = /<[^>]*>/g;
  let output = "";
  let offset = 0;

  for (const match of withoutRawContent.matchAll(tagPattern)) {
    const index = match.index ?? 0;
    output += escapeHtml(
      decodeHtmlEntities(withoutRawContent.slice(offset, index)),
    );
    offset = index + match[0].length;

    const parsed = match[0].match(/^<\s*(\/?)\s*([a-z0-9]+)\b([^>]*)>$/i);
    if (!parsed) continue;
    const closing = parsed[1] === "/";
    const sourceTag = parsed[2].toLowerCase();
    const tag = sourceTag === "h1" ? "h2" : sourceTag;
    if (!allowedTags.has(tag)) continue;

    if (closing) {
      if (tag !== "br" && tag !== "hr") output += `</${tag}>`;
      continue;
    }

    if (tag === "a") {
      const hrefMatch = parsed[3].match(
        /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i,
      );
      const href = safeShopifyHref(
        hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "",
      );
      const targetMatch = parsed[3].match(
        /\btarget\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i,
      );
      const target =
        targetMatch?.[1] ?? targetMatch?.[2] ?? targetMatch?.[3] ?? "";
      const opensNewTab = Boolean(
        href && target === "_blank" && isHttpsHref(href),
      );
      output += href
        ? `<a href="${escapeHtml(href)}"${
            opensNewTab
              ? ' target="_blank" rel="noopener noreferrer"'
              : ""
          }>`
        : "<a>";
      continue;
    }

    output += `<${tag}>`;
  }

  output += escapeHtml(decodeHtmlEntities(withoutRawContent.slice(offset)));
  return output.trim();
}
