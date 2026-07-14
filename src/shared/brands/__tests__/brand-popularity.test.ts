import { describe, expect, it } from "vitest"
import {
  getBrandPopularityRank,
  sortBrandsByPopularity,
} from "@/shared/brands/brandPopularity"

describe("getBrandPopularityRank", () => {
  it("ranks Toyota higher than Ferrari", () => {
    expect(getBrandPopularityRank("Toyota")).toBeLessThan(
      getBrandPopularityRank("Ferrari"),
    )
  })

  it("resolves Dacia Renault database name", () => {
    expect(getBrandPopularityRank("Dacia Renault")).toBeLessThan(
      getBrandPopularityRank("Ferrari"),
    )
  })

  it("uses brand key when display name is unknown", () => {
    expect(getBrandPopularityRank("Unknown Brand", "volkswagen")).toBe(2)
  })

  it("returns Infinity for unlisted brands", () => {
    expect(getBrandPopularityRank("Bobcat")).toBe(Number.POSITIVE_INFINITY)
  })
})

describe("sortBrandsByPopularity", () => {
  it("places popular brands before niche brands", () => {
    const sorted = sortBrandsByPopularity([
      { name: "Ferrari", key: "ferrari" },
      { name: "Toyota", key: "toyota" },
      { name: "Volkswagen", key: "volkswagen" },
      { name: "Bobcat", key: "bobcat" },
    ])

    expect(sorted.map((brand) => brand.name)).toEqual([
      "Toyota",
      "Volkswagen",
      "Ferrari",
      "Bobcat",
    ])
  })

  it("sorts unlisted brands alphabetically after popular ones", () => {
    const sorted = sortBrandsByPopularity([
      { name: "Zaz", key: "zaz" },
      { name: "Bobcat", key: "bobcat" },
      { name: "Audi", key: "audi" },
    ])

    expect(sorted.map((brand) => brand.name)).toEqual([
      "Audi",
      "Zaz",
      "Bobcat",
    ])
  })
})
