import "server-only"
import { supabaseAdmin } from "@/lib/database/supabase"
import {
  brandMatchToken,
  getBrandMetaBySlug,
  getBrandMetaLookupLabels,
} from "@/shared/brands/brandNormalizer"
import {
  buildSearchIlikeOrClauses,
  matchesAllSearchTokens,
  parseSearchTokens,
} from "../domain/searchTokens"
import {
  SELLABLE_PRICING_CATEGORIES,
  type CatalogQuery,
} from "../model/schemas"

const MULTI_TOKEN_SEARCH_FETCH_CAP = 800

export type MatTemplateDbRow = {
  id: string
  record_key: string
  brand_name: string
  brand_key: string
  model_name: string
  model_key: string
  model_family_name: string
  model_family_key: string
  generation: string
  year_from: number | null
  year_to: number | null
  is_open_ended: boolean
  body_type: string | null
  body_type_key: string | null
  body_type_1: string | null
  body_type_2: string | null
  body_type_3: string | null
  body_type_1_key: string | null
  body_type_2_key: string | null
  body_type_3_key: string | null
  body_type_variants: string[]
  dealer_pricing_category_key: string
  seat_rows: number
}

const TEMPLATE_SELECT = [
  "id",
  "record_key",
  "brand_name",
  "brand_key",
  "model_name",
  "model_key",
  "model_family_name",
  "model_family_key",
  "generation",
  "year_from",
  "year_to",
  "is_open_ended",
  "body_type",
  "body_type_key",
  "body_type_1",
  "body_type_2",
  "body_type_3",
  "body_type_1_key",
  "body_type_2_key",
  "body_type_3_key",
  "body_type_variants",
  "dealer_pricing_category_key",
  "seat_rows",
].join(",")

const PAGE_SIZE = 1000

export const getMatTemplates = async (
  filters: CatalogQuery = {},
): Promise<MatTemplateDbRow[]> => {
  const rows: MatTemplateDbRow[] = []
  let offset = 0

  while (true) {
    let query = supabaseAdmin
      .schema("evapremium_shop")
      .from("mat_templates")
      .select(TEMPLATE_SELECT)
      .eq("is_active", true)
      .in("dealer_pricing_category_key", [...SELLABLE_PRICING_CATEGORIES])
      .order("brand_key")
      .order("model_family_key")
      .order("year_from")
      .range(offset, offset + PAGE_SIZE - 1)

    if (filters.brandKey) query = query.eq("brand_key", filters.brandKey)
    if (filters.modelFamilyKey) {
      query = query.eq("model_family_key", filters.modelFamilyKey)
    }
    if (filters.modelFamilyPrefix) {
      query = query.ilike("model_family_key", `${filters.modelFamilyPrefix}%`)
    }
    if (filters.year) {
      query = query
        .not("year_from", "is", null)
        .lte("year_from", filters.year)
        .or(`year_to.gte.${filters.year},year_to.is.null`)
    }

    const { data, error } = await query
    if (error) throw new Error(`Vehicle catalog query failed: ${error.message}`)

    const page = (data ?? []) as unknown as MatTemplateDbRow[]
    rows.push(...page)
    if (page.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return rows
}

export const searchMatTemplates = async (
  searchTerm: string,
  limit = 200,
): Promise<MatTemplateDbRow[]> => {
  const tokens = parseSearchTokens(searchTerm)
  if (tokens.length === 0) return []

  if (tokens.length === 1) {
    const [token] = tokens
    const pattern = `%${token}%`
    const { data, error } = await supabaseAdmin
      .schema("evapremium_shop")
      .from("mat_templates")
      .select(TEMPLATE_SELECT)
      .eq("is_active", true)
      .in("dealer_pricing_category_key", [...SELLABLE_PRICING_CATEGORIES])
      .or(buildSearchIlikeOrClauses(token).join(","))
      .order("brand_key")
      .order("model_family_key")
      .limit(limit)

    if (error) throw new Error(`Vehicle catalog search failed: ${error.message}`)
    return (data ?? []) as unknown as MatTemplateDbRow[]
  }

  const orClauses = [...new Set(tokens.flatMap((token) => buildSearchIlikeOrClauses(token)))]
  const { data, error } = await supabaseAdmin
    .schema("evapremium_shop")
    .from("mat_templates")
    .select(TEMPLATE_SELECT)
    .eq("is_active", true)
    .in("dealer_pricing_category_key", [...SELLABLE_PRICING_CATEGORIES])
    .or(orClauses.join(","))
    .order("brand_key")
    .order("model_family_key")
    .limit(MULTI_TOKEN_SEARCH_FETCH_CAP)

  if (error) throw new Error(`Vehicle catalog search failed: ${error.message}`)

  return ((data ?? []) as unknown as MatTemplateDbRow[])
    .filter((row) => matchesAllSearchTokens(row, tokens))
    .slice(0, limit)
}

type BrandLookupRow = { brand_key: string; brand_name: string }

const SELLABLE_BRAND_FILTER = () =>
  supabaseAdmin
    .schema("evapremium_shop")
    .from("mat_templates")
    .select("brand_key, brand_name")
    .eq("is_active", true)
    .in("dealer_pricing_category_key", [...SELLABLE_PRICING_CATEGORIES])

const pickBrandKeyFromRows = (
  rows: BrandLookupRow[],
  trimmed: string,
): string | null => {
  if (rows.length === 0) return null

  const distinctKeys = [...new Set(rows.map((row) => row.brand_key))]
  if (distinctKeys.length === 1) return distinctKeys[0]

  const exactName = rows.find(
    (row) => row.brand_name.trim().toLowerCase() === trimmed.toLowerCase(),
  )
  if (exactName) return exactName.brand_key

  const exactKey = rows.find(
    (row) => row.brand_key.trim().toLowerCase() === trimmed.toLowerCase(),
  )
  if (exactKey) return exactKey.brand_key

  const slugToken = brandMatchToken(trimmed)
  const slugMatches = rows.filter((row) => {
    const keyToken = brandMatchToken(row.brand_key)
    const nameToken = brandMatchToken(row.brand_name)
    return keyToken === slugToken || nameToken === slugToken
  })
  const slugKeys = [...new Set(slugMatches.map((row) => row.brand_key))]
  if (slugKeys.length === 1) return slugKeys[0]

  if (slugKeys.length > 1) {
    const tally = new Map<string, number>()
    rows
      .filter((row) => slugKeys.includes(row.brand_key))
      .forEach((row) => {
        tally.set(row.brand_key, (tally.get(row.brand_key) ?? 0) + 1)
      })
    const ranked = slugKeys
      .map((key) => ({ key, count: tally.get(key) ?? 0 }))
      .sort((left, right) => right.count - left.count)
    if (ranked[0]) return ranked[0].key
  }

  return rows[0]?.brand_key ?? null
}

const lookupBrandByMetaLabels = async (trimmed: string): Promise<string | null> => {
  const meta = getBrandMetaBySlug(trimmed)
  if (!meta) return null

  for (const label of getBrandMetaLookupLabels(meta)) {
    const { data, error } = await SELLABLE_BRAND_FILTER()
      .eq("brand_key", label)
      .limit(1)
    if (error) throw new Error(`Brand meta lookup failed: ${error.message}`)
    if (data?.[0]) return data[0].brand_key
  }

  return null
}

const lookupBrandByToken = async (trimmed: string): Promise<string | null> => {
  const paramToken = brandMatchToken(trimmed)
  if (!paramToken) return null

  const { data, error } = await SELLABLE_BRAND_FILTER().limit(3000)
  if (error) throw new Error(`Brand token lookup failed: ${error.message}`)

  const distinctBrands = [
    ...new Map(
      ((data ?? []) as BrandLookupRow[]).map((row) => [row.brand_key, row]),
    ).values(),
  ]
  const tokenMatches = distinctBrands.filter(
    (row) =>
      brandMatchToken(row.brand_key) === paramToken ||
      brandMatchToken(row.brand_name) === paramToken,
  )

  return pickBrandKeyFromRows(tokenMatches, trimmed)
}

export const getDistinctSellableBrandRows = async (): Promise<BrandLookupRow[]> => {
  const rows: BrandLookupRow[] = []
  let offset = 0

  while (true) {
    const { data, error } = await SELLABLE_BRAND_FILTER()
      .order("brand_key")
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) {
      throw new Error(`Sellable brands query failed: ${error.message}`)
    }

    const page = (data ?? []) as BrandLookupRow[]
    rows.push(...page)
    if (page.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return [
    ...new Map(rows.map((row) => [row.brand_key, row])).values(),
  ]
}

export const resolveBrandKeyFromParam = async (
  brandParam: string,
  modelParam?: string | null,
): Promise<string | null> => {
  const trimmed = brandParam.trim()
  if (!trimmed) return null

  const fromMeta = await lookupBrandByMetaLabels(trimmed)
  if (fromMeta) return fromMeta

  const normalizedKey = trimmed.toLowerCase().replace(/[\s-]+/g, "_")
  const pattern = `%${trimmed.replace(/[%_,-]/g, "").replace(/-/g, "")}%`
  const parts = trimmed
    .replace(/[%_,]/g, "")
    .split(/[\s-]+/)
    .filter(Boolean)
  const orClauses = [
    `brand_key.eq.${normalizedKey}`,
    `brand_name.ilike.${pattern}`,
  ]
  if (parts.length >= 2) {
    const spacedPattern = `%${parts.join("%")}%`
    orClauses.push(`brand_name.ilike.${spacedPattern}`)
    orClauses.push(`brand_key.ilike.${spacedPattern}`)
  }

  const { data, error } = await SELLABLE_BRAND_FILTER()
    .or(orClauses.join(","))
    .limit(20)

  if (error) throw new Error(`Brand lookup failed: ${error.message}`)
  const rows = (data ?? []) as BrandLookupRow[]
  const fromRows = pickBrandKeyFromRows(rows, trimmed)
  if (fromRows) return fromRows

  const slugToken = brandMatchToken(trimmed)
  const slugKeys = [
    ...new Set(
      rows
        .filter(
          (row) =>
            brandMatchToken(row.brand_key) === slugToken ||
            brandMatchToken(row.brand_name) === slugToken,
        )
        .map((row) => row.brand_key),
    ),
  ]

  if (slugKeys.length > 1 && modelParam?.trim()) {
    const modelToken = modelParam.trim().toLowerCase()
    const { data: modelRows, error: modelError } = await supabaseAdmin
      .schema("evapremium_shop")
      .from("mat_templates")
      .select("brand_key, model_family_key, model_family_name, brand_name")
      .eq("is_active", true)
      .in("dealer_pricing_category_key", [...SELLABLE_PRICING_CATEGORIES])
      .in("brand_key", slugKeys)

    if (modelError) {
      throw new Error(`Brand model hint lookup failed: ${modelError.message}`)
    }

    const scopedMatches = (modelRows ?? []).filter((row) => {
      const matchesModel =
        row.model_family_key.trim().toLowerCase() === modelToken ||
        row.model_family_name.trim().toLowerCase() === modelToken
      return matchesModel
    })

    if (scopedMatches.length > 0) return scopedMatches[0].brand_key
  }

  return lookupBrandByToken(trimmed)
}

export const getMatTemplateByRecordKey = async (
  recordKey: string,
): Promise<MatTemplateDbRow | null> => {
  const { data, error } = await supabaseAdmin
    .schema("evapremium_shop")
    .from("mat_templates")
    .select(TEMPLATE_SELECT)
    .eq("record_key", recordKey)
    .eq("is_active", true)
    .maybeSingle()

  if (error) throw new Error(`Template lookup failed: ${error.message}`)
  return data as unknown as MatTemplateDbRow | null
}
