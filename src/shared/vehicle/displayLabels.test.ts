import { describe, expect, it } from "vitest"
import {
  buildVehicleDisplayLabels,
  extractGenerationNumber,
  formatBodyTypeDisplayPl,
  formatModelWithGenerationDisplay,
  formatVehicleCardSubtitle,
  formatVehicleCardTitle,
  formatYearRangeDisplay,
} from "./displayLabels"

describe("displayLabels", () => {
  it("formats Aixam Minauto like evamats.pl", () => {
    const labels = buildVehicleDisplayLabels({
      brandName: "aixam",
      modelFamilyName: "Minauto",
      modelFamilyKey: "minauto",
      modelKey: "minauto_1_gen",
      generation: "2017-2028",
      yearFrom: 2017,
      yearTo: 2028,
      bodyType: "hatchback_3_door",
    })

    expect(formatVehicleCardTitle(labels)).toBe("Aixam Minauto 1 gen")
    expect(labels.yearRangeDisplay).toBe("2017-2028 rok")
    expect(labels.bodyTypeDisplay).toBe("HATCHBACK 3 drzwi")
    expect(formatVehicleCardSubtitle(labels)).toEqual([
      "2017-2028 rok",
      "HATCHBACK 3 drzwi",
    ])
  })

  it("extracts generation number from model key", () => {
    expect(extractGenerationNumber("bronco_6_gen")).toBe("6 gen")
    expect(extractGenerationNumber("explorer_5_gen")).toBe("5 gen")
    expect(extractGenerationNumber("m9_ev")).toBeNull()
  })

  it("formats model with generation", () => {
    expect(formatModelWithGenerationDisplay("Bronco", "bronco_6_gen", "bronco")).toBe(
      "Bronco 6 gen",
    )
  })

  it("formats year range with rok suffix", () => {
    expect(formatYearRangeDisplay(2021, 2028, "2021-2028")).toBe("2021-2028 rok")
    expect(formatYearRangeDisplay(2017, null, null, true)).toBe("2017+ rok")
  })

  it("formats polish body types", () => {
    expect(formatBodyTypeDisplayPl("suv_7_seater")).toBe("SUV 7 osobowy")
    expect(formatBodyTypeDisplayPl("minivan")).toBe("MINIVAN")
    expect(formatBodyTypeDisplayPl("pickup")).toBe("PICK-UP")
    expect(formatBodyTypeDisplayPl("hatchback_3_door")).toBe("HATCHBACK 3 drzwi")
  })

  it("formats BMW chassis codes with space", () => {
    expect(
      formatModelWithGenerationDisplay("3e90", "3e90_5_gen", "3e90"),
    ).toBe("3 E90 5 gen")
    expect(
      formatModelWithGenerationDisplay("3(e90)_5_gen", "3e90_5_gen", "3e90"),
    ).toBe("3 E90 5 gen")
    expect(
      formatModelWithGenerationDisplay("m3e90", "m3e90_4_gen", "m3e90"),
    ).toBe("M3 E90 4 gen")
    expect(
      formatModelWithGenerationDisplay("1f20", "1f20_2_gen", "1f20"),
    ).toBe("1 F20 2 gen")
  })

  it("formats Audi glued chassis codes", () => {
    expect(
      formatModelWithGenerationDisplay("A5f5", "a5f5_2_gen", "a5f5"),
    ).toBe("A5 F5 2 gen")
    expect(
      formatModelWithGenerationDisplay("3e36 Compact", "3e36_compact_3_gen", "3e36_compact"),
    ).toBe("3 E36 Compact 3 gen")
  })

  it("keeps non-chassis model names unchanged", () => {
    expect(
      formatModelWithGenerationDisplay("Bronco", "bronco_6_gen", "bronco"),
    ).toBe("Bronco 6 gen")
    expect(
      formatModelWithGenerationDisplay("Minauto", "minauto_1_gen", "minauto"),
    ).toBe("Minauto 1 gen")
  })
})
