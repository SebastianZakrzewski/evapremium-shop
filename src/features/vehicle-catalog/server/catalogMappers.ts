import {
  buildVehicleDisplayLabels,
  formatBodyTypeDisplayPl,
  formatBrandDisplayName,
  formatModelFamilyDisplayName,
  inferBodyTypeKeyFromValue,
} from "@/shared/vehicle/displayLabels"
import type { MatTemplateDbRow } from "./repository"

const uniqueByKey = <T extends { key: string }>(items: T[]): T[] =>
  [...new Map(items.map((item) => [item.key, item])).values()]

const resolveBodyTypeKey = (keyValue: string | null, labelValue: string | null): string => {
  if (keyValue?.trim()) return keyValue.trim().toLowerCase()
  if (labelValue?.trim()) return inferBodyTypeKeyFromValue(labelValue)
  return ""
}

export const getBodyTypes = (
  row: MatTemplateDbRow,
): Array<{ key: string; label: string; displayLabel: string }> => {
  const slots = [
    [row.body_type_1_key, row.body_type_1],
    [row.body_type_2_key, row.body_type_2],
    [row.body_type_3_key, row.body_type_3],
  ]

  return uniqueByKey(
    slots
      .filter((slot): slot is [string | null, string] => typeof slot[1] === "string" && slot[1].length > 0)
      .map(([keyValue, labelValue]) => {
        const key = resolveBodyTypeKey(keyValue, labelValue)
        return {
          key,
          label: labelValue,
          displayLabel: formatBodyTypeDisplayPl(labelValue),
        }
      })
      .filter((item) => item.key.length > 0),
  )
}

export const toTemplateOption = (row: MatTemplateDbRow) => {
  const bodyTypes = getBodyTypes(row)
  const primaryBodyType = bodyTypes[0]?.label ?? row.body_type ?? row.body_type_1 ?? ""
  const labels = buildVehicleDisplayLabels({
    brandName: row.brand_name,
    modelFamilyName: row.model_family_name,
    modelFamilyKey: row.model_family_key,
    modelKey: row.model_key,
    modelName: row.model_name,
    generation: row.generation,
    yearFrom: row.year_from,
    yearTo: row.year_to,
    isOpenEnded: row.is_open_ended,
    bodyType: primaryBodyType,
  })

  return {
    id: row.id,
    recordKey: row.record_key,
    modelKey: row.model_key,
    modelName: row.model_name,
    modelNameDisplay: labels.modelDisplay,
    generation: row.generation,
    generationDisplay: labels.yearRangeDisplay,
    generationNumberDisplay: labels.generationNumberDisplay,
    yearFrom: row.year_from,
    yearTo: row.year_to,
    isOpenEnded: row.is_open_ended,
    bodyTypes,
    bodyTypeKey: row.body_type_key ?? bodyTypes[0]?.key ?? null,
    bodyTypeDisplay: labels.bodyTypeDisplay || null,
    pricingCategoryKey: row.dealer_pricing_category_key,
  }
}

export const toCatalogBrand = (row: MatTemplateDbRow) => ({
  key: row.brand_key,
  name: row.brand_name,
  displayName: formatBrandDisplayName(row.brand_name),
})

export const toModelFamily = (row: MatTemplateDbRow) => ({
  key: row.model_family_key,
  name: row.model_family_name,
  displayName: formatModelFamilyDisplayName(
    row.model_family_name,
    row.model_family_key,
    row.model_key,
  ),
})
