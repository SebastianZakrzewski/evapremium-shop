import type { SupabaseClient } from '@supabase/supabase-js'
import { getGenerationSearchVariants } from './generationMatching'

export interface MatProductImageQueryParams {
  brand?: string
  model?: string
  year?: number
  generation?: string
  bodyType?: string
}

export interface MatProductImageRow {
  id: number
  car_brand_slug: string
  car_model_slug: string
  generation: string | null
  year: number | null
  body_type: string | null
  image_url: string
  alt_text: string | null
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export const brandNameToSlug = (brandName: string): string =>
  brandName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

export const modelNameToSlug = (modelName: string): string =>
  modelName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

type ResolvedFilters = {
  brandSlug?: string
  modelSlug?: string
  year?: number
  generation?: string
  bodyType?: string
}

const resolveFilters = (params: MatProductImageQueryParams): ResolvedFilters => ({
  brandSlug: params.brand ? brandNameToSlug(params.brand) : undefined,
  modelSlug: params.model ? modelNameToSlug(params.model) : undefined,
  year: params.year,
  generation: params.generation?.trim() || undefined,
  bodyType: params.bodyType?.toLowerCase().trim() || undefined,
})

const applyFilters = (
  supabase: SupabaseClient,
  filters: ResolvedFilters
) => {
  let query = supabase.from('mat_product_images').select('*').eq('is_active', true)

  if (filters.brandSlug) {
    query = query.eq('car_brand_slug', filters.brandSlug)
  }
  if (filters.modelSlug) {
    query = query.eq('car_model_slug', filters.modelSlug)
  }
  if (filters.year !== undefined) {
    query = query.eq('year', filters.year)
  }
  if (filters.generation) {
    query = query.eq('generation', filters.generation)
  }
  if (filters.bodyType) {
    query = query.eq('body_type', filters.bodyType)
  }

  return query.order('sort_order', { ascending: true }).order('year', { ascending: true })
}

const runQuery = async (
  supabase: SupabaseClient,
  filters: ResolvedFilters
): Promise<MatProductImageRow[]> => {
  const { data, error } = await applyFilters(supabase, filters)

  if (error) {
    throw error
  }

  return (data as MatProductImageRow[]) || []
}

/**
 * Pobiera zdjęcia z progresywnym poluzowaniem filtrów (generacja, bodyType, rok).
 */
export const queryMatProductImages = async (
  supabase: SupabaseClient,
  params: MatProductImageQueryParams
): Promise<MatProductImageRow[]> => {
  const base = resolveFilters(params)

  if (!base.brandSlug && !base.modelSlug) {
    return []
  }

  const generationVariants = base.generation
    ? getGenerationSearchVariants(base.generation)
    : [undefined]

  for (const generation of generationVariants) {
    const rows = await runQuery(supabase, { ...base, generation })
    if (rows.length > 0) return rows
  }

  if (base.bodyType) {
    const rows = await runQuery(supabase, { ...base, bodyType: undefined })
    if (rows.length > 0) return rows
  }

  if (base.generation) {
    const rows = await runQuery(supabase, {
      ...base,
      generation: undefined,
      bodyType: base.bodyType,
    })
    if (rows.length > 0) return rows

    if (base.bodyType) {
      const withoutBody = await runQuery(supabase, {
        ...base,
        generation: undefined,
        bodyType: undefined,
      })
      if (withoutBody.length > 0) return withoutBody
    }
  }

  if (base.year !== undefined) {
    const rows = await runQuery(supabase, {
      brandSlug: base.brandSlug,
      modelSlug: base.modelSlug,
      bodyType: base.bodyType,
    })
    if (rows.length > 0) return rows

    if (base.bodyType) {
      const withoutBody = await runQuery(supabase, {
        brandSlug: base.brandSlug,
        modelSlug: base.modelSlug,
      })
      if (withoutBody.length > 0) return withoutBody
    }
  }

  return []
}
