import type { CarGenerationApiResponse, CarModelApiResponse } from "@/lib/types/api"
import { brandMatchToken } from "@/shared/brands/brandNormalizer"
import {
  buildVehicleDisplayLabels,
  formatBodyTypeDisplayPl,
  formatBrandDisplayName,
  formatModelFamilyDisplayName,
  formatVehicleSearchResultLabel,
  formatYearRangeDisplay,
  inferBodyTypeKeyFromValue,
} from "@/shared/vehicle/displayLabels"
import type { MatTemplateDbRow } from "../server/repository"
import { getBodyTypes } from "../server/catalogMappers"

const currentYear = () => new Date().getFullYear()

const expandYears = (from: number | null, to: number | null): number[] => {
  if (from == null) return []
  const end = Math.min(to ?? currentYear() + 1, 2100)
  return Array.from({ length: end - from + 1 }, (_, index) => from + index)
}

const collectBodyTypeLabels = (row: MatTemplateDbRow): string[] => {
  const labels = [row.body_type_1, row.body_type_2, row.body_type_3, row.body_type]
    .filter((value): value is string => typeof value === "string" && value.length > 0)
  return [...new Set(labels)]
}

const isCurrentlyProduced = (row: MatTemplateDbRow): boolean => {
  if (row.is_open_ended) return true
  if (row.year_to == null) return true
  return row.year_to >= currentYear()
}

export const groupTemplatesToCarModels = (
  rows: MatTemplateDbRow[],
): CarModelApiResponse[] => {
  const grouped = new Map<
    string,
    {
      brand: string
      model: string
      modelFamilyKey: string
      generations: CarGenerationApiResponse[]
      bodyTypes: Set<string>
      years: Set<number>
      isCurrentlyProduced: boolean
    }
  >()

  rows.forEach((row) => {
    const key = `${row.brand_key}|${row.model_family_key}`
    const existing = grouped.get(key) ?? {
      brand: row.brand_name,
      model: row.model_family_name,
      modelFamilyKey: row.model_family_key,
      generations: [],
      bodyTypes: new Set<string>(),
      years: new Set<number>(),
      isCurrentlyProduced: false,
    }

    const bodyTypes = getBodyTypes(row)
    const resolvedBodyTypes =
      bodyTypes.length > 0
        ? bodyTypes
        : [
            {
              key: inferBodyTypeKeyFromValue(row.body_type ?? row.body_type_1 ?? ""),
              label: row.body_type ?? row.body_type_1 ?? "",
              displayLabel: formatBodyTypeDisplayPl(row.body_type ?? row.body_type_1 ?? ""),
            },
          ].filter((item) => item.key.length > 0 || item.label.length > 0)

    resolvedBodyTypes.forEach((bodyTypeOption) => {
      const bodyTypeLabel = bodyTypeOption.label || bodyTypeOption.key
      const labels = buildVehicleDisplayLabels({
        brandName: row.brand_name,
        modelFamilyName: row.model_family_name,
        modelFamilyKey: row.model_family_key,
        modelKey: row.model_key,
        generation: row.generation,
        yearFrom: row.year_from,
        yearTo: row.year_to,
        isOpenEnded: row.is_open_ended,
        bodyType: bodyTypeLabel,
      })

      existing.generations.push({
        generation: row.generation,
        generationDisplay: labels.yearRangeDisplay,
        generationNumberDisplay: labels.generationNumberDisplay,
        modelDisplay: labels.modelDisplay,
        modelKey: row.model_key,
        bodyType: bodyTypeOption.key || bodyTypeLabel,
        bodyTypeDisplay:
          bodyTypeOption.displayLabel || labels.bodyTypeDisplay,
        yearFrom: row.year_from,
        yearTo: row.year_to,
        isCurrentlyProduced: isCurrentlyProduced(row),
      })

      const bodyTypeToken = bodyTypeOption.key || bodyTypeLabel
      if (bodyTypeToken) existing.bodyTypes.add(bodyTypeToken)
    })

    expandYears(row.year_from, row.year_to).forEach((year) => existing.years.add(year))
    if (isCurrentlyProduced(row)) existing.isCurrentlyProduced = true

    grouped.set(key, existing)
  })

  return [...grouped.values()]
    .map((item) => {
      const representativeModelKey = item.generations[0]?.modelKey ?? ""
      return {
        brand: item.brand,
        brandDisplay: formatBrandDisplayName(item.brand),
        model: item.model,
        modelFamilyKey: item.modelFamilyKey,
        modelDisplay: formatModelFamilyDisplayName(
          item.model,
          item.modelFamilyKey,
          representativeModelKey,
        ),
        bodyTypes: [...item.bodyTypes].sort(),
        bodyTypesDisplay: [...item.bodyTypes]
          .map((bodyType) => formatBodyTypeDisplayPl(bodyType))
          .sort(),
        years: [...item.years].sort((left, right) => right - left),
        isCurrentlyProduced: item.isCurrentlyProduced,
        generations: item.generations,
      }
    })
    .sort((left, right) => left.model.localeCompare(right.model, "pl"))
}

export type CatalogSearchBrand = {
  key: string
  name: string
}

export type CatalogSearchModel = {
  brandKey: string
  brand: string
  modelFamilyKey: string
  model: string
  modelKey: string
  displayName: string
  displayLabel: string
  generation: string
  bodyType: string
  bodyTypeDisplay: string
  bodyTypes: string[]
  isCurrentlyProduced: boolean
}

export const collectUniqueBrandsFromRows = (
  rows: MatTemplateDbRow[],
): CatalogSearchBrand[] => {
  const brands = new Map<string, CatalogSearchBrand>()

  rows.forEach((row) => {
    const token = brandMatchToken(row.brand_name || row.brand_key)
    if (!token) return

    const cleanKey = row.brand_key.trim()
    const cleanName = row.brand_name.trim()
    const existing = brands.get(token)

    if (!existing) {
      brands.set(token, { key: cleanKey, name: cleanName })
      return
    }

    const rowIsClean =
      row.brand_key === cleanKey && row.brand_name === cleanName
    if (rowIsClean) {
      brands.set(token, { key: cleanKey, name: cleanName })
    }
  })

  return [...brands.values()]
}

export const extractSearchBrands = (
  rows: MatTemplateDbRow[],
  limit = 10,
): CatalogSearchBrand[] => {
  return collectUniqueBrandsFromRows(rows).slice(0, limit)
}

export const extractSearchModels = (
  rows: MatTemplateDbRow[],
  limit = 15,
): CatalogSearchModel[] => {
  const variants = new Map<string, CatalogSearchModel>()

  rows.forEach((row) => {
    const primaryBodyType =
      row.body_type_1 ??
      row.body_type ??
      collectBodyTypeLabels(row)[0] ??
      ""
    const bodyTypeKey =
      row.body_type_1_key?.trim() ||
      inferBodyTypeKeyFromValue(primaryBodyType)

    const labels = buildVehicleDisplayLabels({
      brandName: row.brand_name,
      modelFamilyName: row.model_family_name,
      modelFamilyKey: row.model_family_key,
      modelKey: row.model_key,
      generation: row.generation,
      yearFrom: row.year_from,
      yearTo: row.year_to,
      isOpenEnded: row.is_open_ended,
      bodyType: primaryBodyType,
    })

    const key = row.record_key
    if (variants.has(key)) return

    variants.set(key, {
      brandKey: row.brand_key,
      brand: formatBrandDisplayName(row.brand_name),
      modelFamilyKey: row.model_family_key,
      model: row.model_family_name,
      modelKey: row.model_key,
      displayName: formatModelFamilyDisplayName(
        row.model_family_name,
        row.model_family_key,
        row.model_key,
      ),
      displayLabel: formatVehicleSearchResultLabel(labels),
      generation: row.generation,
      bodyType: bodyTypeKey || primaryBodyType,
      bodyTypeDisplay: labels.bodyTypeDisplay,
      bodyTypes: collectBodyTypeLabels(row)
        .map((label) => formatBodyTypeDisplayPl(label))
        .sort(),
      isCurrentlyProduced: isCurrentlyProduced(row),
    })
  })

  return [...variants.values()].slice(0, limit)
}
