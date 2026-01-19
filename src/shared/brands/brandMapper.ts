import { getBrandMetaBySlug, mapSlugToCanonicalBrand, BrandMeta } from './brandNormalizer';

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

  return {
    displayName: meta.displayName,
    logo: meta.logo || `/images/products/${meta.slug}.png`,
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




















