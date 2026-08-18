import {
  isDualShopProduct,
  mapShopVariant,
  type ShopMatType,
  type ShopRawVariant,
} from "./shopSetMapping"

export type ShopTemplateSet = {
  key: string
  label: string
  prices: Partial<Record<ShopMatType, number>>
}

export type ShopTemplateOffer = {
  shopHandle: string
  axis: "dual" | "single"
  sets: ShopTemplateSet[]
}

export type ShopProductInput = {
  shopHandle?: string | null
  variants?: ShopRawVariant[] | null
}

export const buildShopTemplateOffer = (
  _recordKey: string,
  product: ShopProductInput,
): ShopTemplateOffer | null => {
  const variants = product.variants ?? []
  if (variants.length === 0) return null

  const dual = isDualShopProduct(variants)
  const order: string[] = []
  const byKey = new Map<string, ShopTemplateSet>()

  for (const raw of variants) {
    const mapped = mapShopVariant(raw, dual)
    if (!mapped) continue
    let set = byKey.get(mapped.key)
    if (!set) {
      set = { key: mapped.key, label: mapped.label, prices: {} }
      byKey.set(mapped.key, set)
      order.push(mapped.key)
    }
    if (set.prices[mapped.matType] == null) {
      set.prices[mapped.matType] = mapped.price
    }
  }

  if (order.length === 0) return null

  return copyTrunkMatPricesToBothDualTypes({
    shopHandle: product.shopHandle || "",
    axis: dual ? "dual" : "single",
    sets: placeTrunkMatSetsLast(order).map((key) => byKey.get(key)!),
  })
}

const DUAL_TRUNK_MAT_KEYS = new Set([
  "complete",
  "trunk_mat_small",
  "trunk_mat_large",
])

export const copyTrunkMatPricesToBothDualTypes = (
  offer: ShopTemplateOffer,
): ShopTemplateOffer => {
  if (offer.axis !== "dual") return offer
  return {
    ...offer,
    sets: offer.sets.map((set) => {
      if (!DUAL_TRUNK_MAT_KEYS.has(set.key)) return set
      const classic = set.prices.classic
      const rims = set.prices["3d-with-rims"]
      if (classic == null && rims == null) return set
      return {
        ...set,
        prices: {
          ...set.prices,
          classic: classic ?? rims,
          "3d-with-rims": rims ?? classic,
        },
      }
    }),
  }
}

export const TRUNK_MAT_SET_KEY = "complete"

export const placeTrunkMatSetsLast = (keys: string[]): string[] => {
  const cabinSets = keys.filter((key) => !DUAL_TRUNK_MAT_KEYS.has(key))
  const trunkSets = keys.filter((key) => DUAL_TRUNK_MAT_KEYS.has(key))
  return [...cabinSets, ...trunkSets]
}

export const withRequiredTrunkMatKey = (
  keys: string[],
  _pricingModel?: string,
): string[] => placeTrunkMatSetsLast(keys)

export const shopPriceForMatType = (
  set: ShopTemplateSet,
  matType: ShopMatType,
): number | undefined => {
  const direct = set.prices[matType]
  if (direct != null) return direct
  if (!DUAL_TRUNK_MAT_KEYS.has(set.key)) return undefined
  return set.prices.classic ?? set.prices["3d-with-rims"]
}

export const shopAvailableMatTypes = (
  offer: ShopTemplateOffer,
): ShopMatType[] => {
  if (offer.axis === "single") return ["single"]
  const types = new Set<ShopMatType>()
  for (const set of offer.sets) {
    if (set.prices.classic != null) types.add("classic")
    if (set.prices["3d-with-rims"] != null) types.add("3d-with-rims")
  }
  return ["3d-with-rims", "classic"].filter((type) =>
    types.has(type as ShopMatType),
  ) as ShopMatType[]
}
