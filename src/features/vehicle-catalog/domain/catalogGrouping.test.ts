import { describe, expect, it } from "vitest"
import {
  collectUniqueBrandsFromRows,
  extractSearchBrands,
  extractSearchModels,
  groupTemplatesToCarModels,
} from "./catalogGrouping"
import type { MatTemplateDbRow } from "../server/repository"

const baseRow = (
  overrides: Partial<MatTemplateDbRow>,
): MatTemplateDbRow => ({
  id: "1",
  record_key: "passenger_car|ford|ranger_6_gen|2022-2028|pickup|1",
  brand_name: "Ford",
  brand_key: "ford",
  model_name: "Ranger 6 gen",
  model_key: "ranger_6_gen",
  model_family_name: "Ranger",
  model_family_key: "ranger",
  generation: "6 gen",
  year_from: 2022,
  year_to: 2028,
  is_open_ended: false,
  body_type: "pickup",
  body_type_key: "pickup",
  body_type_1: "Pickup",
  body_type_2: null,
  body_type_3: null,
  body_type_1_key: "pickup",
  body_type_2_key: null,
  body_type_3_key: null,
  body_type_variants: [],
  dealer_pricing_category_key: "pickup",
  ...overrides,
})

describe("groupTemplatesToCarModels", () => {
  it("groups rows by model family", () => {
    const models = groupTemplatesToCarModels([
      baseRow({}),
      baseRow({
        id: "2",
        generation: "5 gen",
        model_key: "ranger_5_gen",
        year_from: 2015,
        year_to: 2021,
      }),
    ])

    expect(models).toHaveLength(1)
    expect(models[0]?.model).toBe("Ranger")
    expect(models[0]?.modelFamilyKey).toBe("ranger")
    expect(models[0]?.generations).toHaveLength(2)
    expect(models[0]?.generations[0]?.modelKey).toBe("ranger_6_gen")
    expect(models[0]?.generations[0]?.matTemplateId).toBe("1")
    expect(models[0]?.years).toContain(2024)
    expect(models[0]?.years).toContain(2018)
  })

  it("emits separate generation entries for each body type on a template row", () => {
    const models = groupTemplatesToCarModels([
      baseRow({
        brand_name: "Audi",
        brand_key: "Audi",
        model_family_name: "A4(B6) 2 gen",
        model_family_key: "A4(B6) 2 gen",
        model_name: "A4(B6) 2 gen",
        model_key: "A4(B6) 2 gen",
        generation: "2000-2006",
        year_from: 2000,
        year_to: 2006,
        body_type: "wagon",
        body_type_key: "wagon",
        body_type_1: "wagon",
        body_type_1_key: "wagon",
        body_type_2: "sedan",
        body_type_2_key: "sedan",
        record_key: "passenger_car|audi|a4b6_2_gen|2000-2006|wagon|65",
      }),
    ])

    const bodyTypes = models[0]?.generations.map((gen) => gen.bodyType).sort()
    expect(bodyTypes).toEqual(["sedan", "wagon"])
  })
})

describe("extractSearchBrands", () => {
  it("returns unique brands", () => {
    const brands = extractSearchBrands([
      baseRow({}),
      baseRow({ brand_key: "bmw", brand_name: "BMW" }),
    ])
    expect(brands).toHaveLength(2)
  })

  it("deduplicates Citroen variants with trailing whitespace", () => {
    const brands = collectUniqueBrandsFromRows([
      baseRow({ brand_key: "Citroen", brand_name: "Citroen" }),
      baseRow({ brand_key: "Citroen ", brand_name: "Citroen " }),
    ])

    expect(brands).toHaveLength(1)
    expect(brands[0]?.key).toBe("Citroen")
    expect(brands[0]?.name).toBe("Citroen")
  })
})

describe("extractSearchModels", () => {
  it("returns template variants with normalized Polish display labels", () => {
    const models = extractSearchModels([
      baseRow({
        brand_name: "Renault",
        brand_key: "renault",
        model_family_name: "Clio",
        model_family_key: "clio",
        model_key: "clio_5_gen",
        generation: "2019-2026",
        year_from: 2019,
        year_to: 2026,
        body_type: "hatchback_5_door",
        body_type_1: "hatchback_5_door",
        body_type_1_key: "hatchback_5_door",
      }),
    ])

    expect(models).toHaveLength(1)
    expect(models[0]?.displayLabel).toBe(
      "Renault Clio 5 gen 2019-2026 rok HATCHBACK 5 drzwi",
    )
    expect(models[0]?.bodyTypes).toEqual(["HATCHBACK 5 drzwi"])
    expect(models[0]?.generation).toBe("2019-2026")
    expect(models[0]?.bodyType).toBe("hatchback_5_door")
  })

  it("returns separate rows per template record", () => {
    const models = extractSearchModels([
      baseRow({}),
      baseRow({
        id: "2",
        record_key: "pickup|ford|ranger_5_gen|2015-2021|pickup|2",
        generation: "2015-2021",
        model_key: "ranger_5_gen",
        year_from: 2015,
        year_to: 2021,
      }),
    ])

    expect(models).toHaveLength(2)
  })
})
