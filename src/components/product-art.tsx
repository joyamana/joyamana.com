export function ProductArt({
  palette,
  compact = false,
}: {
  palette: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`product-art product-art--${palette}${compact ? " product-art--compact" : ""}`}
      aria-hidden="true"
    >
      <span className="product-art__orb" />
      <span className="product-art__line" />
      <span className="product-art__stone" />
    </div>
  );
}
