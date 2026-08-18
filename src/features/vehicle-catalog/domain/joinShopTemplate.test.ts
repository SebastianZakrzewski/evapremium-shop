import { describe, expect, it } from "vitest"
import {
  indexShopModels,
  matchShopModel,
  parseYearsFromRange,
  yearsOverlap,
} from "./joinShopTemplate"

const volvoXc90 = {
  brandKey: "volvo",
  brandName: "Volvo",
  modelKey: "xc90_2_gen",
  modelName: "XC90 2 gen",
  modelFamilyName: "Xc90",
  yearRange: "2014-2027",
}

describe("joinShopTemplate", () => {
  it("matches record_key brand+model+year", () => {
    const index = indexShopModels([volvoXc90])
    expect(
      matchShopModel(index, {
        recordKey: "passenger_car|volvo|xc90_2_gen|2014-2027|suv|2757",
        brandName: "Volvo",
        modelName: "XC90 2 gen",
        generation: "2014-2027",
      })?.modelKey,
    ).toBe("xc90_2_gen")
  })

  it("treats overlapping years as a match", () => {
    expect(yearsOverlap("2014-2025", "2014-2027")).toBe(true)
    expect(parseYearsFromRange("2014-2027")).toEqual([2014, 2027])
  })

  it("matches Alfa Romeo 147 when shop parsed brand as Alfa / romeo_147", () => {
    const index = indexShopModels([
      {
        brandKey: "alfa",
        brandName: "Alfa",
        modelKey: "romeo_147_1_gen",
        modelName: "Romeo 147 1 gen",
        modelFamilyName: "Romeo 147",
        yearRange: "2000-2010",
      },
    ])
    expect(
      matchShopModel(index, {
        recordKey: "passenger_car|alfa_romeo|147_1_gen|2000-2010|hatchback|10",
        brandName: "Alfa Romeo",
        modelName: "147 1 gen",
        generation: "2000-2010",
      })?.modelKey,
    ).toBe("romeo_147_1_gen")
  })

  it("matches Q3 przedlift 8U to shop q38u_przedlift", () => {
    const index = indexShopModels([
      {
        brandKey: "audi",
        brandName: "Audi",
        modelKey: "q38u_przedlift_1_gen",
        modelName: "Q3(8U) przedlift 1 gen",
        yearRange: "2011-2014",
      },
    ])
    expect(
      matchShopModel(index, {
        recordKey:
          "passenger_car|audi|q3_przedlift_8u_1_gen|2011-2014|suv|121",
        brandName: "Audi",
        modelName: "Q3 przedlift 8U 1 gen",
        generation: "2011-2014",
      })?.modelKey,
    ).toBe("q38u_przedlift_1_gen")
  })
})
