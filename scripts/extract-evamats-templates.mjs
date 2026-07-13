/**
 * Extracts and structures template fields from NEW Baza szablonów Evamats xlsx.
 *
 * Export raw sheet first:
 *   npx xlsx-cli "<path>/NEW Baza szablonów Evamats (2).xlsx" --sheet "Nowa baza szablonów" -J -o output/evamats-templates-raw.json
 *
 * Then run:
 *   node scripts/extract-evamats-templates.mjs
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const outputDir = path.join(root, "output")
const dataDir = path.join(root, "src", "data")

const RAW_FILE = path.join(outputDir, "evamats-templates-raw.json")
const SOURCE_FILE = "NEW Baza szablonów Evamats (2).xlsx"
const SOURCE_SHEET = "Nowa baza szablonów"

const FIELD_MAP = {
  pricingCategory: "Cennik dla handlowca",
  brand: "MARKA",
  model: "MODEL",
  generation: "GENERACJA AUTA",
  bodyType1: "Typ nadwozia1",
  bodyType2: "Typ nadwozia2",
  bodyType3: "Typ nadwozia3",
}

const normalizeText = (value) => {
  if (value === null || value === undefined) return null
  const trimmed = String(value).trim()
  return trimmed || null
}

const FULL_VALUE_TRANSLATIONS = new Map(
  [
    ["auto osobowe", "Passenger car"],
    ["auta osobowe premium", "Premium passenger car"],
    ["minivan", "Minivan"],
    ["bus", "Bus"],
    ["autobus", "Bus"],
    ["pickup", "Pickup"],
    ["auto osobowe/pickup", "Pickup"],
    ["auto ciężarowe", "Commercial truck"],
    ["auto ciezarowe", "Commercial truck"],
    ["cennik indywidualny", "Custom quote"],
    ["koparki", "Excavators"],
    ["koparka", "Excavator"],
    ["ciągniki", "Tractors"],
    ["ciągnik", "Tractor"],
    ["ciagnik", "Tractor"],
    ["brygadówka", "Crew cab"],
    ["brygadowka", "Crew cab"],
    ["ciężarówka", "Truck"],
    ["ciezarowka", "Truck"],
    ["ciężarowka", "Truck"],
    ["spycharka gąsienicowa", "Crawler bulldozer"],
    ["wózek widłowy", "Forklift"],
    ["wozek widlowy", "Forklift"],
    ["koparko-ładowarka", "Backhoe loader"],
    ["koparko-ladowarka", "Backhoe loader"],
    ["ładowarka", "Loader"],
    ["ladowarka", "Loader"],
    ["ładowarki", "Loaders"],
    ["ladowarki", "Loaders"],
    ["kombajn", "Combine harvester"],
    ["helikopter", "Helicopter"],
    ["skuter", "Scooter"],
    ["kamper", "Camper"],
    ["strona", "Page"],
    ["test 1", "Test 1"],
    ["hatchback", "Hatchback"],
    ["sedan", "Sedan"],
    ["coupe", "Coupe"],
    ["roadster", "Roadster"],
    ["liftback", "Liftback"],
    ["fastback", "Fastback"],
    ["fast back", "Fastback"],
    ["crossover", "Crossover"],
    ["targa", "Targa"],
    ["shooting brake", "Shooting brake"],
    ["kabriolet", "Convertible"],
    ["kombi", "Wagon"],
    ["kombivan", "Combo van"],
    ["mikrovan", "Microvan"],
    ["furgon", "Panel van"],
    ["van dostawczak", "Delivery van"],
    ["terenówka", "Off-roader"],
    ["terenowka", "Off-roader"],
    ["minibus", "Minibus"],
    ["bus camper", "Camper bus"],
    ["suv", "SUV"],
    ["van", "Van"],
    ["tir", "Semi truck"],
  ].map(([key, label]) => [key.toLowerCase(), label]),
)

const PHRASE_REPLACEMENTS = [
  [/gąsienicow\w*/gi, "crawler"],
  [/gasienicow\w*/gi, "crawler"],
  [/osobow\w*/gi, "seater"],
  [/(\d+)\s*\/\s*(\d+)\s*os\.?/gi, "$1/$2 seater"],
  [/(\d+)\s*os\.?/gi, "$1 seater"],
  [/(\d+)\s*drzwi/gi, "$1 door"],
  [/(\d+)drzwi/gi, "$1 door"],
  [/kabriolet/gi, "Convertible"],
  [/kombivan/gi, "Combo van"],
  [/mikrovan/gi, "Microvan"],
  [/dostawczak/gi, "delivery van"],
  [/terenówka/gi, "Off-roader"],
  [/terenowka/gi, "Off-roader"],
  [/furgon/gi, "Panel van"],
  [/spycharka/gi, "Bulldozer"],
  [/wózek\s+widłowy/gi, "Forklift"],
  [/wozek\s+widlowy/gi, "Forklift"],
  [/brygadówka/gi, "Crew cab"],
  [/brygadowka/gi, "Crew cab"],
  [/ciężarówk\w*/gi, "Truck"],
  [/ciezarowk\w*/gi, "Truck"],
  [/ciężarowk\w*/gi, "Truck"],
  [/ciągnik\w*/gi, "Tractor"],
  [/ciagnik\w*/gi, "Tractor"],
  [/koparko-ładowark\w*/gi, "Backhoe loader"],
  [/koparko-ladowark\w*/gi, "Backhoe loader"],
  [/kopark\w*/gi, "Excavator"],
  [/ładowark\w*/gi, "Loader"],
  [/ladowark\w*/gi, "Loader"],
  [/kombajn/gi, "Combine harvester"],
  [/helikopter/gi, "Helicopter"],
  [/skuter/gi, "Scooter"],
  [/autobus/gi, "Bus"],
  [/kamper/gi, "Camper"],
  [/minibus/gi, "Minibus"],
  [/hatchback\s*\/\s*kombi/gi, "Hatchback/Wagon"],
  [/kombi/gi, "Wagon"],
  [/coupe-cabrio/gi, "Coupe convertible"],
  [/cabrio/gi, "Convertible"],
  [/fast\s+back/gi, "Fastback"],
  [/liftback/gi, "Liftback"],
  [/hatchback/gi, "Hatchback"],
  [/shooting\s+brake/gi, "Shooting brake"],
  [/mini\s+suv/gi, "Mini SUV"],
  [/suv/gi, "SUV"],
]

const translatePolishToEnglish = (value) => {
  const text = normalizeText(value)
  if (!text) return null

  const lower = text.toLowerCase().replace(/\.$/, "")
  if (FULL_VALUE_TRANSLATIONS.has(lower)) {
    return FULL_VALUE_TRANSLATIONS.get(lower)
  }

  let result = text.replace(/\.$/, "")
  for (const [pattern, replacement] of PHRASE_REPLACEMENTS) {
    result = result.replace(pattern, replacement)
  }

  return result.replace(/\s+/g, " ").trim()
}

const replaceWhitespace = (value) => {
  const text = normalizeText(value)
  if (!text) return null
  return text.replace(/\s+/g, "_")
}

const normalizeValue = (value) => {
  const normalized = replaceWhitespace(translatePolishToEnglish(value))
  return normalized ? normalized.toLowerCase() : null
}

const normalizeKey = (value) => {
  const text = normalizeText(value)
  if (!text) return null
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s\-–—/]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
}

const deriveModelFamily = (modelKey) => {
  const normalizedKey = normalizeKey(modelKey)
  if (!normalizedKey) return { key: null, name: null }

  const familyKey =
    normalizedKey.replace(/_(?:\d+|[ivxlcdm]+)_gen(?:_.*)?$/i, "") || normalizedKey
  const name = familyKey
    .split("_")
    .filter(Boolean)
    .map((token) => {
      if (/^\d+[a-z]$/i.test(token) || /^[a-z]\d+$/i.test(token)) {
        return token.toUpperCase()
      }
      if (token.length <= 2 && /^[a-z]+$/i.test(token)) return token.toUpperCase()
      return `${token.charAt(0).toUpperCase()}${token.slice(1)}`
    })
    .join(" ")

  return { key: familyKey, name }
}

const normalizeBodyTypeKey = (bodyType) => {
  const text = normalizeText(bodyType)
  if (!text) return null

  const normalized = text.toLowerCase()

  if (normalized.includes("hatchback") || normalized.includes("hatch")) return "hatchback"
  if (normalized.includes("suv") || normalized.includes("off-roader") || normalized.includes("off_roader")) {
    return "suv"
  }
  if (normalized.includes("sedan")) return "sedan"
  if (
    normalized.includes("kombi") ||
    normalized.includes("wagon") ||
    normalized.includes("estate")
  ) {
    return "wagon"
  }
  if (normalized.includes("minivan") || normalized.includes("mpv") || normalized.includes("microvan")) {
    return "minivan"
  }
  if (
    normalized.includes("van") ||
    normalized.includes("delivery") ||
    normalized.includes("combo_van") ||
    normalized.includes("panel_van")
  ) {
    return "van"
  }
  if (normalized.includes("coupe")) return "coupe"
  if (normalized.includes("cabrio") || normalized.includes("convertible")) return "convertible"
  if (normalized.includes("roadster")) return "roadster"
  if (normalized.includes("fastback")) return "fastback"
  if (normalized.includes("liftback")) return "liftback"
  if (normalized.includes("pickup")) return "pickup"
  if (normalized.includes("bus")) return "bus"
  if (normalized.includes("truck") || normalized.includes("semi_truck")) return "truck"
  if (normalized.includes("tractor")) return "tractor"
  if (normalized.includes("excavator") || normalized.includes("loader") || normalized.includes("bulldozer")) {
    return "heavy_equipment"
  }

  return normalizeKey(text)
}

const parseGeneration = (value) => {
  const label = normalizeText(value)
  if (!label) {
    return { label: null, year_from: null, year_to: null, is_open_ended: false }
  }

  const openEnded = label.includes("+")
  const rangeMatch = label.match(/^(\d{4})\s*-\s*(\d{4})$/)
  const fromOnlyMatch = label.match(/^(\d{4})\+$/)

  if (rangeMatch) {
    return {
      label: normalizeValue(label),
      year_from: Number.parseInt(rangeMatch[1], 10),
      year_to: Number.parseInt(rangeMatch[2], 10),
      is_open_ended: false,
    }
  }

  if (fromOnlyMatch) {
    return {
      label: normalizeValue(label),
      year_from: Number.parseInt(fromOnlyMatch[1], 10),
      year_to: null,
      is_open_ended: true,
    }
  }

  const yearMatch = label.match(/(\d{4})/)
  return {
    label: normalizeValue(label),
    year_from: yearMatch ? Number.parseInt(yearMatch[1], 10) : null,
    year_to: null,
    is_open_ended: openEnded,
  }
}

const PRICING_CATEGORY_MAP = [
  { match: /^auto osobowe$/i, key: "passenger_car", label: "Passenger car" },
  {
    match: /^auta osobowe premium$/i,
    key: "premium_passenger_car",
    label: "Premium passenger car",
  },
  { match: /^minivan$/i, key: "minivan", label: "Minivan" },
  { match: /^bus$/i, key: "bus", label: "Bus" },
  { match: /^pickup$/i, key: "pickup", label: "Pickup" },
  { match: /^auto osobowe\/pickup$/i, key: "pickup", label: "Pickup" },
  { match: /^auto ci[eę][zż]arowe$/i, key: "commercial_truck", label: "Commercial truck" },
  { match: /^cennik indywidualny$/i, key: "custom_quote", label: "Custom quote" },
  { match: /^koparki$/i, key: "excavator", label: "Excavator" },
  { match: /^ci[aą]gniki$/i, key: "tractor", label: "Tractor" },
]

const mapPricingCategory = (value) => {
  const sourceLabel = normalizeText(value)
  if (!sourceLabel) {
    return { source_label: null, label: null, key: null }
  }

  const found = PRICING_CATEGORY_MAP.find((entry) => entry.match.test(sourceLabel))
  const translatedLabel = found?.label ?? translatePolishToEnglish(sourceLabel)
  return {
    source_label: normalizeValue(sourceLabel),
    label: normalizeValue(translatedLabel),
    key: found?.key ?? normalizeKey(translatedLabel ?? sourceLabel),
  }
}

const buildBodyTypeSlot = (slot, rawValue) => {
  const sourceLabel = normalizeText(rawValue)
  const translatedLabel = translatePolishToEnglish(sourceLabel)
  const label = normalizeValue(sourceLabel)
  return {
    slot,
    label,
    key: normalizeBodyTypeKey(translatedLabel ?? sourceLabel),
  }
}

const buildRecord = (row, index) => {
  const pricingCategory = mapPricingCategory(row[FIELD_MAP.pricingCategory])
  const brandName = normalizeValue(row[FIELD_MAP.brand])
  const modelName = normalizeValue(row[FIELD_MAP.model])
  const modelKey = normalizeKey(modelName)
  const modelFamily = deriveModelFamily(modelKey)
  const generation = parseGeneration(row[FIELD_MAP.generation])

  const bodyTypeSlots = {
    body_type_1: buildBodyTypeSlot(1, row[FIELD_MAP.bodyType1]),
    body_type_2: buildBodyTypeSlot(2, row[FIELD_MAP.bodyType2]),
    body_type_3: buildBodyTypeSlot(3, row[FIELD_MAP.bodyType3]),
  }

  const bodyTypeVariants = Object.values(bodyTypeSlots).filter((entry) => entry.label)

  return {
    id: index + 1,
    dealer_pricing_category: pricingCategory.label,
    dealer_pricing_category_key: pricingCategory.key,
    dealer_pricing_category_source: pricingCategory.source_label,
    brand_name: brandName,
    brand_key: normalizeKey(brandName),
    model_name: modelName,
    model_key: modelKey,
    model_family_name: modelFamily.name,
    model_family_key: modelFamily.key,
    generation,
    body_types: bodyTypeSlots,
    body_type_variants: bodyTypeVariants,
    body_type: bodyTypeVariants[0]?.label ?? null,
    body_type_key: bodyTypeVariants[0]?.key ?? null,
    record_key: [
      pricingCategory.key,
      normalizeKey(brandName),
      normalizeKey(modelName),
      generation.label,
      bodyTypeVariants[0]?.key,
      index + 1,
    ]
      .filter(Boolean)
      .join("|"),
  }
}

const buildIndexes = (records) => {
  const by_brand = {}
  const by_pricing_category = {}
  const by_brand_model = {}

  for (const record of records) {
    if (!record.brand_name) continue

    if (!by_brand[record.brand_name]) by_brand[record.brand_name] = []
    by_brand[record.brand_name].push(record.id)

    const pricingKey = record.dealer_pricing_category_key ?? "unknown"
    if (!by_pricing_category[pricingKey]) {
      by_pricing_category[pricingKey] = {
        label: record.dealer_pricing_category,
        record_ids: [],
      }
    }
    by_pricing_category[pricingKey].record_ids.push(record.id)

    const brandModelKey = `${record.brand_name}::${record.model_name}`
    if (!by_brand_model[brandModelKey]) {
      by_brand_model[brandModelKey] = {
        brand_name: record.brand_name,
        model_name: record.model_name,
        records: [],
      }
    }
    by_brand_model[brandModelKey].records.push({
      id: record.id,
      generation: record.generation.label,
      body_type_variants: record.body_type_variants.map((item) => item.label),
      dealer_pricing_category: record.dealer_pricing_category,
    })
  }

  return { by_brand, by_pricing_category, by_brand_model }
}

const buildSummary = (records) => {
  const pricing_categories = {}
  const brands = new Set()
  let with_body_type_2 = 0
  let with_body_type_3 = 0

  for (const record of records) {
    brands.add(record.brand_name)
    const key = record.dealer_pricing_category_key ?? "unknown"
    pricing_categories[key] = (pricing_categories[key] ?? 0) + 1
    if (record.body_types.body_type_2.label) with_body_type_2 += 1
    if (record.body_types.body_type_3.label) with_body_type_3 += 1
  }

  return {
    total_records: records.length,
    unique_brands: brands.size,
    with_body_type_2,
    with_body_type_3,
    pricing_categories,
  }
}

const main = () => {
  if (!fs.existsSync(RAW_FILE)) {
    console.error(`Brak pliku raw: ${RAW_FILE}`)
    console.error("Uruchom najpierw export xlsx-cli do output/")
    process.exit(1)
  }

  const rawRows = JSON.parse(fs.readFileSync(RAW_FILE, "utf8"))
  const records = rawRows
    .filter((row) => normalizeText(row[FIELD_MAP.brand]))
    .map((row, index) => buildRecord(row, index))

  const indexes = buildIndexes(records)
  const summary = buildSummary(records)

  const payload = {
    meta: {
      version: "1.5.0",
      source_file: SOURCE_FILE,
      source_sheet: SOURCE_SHEET,
      generated_at: new Date().toISOString(),
      normalization_rules: {
        whitespace: "All string values replace whitespace with underscore (_)",
        translation: "Polish source values are translated to English before normalization",
        casing: "All field names and string values are lowercased",
      },
      field_mapping: {
        dealer_pricing_category: FIELD_MAP.pricingCategory,
        brand_name: FIELD_MAP.brand,
        model_name: FIELD_MAP.model,
        generation: FIELD_MAP.generation,
        body_type_1: FIELD_MAP.bodyType1,
        body_type_2: FIELD_MAP.bodyType2,
        body_type_3: FIELD_MAP.bodyType3,
      },
      summary,
    },
    records,
    indexes,
  }

  const compactPayload = records.map((record) => ({
    dealer_pricing_category: record.dealer_pricing_category,
    dealer_pricing_category_key: record.dealer_pricing_category_key,
    brand_name: record.brand_name,
    model_name: record.model_name,
    model_family_name: record.model_family_name,
    model_family_key: record.model_family_key,
    generation: record.generation.label,
    year_from: record.generation.year_from,
    year_to: record.generation.year_to,
    body_type_1: record.body_types.body_type_1.label,
    body_type_2: record.body_types.body_type_2.label,
    body_type_3: record.body_types.body_type_3.label,
    body_type_variants: record.body_type_variants.map((item) => item.label),
  }))

  fs.mkdirSync(outputDir, { recursive: true })
  fs.mkdirSync(dataDir, { recursive: true })

  const files = {
    [path.join(outputDir, "evamats-templates-structured.json")]: payload,
    [path.join(outputDir, "evamats-templates-compact.json")]: compactPayload,
    [path.join(dataDir, "evamats-templates.normalized.json")]: payload,
  }

  for (const [filePath, data] of Object.entries(files)) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8")
  }

  console.log("Extracted Evamats template fields (English schema)")
  console.log(`  records: ${summary.total_records}`)
  console.log(`  brands: ${summary.unique_brands}`)
  console.log(`  with body_type_2: ${summary.with_body_type_2}`)
  console.log(`  with body_type_3: ${summary.with_body_type_3}`)
  console.log("  pricing categories:", JSON.stringify(summary.pricing_categories))
}

main()
