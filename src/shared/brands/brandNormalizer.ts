export interface BrandMeta {
  slug: string;
  apiName: string;
  displayName: string;
  logo?: string;
  aliases: string[];
}

const HUMANIZE_REGEX = /[-_\s]+/;

export const humanizeBrandSlug = (slug: string): string => {
  if (!slug) {
    return "";
  }

  return slug
    .split(HUMANIZE_REGEX)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(" ");
};

const BRAND_DEFINITIONS: BrandMeta[] = [
  {
    slug: "bmw",
    apiName: "Bmw",
    displayName: "BMW",
    logo: "/images/products/bmw.png",
    aliases: ["bmw"],
  },
  {
    slug: "mercedes",
    apiName: "Mercedes-Benz",
    displayName: "Mercedes",
    logo: "/images/products/mercedes.jpg",
    aliases: ["mercedes", "mercedes-benz", "mercedes benz", "mercedes_benz"],
  },
  {
    slug: "audi",
    apiName: "Audi",
    displayName: "Audi",
    logo: "/images/products/audi.jpg",
    aliases: ["audi"],
  },
  {
    slug: "porsche",
    apiName: "Porsche",
    displayName: "Porsche",
    logo: "/images/products/porsche.png",
    aliases: ["porsche"],
  },
  {
    slug: "tesla",
    apiName: "Tesla",
    displayName: "Tesla",
    logo: "/images/products/tesla.avif",
    aliases: ["tesla"],
  },
  {
    slug: "volkswagen",
    apiName: "Volkswagen",
    displayName: "Volkswagen",
    logo: "/images/products/vw.png",
    aliases: ["volkswagen", "vw", "volks wagen"],
  },
  {
    slug: "toyota",
    apiName: "Toyota",
    displayName: "Toyota",
    logo: "/images/products/toyota.png",
    aliases: ["toyota"],
  },
  {
    slug: "ford",
    apiName: "Ford",
    displayName: "Ford",
    logo: "/images/products/ford.png",
    aliases: ["ford"],
  },
  {
    slug: "opel",
    apiName: "Opel",
    displayName: "Opel",
    logo: "/images/products/opel.png",
    aliases: ["opel"],
  },
  {
    slug: "skoda",
    apiName: "Skoda",
    displayName: "Škoda",
    logo: "/images/products/skoda.png",
    aliases: ["skoda", "škoda", "skoda-auto"],
  },
  {
    slug: "seat",
    apiName: "Seat",
    displayName: "SEAT",
    logo: "/images/products/seat.png",
    aliases: ["seat"],
  },
  {
    slug: "renault",
    apiName: "Renault",
    displayName: "Renault",
    logo: "/images/products/renault.png",
    aliases: ["renault"],
  },
  {
    slug: "peugeot",
    apiName: "Peugeot",
    displayName: "Peugeot",
    logo: "/images/products/peugeot.png",
    aliases: ["peugeot"],
  },
  {
    slug: "citroen",
    apiName: "Citroen",
    displayName: "Citroën",
    logo: "/images/products/citroen.png",
    aliases: ["citroen", "citroën"],
  },
  {
    slug: "fiat",
    apiName: "Fiat",
    displayName: "Fiat",
    logo: "/images/products/fiat.png",
    aliases: ["fiat"],
  },
  {
    slug: "mazda",
    apiName: "Mazda",
    displayName: "Mazda",
    logo: "/images/products/mazda.png",
    aliases: ["mazda"],
  },
  {
    slug: "honda",
    apiName: "Honda",
    displayName: "Honda",
    logo: "/images/products/honda.png",
    aliases: ["honda"],
  },
  {
    slug: "nissan",
    apiName: "Nissan",
    displayName: "Nissan",
    logo: "/images/products/nissan.png",
    aliases: ["nissan"],
  },
  {
    slug: "hyundai",
    apiName: "Hyundai",
    displayName: "Hyundai",
    logo: "/images/products/hyundai.png",
    aliases: ["hyundai"],
  },
  {
    slug: "kia",
    apiName: "Kia",
    displayName: "Kia",
    logo: "/images/products/kia.png",
    aliases: ["kia"],
  },
  {
    slug: "smart",
    apiName: "Smart",
    displayName: "Smart",
    logo: "/images/products/smart.png",
    aliases: ["smart"],
  },
  {
    slug: "chevrolet",
    apiName: "Chevrolet",
    displayName: "Chevrolet",
    logo: "/images/products/chevrolet.png",
    aliases: ["chevrolet", "chevy"],
  },
  {
    slug: "alfa-romeo",
    apiName: "Alfa Romeo",
    displayName: "Alfa Romeo",
    logo: "/images/products/alfa-romeo.png",
    aliases: ["alfa-romeo", "alfa romeo", "alfa_romeo"],
  },
  {
    slug: "land-rover",
    apiName: "Land Rover",
    displayName: "Land Rover",
    logo: "/images/products/land-rover.png",
    aliases: ["land-rover", "land rover", "land_rover", "landrover"],
  },
];

function normalizeValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const BRAND_ALIAS_INDEX = new Map<string, BrandMeta>();

BRAND_DEFINITIONS.forEach((brand) => {
  const variants = new Set<string>([
    brand.slug,
    brand.apiName,
    brand.displayName,
    ...brand.aliases,
  ]);

  variants.forEach((variant) => {
    const normalized = normalizeValue(variant);
    if (normalized) {
      BRAND_ALIAS_INDEX.set(normalized, brand);
    }
  });
});

export function mapSlugToCanonicalBrand(slug?: string | null): string | null {
  if (!slug) {
    return null;
  }

  const normalized = normalizeValue(slug);
  const meta = BRAND_ALIAS_INDEX.get(normalized);
  return meta ? meta.apiName : null;
}

export function getBrandMetaBySlug(slug?: string | null): BrandMeta | null {
  if (!slug) {
    return null;
  }

  const normalized = normalizeValue(slug);
  return BRAND_ALIAS_INDEX.get(normalized) ?? null;
}

export const supportedBrands = BRAND_DEFINITIONS;



