# Joya Mana web assets

Extracted from the supplied `【最终】joya mana logo.ai` on 2026-09-21.
Source SHA-256: `743c792391a337487ff82bf8cd449de41cdc1ec819ccf68cc90c450dc8eb3f73`.

| File | SVG viewBox dimensions | Use |
| --- | --- | --- |
| `joya-mana-wordmark.svg` | 177.028988 × 16.653 | Header wordmark; transparent |
| `joya-mana-symbol.svg` | 95.500523 × 53.7035 | Standalone symbol; transparent |
| `joya-mana-lockup.svg` | 177.028988 × 99.5885 | Original stacked combination; transparent |
| `joya-mana-lockup-reverse.svg` | 177.028988 × 99.5885 | Lavender combination for dark surfaces; transparent |
| `joya-mana-pattern.svg` | 686.893 × 435.25 | Original full pattern artwork, including lavender background |

The symbol retains the original Bézier outlines. The wordmark uses outlines
decoded from the source's embedded `ZhuqueFangsong-Regular` TrueType glyphs,
including the PDF's original letter spacing and horizontal/vertical transform.
It was not retyped, traced or generated. SVGs contain no text, font dependencies,
scripts, embedded bitmap images or external references. Pattern references are
local SVG fragment identifiers only.

Brand fills are sRGB `#7B2C06` and `#D8D2F0`. The pattern preserves the source's
white motifs at opacity `0.330002`. Its repeated paths were deduplicated with
at most 0.001 source-point coordinate rounding; a 4× raster comparison before
and after optimization differed by at most 1/255 per color channel. This is the
full artwork, **not a verified seamless tile**; display it as one decorative
image rather than repeating its outer edges.

Preserve each asset's aspect ratio. Supply spacing in the component, since the
transparent assets have tightly cropped viewBoxes. Use an accessible image
label for a linked brand mark and an empty alt for purely decorative artwork.

Related Next.js assets: `src/app/icon.svg` (64 × 64 viewBox),
`src/app/apple-icon.png` (180 × 180), and `public/brand/joya-mana-opengraph.png`
(1200 × 630). Icons use the unmodified symbol with a lavender square background.
The share image uses the original lockup, with no added claims or photography.

Validation included XML/reference checks, rendering against the original PDF
with macOS CoreGraphics, and visual inspection of the lockup, pattern, share
image and icons at 16, 32, 48, 64 and 180 px. At 16 px the silhouette remains
visible but the inner curls necessarily lose detail; the artwork was not
simplified. Browser integration and metadata checks are performed by the
application's normal verification workflow.
