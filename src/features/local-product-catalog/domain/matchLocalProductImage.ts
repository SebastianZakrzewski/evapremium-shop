import {
  normalizeLocalBodyType,
  parseVehicleQuery,
  type LocalProductCard,
} from "./parseLocalProductCard"

export type LocalProductImageQuery = {
  brand: string
  model: string
  modelKey?: string
  generation?: string
  bodyType?: string
  year?: number
  yearFrom?: number | null
  yearTo?: number | null
}

const yearsOverlap = (
  leftFrom: number | null,
  leftTo: number | null,
  rightFrom: number | null,
  rightTo: number | null,
): boolean => {
  if (leftFrom == null || rightFrom == null) return true
  const leftEnd = leftTo ?? leftFrom
  const rightEnd = rightTo ?? rightFrom
  return leftFrom <= rightEnd && rightFrom <= leftEnd
}

export const matchLocalProductImage = (
  cards: LocalProductCard[],
  query: LocalProductImageQuery,
): LocalProductCard | null => {
  const brand = query.brand.trim().toLowerCase()
  if (brand && brand !== "bmw" && brand !== "bmw.") return null

  const haystack = [query.model, query.modelKey, query.generation]
    .filter(Boolean)
    .join(" ")
  const parsedQuery = parseVehicleQuery(haystack)
  if (!parsedQuery.series) return null

  const queryBody = query.bodyType ? normalizeLocalBodyType(query.bodyType) : ""
  const queryYearFrom = query.yearFrom ?? query.year ?? parsedQuery.yearFrom
  const queryYearTo = query.yearTo ?? query.year ?? parsedQuery.yearTo

  let best: { card: LocalProductCard; score: number } | null = null

  for (const card of cards) {
    if (card.series !== parsedQuery.series) continue
    if (card.isMVariant !== parsedQuery.isMVariant) continue

    const extrasDiffer =
      parsedQuery.extras.join("|") !== card.extras.join("|")
    const chassisOverlap = parsedQuery.chassisCodes.filter((code) =>
      card.chassisCodes.includes(code),
    )
    const queryHasChassis = parsedQuery.chassisCodes.length > 0
    const cardHasChassis = card.chassisCodes.length > 0

    if (queryHasChassis && cardHasChassis && chassisOverlap.length === 0) continue
    if (extrasDiffer && chassisOverlap.length === 0) continue

    if (
      queryBody &&
      card.bodyType &&
      queryBody !== card.bodyType &&
      chassisOverlap.length === 0
    ) {
      continue
    }
    if (
      !yearsOverlap(queryYearFrom ?? null, queryYearTo ?? null, card.yearFrom, card.yearTo)
    ) {
      continue
    }

    let score = 10
    if (chassisOverlap.length > 0) score += 100
    if (queryBody && card.bodyType === queryBody) score += 40
    if (queryYearFrom && card.yearFrom) score += 30
    if (
      parsedQuery.generationNumber != null &&
      parsedQuery.generationNumber === card.generationNumber
    ) {
      score += 20
    }
    if (!extrasDiffer) score += 15

    if (!best || score > best.score) {
      best = { card, score }
    }
  }

  return best?.card ?? null
}
