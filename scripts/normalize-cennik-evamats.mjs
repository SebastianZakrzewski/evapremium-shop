/**
 * Normalizes CENNIK EVAMATS.xlsx into three JSON layers:
 * 1) pricing (cennik) by vehicle category
 * 2) model → vehicle category mapping (minivan / auto_osobowe / bus / pickup)
 * 3) Bitrix "Wariant kompletu" labels per cennik segment
 *
 * Run after exporting raw sheets:
 *   npx xlsx-cli "<path>/CENNIK EVAMATS (3).xlsx" --sheet "Cennik" -J -o output/cennik-sheet-raw.json
 *   npx xlsx-cli "<path>/CENNIK EVAMATS (3).xlsx" --sheet "MinivanAuto osoboweBUSPickup" -J -o output/vehicle-mapping-sheet-raw.json
 *   npx xlsx-cli "<path>/CENNIK EVAMATS (3).xlsx" --sheet "Wariant kompletu Bitrix" -J -o output/bitrix-variant-sheet-raw.json
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import {
  META_EN,
  PRICING_TABLE_LABELS,
  VEHICLE_CATEGORY_LABELS,
  toEnglishPricingTable,
  toEnglishVehicleCategory,
  toSnakeKey,
  translateAccessoryLabel,
  translateBodyType,
  translateExtraLabel,
  translateNote,
  translateShippingEntry,
  translateVariant,
} from "./evamats-translations.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const outputDir = path.join(root, "output")
const dataDir = path.join(root, "src", "data")

const CENNIK_RAW = path.join(outputDir, "cennik-sheet-raw.json")
const VEHICLE_RAW = path.join(outputDir, "vehicle-mapping-sheet-raw.json")
const BITRIX_RAW = path.join(outputDir, "bitrix-variant-sheet-raw.json")
const SOURCE_FILE = "CENNIK EVAMATS (3).xlsx"

const VARIANT_SLUG_MAP = [
  { match: /^tylko prz[oó]d$/i, slug: "front" },
  { match: /^prz[oó]d i tył$/i, slug: "basic" },
  { match: /^prz[oó]d tył \+ baga[zż]nik$/i, slug: "premium" },
  { match: /^mata do baga[zż]nika$/i, slug: "complete" },
  { match: /^dywanik kierowcy$/i, slug: "driver_mat" },
  { match: /^dywanik pasa[zż]era$/i, slug: "passenger_mat" },
  { match: /^1 rz[aą]d$/i, slug: "row_1" },
  { match: /^2 rz[eę]dy$/i, slug: "row_2" },
  { match: /^3 rz[eę]dy$/i, slug: "row_3" },
]

const parseMoney = (value) => {
  if (value === null || value === undefined || value === "") return null
  if (typeof value === "number" && !Number.isNaN(value)) return Math.round(value * 100) / 100
  const str = String(value).trim()
  if (!str || str.toUpperCase() === "X") return null
  const cleaned = str
    .replace(/\s*zł\s*/gi, "")
    .replace(/\s*zl\s*/gi, "")
    .replace(/[^\d,.-]/g, "")
    .replace(",", ".")
  const num = Number.parseFloat(cleaned)
  return Number.isFinite(num) ? Math.round(num * 100) / 100 : null
}

const parseDiscountFlag = (value) => {
  if (value === null || value === undefined || value === "") return null
  if (typeof value === "number") {
    if (value > 0 && value < 1) {
      if (value === 0.2) return { rate: 0.2, label: "20%" }
      if (value === 0.3) return { rate: 0.3, label: "30%" }
      return { rate: value, label: `${Math.round(value * 100)}%` }
    }
    return { priceAfterDiscountPln: value }
  }
  const str = String(value).trim().toUpperCase()
  if (str === "X") return { excluded: true, label: "no_discount" }
  const num = parseMoney(value)
  if (num !== null) return { priceAfterDiscountPln: num }
  if (str.includes("20%")) return { rate: 0.2, label: "20%" }
  if (str.includes("30%")) return { rate: 0.3, label: "30%" }
  if (str.includes("25%")) return { rate: 0.25, label: "25%" }
  if (str.includes("35%")) return { rate: 0.35, label: "35%" }
  return { raw: String(value) }
}

const slugifyVariant = (label) => {
  if (!label || typeof label !== "string") return null
  const trimmed = label.trim()
  const found = VARIANT_SLUG_MAP.find((r) => r.match.test(trimmed))
  return found?.slug ?? null
}

const normalizeKey = toSnakeKey

const CENNIK_CATEGORIES = {
  auta_osobowe: {
    id: "auta_osobowe",
    label: "Auta osobowe",
    pricingModel: "dual_mat_type",
    variantKey: "CENNIK EVAMATS",
    classicKey: "__EMPTY_2",
    rimsKey: "__EMPTY_3",
    discountClassicKey: "__EMPTY_4",
    discountRimsKey: "__EMPTY_5",
  },
  minivany: {
    id: "minivany",
    label: "Minivany",
    pricingModel: "single_price",
    variantKey: "__EMPTY_6",
    priceKey: "__EMPTY_9",
    discount20Key: "__EMPTY_10",
    discount30Key: "__EMPTY_11",
  },
  busy: {
    id: "busy",
    label: "Busy",
    pricingModel: "single_price",
    variantKey: "__EMPTY_12",
    priceKey: "__EMPTY_15",
    discount20Key: "__EMPTY_16",
    discount30Key: "__EMPTY_17",
  },
  pickup: {
    id: "pickup",
    label: "Pickupy",
    pricingModel: "dual_mat_type",
    variantKey: "__EMPTY_18",
    classicKey: "__EMPTY_21",
    rimsKey: "__EMPTY_22",
    discountClassicKey: "__EMPTY_23",
    discountRimsKey: "CENNIK EVAMATS_4",
  },
  auta_ciezarowe: {
    id: "auta_ciezarowe",
    label: "Auta ciężarowe",
    pricingModel: "single_price",
    variantKey: "__EMPTY_25",
    priceKey: "__EMPTY_28",
    discount20Key: "__EMPTY_29",
    discount30Key: "CENNIK EVAMATS_5",
  },
  auto_osobowe_legacy: {
    id: "auto_osobowe_legacy",
    label: 'Auto osobowe poniżej 2000 / "angliki" bez szablonów',
    pricingModel: "dual_mat_type",
    variantKey: "__EMPTY_31",
    classicKey: "__EMPTY_34",
    rimsKey: "__EMPTY_35",
    discountClassicKey: "CENNIK EVAMATS_6",
    discountRimsKey: "__EMPTY_36",
  },
}

const mapDiscount = (value) => {
  const parsed = parseDiscountFlag(value)
  if (!parsed) return null
  if (parsed.excluded) return { excluded: true, label: "no_discount" }
  if (parsed.rate != null) return { rate: parsed.rate, label: parsed.label }
  if (parsed.priceAfterDiscountPln != null) {
    return { price_after_discount_pln: parsed.priceAfterDiscountPln }
  }
  if (parsed.raw) return { raw: parsed.raw }
  return parsed
}

const isPricingVariantLabel = (variantLabel) => {
  const translated = translateVariant(variantLabel, slugifyVariant(variantLabel))
  const key = translated.variant_key
  if (!key || key === "set_type_header") return false
  if (key.startsWith("jesli_nie_mamy")) return false
  if (key.startsWith("pod_kazdy_model")) return false
  if (key.includes("wycena_indywidualna")) return false
  return true
}

const buildVariantItem = (variantLabel) => {
  const variantSlug = slugifyVariant(variantLabel)
  const translated = translateVariant(variantLabel, variantSlug)
  return {
    variant_label: translated.variant_label,
    variant_slug: variantSlug,
    variant_key: translated.variant_key,
  }
}

const parseCennikLayer = (rows) => {
  const meta = {
    source_sheet: "Cennik",
    deposit_rules: META_EN.deposit_rules,
    discount_legend: {
      no_discount: "X",
      tier_below_910: 0.2,
      tier_from_910: 0.3,
      note: META_EN.discount_note,
    },
    shipping: {},
    extras: [],
    accessories: [],
    other_products: [],
  }

  const categories = {}

  for (const [catId, cfg] of Object.entries(CENNIK_CATEGORIES)) {
    const enId = toEnglishPricingTable(catId)
    categories[enId] = {
      id: enId,
      label: PRICING_TABLE_LABELS[enId] ?? cfg.label,
      pricing_model: cfg.pricingModel,
      items: [],
    }
  }

  let inExtras = false
  let inShipping = false

  for (const row of rows) {
    const label = row["CENNIK EVAMATS"]?.toString?.().trim()
    if (!label) continue

    if (label === "Inne" && !row.__EMPTY_6) {
      inExtras = true
      continue
    }
    if (label === "Koszty wysyłki") {
      inShipping = true
      inExtras = false
      continue
    }
    if (label === "UWAGA") {
      inShipping = false
      continue
    }

    if (inShipping) {
      const price = parseMoney(row.__EMPTY_2)
      if (price !== null) {
        const shippingKey = normalizeKey(label)
        const translated = translateShippingEntry(label, shippingKey)
        meta.shipping[translated.key] = {
          label: translated.label,
          price_pln: price,
          discount_excluded: row.__EMPTY_4 === "X",
        }
      }
      if (label.includes("GRATIS")) {
        meta.shipping.free_shipping_note = META_EN.free_shipping_note
      }
      continue
    }

    if (inExtras) {
      const translated = translateExtraLabel(label)
      meta.extras.push({
        extra_key: translated.extra_key,
        label: translated.extra_label,
        price_pln: parseMoney(row.__EMPTY_2),
        discount: mapDiscount(row.__EMPTY_4),
      })
      continue
    }

    for (const [catId, cfg] of Object.entries(CENNIK_CATEGORIES)) {
      const variantLabel = row[cfg.variantKey]?.toString?.().trim()
      if (!variantLabel) continue

      const enId = toEnglishPricingTable(catId)
      const item = buildVariantItem(variantLabel)

      if (cfg.pricingModel === "dual_mat_type") {
        item.classic = {
          base_price_pln: parseMoney(row[cfg.classicKey]),
          after_discount: mapDiscount(row[cfg.discountClassicKey]),
        }
        item.rims_3d = {
          base_price_pln: parseMoney(row[cfg.rimsKey]),
          after_discount: mapDiscount(row[cfg.discountRimsKey]),
        }
      } else {
        item.price_pln = parseMoney(row[cfg.priceKey])
        item.after_discount_20 = mapDiscount(row[cfg.discount20Key])
        item.after_discount_30 = mapDiscount(row[cfg.discount30Key])
      }

      const hasPrice =
        item.price_pln != null ||
        item.classic?.base_price_pln != null ||
        item.rims_3d?.base_price_pln != null

      if (!hasPrice) continue
      if (!isPricingVariantLabel(variantLabel)) continue

      const existing = categories[enId].items.find(
        (i) => i.variant_key === item.variant_key
      )
      if (!existing) categories[enId].items.push(item)
    }

    const accLabel = row.__EMPTY_38?.toString?.().trim()
    if (accLabel) {
      const translated = translateAccessoryLabel(accLabel)
      meta.accessories.push({
        accessory_key: translated.accessory_key,
        label: translated.accessory_label,
        price_raw: row.__EMPTY_40,
        price_pln: parseMoney(row.__EMPTY_40),
      })
    }

    const otherLabel = row["CENNIK EVAMATS_7"]?.toString?.().trim()
    if (otherLabel) {
      const translated = translateAccessoryLabel(otherLabel)
      meta.other_products.push({
        product_key: translated.accessory_key,
        label: translated.accessory_label,
        price_raw: row.__EMPTY_43,
        price_pln: parseMoney(row.__EMPTY_43),
        note: row.__EMPTY_44 ?? null,
      })
    }
  }

  return { meta, categories }
}

const VEHICLE_CATEGORY_COLUMNS = {
  minivan: "__EMPTY",
  auto_osobowe: "__EMPTY_1",
  bus: "__EMPTY_2",
  pickup: "__EMPTY_3",
  indywidualna_wycena: "__EMPTY_4",
}

const HEADER_MODEL_LABELS = new Set([
  "minivan",
  "auto osobowe",
  "bus",
  "pickup",
])

const parseVehicleCategoryLayer = (rows) => {
  const categories = Object.keys(VEHICLE_CATEGORY_COLUMNS)
  const models = []
  const specialNotes = []

  for (const row of rows) {
    for (const [category, col] of Object.entries(VEHICLE_CATEGORY_COLUMNS)) {
      const raw = row[col]
      if (!raw || typeof raw !== "string") continue
      const model = raw.trim()
      if (!model) continue

      const lower = model.toLowerCase()
      if (HEADER_MODEL_LABELS.has(lower)) continue
      if (
        lower.startsWith("indywidualna wycena") ||
        lower.startsWith("van, kombivan") ||
        lower.startsWith("mata na pak") ||
        lower.startsWith("3d bez rant") ||
        lower.startsWith("przykłady") ||
        lower.startsWith("bus 2/3") ||
        lower.includes("tesla bagażnik") ||
        lower.includes("fortwo")
      ) {
        specialNotes.push({
          category: toEnglishVehicleCategory(category),
          note_key: toSnakeKey(model),
          note_label: model,
        })
        continue
      }

      models.push({
        model_name: model,
        model_key: toSnakeKey(model),
        vehicle_category: toEnglishVehicleCategory(category),
      })
    }
  }

  const byCategory = {}
  for (const cat of categories) {
    const enCat = toEnglishVehicleCategory(cat)
    byCategory[enCat] = models.filter((m) => m.vehicle_category === enCat).length
  }

  return {
    meta: {
      source_sheet: "MinivanAuto osoboweBUSPickup",
      description: META_EN.vehicle_mapping_description,
      category_labels: Object.fromEntries(
        Object.entries(VEHICLE_CATEGORY_LABELS).map(([key, label]) => [key, label])
      ),
      counts: byCategory,
      total_models: models.length,
    },
    models,
    special_notes: specialNotes,
  }
}

const BITRIX_SEGMENT_COLUMNS = {
  auto_osobowe: {
    id: "passenger_car",
    label: "Passenger car",
    columnKey: "AUTO OSOBOWE-cennik",
    pricingTable: "passenger_car",
    vehicleCategory: "passenger_car",
  },
  pickup: {
    id: "pickup",
    label: "Pickup",
    columnKey: "Pickup-cennik",
    pricingTable: "pickup",
    vehicleCategory: "pickup",
  },
  minivan: {
    id: "minivan",
    label: "Minivan / van",
    columnKey: "MINIVAN; FURGON-cennik",
    pricingTable: "minivan",
    vehicleCategory: "minivan",
  },
  bus: {
    id: "bus",
    label: "Bus / van / coach",
    columnKey: "BUS; VAN; AUTOBUS-cennik",
    pricingTable: "bus",
    vehicleCategory: "bus",
  },
  auta_ciezarowe: {
    id: "heavy_truck",
    label: "Heavy truck",
    columnKey: "AUTO CIĘŻAROWE-cennik",
    pricingTable: "heavy_truck",
    vehicleCategory: null,
  },
}

const BODY_TYPE_COLUMN = "__EMPTY"

const BITRIX_INFO_PREFIXES = [
  "informacje dodatkowe",
  "typ nadwozia",
  "w bitrix wybieramy",
  "wariant kompletu",
  "jeśli jest zamówienie",
  "jezeli jest zamowienie",
]

const isBitrixInfoText = (value) => {
  if (!value || typeof value !== "string") return true
  const lower = value.trim().toLowerCase()
  if (!lower) return true
  return BITRIX_INFO_PREFIXES.some((prefix) => lower.startsWith(prefix))
}

const parseBitrixVariantLayer = (rows) => {
  const segments = {}
  const crossCategoryRows = []
  const notes = []

  for (const cfg of Object.values(BITRIX_SEGMENT_COLUMNS)) {
    segments[cfg.id] = {
      id: cfg.id,
      label: cfg.label,
      pricing_table: cfg.pricingTable,
      vehicle_category: cfg.vehicleCategory,
      bitrix_field: "UF_CRM_1757024931236",
      notes: [],
      body_types: [],
      variants: [],
    }
  }

  rows.forEach((row, rowIndex) => {
    const bodyType = row[BODY_TYPE_COLUMN]?.toString?.().trim()
    if (
      bodyType &&
      !isBitrixInfoText(bodyType) &&
      normalizeKey(bodyType) !== "typy_nadwozia"
    ) {
      const translated = translateBodyType(bodyType)
      segments.passenger_car.body_types.push({
        body_type_key: translated.body_type_key,
        body_type_label: translated.body_type_label,
      })
    }

    const rowMapping = { row_index: rowIndex }
    let hasVariant = false

    for (const [, cfg] of Object.entries(BITRIX_SEGMENT_COLUMNS)) {
      const raw = row[cfg.columnKey]?.toString?.().trim()
      if (!raw) continue

      if (isBitrixInfoText(raw)) {
        if (
          raw.toLowerCase().includes("bitrix") ||
          raw.toLowerCase().includes("typ nadwozia") ||
          raw.toLowerCase().includes("zamówienie")
        ) {
          const note = translateNote(raw)
          segments[cfg.id].notes.push(note.note_label)
          notes.push({ segment_id: cfg.id, ...note })
        }
        continue
      }

      const variantSlug = slugifyVariant(raw)
      const translated = translateVariant(raw, variantSlug)
      const variant = {
        variant_label: translated.variant_label,
        variant_key: translated.variant_key,
        variant_slug: variantSlug,
        pricing_variant_key: translated.variant_key,
      }

      const existing = segments[cfg.id].variants.find(
        (item) => item.variant_key === variant.variant_key
      )
      if (!existing) segments[cfg.id].variants.push(variant)

      rowMapping[cfg.id] = translated.variant_key
      hasVariant = true
    }

    if (hasVariant) crossCategoryRows.push(rowMapping)
  })

  const counts = {}
  for (const [segmentId, segment] of Object.entries(segments)) {
    counts[segmentId] = segment.variants.length
  }

  return {
    meta: {
      source_sheet: "Wariant kompletu Bitrix",
      description: META_EN.bitrix_description,
      bitrix_field: "UF_CRM_1757024931236",
      counts,
      total_cross_rows: crossCategoryRows.length,
    },
    segments,
    cross_category_rows: crossCategoryRows,
    global_notes: notes,
  }
}

const VEHICLE_SEGMENT_CROSSWALK = {
  minivan: {
    vehicle_category: "minivan",
    pricing_table: "minivan",
    bitrix_segment: "minivan",
    label: "Minivan",
  },
  passenger_car: {
    vehicle_category: "passenger_car",
    pricing_table: "passenger_car",
    bitrix_segment: "passenger_car",
    label: "Passenger car",
  },
  bus: {
    vehicle_category: "bus",
    pricing_table: "bus",
    bitrix_segment: "bus",
    label: "Bus",
  },
  pickup: {
    vehicle_category: "pickup",
    pricing_table: "pickup",
    bitrix_segment: "pickup",
    label: "Pickup",
  },
}

const buildVehicleSegments = (pricingLayer, vehicleLayer, bitrixLayer) => {
  const segments = {}

  for (const [segmentId, crosswalk] of Object.entries(VEHICLE_SEGMENT_CROSSWALK)) {
    const models = vehicleLayer.models.filter(
      (model) => model.vehicle_category === crosswalk.vehicle_category
    )
    const specialNotes = vehicleLayer.special_notes.filter(
      (note) => note.category === crosswalk.vehicle_category
    )
    const pricingCategory = pricingLayer.categories[crosswalk.pricing_table] ?? {
      items: [],
    }
    const bitrixSegment = bitrixLayer.segments[crosswalk.bitrix_segment] ?? {
      variants: [],
      body_types: [],
      notes: [],
    }

    segments[segmentId] = {
      id: segmentId,
      label: crosswalk.label,
      vehicle_category: crosswalk.vehicle_category,
      pricing_table: crosswalk.pricing_table,
      bitrix_segment: crosswalk.bitrix_segment,
      vehicle_mapping: {
        model_count: models.length,
        models,
        special_notes: specialNotes,
      },
      pricing: {
        pricing_model: pricingCategory.pricing_model ?? null,
        item_count: pricingCategory.items?.length ?? 0,
        items: pricingCategory.items ?? [],
      },
      bitrix: {
        bitrix_field: bitrixSegment.bitrix_field ?? "UF_CRM_1757024931236",
        variant_count: bitrixSegment.variants?.length ?? 0,
        variants: bitrixSegment.variants ?? [],
        body_types:
          segmentId === "passenger_car" ? bitrixSegment.body_types ?? [] : [],
        notes: bitrixSegment.notes ?? [],
      },
    }
  }

  return {
    version: "2.0.0",
    locale: "en",
    key_format: "snake_case",
    source_file: SOURCE_FILE,
    generated_at: new Date().toISOString(),
    description: META_EN.segments_description,
    layers: {
      pricing: {
        file: "evamats-cennik.normalized.json",
        source_sheet: "Cennik",
      },
      vehicle_mapping: {
        file: "evamats-vehicle-category-mapping.normalized.json",
        source_sheet: "MinivanAuto osoboweBUSPickup",
      },
      bitrix_variants: {
        file: "evamats-bitrix-variant-mapping.normalized.json",
        source_sheet: "Wariant kompletu Bitrix",
      },
    },
    segments,
  }
}

const main = () => {
  if (!fs.existsSync(CENNIK_RAW) || !fs.existsSync(VEHICLE_RAW)) {
    console.error("Brak plików raw. Uruchom najpierw export xlsx-cli do output/")
    process.exit(1)
  }

  const cennikRows = JSON.parse(fs.readFileSync(CENNIK_RAW, "utf8"))
  const vehicleRows = JSON.parse(fs.readFileSync(VEHICLE_RAW, "utf8"))
  const bitrixRows = fs.existsSync(BITRIX_RAW)
    ? JSON.parse(fs.readFileSync(BITRIX_RAW, "utf8"))
    : []

  const pricingLayer = parseCennikLayer(cennikRows)
  const vehicleLayer = parseVehicleCategoryLayer(vehicleRows)
  const bitrixLayer = parseBitrixVariantLayer(bitrixRows)
  const vehicleSegments = buildVehicleSegments(
    pricingLayer,
    vehicleLayer,
    bitrixLayer
  )

  const index = {
    version: "2.0.0",
    locale: "en",
    key_format: "snake_case",
    source_file: SOURCE_FILE,
    generated_at: new Date().toISOString(),
    layers: {
      pricing: "evamats-cennik.normalized.json",
      vehicle_categories: "evamats-vehicle-category-mapping.normalized.json",
      bitrix_variants: "evamats-bitrix-variant-mapping.normalized.json",
      vehicle_segments: "evamats-pricing-segments.json",
    },
    vehicle_category_to_pricing_table: {
      minivan: "minivan",
      passenger_car: "passenger_car",
      bus: "bus",
      pickup: "pickup",
      custom_quote: null,
    },
    vehicle_category_to_bitrix_segment: {
      minivan: "minivan",
      passenger_car: "passenger_car",
      bus: "bus",
      pickup: "pickup",
      custom_quote: null,
    },
    summary: {
      pricing_categories: Object.keys(pricingLayer.categories).length,
      mapped_models: vehicleLayer.meta.total_models,
      bitrix_segments: Object.keys(bitrixLayer.segments).length,
      vehicle_segments: Object.keys(vehicleSegments.segments).length,
    },
  }

  fs.mkdirSync(dataDir, { recursive: true })
  fs.mkdirSync(outputDir, { recursive: true })

  const files = {
    [path.join(dataDir, "evamats-cennik.normalized.json")]: pricingLayer,
    [path.join(dataDir, "evamats-vehicle-category-mapping.normalized.json")]:
      vehicleLayer,
    [path.join(dataDir, "evamats-bitrix-variant-mapping.normalized.json")]:
      bitrixLayer,
    [path.join(dataDir, "evamats-pricing-segments.json")]: vehicleSegments,
    [path.join(dataDir, "evamats-pricing.index.json")]: index,
    [path.join(outputDir, "evamats-cennik.normalized.json")]: pricingLayer,
    [path.join(outputDir, "evamats-vehicle-category-mapping.normalized.json")]:
      vehicleLayer,
    [path.join(outputDir, "evamats-bitrix-variant-mapping.normalized.json")]:
      bitrixLayer,
    [path.join(outputDir, "evamats-pricing-segments.json")]: vehicleSegments,
  }

  for (const [filePath, data] of Object.entries(files)) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8")
  }

  console.log("Saved pricing + vehicle mapping + bitrix + segments (en/snake_case)")
  console.log("  passenger_car items:", pricingLayer.categories.passenger_car?.items.length ?? 0)
  console.log("  minivan items:", pricingLayer.categories.minivan?.items.length ?? 0)
  console.log("  bus items:", pricingLayer.categories.bus?.items.length ?? 0)
  console.log("  pickup items:", pricingLayer.categories.pickup?.items.length ?? 0)
  console.log("  mapped models:", vehicleLayer.meta.total_models)
  console.log("  bitrix passenger_car variants:", bitrixLayer.segments.passenger_car?.variants.length ?? 0)
  console.log("  bitrix minivan variants:", bitrixLayer.segments.minivan?.variants.length ?? 0)
  console.log("  bitrix bus variants:", bitrixLayer.segments.bus?.variants.length ?? 0)
  console.log("  bitrix pickup variants:", bitrixLayer.segments.pickup?.variants.length ?? 0)
}

main()
