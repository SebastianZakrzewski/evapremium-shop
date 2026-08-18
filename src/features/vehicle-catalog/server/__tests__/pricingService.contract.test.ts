import { describe, expect, it, vi, beforeEach } from "vitest"
import { resolveVehiclePricing } from "../pricingService"

const getMatTemplateByRecordKey = vi.fn()
const getActivePricingCatalog = vi.fn()
const getPricingCategory = vi.fn()
const getCategoryPricingRows = vi.fn()
const getPricingOverrides = vi.fn()
const getVariantsByKeys = vi.fn()
const getShopTemplateOffer = vi.fn()

vi.mock("../repository", () => ({
  getMatTemplateByRecordKey: (...args: unknown[]) =>
    getMatTemplateByRecordKey(...args),
}))

vi.mock("../shopOfferRepository", () => ({
  getShopTemplateOffer: (...args: unknown[]) => getShopTemplateOffer(...args),
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
    variant("front", "Przód", "v-front"),
    variant("rear_only", "Tył", "v-rear"),
    variant("basic", "Przód + tył", "v-basic"),
    variant("premium", "Przód + tył + bagażnik", "v-premium"),
    variant("complete", "Mata do bagażnika", "v-complete"),
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
    matrix("v-rear", "3d-with-rims", 550, 440),
    matrix("v-basic", "3d-with-rims", 910, 637),
    matrix("v-premium", "3d-with-rims", 1210, 847),
    matrix("v-complete", "3d-with-rims", 350, 280),
    matrix("v-complete", "classic", 350, 280),
    matrix("v-row-3", "3d-with-rims", 1110, 777),
    matrix("v-r3-st", "3d-with-rims", 1310, 917),
    matrix("v-r3-lt", "3d-with-rims", 1410, 987),
    matrix("v-r3-tt", "3d-with-rims", 1610, 1127),
    matrix("v-fr-tt", "3d-with-rims", 1410, 987),
    matrix("v-front", "classic", 290, 232),
    matrix("v-rear", "classic", 290, 232),
    matrix("v-basic", "classic", 510, 408),
    matrix("v-premium", "classic", 710, 568),
    matrix("v-driver", "classic", 150, 150),
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
    getShopTemplateOffer.mockReturnValue(null)
  })

  it("resolves Ford Ranger pickup basic 3D at 693 PLN", async () => {
    getMatTemplateByRecordKey.mockResolvedValue({
      id: "tpl-ranger",
      record_key: "pickup|ford|ranger_6_gen|2022-2028|pickup|966",
      brand_key: "ford",
      model_family_key: "ranger",
      dealer_pricing_category_key: "pickup",
      seat_rows: 2,
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
      seat_rows: 2,
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
      "driver_mat",
      "front",
      "rear_only",
      "basic",
      "premium",
      "complete",
    ])
    expect(
      result3d.variants.find((item) => item.key === "complete")?.basePrice,
    ).toBe(350)
    expect(
      result3d.variants.find((item) => item.key === "complete")?.priceAfterDiscount,
    ).toBe(280)

    const resultClassic = await resolveVehiclePricing({
      recordKey: "passenger_car|baic|beijing_5_1_gen|2022-2028|suv|203",
      year: 2024,
      bodyTypeKey: "suv",
      matType: "classic",
    })

    expect(resultClassic.variants.map((item) => item.key)).toEqual([
      "driver_mat",
      "front",
      "rear_only",
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
      seat_rows: 3,
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
      "driver_mat",
      "front",
      "rear_only",
      "basic",
      "premium",
      "row_3",
      "row_3_small_trunk_unfolded",
      "row_3_large_trunk_folded",
      "row_3_two_trunks",
      "front_rear_two_trunks",
      "complete",
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
      seat_rows: 3,
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
      seat_rows: 3,
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
      "row_1",
      "row_2",
      "row_3",
      "row_3_trunk",
    ])
  })

  it("maps shop offer 1:1 for XC90 including large-trunk 2-row and shop prices", async () => {
    getMatTemplateByRecordKey.mockResolvedValue({
      id: "tpl-xc90",
      record_key: "passenger_car|volvo|xc90_2_gen|2014-2027|suv|2757",
      brand_key: "volvo",
      model_family_key: "xc90",
      dealer_pricing_category_key: "passenger_car",
      seat_rows: 3,
      year_from: 2014,
      year_to: 2027,
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
    getShopTemplateOffer.mockReturnValue({
      shopHandle: "volvo-xc90",
      axis: "dual",
      sets: [
        { key: "front", label: "Przód", prices: { classic: 290, "3d-with-rims": 550 } },
        { key: "basic", label: "Przód + tył", prices: { classic: 510 } },
        {
          key: "front_rear_two_trunks",
          label: "Przód + tył + Duży bagażnik",
          prices: { classic: 710 },
        },
      ],
    })

    const result = await resolveVehiclePricing({
      recordKey: "passenger_car|volvo|xc90_2_gen|2014-2027|suv|2757",
      year: 2020,
      bodyTypeKey: "suv",
      matType: "classic",
    })

    expect(result.availableMatTypes).toEqual(["3d-with-rims", "classic"])
    expect(result.variants.map((item) => item.key)).toEqual([
      "front",
      "basic",
      "front_rear_two_trunks",
    ])
    expect(result.variants.find((item) => item.key === "premium")).toBeUndefined()
    expect(
      result.variants.find((item) => item.key === "front_rear_two_trunks"),
    ).toMatchObject({
      label: "Przód + tył + Duży bagażnik",
      basePrice: 710,
      priceAfterDiscount: 568,
    })
  })

  it("keeps trunk mat on 3d-with-rims at classic shop price", async () => {
    getMatTemplateByRecordKey.mockResolvedValue({
      id: "tpl-golf",
      record_key: "passenger_car|volkswagen|golf_8_gen|2019-2028|hatchback|1",
      brand_key: "volkswagen",
      model_family_key: "golf",
      dealer_pricing_category_key: "passenger_car",
      seat_rows: 2,
      year_from: 2019,
      year_to: 2028,
      body_type_1_key: "hatchback",
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
    getShopTemplateOffer.mockReturnValue({
      shopHandle: "vw-golf",
      axis: "dual",
      sets: [
        { key: "front", label: "Przód", prices: { classic: 290, "3d-with-rims": 550 } },
        { key: "complete", label: "Mata do bagażnika", prices: { classic: 350 } },
      ],
    })

    const result = await resolveVehiclePricing({
      recordKey: "passenger_car|volkswagen|golf_8_gen|2019-2028|hatchback|1",
      year: 2022,
      bodyTypeKey: "hatchback",
      matType: "3d-with-rims",
    })

    expect(result.variants.map((item) => item.key)).toEqual(["front", "complete"])
    expect(result.variants.find((item) => item.key === "complete")).toMatchObject({
      label: "Mata do bagażnika",
      basePrice: 350,
      priceAfterDiscount: 280,
    })
  })

  it("does not invent trunk mat when shop offer has no complete SET", async () => {
    getMatTemplateByRecordKey.mockResolvedValue({
      id: "tpl-a4",
      record_key: "passenger_car|audi|a4_b9|2015-2024|sedan|1",
      brand_key: "audi",
      model_family_key: "a4",
      dealer_pricing_category_key: "passenger_car",
      seat_rows: 2,
      year_from: 2015,
      year_to: 2024,
      body_type_1_key: "sedan",
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
    getShopTemplateOffer.mockReturnValue({
      shopHandle: "audi-a4",
      axis: "dual",
      sets: [
        { key: "front", label: "Przód", prices: { classic: 290, "3d-with-rims": 550 } },
        { key: "basic", label: "Przód + tył", prices: { classic: 510, "3d-with-rims": 910 } },
      ],
    })

    const result = await resolveVehiclePricing({
      recordKey: "passenger_car|audi|a4_b9|2015-2024|sedan|1",
      year: 2020,
      bodyTypeKey: "sedan",
      matType: "3d-with-rims",
    })

    expect(result.variants.map((item) => item.key)).toEqual([
      "front",
      "basic",
    ])
    expect(result.variants.find((item) => item.key === "complete")).toBeUndefined()
  })

  it("uses classic complete matrix when 3d-with-rims complete row is missing", async () => {
    getMatTemplateByRecordKey.mockResolvedValue({
      id: "tpl-a3",
      record_key: "passenger_car|audi|a3_8y|2020-2028|hatchback|1",
      brand_key: "audi",
      model_family_key: "a3",
      dealer_pricing_category_key: "passenger_car",
      seat_rows: 2,
      year_from: 2020,
      year_to: 2028,
      body_type_1_key: "hatchback",
      body_type_2_key: null,
      body_type_3_key: null,
    })
    getPricingCategory.mockResolvedValue({
      id: "cat-passenger",
      slug: "passenger_car",
      label: "Passenger car",
      pricing_model: "dual_mat_type",
    })
    getCategoryPricingRows.mockResolvedValue({
      ...passengerCarRows,
      matrices: passengerCarRows.matrices.filter(
        (row) => !(row.variant_id === "v-complete" && row.mat_type === "3d-with-rims"),
      ),
    })
    getShopTemplateOffer.mockReturnValue(null)

    const result = await resolveVehiclePricing({
      recordKey: "passenger_car|audi|a3_8y|2020-2028|hatchback|1",
      year: 2022,
      bodyTypeKey: "hatchback",
      matType: "3d-with-rims",
    })

    expect(result.variants.find((item) => item.key === "complete")).toMatchObject({
      basePrice: 350,
      priceAfterDiscount: 280,
    })
  })
})
