import { describe, expect, it } from "vitest"
import { parseLocalProductCardFileName } from "./parseLocalProductCard"

describe("parseLocalProductCardFileName", () => {
  it("parses spaced BMW X5 G05 SUV filename", () => {
    const parsed = parseLocalProductCardFileName(
      "BMW_X5_G05_4_gen_2018-2025_rok_SUV.png",
    )

    expect(parsed).toMatchObject({
      series: "x5",
      chassisCodes: ["g05"],
      generationNumber: 4,
      yearFrom: 2018,
      yearTo: 2025,
      bodyType: "suv",
      isMVariant: false,
    })
  })

  it("parses X5 M separately from X5", () => {
    const parsed = parseLocalProductCardFileName(
      "BMW_X5_M_F95_3_gen_2019-2023_rok_SUV.png",
    )

    expect(parsed).toMatchObject({
      series: "x5",
      chassisCodes: ["f95"],
      isMVariant: true,
      bodyType: "suv",
    })
  })

  it("parses glued 3 Series E30 sedan filename", () => {
    const parsed = parseLocalProductCardFileName(
      "BMW3_E30_2gen1982-1994rokSedan.png",
    )

    expect(parsed).toMatchObject({
      series: "3",
      chassisCodes: ["e30"],
      generationNumber: 2,
      yearFrom: 1982,
      yearTo: 1994,
      bodyType: "sedan",
    })
  })

  it("parses Active Tourer and Combi body type", () => {
    const tourer = parseLocalProductCardFileName(
      "BMW_2_Active_Tourer_F45_1_gen.2014-2021_rok_Minivan.png",
    )
    const combi = parseLocalProductCardFileName(
      "BMW_3_F31_6_gen.2011-2020_rok_Combi.png",
    )

    expect(tourer).toMatchObject({
      series: "2",
      extras: ["active tourer"],
      chassisCodes: ["f45"],
      bodyType: "minivan",
    })
    expect(combi?.bodyType).toBe("kombi")
  })

  it("returns null for junk filenames without a model", () => {
    expect(parseLocalProductCardFileName("e91.png")).toBeNull()
    expect(parseLocalProductCardFileName("jpg_bmw2gc.png")).toBeNull()
  })

  it("parses glued i8 filename as i8 not 1 Series", () => {
    const parsed = parseLocalProductCardFileName(
      "BMWi81gen.2014-2020rokHybrydaCoupe_db4f5fec-1fe1-4c70-afcf-63d0cefd8504.png",
    )

    expect(parsed).toMatchObject({
      series: "i8",
      generationNumber: 1,
      yearFrom: 2014,
      yearTo: 2020,
      bodyType: "coupe",
    })
  })
})
