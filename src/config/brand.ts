export const brand = {
  name: "Joya Mana",
  legalName: null,
  tagline: "Objects with presence.",
  supportEmail: "info@joyamana.com",
  social: {
    instagram: null,
    pinterest: null,
    tiktok: null,
  },
} as const;

export type BrandConfig = typeof brand;
