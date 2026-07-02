/**
 * Normalizes CENNIK EVAMATS.xlsx into two JSON layers:
 * 1) pricing (cennik) by vehicle category
 * 2) model → vehicle category mapping (minivan / auto_osobowe / bus / pickup)
 *
 * Run after exporting raw sheets:
 *   npx xlsx-cli "<path>/CENNIK EVAMATS (1).xlsx" --sheet "Cennik" -J -o output/cennik-sheet-raw.json
 *   npx xlsx-cli "<path>/CENNIK EVAMATS (1).xlsx" --sheet "MinivanAuto osoboweBUSPickup" -J -o output/vehicle-mapping-sheet-raw.json
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const outputDir = path.join(root, "output")
const dataDir = path.join(root, "src", "data")

const CENNIK_RAW = path.join(outputDir, "cennik-sheet-raw.json")
const VEHICLE_RAW = path.join(outputDir, "vehicle-mapping-sheet-raw.json")

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

const normalizeKey = (value) =>
  value
    ? value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s\-–—/]+/g, "")
    : ""

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

const parseCennikLayer = (rows) => {
  const meta = {
    sourceSheet: "Cennik",
    depositRules:
      rows[0]?.["CENNIK EVAMATS"]?.includes("ZALICZKA") ? rows[0]["CENNIK EVAMATS"] : null,
    discountLegend: {
      noDiscount: "X",
      tierBelow910: 0.2,
      tierFrom910: 0.3,
      note: "20% poniżej progu 910 zł, 30% od 910 zł (kolumny „Kwota po rabacie”)",
    },
    shipping: {},
    extras: [],
    accessories: [],
    otherProducts: [],
  }

  const categories = {}

  for (const [catId, cfg] of Object.entries(CENNIK_CATEGORIES)) {
    categories[catId] = {
      id: catId,
      label: cfg.label,
      pricingModel: cfg.pricingModel,
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
        meta.shipping[normalizeKey(label)] = {
          label,
          pricePln: price,
          discountExcluded: row.__EMPTY_4 === "X",
        }
      }
      if (label.includes("GRATIS")) {
        meta.shipping.freeShippingNote = label
      }
      continue
    }

    if (inExtras) {
      meta.extras.push({
        label,
        pricePln: parseMoney(row.__EMPTY_2),
        discount: parseDiscountFlag(row.__EMPTY_4),
      })
      continue
    }

    for (const [catId, cfg] of Object.entries(CENNIK_CATEGORIES)) {
      const variantLabel = row[cfg.variantKey]?.toString?.().trim()
      if (!variantLabel) continue

      const item = {
        variantLabel,
        variantSlug: slugifyVariant(variantLabel),
        variantKey: normalizeKey(variantLabel),
      }

      if (cfg.pricingModel === "dual_mat_type") {
        item.classic = {
          basePricePln: parseMoney(row[cfg.classicKey]),
          afterDiscount: parseDiscountFlag(row[cfg.discountClassicKey]),
        }
        item.rims3d = {
          basePricePln: parseMoney(row[cfg.rimsKey]),
          afterDiscount: parseDiscountFlag(row[cfg.discountRimsKey]),
        }
      } else {
        item.pricePln = parseMoney(row[cfg.priceKey])
        item.afterDiscount20 = parseDiscountFlag(row[cfg.discount20Key])
        item.afterDiscount30 = parseDiscountFlag(row[cfg.discount30Key])
      }

      const hasPrice =
        item.pricePln != null ||
        item.classic?.basePricePln != null ||
        item.rims3d?.basePricePln != null

      if (!hasPrice) continue

      const existing = categories[catId].items.find(
        (i) => i.variantKey === item.variantKey
      )
      if (!existing) categories[catId].items.push(item)
    }

    const accLabel = row.__EMPTY_38?.toString?.().trim()
    if (accLabel) {
      meta.accessories.push({
        label: accLabel,
        priceRaw: row.__EMPTY_40,
        pricePln: parseMoney(row.__EMPTY_40),
      })
    }

    const otherLabel = row["CENNIK EVAMATS_7"]?.toString?.().trim()
    if (otherLabel) {
      meta.otherProducts.push({
        label: otherLabel,
        priceRaw: row.__EMPTY_43,
        pricePln: parseMoney(row.__EMPTY_43),
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
        specialNotes.push({ category, text: model })
        continue
      }

      models.push({
        model,
        modelKey: normalizeKey(model),
        vehicleCategory: category,
      })
    }
  }

  const byCategory = {}
  for (const cat of categories) {
    byCategory[cat] = models.filter((m) => m.vehicleCategory === cat).length
  }

  return {
    meta: {
      sourceSheet: "MinivanAuto osoboweBUSPickup",
      description:
        "Mapowanie modeli aut na kategorię cennika (kolumny arkusza). Użyj vehicleCategory do wyboru tabeli z warstwy cennik.",
      categoryLabels: {
        minivan: "Minivan",
        auto_osobowe: "Auto osobowe",
        bus: "BUS",
        pickup: "Pickup",
        indywidualna_wycena: "Wycena indywidualna / wyjątki",
      },
      counts: byCategory,
      totalModels: models.length,
    },
    models,
    specialNotes,
  }
}

const main = () => {
  if (!fs.existsSync(CENNIK_RAW) || !fs.existsSync(VEHICLE_RAW)) {
    console.error("Brak plików raw. Uruchom najpierw export xlsx-cli do output/")
    process.exit(1)
  }

  const cennikRows = JSON.parse(fs.readFileSync(CENNIK_RAW, "utf8"))
  const vehicleRows = JSON.parse(fs.readFileSync(VEHICLE_RAW, "utf8"))

  const pricingLayer = parseCennikLayer(cennikRows)
  const vehicleLayer = parseVehicleCategoryLayer(vehicleRows)

  const index = {
    version: "1.0.0",
    sourceFile: "CENNIK EVAMATS (1).xlsx",
    generatedAt: new Date().toISOString(),
    layers: {
      cennik: "evamats-cennik.normalized.json",
      vehicleCategories: "evamats-vehicle-category-mapping.normalized.json",
    },
    vehicleCategoryToCennikTable: {
      minivan: "minivany",
      auto_osobowe: "auta_osobowe",
      bus: "busy",
      pickup: "pickup",
      indywidualna_wycena: null,
    },
  }

  fs.mkdirSync(dataDir, { recursive: true })
  fs.mkdirSync(outputDir, { recursive: true })

  const files = {
    [path.join(dataDir, "evamats-cennik.normalized.json")]: pricingLayer,
    [path.join(dataDir, "evamats-vehicle-category-mapping.normalized.json")]:
      vehicleLayer,
    [path.join(dataDir, "evamats-pricing.index.json")]: index,
    [path.join(outputDir, "evamats-cennik.normalized.json")]: pricingLayer,
    [path.join(outputDir, "evamats-vehicle-category-mapping.normalized.json")]:
      vehicleLayer,
  }

  for (const [filePath, data] of Object.entries(files)) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8")
  }

  console.log("Zapisano warstwy cennik + vehicle mapping")
  console.log("  auta_osobowe items:", pricingLayer.categories.auta_osobowe.items.length)
  console.log("  minivany items:", pricingLayer.categories.minivany.items.length)
  console.log("  busy items:", pricingLayer.categories.busy.items.length)
  console.log("  pickup items:", pricingLayer.categories.pickup.items.length)
  console.log("  modele zmapowane:", vehicleLayer.meta.totalModels)
}

main()
