import { describe, expect, it, vi, beforeEach } from "vitest"
import { resolveVehiclePricing } from "../pricingService"

const getMatTemplateByRecordKey = vi.fn()
const getActivePricingCatalog = vi.fn()
const getPricingCategory = vi.fn()
const getCategoryPricingRows = vi.fn()
const getPricingOverrides = vi.fn()
const getVariantsByKeys = vi.fn()

vi.mock("../repository", () => ({
  getMatTemplateByRecordKey: (...args: unknown[]) =>
    getMatTemplateByRecordKey(...args),
}))

vi.mock("../pricingRepository", () => ({
  getActivePricingCatalog: (...args: unknown[]) =>
    getActivePricingCatalog(...args),
  getPricingCategory: (...args: unknown[]) => getPricingCategory(...args),
  getCategoryPricingRows: (...args: unknown[]) =>
    getCategoryPricingRows(...args),
  getPricingOverrides: (...args: unknown[]) => getPricingOverrides(...args),
  getVariantsByKeys: (...args: unknown[]) => getVariantsByKeys(...args),
}))

const catalog = {
  id: "catalog-1",
  code: "evamats_v2",
  discount_threshold_pln: 910,
  discount_rate_below: 0.2,
  discount_rate_from: 0.3,
}

const variant = (key: string, label: string, id: string) => ({
  id,
  variant_key: key,
  variant_label: label,
})

const matrix = (
  variantId: string,
  matType: string,
  base: number,
  discounted?: number,
) => ({
  id: `${variantId}-${matType}`,
  variant_id: variantId,
  mat_type: matType,
  base_price_pln: base,
  price_after_discount_pln: discounted ?? null,
  discount_excluded: false,
})

const pickupRows = {
  variants: [
    variant("basic", "Front and rear", "v-basic"),
    variant("front", "Front only", "v-front"),
  ],
  matrices: [
    matrix("v-basic", "3d-with-rims", 990, 693),
    matrix("v-basic", "classic", 690, 552),
    matrix("v-front", "3d-with-rims", 550, 440),
  ],
  links: [],
}

const minivanRows = {
  variants: [
    variant("driver_mat", "Driver mat", "v-minivan-driver"),
    variant("front", "Front only", "v-minivan-front"),
    variant("front_with_tunnel", "Front with tunnel", "v-minivan-ft"),
    variant("row_2", "Row 2", "v-minivan-r2"),
    variant("row_3", "Row 3", "v-minivan-r3"),
    variant("trunk_small", "Trunk small", "v-minivan-ts"),
    variant("trunk_large", "Trunk large", "v-minivan-tl"),
    variant("row_3_small_trunk_unfolded", "Row 3 small trunk", "v-minivan-r3st"),
    variant("row_3_large_trunk_folded", "Row 3 large trunk", "v-minivan-r3lt"),
    variant("row_3_two_trunks", "Row 3 two trunks", "v-minivan-r3tt"),
    variant("sill_mat_measured", "Sill mat", "v-minivan-sill"),
  ],
  matrices: [
    matrix("v-minivan-driver", "single", 350, 350),
    matrix("v-minivan-front", "single", 550, 440),
    matrix("v-minivan-ft", "single", 650, 520),
    matrix("v-minivan-r2", "single", 1050, 735),
    matrix("v-minivan-r3", "single", 1410, 987),
    matrix("v-minivan-ts", "single", 310, 248),
    matrix("v-minivan-tl", "single", 510, 408),
    matrix("v-minivan-r3st", "single", 1610, 1127),
    matrix("v-minivan-r3lt", "single", 1810, 1267),
    matrix("v-minivan-r3tt", "single", 1910, 1337),
    matrix("v-minivan-sill", "single", 50, 50),
  ],
  links: [],
}

const busRows = {
  variants: [
    variant("driver_mat", "Driver mat", "v-bus-driver"),
    variant("row_1", "Row 1", "v-bus-row-1"),
    variant("row_2", "Row 2", "v-bus-row-2"),
    variant("row_3", "Row 3", "v-bus-row-3"),
    variant("row_3_trunk", "Row 3 trunk", "v-bus-row-3-trunk"),
    variant("trunk_small", "Trunk small", "v-bus-trunk-small"),
  ],
  matrices: [
    matrix("v-bus-driver", "single", 350, 350),
    matrix("v-bus-row-1", "single", 850, 680),
    matrix("v-bus-row-2", "single", 1450, 1015),
    matrix("v-bus-row-3", "single", 2010, 1407),
    matrix("v-bus-row-3-trunk", "single", 2860, 2002),
    matrix("v-bus-trunk-small", "single", 510, 408),
  ],
  links: [],
}

const passengerCarRows = {
  variants: [
    variant("driver_mat", "Driver mat", "v-driver"),
    variant("passenger_mat", "Passenger mat", "v-passenger"),
    variant("front", "Starter", "v-front"),
    variant("basic", "Basic", "v-basic"),
    variant("premium", "Premium", "v-premium"),
    variant("complete", "Trunk mat", "v-complete"),
    variant("row_3", "Row 3", "v-row-3"),
    variant("row_3_small_trunk_unfolded", "Row 3 small trunk", "v-r3-st"),
    variant("row_3_large_trunk_folded", "Row 3 large trunk", "v-r3-lt"),
    variant("row_3_two_trunks", "Row 3 two trunks", "v-r3-tt"),
    variant("front_rear_two_trunks", "Front rear two trunks", "v-fr-tt"),
  ],
  matrices: [
    matrix("v-driver", "3d-with-rims", 275, 220),
    matrix("v-passenger", "3d-with-rims", 275, 220),
    matrix("v-front", "3d-with-rims", 550, 440),
    matrix("v-basic", "3d-with-rims", 910, 637),
    matrix("v-premium", "3d-with-rims", 1210, 847),
    matrix("v-complete", "classic", 350, 280),
    matrix("v-row-3", "3d-with-rims", 1110, 777),
    matrix("v-r3-st", "3d-with-rims", 1310, 917),
    matrix("v-r3-lt", "3d-with-rims", 1410, 987),
    matrix("v-r3-tt", "3d-with-rims", 1610, 1127),
    matrix("v-fr-tt", "3d-with-rims", 1410, 987),
    matrix("v-front", "classic", 290, 232),
    matrix("v-basic", "classic", 510, 408),
    matrix("v-premium", "classic", 710, 568),
    matrix("v-row-3", "classic", 710, 568),
    matrix("v-r3-st", "classic", 910, 637),
    matrix("v-r3-lt", "classic", 1010, 707),
    matrix("v-r3-tt", "classic", 1110, 777),
    matrix("v-fr-tt", "classic", 810, 648),
  ],
  links: [],
}

describe("resolveVehiclePricing contract", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getActivePricingCatalog.mockResolvedValue(catalog)
    getPricingOverrides.mockResolvedValue([])
    getVariantsByKeys.mockResolvedValue([])
  })

  it("resolves Ford Ranger pickup basic 3D at 693 PLN", async () => {
    getMatTemplateByRecordKey.mockResolvedValue({
      id: "tpl-ranger",
      record_key: "pickup|ford|ranger_6_gen|2022-2028|pickup|966",
      brand_key: "ford",
      model_family_key: "ranger",
      dealer_pricing_category_key: "pickup",
      year_from: 2022,
      year_to: 2028,
      body_type_1_key: "pickup",
      body_type_2_key: null,
      body_type_3_key: null,
    })
    getPricingCategory.mockResolvedValue({
      id: "cat-pickup",
      slug: "pickup",
      label: "Pickup",
      pricing_model: "dual_mat_type",
    })
    getCategoryPricingRows.mockResolvedValue(pickupRows)

    const result = await resolveVehiclePricing({
      recordKey: "pickup|ford|ranger_6_gen|2022-2028|pickup|966",
      year: 2024,
      bodyTypeKey: "pickup",
      matType: "3d-with-rims",
      variantKey: "basic",
    })

    expect(result.pricingCategoryKey).toBe("pickup")
    expect(result.selectedVariant?.priceAfterDiscount).toBe(693)
  })

  it("resolves minivan single-price front at 440 PLN after discount", async () => {
    getMatTemplateByRecordKey.mockResolvedValue({
      id: "tpl-minivan",
      record_key: "minivan|citroen|berlingo_3_gen|2018-2024|minivan|100",
      brand_key: "citroen",
      model_family_key: "berlingo",
      dealer_pricing_category_key: "minivan",
      year_from: 2018,
      year_to: 2024,
      body_type_1_key: "minivan",
      body_type_2_key: null,
      body_type_3_key: null,
    })
    getPricingCategory.mockResolvedValue({
      id: "cat-minivan",
      slug: "minivan",
      label: "Minivan",
      pricing_model: "single_price",
    })
    getCategoryPricingRows.mockResolvedValue(minivanRows)

    const result = await resolveVehiclePricing({
      recordKey: "minivan|citroen|berlingo_3_gen|2018-2024|minivan|100",
      year: 2020,
      bodyTypeKey: "minivan",
      matType: "3d-with-rims",
      variantKey: "front",
    })

    expect(result.availableMatTypes).toEqual(["single"])
    expect(result.matType).toBe("single")
    expect(result.selectedVariant?.priceAfterDiscount).toBe(440)
  })

  it("applies Citroen C8 front override priced as bus at 680 PLN", async () => {
    getMatTemplateByRecordKey.mockResolvedValue({
      id: "tpl-c8",
      record_key: "minivan|citroen|c8_1_gen|2002-2014|minivan|613",
      brand_key: "citroen",
      model_family_key: "c8",
      dealer_pricing_category_key: "minivan",
      year_from: 2002,
      year_to: 2014,
      body_type_1_key: "minivan",
      body_type_2_key: null,
      body_type_3_key: null,
    })
    getPricingCategory.mockImplementation(async (slug: string) => {
      if (slug === "bus") {
        return {
          id: "cat-bus",
          slug: "bus",
          label: "Bus",
          pricing_model: "single_price",
        }
      }
      return {
        id: "cat-minivan",
        slug: "minivan",
        label: "Minivan",
        pricing_model: "single_price",
      }
    })
    getCategoryPricingRows.mockImplementation(
      async (_catalogId: string, categoryId: string) => {
        if (categoryId === "cat-bus") return busRows
        return minivanRows
      },
    )
    getPricingOverrides.mockResolvedValue([
      {
        template_record_key: null,
        brand_key: "citroen",
        model_family_key: "c8",
        year_from: null,
        year_to: null,
        variant_key: "front",
        override_category_slug: "bus",
        fixed_base_price_pln: 850,
        surcharge_pln: 0,
        notes: "C8 front priced as bus",
      },
    ])

    const result = await resolveVehiclePricing({
      recordKey: "minivan|citroen|c8_1_gen|2002-2014|minivan|613",
      year: 2010,
      bodyTypeKey: "minivan",
      matType: "single",
      variantKey: "front",
    })

    expect(result.pricingCategoryKey).toBe("bus")
    expect(result.selectedVariant?.basePrice).toBe(850)
    expect(result.selectedVariant?.priceAfterDiscount).toBe(680)
  })

  it("returns only configurator set variants for passenger_car dual_mat_type", async () => {
    getMatTemplateByRecordKey.mockResolvedValue({
      id: "tpl-passenger",
      record_key: "passenger_car|baic|beijing_5_1_gen|2022-2028|suv|203",
      brand_key: "baic",
      model_family_key: "beijing_5",
      dealer_pricing_category_key: "passenger_car",
      year_from: 2022,
      year_to: 2028,
      body_type_1_key: "suv",
      body_type_2_key: null,
      body_type_3_key: null,
    })
    getPricingCategory.mockResolvedValue({
      id: "cat-passenger",
      slug: "passenger_car",
      label: "Passenger car",
      pricing_model: "dual_mat_type",
    })
    getCategoryPricingRows.mockResolvedValue(passengerCarRows)

    const result3d = await resolveVehiclePricing({
      recordKey: "passenger_car|baic|beijing_5_1_gen|2022-2028|suv|203",
      year: 2024,
      bodyTypeKey: "suv",
      matType: "3d-with-rims",
    })

    expect(result3d.variants.map((item) => item.key)).toEqual([
      "front",
      "basic",
      "premium",
    ])

    const resultClassic = await resolveVehiclePricing({
      recordKey: "passenger_car|baic|beijing_5_1_gen|2022-2028|suv|203",
      year: 2024,
      bodyTypeKey: "suv",
      matType: "classic",
    })

    expect(resultClassic.variants.map((item) => item.key)).toEqual([
      "front",
      "basic",
      "premium",
      "complete",
    ])
  })

  it("returns extended set variants for minivan body on passenger_car pricing", async () => {
    getMatTemplateByRecordKey.mockResolvedValue({
      id: "tpl-sharan",
      record_key: "passenger_car|volkswagen|sharan_2_gen|2010-2022|minivan|100",
      brand_key: "volkswagen",
      model_family_key: "sharan",
      dealer_pricing_category_key: "passenger_car",
      year_from: 2010,
      year_to: 2022,
      body_type_1_key: "minivan",
      body_type_2_key: null,
      body_type_3_key: null,
    })
    getPricingCategory.mockResolvedValue({
      id: "cat-passenger",
      slug: "passenger_car",
      label: "Passenger car",
      pricing_model: "dual_mat_type",
    })
    getCategoryPricingRows.mockResolvedValue(passengerCarRows)

    const result = await resolveVehiclePricing({
      recordKey: "passenger_car|volkswagen|sharan_2_gen|2010-2022|minivan|100",
      year: 2018,
      bodyTypeKey: "minivan",
      matType: "3d-with-rims",
      variantKey: "row_3_two_trunks",
    })

    expect(result.variants.map((item) => item.key)).toEqual([
      "front",
      "basic",
      "premium",
      "row_3",
      "row_3_small_trunk_unfolded",
      "row_3_large_trunk_folded",
      "row_3_two_trunks",
      "front_rear_two_trunks",
    ])
    expect(result.selectedVariant?.basePrice).toBe(1610)
    expect(result.selectedVariant?.priceAfterDiscount).toBe(1127)
  })

  it("returns only evamats.pl minivan variants for Espace-style templates", async () => {
    getMatTemplateByRecordKey.mockResolvedValue({
      id: "tpl-espace",
      record_key: "minivan|renault|espace_4_gen|2002-2014|minivan|100",
      brand_key: "renault",
      model_family_key: "espace_4_gen",
      dealer_pricing_category_key: "minivan",
      year_from: 2002,
      year_to: 2014,
      body_type_1_key: "minivan",
      body_type_2_key: null,
      body_type_3_key: null,
    })
    getPricingCategory.mockResolvedValue({
      id: "cat-minivan",
      slug: "minivan",
      label: "Minivan",
      pricing_model: "single_price",
    })
    getCategoryPricingRows.mockResolvedValue(minivanRows)

    const result = await resolveVehiclePricing({
      recordKey: "minivan|renault|espace_4_gen|2002-2014|minivan|100",
      year: 2010,
      bodyTypeKey: "minivan",
      matType: "single",
    })

    expect(result.variants.map((item) => item.key)).toEqual([
      "driver_mat",
      "front",
      "row_2",
      "row_3",
      "trunk_small",
      "trunk_large",
      "row_3_small_trunk_unfolded",
      "row_3_large_trunk_folded",
      "row_3_two_trunks",
    ])
  })

  it("returns only evamats.pl bus variants for Vito-style templates", async () => {
    getMatTemplateByRecordKey.mockResolvedValue({
      id: "tpl-vito",
      record_key: "bus|mercedes_benz|vito|2014-2027|bus|100",
      brand_key: "mercedes_benz",
      model_family_key: "vito",
      dealer_pricing_category_key: "bus",
      year_from: 2014,
      year_to: 2027,
      body_type_1_key: "bus",
      body_type_2_key: null,
      body_type_3_key: null,
    })
    getPricingCategory.mockResolvedValue({
      id: "cat-bus",
      slug: "bus",
      label: "Bus",
      pricing_model: "single_price",
    })
    getCategoryPricingRows.mockResolvedValue(busRows)

    const result = await resolveVehiclePricing({
      recordKey: "bus|mercedes_benz|vito|2014-2027|bus|100",
      year: 2020,
      bodyTypeKey: "bus",
      matType: "single",
    })

    expect(result.variants.map((item) => item.key)).toEqual([
      "driver_mat",
      "row_2",
      "row_3",
      "row_3_trunk",
    ])
  })
})
