export type ShopRawVariant = {
  matType?: string | null
  setName?: string | null
  price?: number | null
  available?: boolean | null
}

export type ShopMatType = "classic" | "3d-with-rims" | "single"

export type MappedShopVariant = {
  key: string
  matType: ShopMatType
  label: string
  price: number
}

const DIACRITICS: Record<string, string> = {
  ą: "a",
  ć: "c",
  ę: "e",
  ł: "l",
  ń: "n",
  ó: "o",
  ś: "s",
  ź: "z",
  ż: "z",
}

export const foldShopText = (text: string): string => {
  const lower = (text || "").trim().toLowerCase()
  const replaced = [...lower]
    .map((ch) => DIACRITICS[ch] ?? ch)
    .join("")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  return replaced
}

export const slugShopText = (text: string): string =>
  foldShopText(text).replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")

const labelMap = (raw: Record<string, string>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(raw).map(([label, key]) => [foldShopText(label), key]),
  )

const DUAL_SET_MAP = labelMap({
  "Dywanik Kierowcy": "driver_mat",
  "Przód": "front",
  "Tył": "rear_only",
  "Przód + tył": "basic",
  "Przód + tył + bagażnik": "premium",
  "Mata do bagażnika": "complete",
  Bagażnik: "complete",
  "Przód + tył + 3 rząd": "row_3",
  "Przód + tył + 3 rząd + Mały bagażnik": "row_3_small_trunk_unfolded",
  "Przód + tył + 3 rząd + Duży bagażnik": "row_3_large_trunk_folded",
  "3 rzędy + 2 Bagażniki (Duży | Mały)": "row_3_two_trunks",
  "Przód + tył + Duży bagażnik": "front_rear_two_trunks",
  "Przód + bagażnik": "front_trunk",
  "Przód + tył + 3 bagażniki (1 duzy i 2 malych z przodu i z tylu)":
    "front_rear_three_trunks",
  "Przód + tył + 3 rząd + 3 bagażniki (1 duzy bagaznik i 2 malych z przodu i z tylu)":
    "front_rear_row_3_three_trunks_large",
  "Przód + tył + 3 rząd + 3 bagażniki (1 maly bagaznik i 2 malych z przodu i z tylu)":
    "front_rear_row_3_three_trunks_small",
})

const SINGLE_SET_MAP = labelMap({
  "Dywanik kierowcy": "driver_mat",
  "Przód": "front",
  "1 rząd": "row_1",
  "2 rzędy": "row_2",
  "3 rzędy": "row_3",
  "3 rzędy + mały bagażnik": "row_3_small_trunk_unfolded",
  "3 rzędy + bagażnik MAŁY": "row_3_small_trunk_unfolded",
  "3 rzędy + bagażnik DUŻY": "row_3_large_trunk_folded",
  "3 rzędy + 2 bagażniki mały i duży(całe auto)": "row_3_two_trunks",
  "Bagażnik MAŁY": "trunk_small",
  "Bagażnik DUŻY": "trunk_large",
  "3 rzędy+ bagażnik duży (całe auto)": "row_3_trunk",
  "Duża mata do bagażnika": "trunk_mat_large",
  "1 rząd + Bagażnik": "row_1_trunk",
  "2 rzędy + Bagażnik": "row_2_large_trunk_folded",
  "Mata do Bagażnika": "trunk_mat_small",
  "Przód z tunelem": "front_with_tunnel",
  "Przód bez tunelu": "front_without_tunnel",
  "Przód Bez Tunelu": "front_without_tunnel",
})

const CONSTRUCTION_TYPES: Record<string, ShopMatType> = {
  "3d bez rantow": "classic",
  "3d z rantami": "3d-with-rims",
}

export const shopKeyFromLabel = (label: string): string => {
  const folded = foldShopText(label)
  return DUAL_SET_MAP[folded] ?? SINGLE_SET_MAP[folded] ?? `shop:${slugShopText(label)}`
}

export const isDualShopProduct = (variants: ShopRawVariant[]): boolean =>
  variants.some((variant) => {
    const folded = foldShopText(variant.matType || "")
    return folded in CONSTRUCTION_TYPES
  })

export const mapShopVariant = (
  variant: ShopRawVariant,
  dual: boolean,
): MappedShopVariant | null => {
  if (variant.available === false) return null
  if (variant.price == null || Number.isNaN(Number(variant.price))) return null

  const matFold = foldShopText(variant.matType || "")
  const setFold = foldShopText(variant.setName || "")
  const construction = CONSTRUCTION_TYPES[matFold]
  const label = dual ? (variant.setName || variant.matType || "").trim() : (variant.matType || variant.setName || "").trim()
  const lookup = dual ? setFold || matFold : matFold || setFold
  const mappedKey = dual
    ? DUAL_SET_MAP[lookup]
    : SINGLE_SET_MAP[lookup] ?? DUAL_SET_MAP[lookup]
  const key = mappedKey ?? `shop:${slugShopText(label)}`

  return {
    key,
    matType: dual ? construction ?? "classic" : "single",
    label,
    price: Number(variant.price),
  }
}
