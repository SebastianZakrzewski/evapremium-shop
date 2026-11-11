import { describe, expect, it } from "vitest"
import type { VehicleTemplateOption } from "@/features/vehicle-catalog/model/schemas"
import {
  previewModelKeyForBody,
  selectionAfterBodyType,
  uniqueBodyOptions,
  yearsForBodyGeneration,
} from "./vehicleBodySelection"

const template = (overrides: Partial<VehicleTemplateOption>): VehicleTemplateOption => ({
  id: "id",
  recordKey: "record",
  modelKey: "3-g20",
  modelName: "3",
  modelNameDisplay: "3",
  generation: "7",
  generationDisplay: "2018-2027",
  generationNumberDisplay: "7",
  yearFrom: 2018,
  yearTo: 2027,
  isOpenEnded: false,
  bodyTypes: [],
  bodyTypeKey: "sedan",
  bodyTypeDisplay: "Sedan",
  pricingCategoryKey: "passenger_car",
  ...overrides,
})

const sedan = template({ id: "sedan", recordKey: "rec-sedan", bodyTypeKey: "sedan", bodyTypeDisplay: "Sedan" })
const touring = template({
  id: "touring",
  recordKey: "rec-touring",
  modelKey: "3-g21",
  generation: "7-touring",
  generationDisplay: "2019-2027",
  yearFrom: 2019,
  yearTo: 2027,
  bodyTypeKey: "wagon",
  bodyTypeDisplay: "Touring",
})

describe("vehicleBodySelection", () => {
  it("lists each body type once", () => {
    expect(uniqueBodyOptions([sedan, sedan, touring]).map((body) => body.key)).toEqual(["sedan", "wagon"])
  })

  it("auto-picks the only generation for a body and keeps a valid year", () => {
    const next = selectionAfterBodyType(
      { modelKey: "", generation: "", year: "2020" },
      [sedan],
      { key: "sedan", label: "Sedan", displayLabel: "Sedan" },
    )
    expect(next.modelKey).toBe("3-g20")
    expect(next.year).toBe("2020")
    expect(next.recordKey).toBe("rec-sedan")
  })

  it("drops a year that the newly chosen body does not cover", () => {
    const next = selectionAfterBodyType(
      { modelKey: "3-g20", generation: "7", year: "2018" },
      [sedan, touring],
      { key: "wagon", label: "Touring", displayLabel: "Touring" },
    )
    expect(next.modelKey).toBe("3-g21")
    expect(next.year).toBe("")
    expect(next.recordKey).toBe("")
  })

  it("limits years to the chosen body and generation", () => {
    expect(yearsForBodyGeneration([sedan, touring], "wagon", "3-g21", "7-touring")).toContain(2019)
    expect(yearsForBodyGeneration([sedan, touring], "wagon", "3-g21", "7-touring")).not.toContain(2018)
  })

  it("uses the newest body template for the photo before a generation is chosen", () => {
    expect(previewModelKeyForBody([sedan, touring], "wagon", "")).toBe("3-g21")
    expect(previewModelKeyForBody([sedan, touring], "wagon", "3-g20")).toBe("3-g20")
  })
})
