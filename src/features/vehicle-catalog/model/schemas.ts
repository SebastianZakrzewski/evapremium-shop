import { z } from "zod"

export const SELLABLE_PRICING_CATEGORIES = [
  "passenger_car",
  "premium_passenger_car",
  "minivan",
  "bus",
  "pickup",
] as const

/** Surowe etykiety z Excela — bez trim (np. „A290 1 gen ”, „Alpine ”). */
const rawCatalogLabel = z.string().min(1)

export const CatalogQuerySchema = z.object({
  brandKey: z.string().trim().min(1).optional(),
  modelParam: z.string().trim().min(1).optional(),
  modelFamilyKey: rawCatalogLabel.optional(),
  modelFamilyPrefix: rawCatalogLabel.optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
})

export const PricingResolveSchema = z.object({
  recordKey: z.string().trim().min(1),
  year: z.number().int().min(1900).max(2100),
  bodyTypeKey: z.string().trim().min(1),
  matType: z.enum(["classic", "3d-with-rims", "single"]).optional(),
  variantKey: z.string().trim().min(1).optional(),
})

export type CatalogQuery = z.infer<typeof CatalogQuerySchema>
export type PricingResolveInput = z.infer<typeof PricingResolveSchema>

export type VehicleCatalogBrand = {
  key: string
  name: string
  displayName: string
}

export type VehicleModelFamily = {
  key: string
  name: string
  displayName: string
}

export type VehicleBodyTypeOption = {
  key: string
  label: string
  displayLabel: string
}

export type VehicleTemplateOption = {
  id: string
  recordKey: string
  modelKey: string
  modelName: string
  modelNameDisplay: string
  generation: string
  generationDisplay: string
  generationNumberDisplay: string | null
  yearFrom: number | null
  yearTo: number | null
  isOpenEnded: boolean
  bodyTypes: VehicleBodyTypeOption[]
  bodyTypeKey: string | null
  bodyTypeDisplay: string | null
  pricingCategoryKey: string
}

export type PricingVariantOption = {
  key: string
  label: string
  basePrice: number
  priceAfterDiscount: number
  discount: number
}
