/** Port of src/shared/vehicle/displayLabels.ts for audit scripts */

const GENERATION_NUMBER_PATTERN = /_(\d+|[ivxlcdm]+)_gen(?:_|$)/i
const GENERATION_SUFFIX = /_(?:\d+|[ivxlcdm]+)_gen(?:_.*)?$/i

const formatToken = (token) => {
  if (/^\d+[a-z]$/i.test(token)) return token.toUpperCase()
  if (/^[a-z]\d+$/i.test(token)) return token.toUpperCase()
  if (token.length <= 2 && /^[a-z]+$/i.test(token)) return token.toUpperCase()
  return `${token.charAt(0).toUpperCase()}${token.slice(1)}`
}

const humanizeKey = (value) =>
  value
    .split("_")
    .filter(Boolean)
    .map(formatToken)
    .join(" ")

export const formatChassisFamilyToken = (token) => {
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

const needsChassisFormatting = (name, key) => {
  const source = (key ?? name ?? "").toLowerCase().replace(/[()]/g, "")
  if (!source) return false
  if (/\(/.test(name ?? "")) return true
  if (/_gen/i.test(name ?? "")) return true
  const normalized = source.replace(/[()_]/g, "")
  if (/^(m\d+)?(\d+|[a-z]{1,3}\d+)[efg]\d{1,3}/i.test(normalized)) return true
  return /^(\d+|[a-z]+\d*)([efg]\d{1,3})$/i.test(source)
}

export const formatModelFamilyDisplayName = (
  modelFamilyName,
  modelFamilyKey,
  modelKey,
) => {
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

export const extractGenerationNumber = (modelKey) => {
  const normalized = modelKey.trim().toLowerCase()
  const match = normalized.match(GENERATION_NUMBER_PATTERN)
  if (!match?.[1]) return null
  return `${match[1]} gen`
}

export const formatModelWithGenerationDisplay = (
  modelFamilyName,
  modelKey,
  modelFamilyKey,
) => {
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

export const detectFormattingIssues = (row) => {
  const display = formatModelWithGenerationDisplay(
    row.model_family_name,
    row.model_key,
    row.model_family_key,
  )
  const issues = []

  if (/[()]/.test(display)) issues.push("parens_in_display")
  if (/\b\d[efg]\d{1,3}\b/i.test(display)) issues.push("chassis_no_space")
  if (/\b[a-z]{1,3}\d+[efg]\d{1,3}\b/i.test(display)) issues.push("chassis_no_space")
  if (/\d+_gen/i.test(display)) issues.push("gen_suffix_in_family")
  if (/\b[efg]\d{2,3}\b/.test(display) && !/\b[EFG]\d{2,3}\b/.test(display)) {
    issues.push("lowercase_chassis")
  }

  return { display, issues }
}
