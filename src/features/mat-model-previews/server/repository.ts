import "server-only"
import { supabaseAdmin } from "@/lib/database/supabase"
import {
  MatModelPreviewSchema,
  type MatModelPreview,
  type MatModelPreviewsQuery,
} from "../model/schemas"
import {
  resolvePrimaryPreviewImageUrl,
  type PrimaryModelPreviewRow,
} from "../lib/resolvePrimaryPreviewImageUrl"

export type { PrimaryModelPreviewRow }
export { resolvePrimaryPreviewImageUrl }

const PREVIEW_SELECT = [
  "id",
  "mat_template_id",
  "body_type_key",
  "image_url",
  "alt_text",
  "caption",
  "sort_order",
  "is_primary",
  "is_active",
].join(",")

const db = () => supabaseAdmin.schema("evapremium_shop")

const normalizeBodyTypeKey = (value: string | null | undefined): string =>
  (value ?? "").trim().toLowerCase()

const resolveTemplateScope = async (
  query: MatModelPreviewsQuery,
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

const matchesBodyTypeScope = (
  previewBodyTypeKey: string | null,
  requestedBodyTypeKey: string | undefined,
): boolean => {
  if (!requestedBodyTypeKey) return true
  if (!previewBodyTypeKey) return true
  return (
    normalizeBodyTypeKey(previewBodyTypeKey) ===
    normalizeBodyTypeKey(requestedBodyTypeKey)
  )
}

/**
 * Zdjęcia podglądowe produktu dla marki+modelu (kompozyt auto + dywaniki).
 * Opcjonalnie filtruje po bodyTypeKey (NULL w DB = wspólne dla wszystkich typów).
 */
export const getMatModelPreviews = async (
  query: MatModelPreviewsQuery,
): Promise<MatModelPreview[]> => {
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

  const { data, error } = await db()
    .from("mat_model_previews")
    .select(PREVIEW_SELECT)
    .eq("is_active", true)
    .in("mat_template_id", templateIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (error) throw error

  const parsed = MatModelPreviewSchema.array().parse(data ?? [])

  const filtered = parsed.filter((preview) =>
    matchesBodyTypeScope(preview.body_type_key, query.bodyTypeKey),
  )

  const seen = new Set<string>()
  return filtered.filter((preview) => {
    const dedupeKey = `${preview.image_url}|${preview.body_type_key ?? ""}`
    if (seen.has(dedupeKey)) return false
    seen.add(dedupeKey)
    return true
  })
}

/**
 * Primary previews dla batcha katalogu (template + opcjonalny body_type_key).
 */
export const getPrimaryModelPreviewsByTemplateIds = async (
  templateIds: string[],
): Promise<PrimaryModelPreviewRow[]> => {
  if (templateIds.length === 0) return []

  const uniqueIds = [...new Set(templateIds)]

  const { data, error } = await db()
    .from("mat_model_previews")
    .select("mat_template_id, body_type_key, image_url")
    .eq("is_active", true)
    .eq("is_primary", true)
    .in("mat_template_id", uniqueIds)

  if (error) throw error

  return (data ?? [])
    .map((row) => {
      const matTemplateId = row.mat_template_id as string
      const imageUrl = row.image_url as string
      if (!matTemplateId || !imageUrl) return null
      return {
        matTemplateId,
        bodyTypeKey: (row.body_type_key as string | null) ?? null,
        imageUrl,
      }
    })
    .filter((row): row is PrimaryModelPreviewRow => row != null)
}
