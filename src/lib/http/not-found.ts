import type { EnabledLocale } from "@/config/locales";
import { brand } from "@/config/brand";
import { localePath } from "@/lib/i18n/locales";
import { notFoundCopy } from "@/lib/i18n/not-found-copy";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Unknown URLs need a complete 404 document even without JavaScript.
 * Keep this independent of dynamic page rendering until Next fixes #97000.
 * Only trusted locale copy and generated paths enter the document.
 */
export function notFoundResponse(locale: EnabledLocale) {
  const copy = notFoundCopy(locale);
  const html = `<!doctype html><html lang="${locale}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>${escapeHtml(copy.label)} · ${escapeHtml(brand.name)}</title>
<style>body{margin:0;padding:clamp(1.25rem,5vw,4rem);font:1rem/1.6 Arial,sans-serif}main{max-width:46rem;margin:10vh auto}h1{font:clamp(2rem,6vw,3.5rem)/1.15 Georgia,serif}nav{display:flex;flex-wrap:wrap;gap:1rem;margin-top:2rem}a{color:inherit;padding:.7rem 1rem;border:1px solid currentColor;text-underline-offset:.2em}a:focus-visible{outline:3px solid;outline-offset:4px}</style>
</head><body><main id="main-content"><p>${escapeHtml(brand.name)} · 404</p>
<h1>${escapeHtml(copy.title)}</h1><p>${escapeHtml(copy.description)}</p>
<nav><a href="${localePath(locale, "/shop")}">${escapeHtml(copy.shop)}</a><a href="${localePath(locale, "/")}">${escapeHtml(copy.home)}</a></nav>
</main></body></html>`;
  return new Response(html, {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
    },
  });
}
