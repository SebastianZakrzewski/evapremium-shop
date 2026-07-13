import { isMinivanBodyTypeKey } from "@/features/vehicle-catalog/domain/pricingRules"

export type VariantPresentation = {
  name?: string
  description: string
  image: string
}

const passengerVariantPresentation: Record<string, VariantPresentation> = {
  front: {
    name: "Starter",
    description: "2 dyw. (przód)",
    image: "/konfigurator/zestaw/przod.png",
  },
  basic: {
    name: "Podstawowy",
    description: "5 dyw. (przód + tył)",
    image: "/konfigurator/zestaw/pt.png",
  },
  premium: {
    name: "Premium",
    description: "5 dyw. (przód + tył + bagażnik)",
    image: "/konfigurator/zestaw/ptb.png",
  },
  complete: {
    name: "Bagażnik",
    description: "1 dyw. (mata bagażnik)",
    image: "/konfigurator/zestaw/mata.png",
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
  image: "/konfigurator/zestaw/pt.png",
}

export const getVariantPresentation = (
  variantKey: string,
  pricingCategoryKey?: string,
  bodyTypeKey?: string,
): VariantPresentation => {
  if (pricingCategoryKey === "minivan") {
    return minivanVariantPresentation[variantKey] ?? fallbackPresentation
  }
  if (pricingCategoryKey === "bus") {
    return busVariantPresentation[variantKey] ?? fallbackPresentation
  }
  if (
    isMinivanBodyTypeKey(bodyTypeKey) &&
    passengerPricedMinivanVariantPresentation[variantKey]
  ) {
    return passengerPricedMinivanVariantPresentation[variantKey]
  }
  return passengerVariantPresentation[variantKey] ?? fallbackPresentation
}
