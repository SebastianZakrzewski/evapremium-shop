import { describe, expect, it } from "vitest"
import type { MatTemplateDbRow } from "../server/repository"
import {
  canonicalizeModelDesignation,
  resolveCatalogTemplateRows,
} from "./modelDesignationCorrections"

const baseRow = (
  overrides: Partial<MatTemplateDbRow>,
): MatTemplateDbRow => ({
  id: "1",
  record_key: "passenger_car|bmw|x5_mg05_4_gen|2018-2028|suv|266",
  brand_name: "BMW",
  brand_key: "BMW",
  model_name: "X5 M(G05) 4 gen",
  model_key: "X5 M(G05) 4 gen",
  model_family_name: "X5 M(G05) 4 gen",
  model_family_key: "X5 M(G05) 4 gen",
  generation: "2018-2028",
  year_from: 2018,
  year_to: 2028,
  is_open_ended: false,
  body_type: "suv_5_door",
  body_type_key: "suv",
  body_type_1: "suv_5_door",
  body_type_2: null,
  body_type_3: null,
  body_type_1_key: "suv",
  body_type_2_key: null,
  body_type_3_key: null,
  body_type_variants: [],
  dealer_pricing_category_key: "passenger_car",
  seat_rows: 2,
  ...overrides,
})

describe("canonicalizeModelDesignation", () => {
  it("maps BMW X5 M G05 4 gen to F95 3 gen", () => {
    expect(canonicalizeModelDesignation("X5 M(G05) 4 gen")).toBe(
      "X5 M (F95) 3 gen",
    )
  })

  it("leaves the canonical F95 designation unchanged", () => {
    expect(canonicalizeModelDesignation("X5 M (F95) 3 gen")).toBe(
      "X5 M (F95) 3 gen",
    )
  })
})

describe("resolveCatalogTemplateRows", () => {
  it("drops the G05 alias when F95 already exists", () => {
    const rows = resolveCatalogTemplateRows([
      baseRow({
        id: "f95",
        record_key: "passenger_car|bmw|x5_m_f95_3_gen|2019-2027|suv|272",
        model_name: "X5 M (F95) 3 gen",
        model_key: "X5 M (F95) 3 gen",
        model_family_name: "X5 M (F95) 3 gen",
        model_family_key: "X5 M (F95) 3 gen",
        generation: "2019-2027",
        year_from: 2019,
        year_to: 2027,
      }),
      baseRow({}),
    ])

    expect(rows).toHaveLength(1)
    expect(rows[0]?.id).toBe("f95")
    expect(rows[0]?.model_family_name).toBe("X5 M (F95) 3 gen")
  })

  it("rewrites G05 to F95 when the canonical row is missing", () => {
    const rows = resolveCatalogTemplateRows([baseRow({})])

    expect(rows).toHaveLength(1)
    expect(rows[0]?.model_name).toBe("X5 M (F95) 3 gen")
    expect(rows[0]?.model_family_key).toBe("X5 M (F95) 3 gen")
  })
})
