import { isMinivanBodyTypeKey } from "@/features/vehicle-catalog/domain/pricingRules"

export type VariantPresentation = {
  name?: string
  description: string
  image: string
}

export type VariantPresentationOptions = {
  seatRows?: number | null
  offeredVariantKeys?: string[]
}

const TWO_ROW_SET_IMAGE = {
  driver: "/konfigurator/zestaw/2rzedy/kierowca.png",
  front: "/konfigurator/zestaw/2rzedy/przod.png",
  rear: "/konfigurator/zestaw/2rzedy/tyl.png",
  frontRear: "/konfigurator/zestaw/2rzedy/przod-tyl.png",
  frontRearTrunk: "/konfigurator/zestaw/2rzedy/przod-tyl-bagaznik.png",
  trunk: "/konfigurator/zestaw/2rzedy/mata-bagaznika.png",
} as const

const THREE_ROW_SET_IMAGE = {
  driver: "/konfigurator/zestaw/3rzedy/kierowca.png",
  front: "/konfigurator/zestaw/3rzedy/przod.png",
  rear: "/konfigurator/zestaw/3rzedy/tyl.png",
  frontRear: "/konfigurator/zestaw/3rzedy/przod-tyl.png",
  frontRearTrunk: "/konfigurator/zestaw/3rzedy/przod-tyl-duzy-bagaznik.png",
  trunk: "/konfigurator/zestaw/3rzedy/mata-bagaznika.png",
  row3: "/konfigurator/zestaw/3rzedy/3rzedy.png",
  row3SmallTrunk: "/konfigurator/zestaw/3rzedy/3rzedy-maly-bagaznik.png",
  row3LargeTrunk: "/konfigurator/zestaw/3rzedy/3rzedy-duzy-bagaznik.png",
  row3TwoTrunks: "/konfigurator/zestaw/3rzedy/3rzedy-maly-i-duzy-bagaznik.png",
} as const

const THREE_ROW_IMAGE_BY_KEY: Record<string, string> = {
  driver_mat: THREE_ROW_SET_IMAGE.driver,
  front: THREE_ROW_SET_IMAGE.front,
  front_with_tunnel: THREE_ROW_SET_IMAGE.front,
  front_without_tunnel: THREE_ROW_SET_IMAGE.front,
  rear_only: THREE_ROW_SET_IMAGE.rear,
  basic: THREE_ROW_SET_IMAGE.frontRear,
  premium: THREE_ROW_SET_IMAGE.frontRearTrunk,
  complete: THREE_ROW_SET_IMAGE.trunk,
  front_trunk: THREE_ROW_SET_IMAGE.frontRearTrunk,
  row_3: THREE_ROW_SET_IMAGE.row3,
  row_3_small_trunk_unfolded: THREE_ROW_SET_IMAGE.row3SmallTrunk,
  row_3_large_trunk_folded: THREE_ROW_SET_IMAGE.row3LargeTrunk,
  row_3_two_trunks: THREE_ROW_SET_IMAGE.row3TwoTrunks,
  front_rear_two_trunks: THREE_ROW_SET_IMAGE.frontRearTrunk,
}

const THREE_ROW_OFFER_HINT_KEYS = new Set([
  "row_3",
  "row_3_small_trunk_unfolded",
  "row_3_large_trunk_folded",
  "row_3_two_trunks",
  "front_rear_two_trunks",
])

export const usesThreeRowPassengerSetGraphics = (
  pricingCategoryKey?: string,
  bodyTypeKey?: string,
  options?: VariantPresentationOptions,
): boolean => {
  if (pricingCategoryKey === "minivan" || pricingCategoryKey === "bus") {
    return false
  }
  if (isMinivanBodyTypeKey(bodyTypeKey)) return true
  if (options?.seatRows === 3) return true
  return (options?.offeredVariantKeys ?? []).some((key) =>
    THREE_ROW_OFFER_HINT_KEYS.has(key),
  )
}

const passengerVariantPresentation: Record<string, VariantPresentation> = {
  driver_mat: {
    name: "Dywanik kierowcy",
    description: "1 dyw. (kierowca)",
    image: TWO_ROW_SET_IMAGE.driver,
  },
  front_trunk: {
    name: "Przód + bagażnik",
    description: "Przód i mata bagażnika",
    image: TWO_ROW_SET_IMAGE.frontRearTrunk,
  },
  front_with_tunnel: {
    name: "Przód z tunelem",
    description: "Dywaniki przednie z tunelem",
    image: TWO_ROW_SET_IMAGE.front,
  },
  front_without_tunnel: {
    name: "Przód bez tunelu",
    description: "Dywaniki przednie bez tunelu",
    image: TWO_ROW_SET_IMAGE.front,
  },
  front: {
    name: "Przód",
    description: "2 dyw. (przód)",
    image: TWO_ROW_SET_IMAGE.front,
  },
  rear_only: {
    name: "Tył",
    description: "Dywaniki tylne",
    image: TWO_ROW_SET_IMAGE.rear,
  },
  basic: {
    name: "Przód + tył",
    description: "5 dyw. (przód + tył)",
    image: TWO_ROW_SET_IMAGE.frontRear,
  },
  premium: {
    name: "Przód + tył + bagażnik",
    description: "Przód, tył i mata bagażnika",
    image: TWO_ROW_SET_IMAGE.frontRearTrunk,
  },
  complete: {
    name: "Mata do bagażnika",
    description: "1 dyw. (mata bagażnik)",
    image: TWO_ROW_SET_IMAGE.trunk,
  },
  row_3: {
    name: "Przód + tył + 3 rząd",
    description: "Komplet na 3 rzędy siedzeń",
    image: "/minivan/3rzedy.png",
  },
  row_3_small_trunk_unfolded: {
    name: "Przód + tył + 3 rząd + mały bagażnik",
    description: "3 rzędy z małym bagażnikiem",
    image: "/minivan/3rzedy_maly_bagaznik.png",
  },
  row_3_large_trunk_folded: {
    name: "Przód + tył + 3 rząd + duży bagażnik",
    description: "3 rzędy z dużym bagażnikiem",
    image: "/minivan/3rzedy_duzy_bagaznik.png",
  },
  row_3_two_trunks: {
    name: "3 rzędy + 2 bagażniki",
    description: "Mały i duży bagażnik",
    image: "/minivan/3rzedy_malybagaznik_duzybagaznik.png",
  },
  front_rear_two_trunks: {
    name: "Przód + tył + duży bagażnik",
    description: "Dwa rzędy z dużym bagażnikiem",
    image: TWO_ROW_SET_IMAGE.frontRearTrunk,
  },
}

const minivanVariantPresentation: Record<string, VariantPresentation> = {
  driver_mat: {
    name: "Dywanik kierowcy",
    description: "1 dyw. (kierowca)",
    image: "/minivan/przod.png",
  },
  front: {
    name: "Przód",
    description: "Dywaniki przednie",
    image: "/minivan/przod.png",
  },
  row_2: {
    name: "2 rzędy",
    description: "Przód i drugi rząd",
    image: "/minivan/2rzedy.png",
  },
  row_3: {
    name: "3 rzędy",
    description: "Przód, środek i tył",
    image: "/minivan/3rzedy.png",
  },
  trunk_small: {
    name: "Bagażnik mały",
    description: "Mata do małego bagażnika",
    image: "/minivan/maly_bagaznik.png",
  },
  trunk_large: {
    name: "Bagażnik duży",
    description: "Mata do dużego bagażnika",
    image: "/minivan/duzy_bagaznik.png",
  },
  row_3_small_trunk_unfolded: {
    name: "3 rzędy + bagażnik mały",
    description: "Komplet z małym bagażnikiem",
    image: "/minivan/3rzedy_maly_bagaznik.png",
  },
  row_3_large_trunk_folded: {
    name: "3 rzędy + bagażnik duży",
    description: "Komplet z dużym bagażnikiem",
    image: "/minivan/3rzedy_duzy_bagaznik.png",
  },
  row_3_two_trunks: {
    name: "Całe auto",
    description: "3 rzędy + 2 bagażniki",
    image: "/minivan/3rzedy_malybagaznik_duzybagaznik.png",
  },
}

const busVariantPresentation: Record<string, VariantPresentation> = {
  driver_mat: {
    name: "Dywanik kierowcy",
    description: "1 dyw. (kierowca)",
    image: "/konfigurator/zestaw/przod.png",
  },
  row_1: {
    name: "1 rząd",
    description: "Pierwszy rząd siedzeń",
    image: "/konfigurator/zestaw/przod.png",
  },
  row_2: {
    name: "2 rzędy",
    description: "Pierwszy i drugi rząd",
    image: "/konfigurator/zestaw/pt.png",
  },
  row_3: {
    name: "3 rzędy",
    description: "Pierwszy, drugi i trzeci rząd",
    image: "/konfigurator/zestaw/ptb.png",
  },
  row_3_trunk: {
    name: "Całe auto",
    description: "3 rzędy + bagażnik duży",
    image: "/konfigurator/zestaw/ptb.png",
  },
  trunk_mat_large: {
    name: "Duża mata do bagażnika",
    description: "Mata do dużego bagażnika",
    image: "/konfigurator/zestaw/mata.png",
  },
}

/** MINIVAN body + passenger_car pricing — extended set variants with minivan graphics */
const passengerPricedMinivanVariantPresentation: Record<string, VariantPresentation> = {
  row_3: {
    name: "Przód + tył + 3 rząd",
    description: "Komplet na 3 rzędy siedzeń",
    image: "/minivan/3rzedy.png",
  },
  row_3_small_trunk_unfolded: {
    name: "Przód + tył + 3 rząd + mały bagażnik",
    description: "3 rzędy z małym bagażnikiem",
    image: "/minivan/3rzedy_maly_bagaznik.png",
  },
  row_3_large_trunk_folded: {
    name: "Przód + tył + 3 rząd + duży bagażnik",
    description: "3 rzędy z dużym bagażnikiem",
    image: "/minivan/3rzedy_duzy_bagaznik.png",
  },
  row_3_two_trunks: {
    name: "3 rzędy + 2 bagażniki",
    description: "Mały i duży bagażnik",
    image: "/minivan/3rzedy_malybagaznik_duzybagaznik.png",
  },
  front_rear_two_trunks: {
    name: "Przód + tył + duży bagażnik",
    description: "Dwa rzędy z dużym bagażnikiem",
    image: "/minivan/duzy_bagaznik.png",
  },
}

const fallbackPresentation: VariantPresentation = {
  description: "Wariant dopasowany do wybranego pojazdu",
  image: TWO_ROW_SET_IMAGE.frontRear,
}

const hasPresentationEntry = (
  map: Record<string, VariantPresentation>,
  variantKey: string,
): boolean => Object.prototype.hasOwnProperty.call(map, variantKey)

export const hasKnownVariantPresentation = (
  variantKey: string,
  pricingCategoryKey?: string,
  bodyTypeKey?: string,
): boolean => {
  if (pricingCategoryKey === "minivan") {
    return hasPresentationEntry(minivanVariantPresentation, variantKey)
  }
  if (pricingCategoryKey === "bus") {
    return hasPresentationEntry(busVariantPresentation, variantKey)
  }
  if (
    isMinivanBodyTypeKey(bodyTypeKey) &&
    hasPresentationEntry(passengerPricedMinivanVariantPresentation, variantKey)
  ) {
    return true
  }
  return hasPresentationEntry(passengerVariantPresentation, variantKey)
}

export const getCanonicalVariantLabel = (
  variantKey: string,
  pricingCategoryKey?: string,
  bodyTypeKey?: string,
): string | null => {
  if (
    !hasKnownVariantPresentation(variantKey, pricingCategoryKey, bodyTypeKey)
  ) {
    return null
  }

  const presentation = getVariantPresentation(
    variantKey,
    pricingCategoryKey,
    bodyTypeKey,
  )

  return presentation.name ?? presentation.description ?? null
}

export const getVariantPresentation = (
  variantKey: string,
  pricingCategoryKey?: string,
  bodyTypeKey?: string,
  options?: VariantPresentationOptions,
): VariantPresentation => {
  if (pricingCategoryKey === "minivan") {
    return minivanVariantPresentation[variantKey] ?? fallbackPresentation
  }
  if (pricingCategoryKey === "bus") {
    return busVariantPresentation[variantKey] ?? fallbackPresentation
  }

  const base =
    passengerVariantPresentation[variantKey] ??
    passengerPricedMinivanVariantPresentation[variantKey] ??
    fallbackPresentation

  if (usesThreeRowPassengerSetGraphics(pricingCategoryKey, bodyTypeKey, options)) {
    const image = THREE_ROW_IMAGE_BY_KEY[variantKey]
    if (image) return { ...base, image }
  }

  if (
    isMinivanBodyTypeKey(bodyTypeKey) &&
    passengerPricedMinivanVariantPresentation[variantKey]
  ) {
    return passengerPricedMinivanVariantPresentation[variantKey]
  }

  return passengerVariantPresentation[variantKey] ?? fallbackPresentation
}
