export type ModelFamily = {
  key: string
  name: string
}

const GENERATION_SUFFIX = /_(?:\d+|[ivxlcdm]+)_gen(?:_.*)?$/i

const formatToken = (token: string): string => {
  if (/^\d+[a-z]$/i.test(token)) return token.toUpperCase()
  if (/^[a-z]\d+$/i.test(token)) return token.toUpperCase()
  if (token.length <= 2 && /^[a-z]+$/i.test(token)) return token.toUpperCase()
  return `${token.charAt(0).toUpperCase()}${token.slice(1)}`
}

export const deriveModelFamily = (modelKey: string): ModelFamily => {
  const normalizedKey = modelKey.trim().toLowerCase()
  const familyKey = normalizedKey.replace(GENERATION_SUFFIX, "") || normalizedKey
  const familyName = familyKey
    .split("_")
    .filter(Boolean)
    .map(formatToken)
    .join(" ")

  return {
    key: familyKey,
    name: familyName,
  }
}
