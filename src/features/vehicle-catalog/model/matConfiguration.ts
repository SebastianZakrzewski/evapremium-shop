import { z } from "zod"

/** Optional catalog string — empty values are treated as missing. */
const optionalNonEmptyString = () =>
  z.preprocess((value) => {
    if (value === null || value === undefined) return undefined
    if (typeof value !== "string") return value
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }, z.string().min(1).optional())

export const MatCarDetailsSchema = z.object({
  brand: z.string().trim().min(1),
  brandKey: optionalNonEmptyString(),
  model: z.string().trim().min(1),
  modelFamilyKey: optionalNonEmptyString(),
  modelKey: optionalNonEmptyString(),
  generation: z.string().trim().optional(),
  year: z.string().trim().min(1),
  bodyType: z.string().trim().min(1),
  bodyTypeKey: optionalNonEmptyString(),
  recordKey: optionalNonEmptyString(),
  templateId: optionalNonEmptyString(),
})

export const MatPricingSnapshotSchema = z.object({
  pricingCategoryKey: optionalNonEmptyString(),
  catalogVersionCode: optionalNonEmptyString(),
  basePrice: z.number().nonnegative(),
  priceAfterDiscount: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
})

export const MatBitrixSnapshotSchema = z.object({
  variantEnumId: z.number().int().positive().optional(),
  variantLabel: optionalNonEmptyString(),
  setTypeEnumId: z.number().int().positive().optional(),
})

export const MatConfigurationSchema = z.object({
  carDetails: MatCarDetailsSchema,
  pricing: MatPricingSnapshotSchema.optional(),
  bitrix: MatBitrixSnapshotSchema.optional(),
  setType: z.enum(["3d-with-rims", "classic", "single"]),
  setVariant: z.string().trim().min(1),
  setVariantLabel: optionalNonEmptyString(),
  cellType: z.enum(["diamonds", "honey"]),
  materialColor: z.string().trim().min(1),
  edgeColor: z.string().trim().min(1),
  heelPad: z.union([z.boolean(), z.literal("yes"), z.literal("no")]).optional(),
})

export const CatalogMatConfigurationSchema = MatConfigurationSchema.extend({
  carDetails: MatCarDetailsSchema.extend({
    recordKey: z.string().trim().min(1),
    bodyTypeKey: z.string().trim().min(1),
  }),
  pricing: MatPricingSnapshotSchema,
})

export const AccessoryConfigurationSchema = z
  .object({
    color: z.string().trim().optional(),
  })
  .optional()

export const CartItemConfigurationSchema = z.union([
  MatConfigurationSchema,
  AccessoryConfigurationSchema,
])

export type MatCarDetails = z.infer<typeof MatCarDetailsSchema>
export type MatPricingSnapshot = z.infer<typeof MatPricingSnapshotSchema>
export type MatBitrixSnapshot = z.infer<typeof MatBitrixSnapshotSchema>
export type MatConfiguration = z.infer<typeof MatConfigurationSchema>
export type CatalogMatConfiguration = z.infer<typeof CatalogMatConfigurationSchema>

export const isCatalogMatConfiguration = (
  configuration: unknown,
): configuration is CatalogMatConfiguration =>
  CatalogMatConfigurationSchema.safeParse(configuration).success

export const parseMatConfiguration = (configuration: unknown): MatConfiguration =>
  MatConfigurationSchema.parse(configuration)

export const parseCatalogMatConfiguration = (
  configuration: unknown,
): CatalogMatConfiguration =>
  CatalogMatConfigurationSchema.parse(configuration)
