import { getBrandMetaBySlug, mapSlugToCanonicalBrand, MODELE_IMAGE_MAP, BrandMeta } from './brandNormalizer';

/**
 * Brand mapping information
 */
export interface BrandMappingInfo {
  displayName: string;
  logo: string;
  apiName: string;
}

/**
 * Get brand mapping information by slug
 * 
 * @param brandSlug - Brand slug from URL (e.g., "bmw", "mercedes-benz")
 * @returns Brand mapping info or null if not found
 * 
 * @example
 * ```ts
 * const info = getBrandInfo("bmw");
 * // { displayName: "BMW", logo: "/images/products/bmw.png", apiName: "Bmw" }
 * ```
 */
export function getBrandInfo(brandSlug: string): BrandMappingInfo | null {
  if (!brandSlug) {
    return null;
  }

  const meta = getBrandMetaBySlug(brandSlug);
  if (!meta) {
    return null;
  }

  const logoFromMap = MODELE_IMAGE_MAP[meta.slug.replace(/-/g, '_')];
  return {
    displayName: meta.displayName,
    logo: meta.logo || (logoFromMap ? `/modele/${logoFromMap}` : `/modele/${meta.slug.replace(/-/g, '_')}.jpg`),
    apiName: meta.apiName,
  };
}

/**
 * Normalize brand name from URL slug to API format
 * 
 * @param brandSlug - Brand slug from URL
 * @returns Normalized API name or null if not found
 * 
 * @example
 * ```ts
 * normalizeBrandName("mercedes-benz"); // "Mercedes-Benz"
 * normalizeBrandName("vw"); // "Volkswagen"
 * ```
 */
export function normalizeBrandName(brandSlug: string): string | null {
  return mapSlugToCanonicalBrand(brandSlug);
}

/**
 * Get brand display name by slug
 * 
 * @param brandSlug - Brand slug from URL
 * @returns Display name or null if not found
 */
export function getBrandDisplayName(brandSlug: string): string | null {
  const info = getBrandInfo(brandSlug);
  return info?.displayName || null;
}

/**
 * Get brand logo path by slug
 * 
 * @param brandSlug - Brand slug from URL
 * @returns Logo path or null if not found
 */
export function getBrandLogo(brandSlug: string): string | null {
  const info = getBrandInfo(brandSlug);
  return info?.logo || null;
}

/**
 * Get brand API name by slug
 * 
 * @param brandSlug - Brand slug from URL
 * @returns API name or null if not found
 */
export function getBrandApiName(brandSlug: string): string | null {
  return normalizeBrandName(brandSlug);
}

const titleCaseBrandName = (brandName: string): string =>
  brandName
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

/**
 * Mapuje nazwę marki z bazy (np. "Ssang Young") na nazwę wyświetlaną w UI (np. "SsangYong").
 */
export function resolveBrandDisplayNameFromDbName(dbBrandName: string): string {
  const meta = getBrandMetaBySlug(dbBrandName)
  return meta?.displayName ?? titleCaseBrandName(dbBrandName)
}

/**
 * Zwraca kanoniczny slug marki na podstawie nazwy z bazy — do deduplikacji list marek.
 */
export function resolveBrandSlugFromDbName(dbBrandName: string): string {
  const meta = getBrandMetaBySlug(dbBrandName)
  if (meta) {
    return meta.slug
  }
  return brandNameToSlug(dbBrandName)
}

/**
 * Normalizuje obiekt marki z API do spójnej nazwy wyświetlanej w UI.
 */
export function normalizeBrandForClient<T extends { name: string; logo?: string; description?: string }>(brand: T): T {
  const name = resolveBrandDisplayNameFromDbName(brand.name)
  const logo = resolveBrandLogo(brand.name, brand.logo ?? null)
  return {
    ...brand,
    name,
    logo,
    description: brand.description?.includes(brand.name)
      ? brand.description.replace(brand.name, name)
      : `Dywaniki samochodowe dla marki ${name}`,
  }
}

/**
 * Konwertuje nazwę marki na slug do wyszukiwania w mapowaniu
 * np. "Alfa Romeo" -> "alfa-romeo", "Mercedes-Benz" -> "mercedes-benz"
 */
function brandNameToSlug(brandName: string): string {
  return brandName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Konwertuje slug na nazwę pliku w katalogu modele (np. "alfa-romeo" -> "alfa_romeo")
 */
function slugToModeleFilename(slug: string): string {
  return slug.replace(/-/g, '_');
}

/**
 * Rozwiązuje ścieżkę logo dla marki.
 * Priorytet: 1) mapowanie marek (brandNormalizer), 2) brand_image z bazy, 3) fallback /modele/{slug}.jpg
 * Zdjęcia marek znajdują się w katalogu public/modele/
 *
 * @param brandName - Nazwa marki (np. "BMW", "Alfa Romeo")
 * @param dbBrandImage - Wartość brand_image z bazy (może być null/undefined)
 * @returns Ścieżka do logo
 */
export function resolveBrandLogo(
  brandName: string,
  dbBrandImage?: string | null
): string {
  const slug = brandNameToSlug(brandName);
  const meta = getBrandMetaBySlug(slug);
  if (meta?.logo) {
    return meta.logo;
  }
  if (dbBrandImage && dbBrandImage.trim().length > 0) {
    return dbBrandImage;
  }
  const slugUnderscore = slugToModeleFilename(slug);
  const filename = MODELE_IMAGE_MAP[slugUnderscore];
  if (filename) {
    return `/modele/${filename}`;
  }
  return `/modele/${slugUnderscore}.jpg`;
}




















