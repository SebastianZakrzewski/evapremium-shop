import type { CarGenerationApiResponse } from "@/lib/types/api"

export const expandYearRange = (
  yearFrom?: number | null,
  yearTo?: number | null
): number[] => {
  const years: number[] = []
  if (yearFrom != null && yearTo != null) {
    for (let y = yearFrom; y <= yearTo; y++) years.push(y)
  } else if (yearFrom != null) {
    years.push(yearFrom)
  } else if (yearTo != null) {
    years.push(yearTo)
  }
  return years
}

/**
 * Zwraca posortowane roczniki (malejąco) z generacji modelu.
 * Gdy podano etykietę generacji — tylko z tej generacji.
 */
export const getYearsFromGenerations = (
  generations: CarGenerationApiResponse[],
  generationLabel?: string | null
): number[] => {
  const years = new Set<number>()
  const normalized = generationLabel?.trim().toLowerCase()

  for (const gen of generations) {
    if (normalized) {
      if (gen.generation?.trim().toLowerCase() !== normalized) continue
    }
    for (const year of expandYearRange(gen.yearFrom, gen.yearTo)) {
      years.add(year)
    }
  }

  return Array.from(years).sort((a, b) => b - a)
}
