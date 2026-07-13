import { resolveBrandDisplayNameFromDbName } from "@/shared/brands/brandMapper"

const GENERATION_NUMBER_PATTERN = /_(\d+|[ivxlcdm]+)_gen(?:_|$)/i

const formatToken = (token: string): string => {
  if (/^\d+[a-z]$/i.test(token)) return token.toUpperCase()
  if (/^[a-z]\d+$/i.test(token)) return token.toUpperCase()
  if (token.length <= 2 && /^[a-z]+$/i.test(token)) return token.toUpperCase()
  return `${token.charAt(0).toUpperCase()}${token.slice(1)}`
}

const humanizeKey = (value: string): string =>
  value
    .split("_")
    .filter(Boolean)
    .map(formatToken)
    .join(" ")

const GENERATION_SUFFIX = /_(?:\d+|[ivxlcdm]+)_gen(?:_.*)?$/i

/** Formatuje sklejone kody nadwozia: 3e90 → 3 E90, m3e90 → M3 E90, 3(e90) → 3 E90 */
export const formatChassisFamilyToken = (token: string): string => {
  const trimmed = token.trim()
  if (!trimmed) return ""

  if (trimmed.includes("_")) {
    return trimmed
      .split("_")
      .filter(Boolean)
      .map((segment) => formatChassisFamilyToken(segment))
      .join(" ")
  }

  const parenMatch = trimmed.match(/^(\d+)\(([efg]\d{1,3})\)$/i)
  if (parenMatch) {
    return `${parenMatch[1]} ${parenMatch[2].toUpperCase()}`
  }

  const lower = trimmed.toLowerCase().replace(/[()]/g, "")

  const mSeriesMatch = lower.match(/^(m\d+)([efg]\d{1,3})$/i)
  if (mSeriesMatch) {
    return `${mSeriesMatch[1].toUpperCase()} ${mSeriesMatch[2].toUpperCase()}`
  }

  const letterSeriesMatch = lower.match(/^([a-z]{1,3}\d+)([efg]\d{1,3})$/i)
  if (letterSeriesMatch) {
    return `${letterSeriesMatch[1].toUpperCase()} ${letterSeriesMatch[2].toUpperCase()}`
  }

  const digitChassisMatch = lower.match(/^(\d+)([efg]\d{1,3})$/i)
  if (digitChassisMatch) {
    return `${digitChassisMatch[1]} ${digitChassisMatch[2].toUpperCase()}`
  }

  return formatToken(trimmed)
}

const hasChassisPattern = (value: string): boolean => {
  const normalized = value.toLowerCase().replace(/[()_]/g, "")
  return /^(m\d+)?(\d+|[a-z]{1,3}\d+)[efg]\d{1,3}/i.test(normalized)
}

const needsChassisFormatting = (name: string, key?: string): boolean => {
  const source = (key ?? name ?? "").toLowerCase().replace(/[()]/g, "")
  if (!source) return false
  if (/\(/.test(name)) return true
  if (/_gen/i.test(name)) return true
  if (hasChassisPattern(source)) return true
  return /^(\d+|[a-z]+\d*)([efg]\d{1,3})$/i.test(source)
}

const BODY_TYPE_DISPLAY_PL: Record<string, string> = {
  hatchback_3_door: "HATCHBACK 3 drzwi",
  hatchback_5_door: "HATCHBACK 5 drzwi",
  hatchback: "HATCHBACK 5 drzwi",
  liftback_3_door: "LIFTBACK 3 drzwi",
  liftback: "LIFTBACK",
  sedan: "SEDAN",
  suv_3_door: "SUV 3 drzwi",
  suv_5_door: "SUV 5 drzwi",
  suv_6_seater: "SUV 6 osobowy",
  suv_7_seater: "SUV 7 osobowy",
  suv_coupe: "SUV COUPE",
  suv: "SUV",
  wagon: "KOMBI",
  kombi: "KOMBI",
  minivan: "MINIVAN",
  van: "VAN",
  combi_van: "KOMBIVAN",
  microvan: "MIKROVAN",
  coupe: "COUPE",
  convertible: "KABRIOLET",
  kabriolet: "KABRIOLET",
  cabrio: "CABRIO",
  roadster: "ROADSTER",
  fastback: "FASTBACK",
  pickup: "PICK-UP",
  bus: "BUS",
  minibus: "MINIBUS",
  camper: "KAMPER",
  kamper: "KAMPER",
  truck: "CIĘŻARÓWKA",
  semi_truck: "CIĄGNIK SIODŁOWY",
  tractor: "CIĄGNIK",
  off_road: "TERENÓWKA",
  limousine: "LIMUZYNA",
  buggy: "BUGGY",
  panel_van: "FURGON",
  delivery_van: "VAN DOSTAWCZY",
}

export const extractGenerationNumber = (modelKey: string): string | null => {
  const normalized = modelKey.trim().toLowerCase()
  const match = normalized.match(GENERATION_NUMBER_PATTERN)
  if (!match?.[1]) return null
  return `${match[1]} gen`
}

export const formatBrandDisplayName = (brandName: string): string =>
  resolveBrandDisplayNameFromDbName(brandName)

export const formatModelFamilyDisplayName = (
  modelFamilyName: string,
  modelFamilyKey?: string,
  modelKey?: string,
): string => {
  const strippedKey =
    modelFamilyKey ??
    modelKey?.replace(GENERATION_SUFFIX, "") ??
    ""
  const name = modelFamilyName?.trim()

  if (name && !needsChassisFormatting(name, strippedKey) && !/_gen/i.test(name)) {
    return name
  }

  const token = strippedKey || name?.replace(GENERATION_SUFFIX, "") || ""
  if (token) return formatChassisFamilyToken(token)
  if (name) return formatChassisFamilyToken(name)
  if (modelFamilyKey) return humanizeKey(modelFamilyKey)
  return ""
}

export const formatModelWithGenerationDisplay = (
  modelFamilyName: string,
  modelKey: string,
  modelFamilyKey?: string,
): string => {
  const family = formatModelFamilyDisplayName(
    modelFamilyName,
    modelFamilyKey,
    modelKey,
  )
  const generationNumber = extractGenerationNumber(modelKey)
  if (!family) return generationNumber ?? humanizeKey(modelKey)
  if (!generationNumber) return family
  return `${family} ${generationNumber}`
}

export const formatYearRangeDisplay = (
  yearFrom?: number | null,
  yearTo?: number | null,
  generation?: string | null,
  isOpenEnded = false,
): string => {
  if (yearFrom != null && yearTo != null) {
    return `${yearFrom}-${yearTo} rok`
  }

  if (yearFrom != null && (isOpenEnded || yearTo == null)) {
    return `${yearFrom}+ rok`
  }

  const generationText = generation?.trim()
  if (!generationText) return ""

  const rangeMatch = generationText.match(/^(\d{4})-(\d{4})$/)
  if (rangeMatch) return `${rangeMatch[1]}-${rangeMatch[2]} rok`

  const openMatch = generationText.match(/^(\d{4})\+$/)
  if (openMatch) return `${openMatch[1]}+ rok`

  if (/^\d{4}$/.test(generationText)) return `${generationText} rok`

  return `${generationText} rok`
}

const inferBodyTypeKey = (rawValue: string): string => {
  const normalized = rawValue.trim().toLowerCase()
  if (!normalized) return ""
  if (BODY_TYPE_DISPLAY_PL[normalized]) return normalized

  if (normalized.includes("hatchback") && normalized.includes("3")) return "hatchback_3_door"
  if (normalized.includes("hatchback")) return "hatchback_5_door"
  if (normalized.includes("liftback") && normalized.includes("3")) return "liftback_3_door"
  if (normalized.includes("suv") && normalized.includes("7")) return "suv_7_seater"
  if (normalized.includes("suv") && normalized.includes("6")) return "suv_6_seater"
  if (normalized.includes("suv") && normalized.includes("3")) return "suv_3_door"
  if (normalized.includes("suv") && normalized.includes("5")) return "suv_5_door"
  if (normalized.includes("suv")) return "suv"
  if (normalized.includes("kombi") || normalized.includes("wagon")) return "wagon"
  if (normalized.includes("minivan")) return "minivan"
  if (normalized.includes("pickup") || normalized.includes("pick-up")) return "pickup"
  if (normalized.includes("cabrio") || normalized.includes("convertible")) return "convertible"
  if (normalized.includes("kabriolet")) return "kabriolet"
  if (normalized.includes("kamper") || normalized.includes("camper")) return "camper"
  if (normalized.includes("sedan")) return "sedan"
  if (normalized.includes("coupe")) return "coupe"
  if (normalized.includes("liftback")) return "liftback"
  if (normalized.includes("fastback")) return "fastback"
  if (normalized.includes("roadster")) return "roadster"
  if (normalized.includes("bus")) return "bus"
  if (normalized.includes("van")) return "van"

  return normalized.replace(/\s+/g, "_")
}

export const inferBodyTypeKeyFromValue = inferBodyTypeKey

export const formatBodyTypeDisplayPl = (bodyType: string): string => {
  const raw = bodyType?.trim()
  if (!raw) return ""

  const key = inferBodyTypeKey(raw)
  if (BODY_TYPE_DISPLAY_PL[key]) return BODY_TYPE_DISPLAY_PL[key]

  const doorMatch = key.match(/^([a-z]+)_(\d+)_door$/)
  if (doorMatch) {
    return `${doorMatch[1].toUpperCase()} ${doorMatch[2]} drzwi`
  }

  const seaterMatch = key.match(/^suv_(\d+)_seater$/)
  if (seaterMatch) {
    return `SUV ${seaterMatch[1]} osobowy`
  }

  return humanizeKey(key).toUpperCase()
}

export type VehicleDisplayLabels = {
  brandDisplay: string
  modelFamilyDisplay: string
  modelDisplay: string
  generationNumberDisplay: string | null
  yearRangeDisplay: string
  bodyTypeDisplay: string
}

export const buildVehicleDisplayLabels = (input: {
  brandName: string
  modelFamilyName: string
  modelFamilyKey?: string
  modelKey: string
  modelName?: string
  generation?: string | null
  yearFrom?: number | null
  yearTo?: number | null
  isOpenEnded?: boolean
  bodyType?: string | null
}): VehicleDisplayLabels => {
  const brandDisplay = formatBrandDisplayName(input.brandName)
  const modelFamilyDisplay = formatModelFamilyDisplayName(
    input.modelFamilyName,
    input.modelFamilyKey,
    input.modelKey,
  )
  const generationNumberDisplay = extractGenerationNumber(input.modelKey)
  const modelDisplay = formatModelWithGenerationDisplay(
    input.modelFamilyName,
    input.modelKey,
    input.modelFamilyKey,
  )
  const yearRangeDisplay = formatYearRangeDisplay(
    input.yearFrom,
    input.yearTo,
    input.generation,
    input.isOpenEnded,
  )
  const bodyTypeDisplay = formatBodyTypeDisplayPl(input.bodyType ?? "")

  return {
    brandDisplay,
    modelFamilyDisplay,
    modelDisplay,
    generationNumberDisplay,
    yearRangeDisplay,
    bodyTypeDisplay,
  }
}

export const formatVehicleCardTitle = (labels: VehicleDisplayLabels): string =>
  [labels.brandDisplay, labels.modelDisplay].filter(Boolean).join(" ").trim()

export const formatVehicleCardSubtitle = (labels: VehicleDisplayLabels): string[] =>
  [labels.yearRangeDisplay, labels.bodyTypeDisplay].filter(Boolean)

/** Pełna etykieta wyniku wyszukiwania, np. „Renault Clio 5 gen 2019-2026 rok HATCHBACK 5 drzwi”. */
export const formatVehicleSearchResultLabel = (
  labels: VehicleDisplayLabels,
): string =>
  [
    labels.brandDisplay,
    labels.modelDisplay,
    labels.yearRangeDisplay,
    labels.bodyTypeDisplay,
  ]
    .filter(Boolean)
    .join(" ")
