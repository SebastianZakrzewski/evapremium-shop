import { describe, expect, it } from "vitest"
import type { MatConfiguration } from "@/features/vehicle-catalog/model/matConfiguration"
import {
  formatMatCarBodyTypeLabel,
  formatMatCarDetailsTitle,
  getMatConfigurationDisplayRows,
  getPolishCellTypeLabel,
  getPolishColorLabel,
} from "@/shared/mat-configuration-display"

const sampleConfiguration: MatConfiguration = {
  bitrix: { setTypeEnumId: 264, variantEnumId: 276 },
  pricing: {
    basePrice: 1210,
    totalPrice: 847,
    catalogVersionCode: "evamats_v2",
    priceAfterDiscount: 847,
    pricingCategoryKey: "passenger_car",
  },
  setType: "3d-with-rims",
  cellType: "diamonds",
  edgeColor: "black",
  carDetails: {
    year: "2009",
    brand: "Alfa-romeo",
    model: "Brera",
    bodyType: "shooting_brake",
    brandKey: "Alfa Romeo",
    modelKey: "Brera",
    recordKey:
      "passenger_car|alfa_romeo|brera|2005-2010|shooting_brake|13",
    generation: "2005-2010",
    templateId: "ac40feae-ea82-4e7f-9ed2-d33052c3d702",
    bodyTypeKey: "shooting_brake",
    modelFamilyKey: "Brera",
  },
  setVariant: "premium",
  materialColor: "black",
  setVariantLabel: "Premium",
}

describe("mat-configuration-display", () => {
  it("formats car details for end users", () => {
    expect(formatMatCarDetailsTitle(sampleConfiguration.carDetails)).toBe(
      "Alfa Romeo Brera 2005-2010 (2009)",
    )
    expect(formatMatCarBodyTypeLabel(sampleConfiguration.carDetails)).toBe(
      "SHOOTING BRAKE",
    )
  })

  it("translates cell types and colors to Polish", () => {
    expect(getPolishCellTypeLabel("diamonds")).toBe("Romby")
    expect(getPolishColorLabel("black")).toBe("Czarny")
  })

  it("builds readable configuration rows without internal fields", () => {
    const rows = getMatConfigurationDisplayRows(sampleConfiguration)
    const labels = rows.map((row) => row.label)

    expect(labels).toEqual(["Zestaw", "Typ", "Struktura", "Kolor"])
    expect(rows.find((row) => row.label === "Zestaw")?.value).toBe("Premium")
    expect(rows.find((row) => row.label === "Typ")?.value).toBe("3D z rantami")
    expect(rows.find((row) => row.label === "Struktura")?.value).toBe("Romby")
    expect(rows.find((row) => row.label === "Kolor")?.value).toBe(
      "Czarny + Czarny obszycie",
    )
  })
})
