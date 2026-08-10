import "server-only"
import { supabaseAdmin } from "@/lib/database/supabase"
import {
  MatRealizationPhotoSchema,
  type MatRealizationPhoto,
  type MatRealizationPhotosQuery,
} from "../model/schemas"

const PHOTO_SELECT = [
  "id",
  "mat_template_id",
  "mat_type",
  "image_url",
  "alt_text",
  "caption",
  "sort_order",
  "is_primary",
  "is_active",
].join(",")

const db = () => supabaseAdmin.schema("evapremium_shop")

const resolveTemplateScope = async (
  query: MatRealizationPhotosQuery,
): Promise<{ brandKey: string; modelKey: string } | null> => {
  let templateQuery = db()
    .from("mat_templates")
    .select("brand_key, model_key")
    .eq("is_active", true)
    .limit(1)

  if (query.recordKey) {
    templateQuery = templateQuery.eq("record_key", query.recordKey)
  } else if (query.matTemplateId) {
    templateQuery = templateQuery.eq("id", query.matTemplateId)
  } else if (query.brandKey && query.modelKey) {
    templateQuery = templateQuery
      .ilike("brand_key", query.brandKey)
      .eq("model_key", query.modelKey)
  } else {
    return null
  }

  const { data, error } = await templateQuery.maybeSingle()
  if (error) throw error
  if (!data?.brand_key || !data?.model_key) return null

  return {
    brandKey: data.brand_key as string,
    modelKey: data.model_key as string,
  }
}

/**
 * Zdjęcia realizacji dla marki+modelu, opcjonalnie filtrowane po mat_type
 * (3d-with-rims | classic).
 */
export const getMatRealizationPhotos = async (
  query: MatRealizationPhotosQuery,
): Promise<MatRealizationPhoto[]> => {
  const scope = await resolveTemplateScope(query)
  if (!scope) return []

  const { data: templates, error: templatesError } = await db()
    .from("mat_templates")
    .select("id")
    .eq("is_active", true)
    .eq("brand_key", scope.brandKey)
    .eq("model_key", scope.modelKey)

  if (templatesError) throw templatesError
  const templateIds = (templates ?? []).map((row) => row.id as string)
  if (templateIds.length === 0) return []

  let photosQuery = db()
    .from("mat_realization_photos")
    .select(PHOTO_SELECT)
    .eq("is_active", true)
    .in("mat_template_id", templateIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (query.matType) {
    photosQuery = photosQuery.eq("mat_type", query.matType)
  }

  const { data, error } = await photosQuery

  if (error) throw error

  const parsed = MatRealizationPhotoSchema.array().parse(data ?? [])

  const seen = new Set<string>()
  return parsed.filter((photo) => {
    const dedupeKey = `${photo.mat_type}:${photo.image_url}`
    if (seen.has(dedupeKey)) return false
    seen.add(dedupeKey)
    return true
  })
}
