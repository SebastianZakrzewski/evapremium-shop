import { describe, expect, it } from "vitest"
import {
  CONFIGURATOR_BUS_VARIANT_KEYS,
  CONFIGURATOR_MINIVAN_VARIANT_KEYS,
  CONFIGURATOR_PASSENGER_PRICED_MINIVAN_SET_VARIANT_KEYS,
  filterSellableVariantKeys,
  selectPricingOverride,
} from "./pricingRules"

const familyOverride = {
  templateRecordKey: null,
  brandKey: "mercedes_benz",
  modelFamilyKey: "vito",
  yearFrom: null,
  yearTo: null,
  variantKey: "front",
}

describe("selectPricingOverride", () => {
  it("prefers an exact template override", () => {
    const exact = {
      ...familyOverride,
      templateRecordKey: "bus|mercedes_benz|vito|2014-2027",
    }

    expect(
      selectPricingOverride([familyOverride, exact], {
        recordKey: exact.templateRecordKey,
        brandKey: "mercedes_benz",
        modelFamilyKey: "vito",
        year: 2020,
        variantKey: "front",
      }),
    ).toBe(exact)
  })

  it("uses a family override only inside its year range", () => {
    const ranged = { ...familyOverride, yearFrom: 2014, yearTo: 2020 }

    expect(
      selectPricingOverride([ranged], {
        recordKey: "record",
        brandKey: "mercedes_benz",
        modelFamilyKey: "vito",
        year: 2021,
        variantKey: "front",
      }),
    ).toBeUndefined()
  })
})

describe("filterSellableVariantKeys", () => {
  const dealerKeys = [
    "driver_mat",
    "passenger_mat",
    "front",
    "basic",
    "premium",
    "complete",
    "row_3",
  ]

  it("keeps only configurator set variants for dual_mat_type", () => {
    expect(filterSellableVariantKeys(dealerKeys, "dual_mat_type")).toEqual([
      "front",
      "basic",
      "premium",
      "complete",
    ])
  })

  it("extends dual_mat_type set for minivan body type on passenger pricing", () => {
    const dealerKeys = [
      "front",
      "basic",
      "premium",
      "complete",
      "row_3",
      "row_3_small_trunk_unfolded",
      "row_3_large_trunk_folded",
      "row_3_two_trunks",
      "front_rear_two_trunks",
      "driver_mat",
    ]

    expect(
      filterSellableVariantKeys(
        dealerKeys,
        "dual_mat_type",
        "passenger_car",
        "minivan",
      ),
    ).toEqual([...CONFIGURATOR_PASSENGER_PRICED_MINIVAN_SET_VARIANT_KEYS])
  })

  it("returns all keys for other single_price categories", () => {
    expect(filterSellableVariantKeys(["front", "row_1"], "single_price")).toEqual(
      ["front", "row_1"],
    )
  })

  it("keeps only evamats.pl minivan variants in shop order", () => {
    const dealerKeys = [
      "sill_mat_measured",
      "driver_mat",
      "front",
      "front_with_tunnel",
      "row_2",
      "row_3",
      "trunk_small",
      "trunk_large",
      "row_3_small_trunk_unfolded",
      "row_3_large_trunk_folded",
      "row_3_two_trunks",
      "rear_only",
    ]

    expect(
      filterSellableVariantKeys(dealerKeys, "single_price", "minivan"),
    ).toEqual([...CONFIGURATOR_MINIVAN_VARIANT_KEYS])
  })

  it("keeps only evamats.pl bus variants in shop order", () => {
    const dealerKeys = [
      "row_1",
      "driver_mat",
      "row_2",
      "row_3",
      "row_3_trunk",
      "trunk_small",
    ]

    expect(filterSellableVariantKeys(dealerKeys, "single_price", "bus")).toEqual(
      [...CONFIGURATOR_BUS_VARIANT_KEYS],
    )
  })
})
