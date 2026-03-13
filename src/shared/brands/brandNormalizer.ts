export interface BrandMeta {
  slug: string;
  apiName: string;
  displayName: string;
  /** Nazwa w bazie danych (np. "BMW") – gdy różna od apiName, używana w zapytaniach */
  dbName?: string;
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

/** Katalog ze zdjęciami marek (public/modele/) */
const MODELE_LOGO_BASE = '/modele';

/**
 * Mapowanie slug -> faktyczna nazwa pliku w public/modele/
 * Zgodne z rzeczywistymi plikami w katalogu (różne rozszerzenia: jpg, png, avif, webp, jpeg)
 */
export const MODELE_IMAGE_MAP: Record<string, string> = {
  acura: 'acura.avif',
  aixam: 'Aixam.png',
  alfa_romeo: 'alfa_romeo.jpg',
  aston_martin: 'aston_martin.avif',
  audi: 'audi.avif',
  baic: 'baic.webp',
  bentley: 'bentley.webp',
  bmw: 'bmw.png',
  bobcat: 'Bobcat.jpg',
  bugatti: 'bugatti.jpg',
  buick: 'buick.avif',
  byd: 'byd.webp',
  cadillac: 'cadillac.jpeg',
  case: 'Case.webp',
  cat: 'cat.jpg',
  chevrolet: 'chevrolet.jpg',
  chrysler: 'chrysler.jpg',
  citroen: 'citroen.jpg',
  claas: 'Claas.webp',
  cupra: 'cupra.jpg',
  dacia: 'dacia.jpg',
  dacia_renault: 'dacia.jpg',
  daewoo: 'DAEWOO.jpg',
  daf: 'daf.jpg',
  daihatsu: 'Daihatsu.jpeg',
  deuhtz_far: 'deuhtz-far.jpg',
  dodge: 'dodge.avif',
  ds: 'ds.jpg',
  fendt: 'fendt.webp',
  ferrari: 'ferrari.avif',
  fiat: 'fiat.png',
  ford: 'ford.avif',
  forthing: 'forthing.png',
  genesis: 'genesis.jpeg',
  gmc: 'gmc.jpg',
  hammer: 'hammer.jpeg',
  honda: 'honda.jpg',
  hyundai: 'hyundai.webp',
  ineos: 'ineos.webp',
  infiniti: 'infiniti.jpg',
  isuzu: 'Isuzu.webp',
  iveco: 'Iveco.jpg',
  jaecoo: 'Jaecoo.jpg',
  jaguar: 'jaguar.avif',
  jeep: 'jeep.avif',
  john_deere: 'john-deere.jpg',
  kia: 'kia.jpg',
  komatsu: 'komatsu.webp',
  kubota: 'kubota.jpg',
  lamborghini: 'lamborghini.webp',
  lancia: 'lancia.jpg',
  land_rover: 'land_rover.webp',
  lexus: 'lexus.jpeg',
  lincoln: 'lincoln.jpg',
  man: 'man.jpg',
  maserati: 'maserati.jpg',
  massey_ferguson: 'massey_ferguson.jpg',
  maxus: 'maxus.webp',
  mazda: 'mazda.jpg',
  mclaren: 'mclaren.avif',
  mercedes_benz: 'mercedes_benz.jpg',
  mercedes_maybach: 'mercedes_maybach.webp',
  mg: 'mg.jpg',
  microcar: 'microcar.jpg',
  mini: 'mini.avif',
  mitsubishi: 'mitsubishi.avif',
  moris_minor: 'moris-minor.webp',
  new_holland: 'new-holland.webp',
  nissan: 'nissan.jpeg',
  omoda: 'omoda.jpg',
  opel: 'opel.webp',
  peugeot: 'peugeot.webp',
  plymouth: 'plymouth.jpg',
  pontiac: 'pontiac.avif',
  porsche: 'porsche.jpg',
  renault: 'renault.jpeg',
  rolls_royce: 'rolls-royce.jpg',
  saab: 'saab.jpg',
  scania: 'scania.jpeg',
  seat: 'seat.webp',
  seres: 'seres.jpg',
  skoda: 'skoda.jpg',
  skywell: 'skywell.jpg',
  smart: 'smart.avif',
  ssangyong: 'ssangyong.avif',
  subaru: 'subaru.webp',
  suzuki: 'suzuki.avif',
  tesla: 'tesla.avif',
  toyota: 'toyota.png',
  valtra: 'valtra.jpg',
  volkswagen: 'volkswagen.jpg',
  volvo: 'volvo.webp',
  xev: 'XEV.webp',
  zhidou: 'Zhidou.webp',
};

const BRAND_DEFINITIONS: BrandMeta[] = [
  { slug: "bmw", apiName: "Bmw", displayName: "BMW", dbName: "BMW", logo: `${MODELE_LOGO_BASE}/bmw.png`, aliases: ["bmw"] },
  { slug: "mercedes", apiName: "Mercedes-Benz", displayName: "Mercedes", logo: `${MODELE_LOGO_BASE}/mercedes_benz.jpg`, aliases: ["mercedes", "mercedes-benz", "mercedes benz", "mercedes_benz"] },
  { slug: "audi", apiName: "Audi", displayName: "Audi", logo: `${MODELE_LOGO_BASE}/audi.avif`, aliases: ["audi"] },
  { slug: "porsche", apiName: "Porsche", displayName: "Porsche", logo: `${MODELE_LOGO_BASE}/porsche.jpg`, aliases: ["porsche"] },
  { slug: "tesla", apiName: "Tesla", displayName: "Tesla", logo: `${MODELE_LOGO_BASE}/tesla.avif`, aliases: ["tesla"] },
  { slug: "volkswagen", apiName: "Volkswagen", displayName: "Volkswagen", logo: `${MODELE_LOGO_BASE}/volkswagen.jpg`, aliases: ["volkswagen", "vw", "volks wagen"] },
  { slug: "toyota", apiName: "Toyota", displayName: "Toyota", logo: `${MODELE_LOGO_BASE}/toyota.png`, aliases: ["toyota"] },
  { slug: "ford", apiName: "Ford", displayName: "Ford", logo: `${MODELE_LOGO_BASE}/ford.avif`, aliases: ["ford"] },
  { slug: "opel", apiName: "Opel", displayName: "Opel", logo: `${MODELE_LOGO_BASE}/opel.webp`, aliases: ["opel"] },
  { slug: "skoda", apiName: "Skoda", displayName: "Škoda", logo: `${MODELE_LOGO_BASE}/skoda.jpg`, aliases: ["skoda", "škoda", "skoda-auto"] },
  { slug: "seat", apiName: "Seat", displayName: "SEAT", logo: `${MODELE_LOGO_BASE}/seat.webp`, aliases: ["seat"] },
  { slug: "renault", apiName: "Renault", displayName: "Renault", logo: `${MODELE_LOGO_BASE}/renault.jpeg`, aliases: ["renault"] },
  { slug: "peugeot", apiName: "Peugeot", displayName: "Peugeot", logo: `${MODELE_LOGO_BASE}/peugeot.webp`, aliases: ["peugeot"] },
  { slug: "citroen", apiName: "Citroen", displayName: "Citroën", logo: `${MODELE_LOGO_BASE}/citroen.jpg`, aliases: ["citroen", "citroën"] },
  { slug: "fiat", apiName: "Fiat", displayName: "Fiat", logo: `${MODELE_LOGO_BASE}/fiat.png`, aliases: ["fiat"] },
  { slug: "mazda", apiName: "Mazda", displayName: "Mazda", logo: `${MODELE_LOGO_BASE}/mazda.jpg`, aliases: ["mazda"] },
  { slug: "honda", apiName: "Honda", displayName: "Honda", logo: `${MODELE_LOGO_BASE}/honda.jpg`, aliases: ["honda"] },
  { slug: "nissan", apiName: "Nissan", displayName: "Nissan", logo: `${MODELE_LOGO_BASE}/nissan.jpeg`, aliases: ["nissan"] },
  { slug: "hyundai", apiName: "Hyundai", displayName: "Hyundai", logo: `${MODELE_LOGO_BASE}/hyundai.webp`, aliases: ["hyundai"] },
  { slug: "kia", apiName: "Kia", displayName: "Kia", logo: `${MODELE_LOGO_BASE}/kia.jpg`, aliases: ["kia"] },
  { slug: "smart", apiName: "Smart", displayName: "Smart", logo: `${MODELE_LOGO_BASE}/smart.avif`, aliases: ["smart"] },
  { slug: "chevrolet", apiName: "Chevrolet", displayName: "Chevrolet", logo: `${MODELE_LOGO_BASE}/chevrolet.jpg`, aliases: ["chevrolet", "chevy"] },
  { slug: "alfa-romeo", apiName: "Alfa Romeo", displayName: "Alfa Romeo", logo: `${MODELE_LOGO_BASE}/alfa_romeo.jpg`, aliases: ["alfa-romeo", "alfa romeo", "alfa_romeo"] },
  { slug: "land-rover", apiName: "Land Rover", displayName: "Land Rover", logo: `${MODELE_LOGO_BASE}/land_rover.webp`, aliases: ["land-rover", "land rover", "land_rover", "landrover"] },
  { slug: "dacia", apiName: "Dacia", displayName: "Dacia", logo: `${MODELE_LOGO_BASE}/dacia.jpg`, aliases: ["dacia"] },
  { slug: "volvo", apiName: "Volvo", displayName: "Volvo", logo: `${MODELE_LOGO_BASE}/volvo.webp`, aliases: ["volvo"] },
  { slug: "jeep", apiName: "Jeep", displayName: "Jeep", logo: `${MODELE_LOGO_BASE}/jeep.avif`, aliases: ["jeep"] },
  { slug: "mini", apiName: "Mini", displayName: "Mini", logo: `${MODELE_LOGO_BASE}/mini.avif`, aliases: ["mini", "mini cooper"] },
  { slug: "acura", apiName: "Acura", displayName: "Acura", logo: `${MODELE_LOGO_BASE}/acura.avif`, aliases: ["acura"] },
  { slug: "aixam", apiName: "Aixam", displayName: "Aixam", logo: `${MODELE_LOGO_BASE}/Aixam.png`, aliases: ["aixam"] },
  { slug: "aston-martin", apiName: "Aston Martin", displayName: "Aston Martin", logo: `${MODELE_LOGO_BASE}/aston_martin.avif`, aliases: ["aston-martin", "aston martin", "aston_martin"] },
  { slug: "bentley", apiName: "Bentley", displayName: "Bentley", logo: `${MODELE_LOGO_BASE}/bentley.webp`, aliases: ["bentley"] },
  { slug: "buick", apiName: "Buick", displayName: "Buick", logo: `${MODELE_LOGO_BASE}/buick.avif`, aliases: ["buick"] },
  { slug: "cadillac", apiName: "Cadillac", displayName: "Cadillac", logo: `${MODELE_LOGO_BASE}/cadillac.jpeg`, aliases: ["cadillac"] },
  { slug: "dodge", apiName: "Dodge", displayName: "Dodge", logo: `${MODELE_LOGO_BASE}/dodge.avif`, aliases: ["dodge"] },
  { slug: "ferrari", apiName: "Ferrari", displayName: "Ferrari", logo: `${MODELE_LOGO_BASE}/ferrari.avif`, aliases: ["ferrari"] },
  { slug: "jaguar", apiName: "Jaguar", displayName: "Jaguar", logo: `${MODELE_LOGO_BASE}/jaguar.avif`, aliases: ["jaguar"] },
  { slug: "lamborghini", apiName: "Lamborghini", displayName: "Lamborghini", logo: `${MODELE_LOGO_BASE}/lamborghini.webp`, aliases: ["lamborghini"] },
  { slug: "lexus", apiName: "Lexus", displayName: "Lexus", logo: `${MODELE_LOGO_BASE}/lexus.jpeg`, aliases: ["lexus"] },
  { slug: "mclaren", apiName: "McLaren", displayName: "McLaren", logo: `${MODELE_LOGO_BASE}/mclaren.avif`, aliases: ["mclaren", "mc laren"] },
  { slug: "mitsubishi", apiName: "Mitsubishi", displayName: "Mitsubishi", logo: `${MODELE_LOGO_BASE}/mitsubishi.avif`, aliases: ["mitsubishi"] },
  { slug: "subaru", apiName: "Subaru", displayName: "Subaru", logo: `${MODELE_LOGO_BASE}/subaru.webp`, aliases: ["subaru"] },
  { slug: "suzuki", apiName: "Suzuki", displayName: "Suzuki", logo: `${MODELE_LOGO_BASE}/suzuki.avif`, aliases: ["suzuki"] },
  { slug: "cupra", apiName: "Cupra", displayName: "Cupra", logo: `${MODELE_LOGO_BASE}/cupra.jpg`, aliases: ["cupra"] },
  { slug: "ds", apiName: "DS", displayName: "DS", logo: `${MODELE_LOGO_BASE}/ds.jpg`, aliases: ["ds"] },
  { slug: "genesis", apiName: "Genesis", displayName: "Genesis", logo: `${MODELE_LOGO_BASE}/genesis.jpeg`, aliases: ["genesis"] },
  { slug: "infiniti", apiName: "Infiniti", displayName: "Infiniti", logo: `${MODELE_LOGO_BASE}/infiniti.jpg`, aliases: ["infiniti"] },
  { slug: "lancia", apiName: "Lancia", displayName: "Lancia", logo: `${MODELE_LOGO_BASE}/lancia.jpg`, aliases: ["lancia"] },
  { slug: "maserati", apiName: "Maserati", displayName: "Maserati", logo: `${MODELE_LOGO_BASE}/maserati.jpg`, aliases: ["maserati"] },
  { slug: "mg", apiName: "MG", displayName: "MG", dbName: "MG", logo: `${MODELE_LOGO_BASE}/mg.jpg`, aliases: ["mg"] },
  { slug: "ssangyong", apiName: "SsangYong", displayName: "SsangYong", logo: `${MODELE_LOGO_BASE}/ssangyong.avif`, aliases: ["ssangyong", "ssang yong"] },
  { slug: "baic", apiName: "Baic", displayName: "BAIC", dbName: "Baic", logo: `${MODELE_LOGO_BASE}/baic.webp`, aliases: ["baic"] },
  { slug: "byd", apiName: "Byd", displayName: "BYD", dbName: "Byd", logo: `${MODELE_LOGO_BASE}/byd.webp`, aliases: ["byd"] },
  { slug: "daihatsu", apiName: "Daihatsu", displayName: "Daihatsu", logo: `${MODELE_LOGO_BASE}/Daihatsu.jpeg`, aliases: ["daihatsu"] },
  { slug: "ineos", apiName: "Ineos", displayName: "Ineos", logo: `${MODELE_LOGO_BASE}/ineos.webp`, aliases: ["ineos"] },
  { slug: "maxus", apiName: "Maxus", displayName: "Maxus", logo: `${MODELE_LOGO_BASE}/maxus.webp`, aliases: ["maxus"] },
  { slug: "omoda", apiName: "Omoda", displayName: "Omoda", logo: `${MODELE_LOGO_BASE}/omoda.jpg`, aliases: ["omoda"] },
  { slug: "seres", apiName: "Seres", displayName: "Seres", logo: `${MODELE_LOGO_BASE}/seres.jpg`, aliases: ["seres"] },
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

const API_NAME_TO_META = new Map<string, BrandMeta>();
BRAND_DEFINITIONS.forEach((b) => API_NAME_TO_META.set(b.apiName, b));

/**
 * Zwraca nazwę marki do zapytań do bazy (np. "BMW" zamiast "Bmw").
 * Gdy dbName jest ustawione w definicji marki, zwraca je; w przeciwnym razie apiName.
 */
export function mapApiNameToDbName(apiName?: string | null): string | null {
  if (!apiName) return null;
  const meta = API_NAME_TO_META.get(apiName);
  return meta?.dbName ?? meta?.apiName ?? apiName;
}

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



