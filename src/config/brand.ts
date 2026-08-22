export const brand = {
  name: "Joya Mana",
  legalName: null,
  tagline: "Objects with presence.",
  supportEmail: "hello@placeholder.invalid",
  social: {
    instagram: null,
    pinterest: null,
    tiktok: null,
  },
} as const;

export type BrandConfig = typeof brand;
