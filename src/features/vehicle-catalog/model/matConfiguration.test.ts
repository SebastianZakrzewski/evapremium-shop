import { describe, expect, it } from "vitest"
import {
  CatalogMatConfigurationSchema,
  MatConfigurationSchema,
} from "../model/matConfiguration"

const validCatalogConfig = {
  carDetails: {
    brand: "Ford",
    brandKey: "ford",
    model: "Ranger",
    modelFamilyKey: "ranger",
    modelKey: "ranger_6_gen",
    generation: "6 gen",
    year: "2024",
    bodyType: "Pickup",
    bodyTypeKey: "pickup",
    recordKey: "pickup|ford|ranger_6_gen|2022-2028|pickup|966",
    templateId: "tpl-1",
  },
  pricing: {
    pricingCategoryKey: "pickup",
    catalogVersionCode: "2026-q1",
    basePrice: 693,
    priceAfterDiscount: 693,
    totalPrice: 693,
  },
  setType: "3d-with-rims" as const,
  setVariant: "basic",
  cellType: "diamonds" as const,
  materialColor: "black",
  edgeColor: "black",
}

describe("MatConfigurationSchema", () => {
  it("accepts configurator snapshot with optional catalog keys", () => {
    const { recordKey, bodyTypeKey, templateId, ...partialCar } =
      validCatalogConfig.carDetails
    const result = MatConfigurationSchema.safeParse({
      ...validCatalogConfig,
      carDetails: partialCar,
      pricing: undefined,
    })
    expect(result.success).toBe(true)
  })

  it("requires recordKey and bodyTypeKey for checkout snapshot", () => {
    const withoutRecordKey = {
      ...validCatalogConfig,
      carDetails: {
        ...validCatalogConfig.carDetails,
        recordKey: undefined,
      },
    }
    expect(CatalogMatConfigurationSchema.safeParse(withoutRecordKey).success).toBe(
      false,
    )
    expect(CatalogMatConfigurationSchema.safeParse(validCatalogConfig).success).toBe(
      true,
    )
  })
})
