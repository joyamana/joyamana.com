import type { ReactNode } from "react";
import type { CatalogNavigationIcon } from "@/lib/navigation/catalog-navigation";

const braceletBeads = [
  [19.75, 12],
  [17.48, 17.48],
  [12, 19.75],
  [6.52, 17.48],
  [4.25, 12],
  [6.52, 6.52],
  [12, 4.25],
  [17.48, 6.52],
] as const;

const iconShapes: Record<CatalogNavigationIcon, ReactNode> = {
  all: (
    <>
      <rect height="6.5" rx="1.2" width="6.5" x="4" y="4" />
      <rect height="6.5" rx="1.2" width="6.5" x="13.5" y="4" />
      <rect height="6.5" rx="1.2" width="6.5" x="4" y="13.5" />
      <rect height="6.5" rx="1.2" width="6.5" x="13.5" y="13.5" />
    </>
  ),
  bracelet: (
    <>
      {braceletBeads.map(([cx, cy]) => (
        <circle cx={cx} cy={cy} key={`${cx}-${cy}`} r="2" />
      ))}
    </>
  ),
  ring: (
    <>
      <circle cx="12" cy="14.5" r="6" />
      <path d="m12 2.75 2.6 2.9L12 8.5 9.4 5.65 12 2.75Z" />
    </>
  ),
  necklace: (
    <>
      <path d="M5 3.5c0 6.4 3 10.5 7 10.5s7-4.1 7-10.5" />
      <path d="m12 14 2.25 3.1L12 20.5l-2.25-3.4L12 14Z" />
    </>
  ),
  earrings: (
    <>
      <path d="M7.5 5.5v3.25M16.5 5.5v3.25" />
      <path d="M7.5 8.75c-2 2.7-3 4.6-3 6.25a3 3 0 0 0 6 0c0-1.65-1-3.55-3-6.25Z" />
      <path d="M16.5 8.75c-2 2.7-3 4.6-3 6.25a3 3 0 0 0 6 0c0-1.65-1-3.55-3-6.25Z" />
    </>
  ),
  gemstone: (
    <>
      <path d="M7 4.5h10l4.25 5.5L12 20.5 2.75 10 7 4.5Z" />
      <path d="M2.75 10h18.5" />
      <path d="m9.25 10 2.75-5.5 2.75 5.5L12 20.5 9.25 10Z" />
    </>
  ),
  display: (
    <>
      <path d="M12 3v2.5" />
      <rect height="9" rx="1" width="13" x="5.5" y="5.5" />
      <path d="m8.5 14.5-2 6.5M15.5 14.5l2 6.5M12 14.5V18" />
    </>
  ),
  sparkle: (
    <path d="M12 3c.5 5.4 3.6 8.5 9 9-5.4.5-8.5 3.6-9 9-.5-5.4-3.6-8.5-9-9 5.4-.5 8.5-3.6 9-9Z" />
  ),
};

/** Decorative line icon beside a catalog link; the link text stays the name. */
export function NavigationIcon({
  name = "sparkle",
}: {
  name?: CatalogNavigationIcon;
}) {
  return (
    <svg
      aria-hidden="true"
      className="nav-link-icon"
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
    >
      {iconShapes[name]}
    </svg>
  );
}
