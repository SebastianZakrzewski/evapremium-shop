import { describe, expect, it } from "vitest"
import type { MatTemplateDbRow } from "../server/repository"
import {
  buildTemplateSearchHaystack,
  matchesAllSearchTokens,
  parseSearchTokens,
} from "./searchTokens"

const row = (overrides: Partial<MatTemplateDbRow>): MatTemplateDbRow => ({
  id: "1",
  record_key: "passenger_car|dacia|duster_1_gen|2017-2024|suv|1",
  brand_name: "Dacia",
  brand_key: "dacia",
  model_name: "Duster 1 gen",
  model_key: "duster_1_gen",
  model_family_name: "Duster 1 gen",
  model_family_key: "Duster 1 gen",
  generation: "2017-2024",
  year_from: 2017,
  year_to: 2024,
  is_open_ended: false,
  body_type: "suv",
  body_type_key: "suv",
  body_type_1: "suv",
  body_type_2: null,
  body_type_3: null,
  body_type_1_key: "suv",
  body_type_2_key: null,
  body_type_3_key: null,
  body_type_variants: [],
  dealer_pricing_category_key: "passenger_car",
  ...overrides,
})

describe("parseSearchTokens", () => {
  it("splits brand and model tokens", () => {
    expect(parseSearchTokens("Dacia Duster")).toEqual(["dacia", "duster"])
  })

  it("normalizes punctuation", () => {
    expect(parseSearchTokens("Mercedes-Benz, Sprinter")).toEqual([
      "mercedes",
      "benz",
      "sprinter",
    ])
  })

  it("normalizes mixed case input", () => {
    expect(parseSearchTokens("DACIA DUSTER")).toEqual(["dacia", "duster"])
    expect(parseSearchTokens("renault KADJAR")).toEqual(["renault", "kadjar"])
  })
})

describe("matchesAllSearchTokens", () => {
  it("matches when brand and model tokens hit the same row", () => {
    const template = row({})
    expect(matchesAllSearchTokens(template, parseSearchTokens("Dacia Duster"))).toBe(
      true,
    )
  })

  it("rejects rows missing one of the tokens", () => {
    const template = row({ brand_name: "Ford", brand_key: "ford" })
    expect(matchesAllSearchTokens(template, parseSearchTokens("Dacia Duster"))).toBe(
      false,
    )
  })

  it("matches generation fragments for the same model family", () => {
    const template = row({
      brand_name: "Renault",
      brand_key: "renault",
      model_family_name: "Clio",
      model_family_key: "clio",
      model_name: "Clio 5 gen",
      model_key: "clio_5_gen",
    })
    expect(
      matchesAllSearchTokens(template, parseSearchTokens("Renault Clio 5")),
    ).toBe(true)
  })
})
