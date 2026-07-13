import {
  normalizeSearchToken,
  normalizeVehicleSearchQuery,
} from "@/shared/vehicle/searchQuery"
import type { MatTemplateDbRow } from "../server/repository"

const SEARCH_TOKEN_SPLIT = /[\s,-]+/

export const parseSearchTokens = (searchTerm: string): string[] =>
  normalizeVehicleSearchQuery(searchTerm)
    .replace(/[%_,]/g, " ")
    .split(SEARCH_TOKEN_SPLIT)
    .map((token) => normalizeSearchToken(token))
    .filter(Boolean)

const normalizeSearchText = (value: string): string =>
  normalizeSearchToken(value)
export const buildTemplateSearchHaystack = (row: MatTemplateDbRow): string =>
  normalizeSearchText(
    [
      row.brand_name,
      row.brand_key,
      row.model_family_name,
      row.model_family_key,
      row.model_name,
      row.model_key,
      row.generation,
    ]
      .filter(Boolean)
      .join(" "),
  )

export const matchesAllSearchTokens = (
  row: MatTemplateDbRow,
  tokens: string[],
): boolean => {
  if (tokens.length === 0) return false
  const haystack = buildTemplateSearchHaystack(row)
  return tokens.every((token) => haystack.includes(normalizeSearchText(token)))
}

export const buildSearchIlikeOrClauses = (token: string): string[] => {
  const pattern = `%${token.replace(/[%_,]/g, "")}%`
  return [
    `brand_name.ilike.${pattern}`,
    `model_family_name.ilike.${pattern}`,
    `model_name.ilike.${pattern}`,
    `brand_key.ilike.${pattern}`,
    `model_family_key.ilike.${pattern}`,
    `model_key.ilike.${pattern}`,
    `generation.ilike.${pattern}`,
  ]
}
