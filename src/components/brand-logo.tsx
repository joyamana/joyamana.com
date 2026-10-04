import Image from "next/image";
import { brand } from "@/config/brand";

const logoDimensions = {
  wordmark: { width: 2048, height: 193 },
  symbol: { width: 1024, height: 576 },
  lockup: { width: 2048, height: 1153 },
} as const;

export function BrandLogo({
  variant = "wordmark",
  tone = "rust",
  decorative = false,
}: {
  variant?: keyof typeof logoDimensions;
  tone?: "rust" | "lavender";
  decorative?: boolean;
}) {
  return (
    <Image
      className="brand-logo"
      src={`/brand/${variant}-${tone}.svg`}
      alt={decorative ? "" : brand.name}
      {...logoDimensions[variant]}
      unoptimized
    />
  );
}
