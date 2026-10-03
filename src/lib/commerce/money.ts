function compareDigits(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Compare decimal amounts without converting money to a floating point number. */
export function compareAmounts(a: string, b: string) {
  const [aWholeRaw, aFraction = ""] = a.split(".");
  const [bWholeRaw, bFraction = ""] = b.split(".");
  const aWhole = aWholeRaw.replace(/^0+(?=\d)/, "");
  const bWhole = bWholeRaw.replace(/^0+(?=\d)/, "");
  const width = Math.max(aFraction.length, bFraction.length);
  return (
    aWhole.length - bWhole.length ||
    compareDigits(aWhole, bWhole) ||
    compareDigits(aFraction.padEnd(width, "0"), bFraction.padEnd(width, "0"))
  );
}
