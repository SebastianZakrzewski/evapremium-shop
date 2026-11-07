import { GEARBOX_OPTIONS } from "@/features/car-configurator/domain/gearbox"
import { getAvailableColors, getColorInfo } from "@/lib/color-mapping"
import { getVariantPresentation } from "@/components/configurator/configurator-simple/variantPresentation"
import type { PricingVariantOption } from "@/features/vehicle-catalog/model/schemas"
import { matTypeOptions } from "../mat-type/matTypePresentation"
import { cellStructureOptions } from "../structure/cellStructurePresentation"

type SearchIndexInput = {
  brand: string
  model: string
  year: string
  gearbox: string
  bodyType: string
  matType: "3d-with-rims" | "classic" | "single"
  structure: "diamonds" | "honey"
  availableMatTypes: Array<"classic" | "3d-with-rims" | "single">
  pricingVariants: PricingVariantOption[]
  pricingCategoryKey?: string
  bodyTypeKey?: string
}

const colorTerms = (keys: readonly string[]): string[] =>
  keys.flatMap((key) => [key, getColorInfo(key).name])

export const buildConfiguratorSearchIndex = (
  input: SearchIndexInput,
): Record<string, string[]> => {
  const matTypes = matTypeOptions.filter(
    (type) => !input.availableMatTypes.length || input.availableMatTypes.includes(type.id),
  )
  const offeredKeys = input.pricingVariants.map((variant) => variant.key)

  return {
    "section-vehicle": [
      input.brand,
      input.model,
      input.year,
      input.gearbox,
      input.bodyType,
      ...GEARBOX_OPTIONS.map((option) => option.label),
    ].filter(Boolean),
    "section-matType": matTypes.flatMap((type) => [type.name, type.description]),
    "section-variant": input.pricingVariants.flatMap((variant) => {
      const presentation = getVariantPresentation(
        variant.key,
        input.pricingCategoryKey,
        input.bodyTypeKey,
        { offeredVariantKeys: offeredKeys },
      )
      return [variant.key, variant.label, presentation.name ?? "", presentation.description]
    }),
    "section-structure": cellStructureOptions.flatMap((option) => [
      option.id,
      option.name,
      option.description,
    ]),
    "section-color": colorTerms(
      getAvailableColors(input.structure, "material"),
    ),
    "section-edgeColor": colorTerms(
      getAvailableColors(input.structure, "border"),
    ),
    "section-accessories": [],
  }
}
