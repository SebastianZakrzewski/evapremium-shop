export const VEHICLE_CATEGORY_EN = {
  minivan: "minivan",
  auto_osobowe: "passenger_car",
  bus: "bus",
  pickup: "pickup",
  indywidualna_wycena: "custom_quote",
}

export const PRICING_TABLE_EN = {
  auta_osobowe: "passenger_car",
  minivany: "minivan",
  busy: "bus",
  pickup: "pickup",
  auta_ciezarowe: "heavy_truck",
  auto_osobowe_legacy: "passenger_car_legacy",
}

export const PRICING_TABLE_LABELS = {
  passenger_car: "Passenger car",
  minivan: "Minivan",
  bus: "Bus",
  pickup: "Pickup",
  heavy_truck: "Heavy truck",
  passenger_car_legacy: "Passenger car legacy (pre-2000 / no templates)",
}

export const VEHICLE_CATEGORY_LABELS = {
  minivan: "Minivan",
  passenger_car: "Passenger car",
  bus: "Bus",
  pickup: "Pickup",
  custom_quote: "Custom quote / exceptions",
}

export const VARIANT_SLUG_LABELS = {
  front: "Front only",
  basic: "Front and rear",
  premium: "Front rear and trunk",
  complete: "Trunk mat",
  driver_mat: "Driver mat",
  passenger_mat: "Passenger mat",
  row_1: "Row 1",
  row_2: "Row 2",
  row_3: "Row 3",
}

export const BODY_TYPE_EN = {
  "hatchback 5 drzwi": "hatchback_5_door",
  "hatchback 3 drzwi": "hatchback_3_door",
  liftback: "liftback",
  kombi: "wagon",
  sedan: "sedan",
  terenowka: "off_road",
  limuzyna: "limousine",
  coupe: "coupe",
  "suv coupe": "suv_coupe",
  kabriolet: "convertible",
  "suv 3 drzwi": "suv_3_door",
  "suv 5 drzwi": "suv_5_door",
  "suv 7 osobowy": "suv_7_seater",
  "suv 6 osobowy": "suv_6_seater",
  fastback: "fastback",
  kombivan: "combi_van",
  suv: "suv",
  hatchback: "hatchback",
  "liftback 3 drzwi": "liftback_3_door",
  roadster: "roadster",
  buggy: "buggy",
}

export const BODY_TYPE_LABELS = {
  hatchback_5_door: "Hatchback 5 door",
  hatchback_3_door: "Hatchback 3 door",
  liftback: "Liftback",
  wagon: "Wagon",
  sedan: "Sedan",
  off_road: "Off-road",
  limousine: "Limousine",
  coupe: "Coupe",
  suv_coupe: "SUV coupe",
  convertible: "Convertible",
  suv_3_door: "SUV 3 door",
  suv_5_door: "SUV 5 door",
  suv_7_seater: "SUV 7 seater",
  suv_6_seater: "SUV 6 seater",
  fastback: "Fastback",
  combi_van: "Combi van",
  suv: "SUV",
  hatchback: "Hatchback",
  liftback_3_door: "Liftback 3 door",
  roadster: "Roadster",
  buggy: "Buggy",
}

const VARIANT_PHRASE_RULES = [
  ["dywanik kierowcy + bagaznik duzy", "driver_mat_large_trunk"],
  ["dywanik pasazera + tyl + bagaznik", "passenger_mat_rear_trunk"],
  ["dywanik pasazera + tyl", "passenger_mat_rear"],
  ["dywanik kierowcy", "driver_mat"],
  ["dywanik pasazera", "passenger_mat"],
  ["przod + tyl + 3 rzad + 3 bagazniki (1 maly bagaznik i 2 malych z przodu i z tylu)", "front_rear_row_3_three_trunks_small"],
  ["przod + tyl + 3 rzad + 3 bagazniki (1 duzy bagaznik i 2 malych z przodu i z tylu)", "front_rear_row_3_three_trunks_large"],
  ["przod + tyl + 3 bagazniki (1 duzy i 2 malych z przodu i z tylu)", "front_rear_three_trunks"],
  ["przod+3 rzad+bagaznik duzy (na zlozony 3 rzad)", "front_row_3_large_trunk_folded"],
  ["przod+3 rzad+bagaznik maly (na rozlozony 3 rzad)", "front_row_3_small_trunk_unfolded"],
  ["tyl + 3 rzad + bagaznik duzy (na zlozony 3 rzad)", "rear_row_3_large_trunk_folded"],
  ["tyl + 3 rzad + bagaznik maly (na rozlozony 3 rzad)", "rear_row_3_small_trunk_unfolded"],
  ["3 rzedy + duzy bagaznik i maly bagaznik - osobowe", "row_3_large_and_small_trunk_passenger"],
  ["3 rzedy + duzy bagaznik i maly bagaznik", "row_3_large_and_small_trunk"],
  ["3 rzedy + duzy bagaznik - osobowe", "row_3_large_trunk_passenger"],
  ["3 rzedy + maly bagaznik - osobowe", "row_3_small_trunk_passenger"],
  ["3 rzedy - osobowe", "row_3_passenger"],
  ["3 rzedy + 2 bagazniki (maly i duzy lub dolny i gorny)", "row_3_two_trunks"],
  ["3 rzedy + 2 bagazniki (maly+duzy)", "row_3_two_trunks"],
  ["3 rzedy + bagaznik duzy (na zlozony 3 rzad)", "row_3_large_trunk_folded"],
  ["3 rzedy + bagaznik maly (na rozlozony 3 rzad)", "row_3_small_trunk_unfolded"],
  ["2 rzedy + bagaznik duzy (na zlozony 3 rzad)", "row_2_large_trunk_folded"],
  ["2 rzedy + bagaznik maly (na rozlozony 3 rzad)", "row_2_small_trunk_unfolded"],
  ["1 rzad + bagaznik duzy (na zlozony 3 rzad)", "row_1_large_trunk_folded"],
  ["1 rzad + bagaznik maly (na rozlozony 3 rzad)", "row_1_small_trunk_unfolded"],
  ["bagaznik duzy (np. na zlozony 3 rzad)", "trunk_large_folded"],
  ["bagaznik maly (np. na rozlozony 3 rzad)", "trunk_small_unfolded"],
  ["tylko przod z tunelem", "front_only_with_tunnel"],
  ["tylko przod", "front_only"],
  ["tylko tyl", "rear_only"],
  ["przod z tunelem", "front_with_tunnel"],
  ["przod bez tunelu", "front_without_tunnel"],
  ["przod + tyl + bagaznik", "front_rear_trunk"],
  ["przod + tyl", "front_and_rear"],
  ["przod i tyl", "front_and_rear"],
  ["przod tyl + bagaznik", "front_rear_trunk"],
  ["przod tyl + 2 bagazniki", "front_rear_two_trunks"],
  ["przod+3 rzad+bagaznik", "front_row_3_trunk"],
  ["przod + 3 rzad", "front_row_3"],
  ["tyl + 3 rzad", "rear_row_3"],
  ["przod + bagaznik", "front_trunk"],
  ["przod + bagaznik maly", "front_small_trunk"],
  ["tyl + bagaznik", "rear_trunk"],
  ["tyl + bagaznik maly", "rear_small_trunk"],
  ["3 rzedy + duzy bagaznik", "row_3_large_trunk"],
  ["3 rzedy + maly bagaznik", "row_3_small_trunk"],
  ["2 rzedy + duzy bagaznik", "row_2_large_trunk"],
  ["2 rzedy + maly bagaznik", "row_2_small_trunk"],
  ["1 rzad + duzy bagaznik", "row_1_large_trunk"],
  ["1 rzad + bagaznik maly", "row_1_small_trunk"],
  ["1 rzad + bagaznik", "row_1_trunk"],
  ["3 rzad + bagaznik duzy", "row_3_single_large_trunk"],
  ["3 rzad + bagaznik maly", "row_3_single_small_trunk"],
  ["3 rzedy + bagaznik", "row_3_trunk"],
  ["3 rzedy+bagaznik", "row_3_trunk"],
  ["mata do bagaznika duza", "trunk_mat_large"],
  ["mata do bagaznika mala", "trunk_mat_small"],
  ["mata do bagaznika", "trunk_mat"],
  ["mata do domu", "home_mat"],
  ["bagaznik niestandardowy", "trunk_custom"],
  ["bagaznik duzy", "trunk_large"],
  ["bagaznik maly", "trunk_small"],
  ["niestandardowe zamowienie", "custom_order"],
  ["dywanik na tunel", "tunnel_mat"],
  ["dywanik na progi (tylko jesli mamy pomiary)", "sill_mat_measured"],
  ["rodziaj kompletu", "set_type_header"],
  ["przod", "front"],
  ["tyl", "rear"],
  ["2 rzedy", "row_2"],
  ["3 rzedy", "row_3"],
  ["1 rzad", "row_1"],
  ["2 rzad", "row_2_single"],
  ["3 rzad", "row_3_single"],
]

const SHIPPING_EN = {
  kosztdostawydywanikow: { key: "mat_delivery_cost", label: "Mat delivery cost" },
  kosztdostawyproduktow: { key: "product_delivery_cost", label: "Product delivery cost" },
  realizacjapremium3dni: {
    key: "premium_fulfillment_3_days",
    label: "Premium fulfillment 3 days (if measurements available)",
  },
  realizacjaexpress7dni: {
    key: "express_fulfillment_7_days",
    label: "Express fulfillment 7 days (if measurements available)",
  },
}

const EXTRA_LABEL_EN = {
  "probki materialu (za wysylke )": "material_samples_shipping",
  "dywanik na tunel": "tunnel_mat",
  "3d jezor na dywaniku klasycznym": "classic_mat_3d_lip",
  "tylne obicia siedzen (jesli mamy pomiar)": "rear_seat_upholstery_measured",
  "romby pionowo": "vertical_rhombus",
  "zmiana kolorow mat lub obszyc w jednym rzedzie w zestawie (przod i tyl lub przod tyl i bagaznik)":
    "color_change_one_row_in_set",
  "zmiana koloru maty lub obszycia jednego dywanika w zestawie": "color_change_single_mat_in_set",
  "poprawa dywanikow na indywidualna prosbe klienta (np: zmiania koloru obszyc w gotowych dywanikach)":
    "custom_mat_adjustment",
  "zmiana koloru nici w komplecie": "thread_color_change_in_set",
  "stopery do dywanikow 1szt (gora, dol)": "mat_stoppers_single",
}

const POLISH_CHAR_MAP = {
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

const stripPolishChars = (value) =>
  value.replace(/[ąćęłńóśźż]/gi, (char) => POLISH_CHAR_MAP[char.toLowerCase()] ?? char)

export const toSnakeKey = (value) =>
  value
    ? stripPolishChars(value)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .replace(/_+/g, "_")
    : ""

const normalizePolish = (value) =>
  value
    ? stripPolishChars(value)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
    : ""

export const toEnglishVehicleCategory = (category) =>
  VEHICLE_CATEGORY_EN[category] ?? toSnakeKey(category)

export const toEnglishPricingTable = (table) =>
  PRICING_TABLE_EN[table] ?? toSnakeKey(table)

export const keyToLabel = (key) =>
  key
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

export const translateVariant = (polishLabel, variantSlug = null) => {
  if (!polishLabel) {
    return { variant_key: "", variant_label: "" }
  }

  if (variantSlug && VARIANT_SLUG_LABELS[variantSlug]) {
    return {
      variant_key: variantSlug,
      variant_label: VARIANT_SLUG_LABELS[variantSlug],
    }
  }

  const normalized = normalizePolish(polishLabel)
  for (const [phrase, key] of VARIANT_PHRASE_RULES) {
    if (normalized === phrase || normalized.includes(phrase)) {
      return { variant_key: key, variant_label: keyToLabel(key) }
    }
  }

  const fallbackKey = toSnakeKey(polishLabel)
  return { variant_key: fallbackKey, variant_label: keyToLabel(fallbackKey) }
}

export const translateBodyType = (polishLabel) => {
  const normalized = normalizePolish(polishLabel)
  const key = BODY_TYPE_EN[normalized] ?? toSnakeKey(polishLabel)
  return {
    body_type_key: key,
    body_type_label: BODY_TYPE_LABELS[key] ?? keyToLabel(key),
  }
}

export const translateShippingEntry = (label, snakeFromLabel) => {
  const normalized = toSnakeKey(label).replace(/\(.*\)/g, "")
  const mapped =
    SHIPPING_EN[normalized] ??
    Object.values(SHIPPING_EN).find((entry) => entry.key === snakeFromLabel)

  if (mapped) {
    return { key: mapped.key, label: mapped.label }
  }

  return { key: snakeFromLabel || toSnakeKey(label), label: keyToLabel(snakeFromLabel || label) }
}

export const translateExtraLabel = (label) => {
  const normalized = normalizePolish(label)
  const key = EXTRA_LABEL_EN[normalized] ?? toSnakeKey(label)
  return { extra_key: key, extra_label: keyToLabel(key) }
}

export const translateAccessoryLabel = (label) => {
  const key = toSnakeKey(label)
  return { accessory_key: key, accessory_label: keyToLabel(key) }
}

export const translateNote = (text) => {
  if (!text || typeof text !== "string") return { note_key: "", note_label: "" }
  const key = toSnakeKey(text).slice(0, 80)
  return { note_key: key, note_label: text }
}

export const META_EN = {
  deposit_rules:
    "DEPOSIT: Each order requires a minimum prepayment for mat production: fronts - 100 PLN, front+rear / front+rear+trunk - 200 PLN, orders above 2000 PLN - 300 PLN deposit, above 3000 PLN - 400 PLN deposit, etc. EXCEPTION: ORDERS FOR PRODUCTS MARKED WITH A STAR ONLY (heel pads, organizers, etc.)",
  discount_note: "20% below 910 PLN threshold, 30% from 910 PLN (after-discount columns)",
  free_shipping_note:
    "FREE shipping - only full sets Front rear + trunk or if order exceeds 700 PLN",
  vehicle_mapping_description:
    "Maps car models to pricing category. Use vehicle_category to select the pricing table.",
  bitrix_description:
    "Bitrix24 field UF_CRM_1757024931236 (set variant) labels per pricing segment",
  segments_description:
    "Unified structure per vehicle segment (minivan, passenger_car, bus, pickup) with three data layers",
}
