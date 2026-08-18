import { describe, expect, it } from "vitest"
import {
  CONFIGURATOR_BUS_VARIANT_KEYS,
  CONFIGURATOR_MINIVAN_VARIANT_KEYS,
  CONFIGURATOR_PASSENGER_3_ROW_VARIANT_KEYS,
  CONFIGURATOR_PASSENGER_BASE_VARIANT_KEYS,
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
  const passengerDealerKeys = [
    "driver_mat",
    "passenger_mat",
    "front",
    "rear_only",
    "basic",
    "premium",
    "complete",
    "row_3",
    "row_3_small_trunk_unfolded",
    "row_3_large_trunk_folded",
    "row_3_two_trunks",
    "front_rear_two_trunks",
  ]

  it("keeps passenger base sets for dual_mat_type without 3 rows", () => {
    expect(
      filterSellableVariantKeys(
        passengerDealerKeys,
        "dual_mat_type",
        "passenger_car",
        "sedan",
        { seatRows: 2 },
      ),
    ).toEqual([...CONFIGURATOR_PASSENGER_BASE_VARIANT_KEYS])
  })

  it("does not add 3-row sets for minivan body when seat_rows is 2", () => {
    expect(
      filterSellableVariantKeys(
        passengerDealerKeys,
        "dual_mat_type",
        "passenger_car",
        "minivan",
        { seatRows: 2 },
      ),
    ).toEqual([...CONFIGURATOR_PASSENGER_BASE_VARIANT_KEYS])
  })

  it("adds 3-row sets for passenger_car when seat_rows is 3", () => {
    expect(
      filterSellableVariantKeys(
        passengerDealerKeys,
        "dual_mat_type",
        "passenger_car",
        "suv",
        { seatRows: 3 },
      ),
    ).toEqual([
      ...CONFIGURATOR_PASSENGER_BASE_VARIANT_KEYS,
      ...CONFIGURATOR_PASSENGER_3_ROW_VARIANT_KEYS,
    ])
  })

  it("keeps pickup dual_mat_type on original set variants", () => {
    expect(
      filterSellableVariantKeys(
        ["front", "basic", "premium", "complete", "driver_mat", "row_3"],
        "dual_mat_type",
        "pickup",
        "pickup",
        { seatRows: 2 },
      ),
    ).toEqual(["front", "basic", "premium", "complete"])
  })

  it("returns all keys for other single_price categories", () => {
    expect(filterSellableVariantKeys(["front", "row_1"], "single_price")).toEqual(
      ["front", "row_1"],
    )
  })

  it("keeps evamats.pl minivan variants and drops 3-row keys when seat_rows is 2", () => {
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
      filterSellableVariantKeys(
        dealerKeys,
        "single_price",
        "minivan",
        "minivan",
        { seatRows: 2 },
      ),
    ).toEqual(["driver_mat", "front", "row_2", "trunk_small", "trunk_large"])
  })

  it("keeps full minivan allowlist when seat_rows is 3", () => {
    const dealerKeys = [...CONFIGURATOR_MINIVAN_VARIANT_KEYS, "sill_mat_measured"]

    expect(
      filterSellableVariantKeys(
        dealerKeys,
        "single_price",
        "minivan",
        "minivan",
        { seatRows: 3 },
      ),
    ).toEqual([...CONFIGURATOR_MINIVAN_VARIANT_KEYS])
  })

  it("keeps bus row_1 and drops 2nd/3rd rows when seat_rows is 1", () => {
    const dealerKeys = [
      "row_1",
      "driver_mat",
      "row_2",
      "row_3",
      "row_3_trunk",
      "trunk_mat_large",
      "trunk_small",
    ]

    expect(
      filterSellableVariantKeys(
        dealerKeys,
        "single_price",
        "bus",
        "bus",
        { seatRows: 1 },
      ),
    ).toEqual(["driver_mat", "row_1", "trunk_mat_large"])
  })

  it("keeps bus variants in shop order when seat_rows is 3", () => {
    const dealerKeys = [
      "row_1",
      "driver_mat",
      "row_2",
      "row_3",
      "row_3_trunk",
      "trunk_mat_large",
      "trunk_small",
    ]

    expect(
      filterSellableVariantKeys(
        dealerKeys,
        "single_price",
        "bus",
        "bus",
        { seatRows: 3 },
      ),
    ).toEqual([...CONFIGURATOR_BUS_VARIANT_KEYS])
  })
})
