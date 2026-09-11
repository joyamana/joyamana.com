import { notFound } from "next/navigation";

// Planned markets and unknown URLs must never render a storefront page.
export default function UnavailablePage() {
  notFound();
}
