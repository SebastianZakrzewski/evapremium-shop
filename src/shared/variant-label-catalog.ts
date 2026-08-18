/**
 * Polish fallback labels for variants outside configurator presentation maps
 * (pickup, legacy keys). Keys align with evamats cennik variant_key.
 */
import cennik from "@/data/evamats-cennik.normalized.json"

type CennikCategory = {
  items?: Array<{ variant_key: string; variant_label: string }>
}

const ENGLISH_CENNIK_LABELS = new Set(
  Object.values(cennik.categories as Record<string, CennikCategory>).flatMap(
    (category) =>
      category.items?.map((item) => item.variant_label.trim()) ?? [],
  ),
)

export const POLISH_VARIANT_LABEL_FALLBACKS: Record<string, string> = {
  driver_mat: "Dywanik kierowcy",
  driver_mat_large_trunk: "Dywanik kierowcy + bagażnik duży",
  passenger_mat: "Dywanik pasażera",
  passenger_mat_rear: "Dywanik pasażera + tył",
  passenger_mat_rear_trunk: "Dywanik pasażera + tył + bagażnik",
  front: "Przód",
  front_only: "Przód",
  front_only_with_tunnel: "Przód z tunelem",
  front_with_tunnel: "Przód z tunelem",
  front_without_tunnel: "Przód bez tunelu",
  rear: "Tył",
  rear_only: "Tył",
  front_and_rear: "Przód + tył",
  front_rear_trunk: "Przód + tył + bagażnik",
  front_rear_two_trunks: "Przód + tył + duży bagażnik",
  front_trunk: "Przód + bagażnik",
  rear_trunk: "Tył + bagażnik",
  row_1: "1 rząd",
  row_1_large_trunk_folded: "1 rząd + bagażnik duży",
  row_1_small_trunk: "1 rząd + bagażnik mały",
  row_1_small_trunk_unfolded: "1 rząd + bagażnik mały",
  row_1_trunk: "1 rząd + bagażnik",
  row_2: "2 rzędy",
  row_2_large_trunk_folded: "2 rzędy + bagażnik duży",
  row_2_small_trunk_unfolded: "2 rzędy + bagażnik mały",
  row_3: "3 rzędy",
  row_3_single: "3 rząd",
  row_3_single_large_trunk: "3 rząd + bagażnik duży",
  row_3_single_small_trunk: "3 rząd + bagażnik mały",
  row_3_trunk: "3 rzędy + bagażnik",
  row_3_small_trunk: "3 rzędy + mały bagażnik",
  row_3_large_trunk: "3 rzędy + duży bagażnik",
  row_3_small_trunk_unfolded: "3 rzędy + bagażnik mały",
  row_3_large_trunk_folded: "3 rzędy + bagażnik duży",
  row_3_two_trunks: "3 rzędy + 2 bagażniki",
  trunk_small: "Bagażnik mały",
  trunk_small_unfolded: "Bagażnik mały",
  trunk_large: "Bagażnik duży",
  trunk_large_folded: "Bagażnik duży",
  trunk_mat_small: "Mata bagażnik mały",
  trunk_mat_large: "Mata bagażnik duży",
  trunk_custom: "Bagażnik na wymiar",
  sill_mat_measured: "Mata na próg (mierzona)",
  front_row_3: "Przód + 3 rząd",
  rear_row_3: "Tył + 3 rząd",
  front_row_3_trunk: "Przód + 3 rząd + bagażnik",
  front_row_3_large_trunk_folded: "Przód + 3 rząd + bagażnik duży",
  front_row_3_small_trunk_unfolded: "Przód + 3 rząd + bagażnik mały",
  rear_row_3_large_trunk_folded: "Tył + 3 rząd + bagażnik duży",
  rear_row_3_small_trunk_unfolded: "Tył + 3 rząd + bagażnik mały",
  front_rear_row_3_three_trunks_large:
    "Przód + tył + 3 rząd + 3 bagażniki (duży)",
  front_rear_row_3_three_trunks_small:
    "Przód + tył + 3 rząd + 3 bagażniki (mały)",
  front_rear_three_trunks: "Przód + tył + 3 bagażniki",
  home_mat: "Mata domowa",
  tunnel_mat: "Mata tunel",
  custom_order: "Wycena indywidualna",
  basic: "Przód + tył",
  premium: "Przód + tył + bagażnik",
  complete: "Mata do bagażnika",
}

export const isEnglishCatalogVariantLabel = (
  label: string,
  variantKey?: string,
): boolean => {
  const trimmed = label.trim()
  if (!trimmed) return false
  if (variantKey && trimmed === variantKey) return true
  if (ENGLISH_CENNIK_LABELS.has(trimmed)) return true
  if (trimmed.includes("_")) return true
  return false
}

export const getPolishVariantLabelFallback = (variantKey: string): string | null =>
  POLISH_VARIANT_LABEL_FALLBACKS[variantKey] ?? null
