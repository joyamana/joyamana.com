import { safeContentHref } from "./shopify-html";

export interface ContentPageField {
  key: string;
  type: string;
  value: string | null;
}

export function contentFieldValue(
  fields: Map<string, ContentPageField>,
  key: string,
  type: string,
) {
  const field = fields.get(key);
  return field?.type === type ? (field.value?.trim() ?? "") : "";
}

function validContentDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

/** UI, metadata and sitemap all receive the same complete content entity. */
export function parseContentPageFields(fields: Map<string, ContentPageField>) {
  const title = contentFieldValue(fields, "title", "single_line_text_field");
  const richText = contentFieldValue(fields, "body", "rich_text_field");
  const lastUpdated = contentFieldValue(fields, "last_updated", "date");
  const seoTitle = contentFieldValue(
    fields,
    "seo_title",
    "single_line_text_field",
  );
  const html = renderShopifyRichText(richText);
  const excerpt = richTextExcerpt(richText);
  if (
    !title ||
    !html ||
    !excerpt ||
    !validContentDate(lastUpdated) ||
    !seoTitle
  )
    return null;
  return {
    title,
    html,
    lastUpdated,
    seoTitle,
    seoDescription:
      contentFieldValue(fields, "seo_description", "multi_line_text_field") ||
      excerpt,
  };
}

interface RichTextNode {
  type?: unknown;
  value?: unknown;
  bold?: unknown;
  italic?: unknown;
  level?: unknown;
  listType?: unknown;
  url?: unknown;
  target?: unknown;
  children?: unknown;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isHttpsHref(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function childNodes(node: RichTextNode) {
  return Array.isArray(node.children) ? (node.children as RichTextNode[]) : [];
}

function renderNode(value: unknown, depth = 0): string {
  if (!value || typeof value !== "object" || Array.isArray(value) || depth > 64)
    return "";
  const node = value as RichTextNode;
  if (typeof node.type !== "string") return "";

  if (node.type === "text") {
    if (typeof node.value !== "string") return "";
    let output = escapeHtml(node.value);
    if (node.italic === true) output = `<em>${output}</em>`;
    if (node.bold === true) output = `<strong>${output}</strong>`;
    return output;
  }

  const children = childNodes(node)
    .map((child) => renderNode(child, depth + 1))
    .join("");
  if (node.type === "root") return children;
  if (node.type === "paragraph") return `<p>${children}</p>`;
  if (node.type === "heading") {
    const level = typeof node.level === "number" ? node.level : 2;
    const safeLevel = level <= 2 ? 2 : level === 3 ? 3 : 4;
    return `<h${safeLevel}>${children}</h${safeLevel}>`;
  }
  if (node.type === "list") {
    const tag = node.listType === "ordered" ? "ol" : "ul";
    return `<${tag}>${children}</${tag}>`;
  }
  if (node.type === "list-item") return `<li>${children}</li>`;
  if (node.type === "link") {
    const href = safeContentHref(node.url);
    if (!href) return children;
    const opensNewTab = node.target === "_blank" && isHttpsHref(href);
    return `<a href="${escapeHtml(href)}"${
      opensNewTab ? ' target="_blank" rel="noopener noreferrer"' : ""
    }>${children}</a>`;
  }

  return "";
}

export function renderShopifyRichText(source: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    return "";
  }

  return parsed &&
    typeof parsed === "object" &&
    "type" in parsed &&
    parsed.type === "root"
    ? renderNode(parsed).trim()
    : "";
}

export function richTextExcerpt(source: string, maximumLength = 180) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    return "";
  }

  function textNodes(value: unknown, depth = 0): string[] {
    if (!value || typeof value !== "object" || depth > 64) return [];
    const node = value as {
      type?: unknown;
      value?: unknown;
      children?: unknown;
    };
    if (node.type === "text" && typeof node.value === "string") {
      return [node.value];
    }
    if (
      !["root", "paragraph", "heading", "list", "list-item", "link"].includes(
        String(node.type),
      )
    )
      return [];
    return Array.isArray(node.children)
      ? node.children.flatMap((child) => textNodes(child, depth + 1))
      : [];
  }

  const normalized = textNodes(parsed).join(" ").replace(/\s+/g, " ").trim();
  if (normalized.length <= maximumLength) return normalized;

  const candidate = normalized.slice(0, maximumLength + 1);
  const lastWordBoundary = candidate.lastIndexOf(" ");
  const truncated = candidate
    .slice(
      0,
      lastWordBoundary >= maximumLength * 0.65
        ? lastWordBoundary
        : maximumLength,
    )
    .trimEnd();
  return `${truncated}…`;
}
