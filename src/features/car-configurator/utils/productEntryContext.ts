/**
 * Kontekst wejścia do konfiguratora z karty produktu / modelu (URL z marką i modelem).
 */
export type ProductEntryLock = {
  isLocked: boolean
  brandParam: string | null
  modelParam: string | null
  yearParam: string | null
  bodyTypeParam: string | null
  generationParam: string | null
  previewImageParam: string | null
}

export const getProductEntryLock = (
  searchParams: URLSearchParams,
): ProductEntryLock => {
  const brandParam = searchParams.get("brand")?.trim() || null
  const modelParam = searchParams.get("model")?.trim() || null

  return {
    isLocked: !!(brandParam && modelParam),
    brandParam,
    modelParam,
    yearParam: searchParams.get("year")?.trim() || null,
    bodyTypeParam: searchParams.get("bodyType")?.trim() || null,
    generationParam: searchParams.get("generation")?.trim() || null,
    previewImageParam: searchParams.get("previewImage")?.trim() || null,
  }
}

/** Rok początkowy z etykiety generacji, np. "2012-2020" → 2012, "2021+" → 2021 */
export const parseYearFromGeneration = (generation: string): number | null => {
  const trimmed = generation.trim()
  if (!trimmed) return null

  const rangeMatch = trimmed.match(/^(\d{4})-/)
  if (rangeMatch) return parseInt(rangeMatch[1], 10)

  const openMatch = trimmed.match(/^(\d{4})\+/)
  if (openMatch) return parseInt(openMatch[1], 10)

  return null
}
