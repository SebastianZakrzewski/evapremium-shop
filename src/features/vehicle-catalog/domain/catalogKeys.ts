import { normalizeBodyTypeKey } from "@/shared"
import {
  brandMatchToken,
  brandMetaToCatalogKey,
  getBrandMetaBySlug,
} from "@/shared/brands/brandNormalizer"
import { deriveModelFamily } from "./modelFamily"

type CatalogBrand = {
  key: string
  name: string
}

export type CatalogModelFamily = {
  key: string
  name: string
}

export const normalizeCatalogToken = (value: string): string =>
  value.toLowerCase().replace(/[\s_-]+/g, "")

/** URL slug / display name → klucz katalogu w mat_templates (np. alfa-romeo → alfa_romeo). */
export const brandParamToCatalogKey = (brandParam: string): string => {
  const trimmed = brandParam.trim()
  if (!trimmed) return ""

  const meta = getBrandMetaBySlug(trimmed)
  if (meta) return brandMetaToCatalogKey(meta)

  return trimmed
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
}

const modelFamilyDisplayName = (modelFamilyKey: string, fallbackName: string): string => {
  const derived = deriveModelFamily(modelFamilyKey)
  if (derived.name.trim()) return derived.name
  return fallbackName
}

const scoreModelFamilyMatch = (
  item: CatalogModelFamily,
  param: string,
  token: string,
): number => {
  const keyToken = normalizeCatalogToken(item.key)
  const nameToken = normalizeCatalogToken(item.name)
  const derived = deriveModelFamily(item.key)
  const derivedKeyToken = normalizeCatalogToken(derived.key)
  const derivedNameToken = normalizeCatalogToken(derived.name)

  if (item.key.toLowerCase() === param.toLowerCase()) return 100
  if (item.name.toLowerCase() === param.toLowerCase()) return 100
  if (keyToken === token) return 100
  if (nameToken === token) return 100
  if (derivedKeyToken === token) return 95
  if (derivedNameToken === token) return 95
  if (token.length >= 3 && keyToken.startsWith(token)) return 70
  if (token.length >= 3 && derivedKeyToken.startsWith(token)) return 65
  return 0
}

export type ModelFamilyResolution =
  | { mode: "none" }
  | { mode: "single"; family: CatalogModelFamily; displayName: string }
  | {
      mode: "prefix"
      prefix: string
      families: CatalogModelFamily[]
      displayName: string
    }

export const resolveModelFamiliesFromParam = (
  modelParam: string,
  models: CatalogModelFamily[],
): ModelFamilyResolution => {
  const param = modelParam.trim()
  if (!param || models.length === 0) return { mode: "none" }

  const exactMatches = models.filter(
    (item) =>
      item.key.trim().toLowerCase() === param.trim().toLowerCase() ||
      item.name.trim().toLowerCase() === param.trim().toLowerCase(),
  )
  if (exactMatches.length >= 1) {
    const family = exactMatches[0]
    return {
      mode: "single",
      family,
      displayName: modelFamilyDisplayName(family.key, family.name),
    }
  }

  const token = normalizeCatalogToken(param)
  const ranked = models
    .map((item) => ({ item, score: scoreModelFamilyMatch(item, param, token) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)

  if (ranked.length === 0) return { mode: "none" }

  const topScore = ranked[0].score
  const topMatches = ranked.filter((entry) => entry.score === topScore)

  if (topMatches.length === 1) {
    const family = topMatches[0].item
    return {
      mode: "single",
      family,
      displayName: modelFamilyDisplayName(family.key, family.name),
    }
  }

  const sharedDerivedFamilyKey = deriveModelFamily(topMatches[0].item.key).key
  const allShareDerivedFamily = topMatches.every(
    (entry) => deriveModelFamily(entry.item.key).key === sharedDerivedFamilyKey,
  )

  if (allShareDerivedFamily) {
    return {
      mode: "prefix",
      prefix: sharedDerivedFamilyKey,
      families: topMatches.map((entry) => entry.item),
      displayName: modelFamilyDisplayName(topMatches[0].item.key, sharedDerivedFamilyKey),
    }
  }

  const prefix = param.toLowerCase().replace(/\s+/g, "_")
  const prefixFamilies = models.filter((item) => {
    const keyToken = normalizeCatalogToken(item.key)
    const derivedKeyToken = normalizeCatalogToken(deriveModelFamily(item.key).key)
    const prefixToken = normalizeCatalogToken(prefix)
    return keyToken.startsWith(prefixToken) || derivedKeyToken.startsWith(prefixToken)
  })

  if (prefixFamilies.length === 1) {
    const family = prefixFamilies[0]
    return {
      mode: "single",
      family,
      displayName: modelFamilyDisplayName(family.key, family.name),
    }
  }

  if (prefixFamilies.length > 1) {
    return {
      mode: "prefix",
      prefix,
      families: prefixFamilies,
      displayName: modelFamilyDisplayName(prefixFamilies[0].key, param),
    }
  }

  return { mode: "none" }
}

export const resolveCatalogBrandKey = (
  brandParam: string | null | undefined,
  storedBrandKey: string | null | undefined,
  catalogBrands: CatalogBrand[],
): string => {
  const candidates = [
    storedBrandKey?.trim(),
    brandParam?.trim(),
  ].filter((value): value is string => Boolean(value))

  const findByToken = (candidate: string): CatalogBrand | undefined => {
    const token = brandMatchToken(candidate)
    if (!token) return undefined
    return catalogBrands.find((brand) => {
      const keyToken = brandMatchToken(brand.key)
      const nameToken = brandMatchToken(brand.name)
      return keyToken === token || nameToken === token
    })
  }

  for (const candidate of candidates) {
    const normalizedCandidate = brandParamToCatalogKey(candidate)
    const byKey = catalogBrands.find(
      (brand) =>
        brand.key.trim().toLowerCase() === normalizedCandidate.trim().toLowerCase(),
    )
    if (byKey) return byKey.key

    const byName = catalogBrands.find(
      (brand) =>
        brand.name.trim().toLowerCase() === candidate.trim().toLowerCase(),
    )
    if (byName) return byName.key

    const byToken = findByToken(candidate)
    if (byToken) return byToken.key

    const meta = getBrandMetaBySlug(candidate)
    if (meta) {
      const byMetaName = catalogBrands.find(
        (brand) =>
          brand.name.trim().toLowerCase() === meta.apiName.trim().toLowerCase() ||
          brand.key.trim().toLowerCase() === meta.apiName.trim().toLowerCase(),
      )
      if (byMetaName) return byMetaName.key

      const byMetaToken = findByToken(meta.apiName)
      if (byMetaToken) return byMetaToken.key
    }
  }

  if (brandParam?.trim()) {
    const fallbackToken = findByToken(brandParam)
    if (fallbackToken) return fallbackToken.key
    return brandParamToCatalogKey(brandParam)
  }

  return ""
}

export const bodyTypeMatchesParam = (
  bodyType: { key: string; label: string },
  bodyTypeParam: string,
): boolean => {
  const param = bodyTypeParam.trim().toLowerCase()
  if (!param) return false

  const key = bodyType.key.trim().toLowerCase()
  const label = bodyType.label.trim().toLowerCase()

  if (key === param || label === param) return true

  return (
    normalizeBodyTypeKey(bodyType.key) === normalizeBodyTypeKey(bodyTypeParam) ||
    normalizeBodyTypeKey(bodyType.label) === normalizeBodyTypeKey(bodyTypeParam)
  )
}
