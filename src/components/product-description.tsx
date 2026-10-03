export function ProductDescription({
  description,
  descriptionHtml,
}: {
  description: string;
  descriptionHtml: string;
}) {
  if (descriptionHtml) {
    return (
      <div
        className="product-description"
        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
      />
    );
  }

  return (
    <div className="product-description">
      {description
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
    </div>
  );
}
