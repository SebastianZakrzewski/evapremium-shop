export type LocalProductCard = {
  fileName: string
  publicPath: string
  series: string
  extras: string[]
  chassisCodes: string[]
  generationNumber: number | null
  yearFrom: number | null
  yearTo: number | null
  bodyType: string
  isMVariant: boolean
}

const EXTRA_TOKENS = [
  "active tourer",
  "gran tourer",
  "gran coupe",
  "compact",
] as const

const BODY_ALIASES: Array<[RegExp, string]> = [
  [/hatchback/, "hatchback"],
  [/liftbak|liftback/, "liftback"],
  [/kombi|combi|wagon|estate/, "kombi"],
  [/minivan/, "minivan"],
  [/kabriolet|cabrio|convertible/, "kabriolet"],
  [/roadster/, "roadster"],
  [/sedan/, "sedan"],
  [/coupe/, "coupe"],
  [/suv/, "suv"],
  [/van/, "van"],
]

const UUID_SUFFIX =
  /_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const normalizeBodyType = (value: string): string => {
  const lower = value.toLowerCase()
  const alias = BODY_ALIASES.find(([pattern]) => pattern.test(lower))
  return alias?.[1] ?? lower
}

const extractChassisCodes = (value: string): string[] => {
  const matches = value.match(/\b[efgu]\d{2,3}\b/gi) ?? []
  return [...new Set(matches.map((code) => code.toLowerCase()))]
}

const extractExtras = (value: string): string[] =>
  EXTRA_TOKENS.filter((token) => value.includes(token))

const extractSeries = (normalized: string): { series: string; isMVariant: boolean } | null => {
  if (/\bxm\b/.test(normalized)) return { series: "xm", isMVariant: false }

  const iModel = normalized.match(/\b(ix[123]|ix|i[34578])\b/)
  if (iModel) return { series: iModel[1], isMVariant: false }

  const mLine = normalized.match(/\bm([2-8])\b/)
  if (mLine) return { series: `m${mLine[1]}`, isMVariant: false }

  const xMVariant = normalized.match(/\bx(\d)\s*m\b/)
  if (xMVariant) return { series: `x${xMVariant[1]}`, isMVariant: true }

  const xSeries = normalized.match(/\bx(\d)\b/)
  if (xSeries) return { series: `x${xSeries[1]}`, isMVariant: false }

  const zSeries = normalized.match(/\bz(\d)\b/)
  if (zSeries) return { series: `z${zSeries[1]}`, isMVariant: false }

  const numbered = normalized.match(/\b([1-8])\b/)
  if (numbered) return { series: numbered[1], isMVariant: false }

  return null
}

export const parseLocalProductCardFileName = (
  fileName: string,
): Omit<LocalProductCard, "fileName" | "publicPath"> | null => {
  if (!/\.(png|jpe?g|webp|avif)$/i.test(fileName)) return null

  const withoutExt = fileName.replace(/\.[a-z0-9]+$/i, "").replace(UUID_SUFFIX, "")
  const yearMatch = withoutExt.match(/(\d{4})\s*[-–]\s*(\d{4})/)
  const spaced = withoutExt
    .replace(/^evamats-featured-/i, "")
    .replace(/^bmw_?(ix[123]|ix|i[34578])/i, "bmw_$1_")
    .replace(/^bmw/i, "bmw_")
    .replace(/(\d)gen/gi, "$1_gen")
    .replace(/([efgu]\d{2,3})/gi, "_$1_")
    .replace(/[._-]+/g, " ")
    .replace(/\b(rok|year|elektro|hybryda|long|\d+\s*os|\d+\s*drzwi)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()

  const seriesInfo = extractSeries(spaced.replace(/^bmw\s+/, ""))
  if (!seriesInfo) return null

  const genMatch = spaced.match(/(\d+)\s*gen/)
  const bodyType = normalizeBodyType(spaced)

  return {
    series: seriesInfo.series,
    extras: extractExtras(spaced),
    chassisCodes: extractChassisCodes(spaced),
    generationNumber: genMatch ? Number(genMatch[1]) : null,
    yearFrom: yearMatch ? Number(yearMatch[1]) : null,
    yearTo: yearMatch ? Number(yearMatch[2]) : null,
    bodyType: BODY_ALIASES.some(([pattern]) => pattern.test(spaced)) ? bodyType : "",
    isMVariant: seriesInfo.isMVariant,
  }
}

export const parseVehicleQuery = (value: string) => {
  const normalized = value
    .toLowerCase()
    .replace(/[()]/g, " ")
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  const seriesInfo = extractSeries(normalized.replace(/^bmw\s+/, ""))
  const yearMatch = normalized.match(/(\d{4})\s*-\s*(\d{4})/)
  const genMatch = normalized.match(/(\d+)\s*gen/)

  return {
    series: seriesInfo?.series ?? "",
    extras: extractExtras(normalized),
    chassisCodes: extractChassisCodes(normalized),
    generationNumber: genMatch ? Number(genMatch[1]) : null,
    yearFrom: yearMatch ? Number(yearMatch[1]) : null,
    yearTo: yearMatch ? Number(yearMatch[2]) : null,
    isMVariant: seriesInfo?.isMVariant ?? false,
  }
}

export const normalizeLocalBodyType = normalizeBodyType
