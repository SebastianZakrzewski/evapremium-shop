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

  it("accepts empty optional catalog keys from configurator state", () => {
    const result = MatConfigurationSchema.safeParse({
      carDetails: {
        brand: "Audi",
        brandKey: "Audi",
        model: "A4(b6) 2 gen",
        modelFamilyKey: "A4(B6) 2 gen",
        modelKey: "",
        generation: "2000-2006",
        year: "2004",
        bodyType: "SEDAN",
        bodyTypeKey: "sedan",
        recordKey: "passenger_car|audi|a4b6_2_gen|2000-2006|wagon|65",
        templateId: "47e9d10a-28bb-4488-ba6b-d4167e1b656e",
      },
      pricing: {
        pricingCategoryKey: "passenger_car",
        catalogVersionCode: "evamats_v2",
        basePrice: 510,
        priceAfterDiscount: 408,
        totalPrice: 408,
      },
      setType: "classic",
      setVariant: "basic",
      setVariantLabel: "Podstawowy",
      cellType: "diamonds",
      materialColor: "darkblue",
      edgeColor: "darkblue",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.carDetails.modelKey).toBeUndefined()
    }
  })
})
