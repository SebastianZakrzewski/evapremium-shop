import "server-only"
import { supabaseAdmin } from "@/lib/database/supabase"

const db = () => supabaseAdmin.schema("evapremium_shop")

const requireData = <T>(
  data: T | null,
  error: { message: string } | null,
  operation: string,
): T => {
  if (error) throw new Error(`${operation}: ${error.message}`)
  if (data == null) throw new Error(`${operation}: no data`)
  return data
}

export const getActivePricingCatalog = async () => {
  const { data, error } = await db()
    .from("pricing_catalog_versions")
    .select("id,code,discount_threshold_pln,discount_rate_below,discount_rate_from")
    .eq("is_active", true)
    .single()
  return requireData(data, error, "Active pricing catalog lookup")
}

export const getPricingCategory = async (sourceSlug: string) => {
  const aliasResult = await db()
    .from("pricing_category_aliases")
    .select("vehicle_category_id")
    .eq("alias_slug", sourceSlug)
    .maybeSingle()
  if (aliasResult.error) {
    throw new Error(`Pricing category alias lookup: ${aliasResult.error.message}`)
  }

  let query = db()
    .from("pricing_vehicle_categories")
    .select("id,slug,label,pricing_model")
    .eq("is_active", true)

  query = aliasResult.data?.vehicle_category_id
    ? query.eq("id", aliasResult.data.vehicle_category_id)
    : query.eq("slug", sourceSlug)

  const { data, error } = await query.single()
  return requireData(data, error, "Pricing category lookup")
}

export const getCategoryPricingRows = async (
  catalogId: string,
  categoryId: string,
) => {
  const [linksResult, matrixResult] = await Promise.all([
    db()
      .from("pricing_category_variants")
      .select("variant_id,sort_order")
      .eq("vehicle_category_id", categoryId)
      .eq("is_active", true),
    db()
      .from("pricing_matrix")
      .select(
        "id,variant_id,mat_type,base_price_pln,price_after_discount_pln,discount_excluded",
      )
      .eq("catalog_version_id", catalogId)
      .eq("vehicle_category_id", categoryId),
  ])

  if (linksResult.error) throw new Error(linksResult.error.message)
  if (matrixResult.error) throw new Error(matrixResult.error.message)

  const variantIds = [
    ...new Set((linksResult.data ?? []).map((row) => row.variant_id)),
  ]
  const variantsResult = variantIds.length
    ? await db()
        .from("pricing_variants")
        .select("id,variant_key,variant_label")
        .in("id", variantIds)
    : { data: [], error: null }
  if (variantsResult.error) throw new Error(variantsResult.error.message)

  return {
    links: linksResult.data ?? [],
    matrices: matrixResult.data ?? [],
    variants: variantsResult.data ?? [],
  }
}

export const getPricingOverrides = async (
  catalogId: string,
) => {
  const { data, error } = await db()
    .from("pricing_template_overrides")
    .select(
      "template_record_key,brand_key,model_family_key,year_from,year_to,variant_key,override_category_slug,fixed_base_price_pln,surcharge_pln,notes",
    )
    .eq("catalog_version_id", catalogId)
    .eq("is_active", true)

  if (error) throw new Error(`Pricing overrides lookup: ${error.message}`)
  return data ?? []
}

export const getVariantsByKeys = async (variantKeys: string[]) => {
  if (variantKeys.length === 0) return []
  const { data, error } = await db()
    .from("pricing_variants")
    .select("id,variant_key,variant_label")
    .in("variant_key", variantKeys)
  if (error) throw new Error(`Pricing variants lookup: ${error.message}`)
  return data ?? []
}

export const getBitrixVariantMapping = async (
  categorySlug: string,
  variantKey: string,
) => {
  const category = await getPricingCategory(categorySlug)
  const variants = await getVariantsByKeys([variantKey])
  const variant = variants[0]
  if (!variant) return null

  const { data, error } = await db()
    .from("pricing_bitrix_mappings")
    .select("bitrix_field,bitrix_label,bitrix_enum_id")
    .eq("vehicle_category_id", category.id)
    .eq("variant_id", variant.id)
    .maybeSingle()

  if (error) throw new Error(`Bitrix mapping lookup: ${error.message}`)
  return data
}
