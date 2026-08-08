export const VARIANT_TUNNEL_BONUS_ICON_SRC =
  "/konfigurator/zestaw/tunel-srodkowy.png"

export const VARIANT_TUNNEL_BONUS_LABEL =
  "Tunel środkowy zawsze gratis w komplecie"

export const VARIANT_TUNNEL_BONUS_ALT = "Pokrycie tunelu w zestawie"

const PASSENGER_SET_PRICING_CATEGORIES = new Set([
  "passenger_car",
  "premium_passenger_car",
])

export const shouldShowVariantTunnelBonus = (
  pricingCategoryKey?: string,
): boolean =>
  !!pricingCategoryKey &&
  PASSENGER_SET_PRICING_CATEGORIES.has(pricingCategoryKey)
