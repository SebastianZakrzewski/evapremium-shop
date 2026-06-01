import {
  getBrandMetaBySlug,
  humanizeBrandSlug,
  mapApiNameToDbName,
  mapSlugToCanonicalBrand,
} from './brandNormalizer'

export interface ResolvedBrandParam {
  raw: string
  slug: string
  apiName: string
  dbName: string
  displayName: string
}

/**
 * Dekoduje parametr marki z URL (obsługa %20, podwójnego kodowania).
 */
export const parseBrandFromUrl = (raw: string): string => {
  if (!raw?.trim()) return ''

  let value = raw.trim()

  for (let i = 0; i < 2; i++) {
    try {
      const decoded = decodeURIComponent(value)
      if (decoded === value) break
      value = decoded
    } catch {
      break
    }
  }

  return value.replace(/%20/gi, ' ').replace(/\s+/g, ' ').trim()
}

const toSlug = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Mapuje wartość z ?brand= / [brand] na nazwy używane w API i UI.
 */
export const resolveBrandFromUrlParam = (
  raw: string | null | undefined
): ResolvedBrandParam | null => {
  const parsed = parseBrandFromUrl(raw ?? '')
  if (!parsed) return null

  const meta = getBrandMetaBySlug(parsed)
  const canonical = mapSlugToCanonicalBrand(parsed)
  const apiName = canonical ?? meta?.apiName ?? humanizeBrandSlug(parsed)
  const displayName = meta?.displayName ?? humanizeBrandSlug(parsed)
  const dbName = mapApiNameToDbName(apiName) ?? humanizeBrandSlug(parsed)
  const slug = meta?.slug ?? toSlug(parsed)

  return {
    raw: parsed,
    slug,
    apiName,
    dbName,
    displayName,
  }
}

/**
 * Slug do nawigacji (?brand= / [brand]) — preferuje alias z mapowania marek.
 */
export const brandNameToNavigationSlug = (brandName: string): string => {
  const resolved = resolveBrandFromUrlParam(brandName)
  return resolved?.slug ?? toSlug(brandName)
}
