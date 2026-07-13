import "server-only"
import type { MatTemplateDbRow } from "./repository"
import {
  getMatTemplates,
  resolveBrandKeyFromParam,
} from "./repository"

const currentYear = () => new Date().getFullYear()

const normalizeToken = (value: string): string =>
  value.toLowerCase().replace(/[\s_-]+/g, "")

const collectBodyTypeLabels = (row: MatTemplateDbRow): string[] => {
  const labels = [row.body_type_1, row.body_type_2, row.body_type_3, row.body_type]
    .filter((value): value is string => typeof value === "string" && value.length > 0)
  return [...new Set(labels)]
}

const expandYears = (from: number | null, to: number | null): number[] => {
  if (from == null) return []
  const end = Math.min(to ?? currentYear() + 1, 2100)
  return Array.from({ length: end - from + 1 }, (_, index) => from + index)
}

const isCurrentlyProduced = (row: MatTemplateDbRow): boolean => {
  if (row.is_open_ended) return true
  if (row.year_to == null) return true
  return row.year_to >= currentYear()
}

const matchesModelParam = (row: MatTemplateDbRow, modelParam: string): boolean => {
  const token = normalizeToken(modelParam)
  return (
    normalizeToken(row.model_family_name) === token ||
    normalizeToken(row.model_family_key) === token ||
    normalizeToken(row.model_name) === token ||
    normalizeToken(row.model_key) === token ||
    row.model_family_name.toLowerCase() === modelParam.toLowerCase() ||
    row.model_name.toLowerCase() === modelParam.toLowerCase()
  )
}

type LegacyGeneration = {
  brand: string
  model: string
  generation: string | null
  yearFrom: number | null
  yearTo: number | null
  isCurrentlyProduced: boolean | null
  bodyTypes: string[]
  years: number[]
}

const groupLegacyGenerations = (
  rows: MatTemplateDbRow[],
  brandLabel: string,
  modelLabel: string,
): LegacyGeneration[] => {
  const grouped = new Map<string, LegacyGeneration>()

  rows.forEach((row) => {
    const key = `${row.model_key}|${row.generation}`
    const existing = grouped.get(key) ?? {
      brand: brandLabel,
      model: modelLabel,
      generation: row.generation,
      yearFrom: row.year_from,
      yearTo: row.year_to,
      isCurrentlyProduced: false,
      bodyTypes: [],
      years: [],
    }

    const bodyTypes = new Set([...existing.bodyTypes, ...collectBodyTypeLabels(row)])
    const years = new Set([
      ...existing.years,
      ...expandYears(row.year_from, row.year_to),
    ])

    grouped.set(key, {
      ...existing,
      yearFrom:
        existing.yearFrom == null
          ? row.year_from
          : row.year_from == null
            ? existing.yearFrom
            : Math.min(existing.yearFrom, row.year_from),
      yearTo:
        existing.yearTo == null
          ? row.year_to
          : row.year_to == null
            ? existing.yearTo
            : Math.max(existing.yearTo ?? row.year_to, row.year_to ?? 0),
      isCurrentlyProduced:
        existing.isCurrentlyProduced || isCurrentlyProduced(row),
      bodyTypes: [...bodyTypes].sort(),
      years: [...years].sort((left, right) => right - left),
    })
  })

  return [...grouped.values()].sort((left, right) =>
    (right.yearFrom ?? 0) - (left.yearFrom ?? 0),
  )
}

export const getLegacyGenerations = async (filters: {
  brand?: string
  model?: string
  bodyType?: string
  yearFrom?: number
  yearTo?: number
  isCurrentlyProduced?: boolean
}): Promise<LegacyGeneration[]> => {
  const brandKey = filters.brand
    ? await resolveBrandKeyFromParam(filters.brand)
    : null
  if (filters.brand && !brandKey) return []

  const rows = await getMatTemplates(brandKey ? { brandKey } : {})
  const filteredRows = filters.model
    ? rows.filter((row) => matchesModelParam(row, filters.model!))
    : rows

  if (filteredRows.length === 0) return []

  const brandLabel = filteredRows[0]?.brand_name ?? filters.brand ?? ""
  const modelLabel = filters.model
    ? filteredRows[0]?.model_family_name ?? filters.model
    : filteredRows[0]?.model_family_name ?? ""

  if (!filters.model) {
    const byModelFamily = new Map<string, MatTemplateDbRow[]>()
    filteredRows.forEach((row) => {
      const bucket = byModelFamily.get(row.model_family_key) ?? []
      bucket.push(row)
      byModelFamily.set(row.model_family_key, bucket)
    })

    return applyLegacyGenerationFilters(
      [...byModelFamily.values()].flatMap((familyRows) =>
        groupLegacyGenerations(
          familyRows,
          familyRows[0]?.brand_name ?? brandLabel,
          familyRows[0]?.model_family_name ?? "",
        ),
      ),
      filters,
    )
  }

  return applyLegacyGenerationFilters(
    groupLegacyGenerations(filteredRows, brandLabel, modelLabel),
    filters,
  )
}

const applyLegacyGenerationFilters = (
  generations: LegacyGeneration[],
  filters: {
    bodyType?: string
    yearFrom?: number
    yearTo?: number
    isCurrentlyProduced?: boolean
  },
): LegacyGeneration[] =>
  generations.filter((generation) => {
    if (
      filters.bodyType &&
      !generation.bodyTypes.some(
        (bodyType) => bodyType.toLowerCase() === filters.bodyType!.toLowerCase(),
      )
    ) {
      return false
    }

    if (filters.yearFrom != null) {
      const generationEnd = generation.yearTo ?? currentYear() + 1
      if (generationEnd < filters.yearFrom) return false
    }

    if (filters.yearTo != null) {
      const generationStart = generation.yearFrom ?? 0
      if (generationStart > filters.yearTo) return false
    }

    if (
      filters.isCurrentlyProduced !== undefined &&
      generation.isCurrentlyProduced !== filters.isCurrentlyProduced
    ) {
      return false
    }

    return true
  })

const getBodyTypeCategory = (bodyType: string): string => {
  const lowerType = bodyType.toLowerCase()
  if (lowerType.includes("hatchback")) return "hatchback"
  if (lowerType.includes("sedan")) return "sedan"
  if (lowerType.includes("suv")) return "suv"
  if (lowerType.includes("coupe")) return "coupe"
  if (lowerType.includes("roadster") || lowerType.includes("cabrio")) {
    return "convertible"
  }
  if (lowerType.includes("kombi") || lowerType.includes("wagon")) return "wagon"
  if (lowerType.includes("van") || lowerType.includes("dostawczak")) return "van"
  if (lowerType.includes("minivan")) return "minivan"
  if (lowerType.includes("fastback") || lowerType.includes("liftback")) {
    return "fastback"
  }
  if (lowerType.includes("pickup")) return "pickup"
  return "other"
}

const getBodyTypeDescription = (bodyType: string): string => {
  const descriptions: Record<string, string> = {
    "hatchback 2drzwi": "Hatchback 2-drzwiowy",
    "hatchback 3drzwi": "Hatchback 3-drzwiowy",
    "hatchback 5drzwi": "Hatchback 5-drzwiowy",
    "hatchback 3/5drzwi": "Hatchback 3 lub 5-drzwiowy",
    hatchback: "Hatchback",
    sedan: "Sedan",
    coupe: "Coupe",
    roadster: "Roadster",
    cabrio: "Kabriolet",
    SUV: "SUV",
    "SUV 5os.": "SUV 5-osobowy",
    "SUV 7os.": "SUV 7-osobowy",
    kombi: "Kombi",
    "kombi/ sedan": "Kombi lub sedan",
    minivan: "Minivan",
    VAN: "Van",
    dostawczak: "Dostawczak",
    "van 4drzwi": "Van 4-drzwiowy",
    fastback: "Fastback",
    liftback: "Liftback",
    "shooting brake": "Shooting brake",
  }

  return descriptions[bodyType] ?? bodyType
}

export const getLegacyBodyTypes = async () => {
  const rows = await getMatTemplates()
  const labels = new Set<string>()
  rows.forEach((row) => {
    collectBodyTypeLabels(row).forEach((label) => labels.add(label))
  })

  return [...labels]
    .sort((left, right) => left.localeCompare(right, "pl"))
    .map((name, index) => ({
      id: index + 1,
      name,
      category: getBodyTypeCategory(name),
      description: getBodyTypeDescription(name),
    }))
}
