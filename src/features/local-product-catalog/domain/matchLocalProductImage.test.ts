import { describe, expect, it } from "vitest"
import { matchLocalProductImage } from "./matchLocalProductImage"
import { parseLocalProductCardFileName } from "./parseLocalProductCard"
import type { LocalProductCard } from "./parseLocalProductCard"

const card = (fileName: string): LocalProductCard => {
  const parsed = parseLocalProductCardFileName(fileName)
  if (!parsed) {
    throw new Error(`expected parseable filename: ${fileName}`)
  }
  return {
    ...parsed,
    fileName,
    publicPath: `/images/products/bmw/${fileName}`,
  }
}

const catalog = [
  "BMW_X5_G05_4_gen_2018-2025_rok_SUV.png",
  "BMW_X5_M_F95_3_gen_2019-2023_rok_SUV.png",
  "BMW_X5_E70_2_gen_2006-2013_rok_SUV.png",
  "BMW_3_G20_7_gen.2018-2023_rok_Sedan.png",
  "BMW_3_G21_7_gen.2018-2023_rok_Combi_ee8385cf-d9ec-44c2-8658-11b84eedc3ad.png",
  "BMW_M3_G80_6_gen_2020-2025_rok_Sedan.png",
  "BMW_2_Active_Tourer_F45_1_gen.2014-2021_rok_Minivan.png",
  "BMW_2_F22_1_gen.2014-2021_rok_Coupe.png",
].map(card)

describe("matchLocalProductImage", () => {
  it("matches X5 G05 by chassis, years and body type", () => {
    const match = matchLocalProductImage(catalog, {
      brand: "BMW",
      model: "X5 (G05) 4 gen",
      generation: "2018-2025",
      bodyType: "suv",
      yearFrom: 2018,
      yearTo: 2025,
    })

    expect(match?.fileName).toBe("BMW_X5_G05_4_gen_2018-2025_rok_SUV.png")
  })

  it("does not use X5 M photo for regular X5", () => {
    const match = matchLocalProductImage(catalog, {
      brand: "Bmw",
      model: "X5 (G05) 4 gen",
      bodyType: "suv",
    })

    expect(match?.fileName).not.toContain("_X5_M_")
  })

  it("matches X5 M and 3 Series kombi separately from sedan", () => {
    const mVariant = matchLocalProductImage(catalog, {
      brand: "BMW",
      model: "X5 M (F95) 3 gen",
      bodyType: "suv",
    })
    const kombi = matchLocalProductImage(catalog, {
      brand: "BMW",
      model: "3 (G21) 7 gen",
      bodyType: "wagon",
      generation: "2018-2023",
    })
    const m3 = matchLocalProductImage(catalog, {
      brand: "BMW",
      model: "M3 (G80) 6 gen",
      bodyType: "sedan",
    })

    expect(mVariant?.fileName).toContain("X5_M_F95")
    expect(kombi?.fileName).toContain("G21")
    expect(m3?.fileName).toContain("M3_G80")
  })

  it("allows body-type mismatch when chassis codes match", () => {
    const catalogWithM4 = [
      ...catalog,
      card("BMW_M4_G82_2_gen_2020-2024_rok_Sedan.png"),
    ]
    const match = matchLocalProductImage(catalogWithM4, {
      brand: "BMW",
      model: "M4 (G82) 2 gen",
      bodyType: "coupe",
    })

    expect(match?.fileName).toContain("M4_G82")
  })

  it("matches Active Tourer by extra tokens instead of 2 Series coupe", () => {
    const match = matchLocalProductImage(catalog, {
      brand: "BMW",
      model: "2 Active Tourer (F45) 1 gen",
      bodyType: "minivan",
    })

    expect(match?.fileName).toContain("Active_Tourer")
  })
})
