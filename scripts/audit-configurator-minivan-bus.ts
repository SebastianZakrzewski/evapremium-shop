#!/usr/bin/env npx tsx
/**
 * Audits configurator mapping + pricing for minivan and bus (non-passenger-car) templates.
 *
 * Usage:
 *   npx tsx scripts/audit-configurator-minivan-bus.ts
 */
import fs from "node:fs"
import path from "node:path"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
import { buildConfiguratorEntryUrl } from "../src/features/car-configurator/utils/buildConfiguratorEntryUrl"
import {
  resolveCatalogBrandKey,
  resolveModelFamiliesFromParam,
  normalizeCatalogToken,
} from "../src/features/vehicle-catalog/domain/catalogKeys"
import {
  CONFIGURATOR_BUS_VARIANT_KEYS,
  CONFIGURATOR_MINIVAN_VARIANT_KEYS,
  filterSellableVariantKeys,
  selectPricingOverride,
} from "../src/features/vehicle-catalog/domain/pricingRules"
import { SELLABLE_PRICING_CATEGORIES } from "../src/features/vehicle-catalog/model/schemas"

dotenv.config({ path: path.join(process.cwd(), ".env") })

const TARGET_CATEGORIES = ["minivan", "bus"] as const
type TargetCategory = (typeof TARGET_CATEGORIES)[number]

const outputDir = path.join(process.cwd(), "output", "audit")

type TemplateRow = {
  id: string
  brand_name: string
  brand_key: string
  model_name: string
  model_key: string
  model_family_name: string
  model_family_key: string
  generation: string
  year_from: number | null
  year_to: number | null
  record_key: string
  body_type: string | null
  body_type_1: string | null
  body_type_1_key: string | null
  body_type_2_key: string | null
  body_type_3_key: string | null
  dealer_pricing_category_key: string
}

type CatalogBrand = { key: string; name: string }
type CatalogModelFamily = { key: string; name: string }

type AuditIssue = {
  severity: "error" | "warn"
  stage: string
  category: string
  brandKey: string
  brandName: string
  modelFamilyKey: string
  modelFamilyName: string
  recordKey?: string
  generation?: string
  message: string
}

type PricingCategory = {
  id: string
  slug: string
  label: string
  pricing_model: string
}

type PricingVariant = {
  id: string
  variant_key: string
  variant_label: string
}

type PricingMatrixRow = {
  variant_id: string
  mat_type: string
  base_price_pln: number
  price_after_discount_pln: number | null
  discount_excluded: boolean | null
}

type PricingOverrideRow = {
  template_record_key: string | null
  brand_key: string | null
  model_family_key: string | null
  year_from: number | null
  year_to: number | null
  variant_key: string
  override_category_slug: string | null
  fixed_base_price_pln: number | null
  surcharge_pln: number | null
}

type CategoryPricingBundle = {
  category: PricingCategory
  variants: PricingVariant[]
  matrices: PricingMatrixRow[]
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: "evapremium_shop" } },
)

const uniqueByKey = <T extends { key: string }>(items: T[]): T[] =>
  [...new Map(items.map((item) => [item.key, item])).values()]

const fetchAllTemplates = async (): Promise<TemplateRow[]> => {
  const rows: TemplateRow[] = []
  const pageSize = 1000
  let offset = 0

  while (true) {
    const { data, error } = await supabase
      .from("mat_templates")
      .select(
        "id,brand_name,brand_key,model_name,model_key,model_family_name,model_family_key,generation,year_from,year_to,record_key,body_type,body_type_1,body_type_1_key,body_type_2_key,body_type_3_key,dealer_pricing_category_key",
      )
      .eq("is_active", true)
      .in("dealer_pricing_category_key", [...SELLABLE_PRICING_CATEGORIES])
      .order("brand_key")
      .order("model_family_key")
      .range(offset, offset + pageSize - 1)

    if (error) throw new Error(error.message)
    if (!data?.length) break
    rows.push(...(data as TemplateRow[]))
    if (data.length < pageSize) break
    offset += pageSize
  }

  return rows
}

const resolveBrandKeyFromParam = (
  brandParam: string,
  rows: TemplateRow[],
  modelParam = "",
): string | null => {
  const trimmed = brandParam.trim()
  if (!trimmed) return null

  if (modelParam?.trim()) {
    const modelToken = modelParam.trim().toLowerCase()
    const slugToken = trimmed.toLowerCase().replace(/[\s_-]+/g, "")
    const modelRows = rows.filter((row) => {
      const brandKeyToken = row.brand_key.trim().toLowerCase().replace(/[\s_-]+/g, "")
      const brandNameToken = row.brand_name
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "")
      const matchesBrand =
        brandKeyToken === slugToken ||
        brandNameToken === slugToken ||
        brandKeyToken.includes(slugToken) ||
        brandNameToken.includes(slugToken)
      const matchesModel =
        row.model_family_key.trim().toLowerCase() === modelToken ||
        row.model_family_name.trim().toLowerCase() === modelToken
      return matchesBrand && matchesModel
    })
    if (modelRows.length > 0) return modelRows[0].brand_key
  }

  const brandRows = uniqueByKey(
    rows.map((row) => ({ key: row.brand_key, name: row.brand_name })),
  )

  const fromCatalog = resolveCatalogBrandKey(trimmed, null, brandRows)
  if (brandRows.some((brand) => brand.key === fromCatalog)) return fromCatalog

  const exactName = brandRows.find(
    (brand) => brand.name.trim().toLowerCase() === trimmed.toLowerCase(),
  )
  if (exactName) return exactName.key

  const exactKey = brandRows.find(
    (brand) => brand.key.trim().toLowerCase() === trimmed.toLowerCase(),
  )
  if (exactKey) return exactKey.key

  return null
}

const getModelFamiliesForBrand = (
  brandKey: string,
  rows: TemplateRow[],
): CatalogModelFamily[] =>
  uniqueByKey(
    rows
      .filter((row) => row.brand_key === brandKey)
      .map((row) => ({
        key: row.model_family_key,
        name: row.model_family_name,
      })),
  )

const getTemplatesForFamily = (
  brandKey: string,
  modelFamilyKey: string,
  rows: TemplateRow[],
): TemplateRow[] =>
  rows.filter(
    (row) =>
      row.brand_key === brandKey && row.model_family_key === modelFamilyKey,
  )

const parseConfiguratorUrl = (configuratorUrl: string) => {
  const query = configuratorUrl.split("?")[1] ?? ""
  const params = new URLSearchParams(query)
  return {
    brandParam: params.get("brand") ?? "",
    modelParam: params.get("model") ?? "",
  }
}

const simulateMapping = (
  rows: TemplateRow[],
  catalogBrands: CatalogBrand[],
  brandKey: string,
  brandName: string,
  modelFamilyKey: string,
  modelFamilyName: string,
  category: string,
): AuditIssue[] => {
  const issues: AuditIssue[] = []
  const configuratorUrl = buildConfiguratorEntryUrl({
    brand: brandName,
    model: modelFamilyKey,
  })
  const { brandParam, modelParam } = parseConfiguratorUrl(configuratorUrl)

  const resolvedBrandKey = resolveCatalogBrandKey(brandParam, null, catalogBrands)
  const repositoryBrandKey = resolveBrandKeyFromParam(brandParam, rows, modelParam)
  const effectiveBrandKey =
    repositoryBrandKey ||
    (catalogBrands.some((brand) => brand.key === resolvedBrandKey)
      ? resolvedBrandKey
      : "") ||
    brandKey

  if (effectiveBrandKey !== brandKey) {
    issues.push({
      severity: "error",
      stage: "brand_resolve",
      category,
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      message: `Brand mismatch: expected ${brandKey}, got ${effectiveBrandKey}`,
    })
    return issues
  }

  const models = getModelFamiliesForBrand(effectiveBrandKey, rows)
  const modelResolution = resolveModelFamiliesFromParam(modelParam, models)
  if (modelResolution.mode === "none") {
    issues.push({
      severity: "error",
      stage: "model_resolve",
      category,
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      message: `Model param "${modelParam}" did not resolve`,
    })
    return issues
  }

  const templateFamilyKey =
    modelResolution.mode === "single"
      ? modelResolution.family.key
      : modelResolution.prefix

  const templates =
    modelResolution.mode === "prefix"
      ? rows.filter(
          (row) =>
            row.brand_key === effectiveBrandKey &&
            (row.model_family_key === templateFamilyKey ||
              row.model_family_key.startsWith(templateFamilyKey)),
        )
      : getTemplatesForFamily(effectiveBrandKey, modelResolution.family.key, rows)

  if (templates.length === 0) {
    issues.push({
      severity: "error",
      stage: "templates_load",
      category,
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      message: "No templates after model resolution",
    })
    return issues
  }

  const targetTemplates = templates.filter((row) =>
    TARGET_CATEGORIES.includes(row.dealer_pricing_category_key as TargetCategory),
  )
  if (targetTemplates.length === 0) {
    issues.push({
      severity: "warn",
      stage: "category_filter",
      category,
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      message: "Resolved templates but none are minivan/bus",
    })
    return issues
  }

  const sample = targetTemplates[0]
  const year = sample.year_from
  if (year == null) {
    issues.push({
      severity: "warn",
      stage: "year_pick",
      category,
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      message: "First template has no year_from",
    })
    return issues
  }

  const yearMatches = targetTemplates.filter(
    (row) =>
      (row.year_from == null || year >= row.year_from) &&
      (row.year_to == null || year <= row.year_to),
  )
  if (yearMatches.length === 0) {
    issues.push({
      severity: "error",
      stage: "year_match",
      category,
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      message: `No minivan/bus templates match year ${year}`,
    })
  }

  const generations = new Set(targetTemplates.map((row) => row.generation))
  if (generations.size < targetTemplates.length && modelResolution.mode === "single") {
    const genList = [...generations].slice(0, 3).join(", ")
    issues.push({
      severity: "warn",
      stage: "generation_span",
      category,
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      message: `${targetTemplates.length} templates across ${generations.size} generations (${genList})`,
    })
  }

  if (
    modelResolution.mode === "single" &&
    normalizeCatalogToken(modelResolution.family.key) !==
      normalizeCatalogToken(modelFamilyKey)
  ) {
    issues.push({
      severity: "warn",
      stage: "model_key_drift",
      category,
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      message: `Resolved different family key: ${modelResolution.family.key}`,
    })
  }

  return issues
}

const loadPricingBundles = async (
  catalogId: string,
): Promise<Map<string, CategoryPricingBundle>> => {
  const { data: categories, error: catError } = await supabase
    .from("pricing_vehicle_categories")
    .select("id,slug,label,pricing_model")
    .eq("is_active", true)
    .in("slug", [...TARGET_CATEGORIES, "passenger_car"])

  if (catError) throw new Error(catError.message)

  const bundles = new Map<string, CategoryPricingBundle>()

  for (const category of (categories ?? []) as PricingCategory[]) {
    const [linksResult, matrixResult] = await Promise.all([
      supabase
        .from("pricing_category_variants")
        .select("variant_id,sort_order")
        .eq("vehicle_category_id", category.id)
        .eq("is_active", true),
      supabase
        .from("pricing_matrix")
        .select(
          "variant_id,mat_type,base_price_pln,price_after_discount_pln,discount_excluded",
        )
        .eq("catalog_version_id", catalogId)
        .eq("vehicle_category_id", category.id),
    ])

    if (linksResult.error) throw new Error(linksResult.error.message)
    if (matrixResult.error) throw new Error(matrixResult.error.message)

    const variantIds = [
      ...new Set((linksResult.data ?? []).map((row) => row.variant_id as string)),
    ]
    const variantsResult = variantIds.length
      ? await supabase
          .from("pricing_variants")
          .select("id,variant_key,variant_label")
          .in("id", variantIds)
      : { data: [], error: null }
    if (variantsResult.error) throw new Error(variantsResult.error.message)

    bundles.set(category.slug, {
      category,
      variants: (variantsResult.data ?? []) as PricingVariant[],
      matrices: (matrixResult.data ?? []) as PricingMatrixRow[],
    })
  }

  return bundles
}

const pickSampleYear = (template: TemplateRow): number | null => {
  if (template.year_from != null && template.year_to != null) {
    return Math.floor((template.year_from + template.year_to) / 2)
  }
  return template.year_from ?? template.year_to
}

const getBodyTypeKey = (template: TemplateRow): string | null =>
  template.body_type_1_key ??
  (template.body_type?.toLowerCase().includes("bus")
    ? "bus"
    : template.body_type?.toLowerCase().includes("minivan")
      ? "minivan"
      : null)

const simulateTemplatePricing = (
  template: TemplateRow,
  bundles: Map<string, CategoryPricingBundle>,
  overrides: PricingOverrideRow[],
): AuditIssue[] => {
  const issues: AuditIssue[] = []
  const category = template.dealer_pricing_category_key

  if (!TARGET_CATEGORIES.includes(category as TargetCategory)) {
    return issues
  }

  const bundle = bundles.get(category)
  if (!bundle) {
    issues.push({
      severity: "error",
      stage: "pricing_category_missing",
      category,
      brandKey: template.brand_key,
      brandName: template.brand_name,
      modelFamilyKey: template.model_family_key,
      modelFamilyName: template.model_family_name,
      recordKey: template.record_key,
      generation: template.generation,
      message: `No pricing bundle for category ${category}`,
    })
    return issues
  }

  const year = pickSampleYear(template)
  if (year == null) {
    issues.push({
      severity: "error",
      stage: "pricing_year",
      category,
      brandKey: template.brand_key,
      brandName: template.brand_name,
      modelFamilyKey: template.model_family_key,
      modelFamilyName: template.model_family_name,
      recordKey: template.record_key,
      generation: template.generation,
      message: "Template has no year range for pricing simulation",
    })
    return issues
  }

  const bodyTypeKey = getBodyTypeKey(template)
  const bodyTypeKeys = [
    template.body_type_1_key,
    template.body_type_2_key,
    template.body_type_3_key,
  ].filter((key): key is string => Boolean(key))

  if (!bodyTypeKey || !bodyTypeKeys.includes(bodyTypeKey)) {
    issues.push({
      severity: "error",
      stage: "pricing_body_type",
      category,
      brandKey: template.brand_key,
      brandName: template.brand_name,
      modelFamilyKey: template.model_family_key,
      modelFamilyName: template.model_family_name,
      recordKey: template.record_key,
      generation: template.generation,
      message: `Missing or invalid body type key (got ${bodyTypeKey ?? "null"})`,
    })
    return issues
  }

  const categoryVariantKeys = bundle.variants.map((variant) => variant.variant_key)
  const overrideVariantKeys = overrides
    .filter((override) =>
      selectPricingOverride(
        [
          {
            templateRecordKey: override.template_record_key,
            brandKey: override.brand_key,
            modelFamilyKey: override.model_family_key,
            yearFrom: override.year_from,
            yearTo: override.year_to,
            variantKey: override.variant_key,
          },
        ],
        {
          recordKey: template.record_key,
          brandKey: template.brand_key,
          modelFamilyKey: template.model_family_key,
          year,
          variantKey: override.variant_key,
        },
      ),
    )
    .map((override) => override.variant_key)

  const sellableKeys = filterSellableVariantKeys(
    [...new Set([...categoryVariantKeys, ...overrideVariantKeys])],
    bundle.category.pricing_model,
    bundle.category.slug,
  )

  const allowlist =
    category === "minivan"
      ? CONFIGURATOR_MINIVAN_VARIANT_KEYS
      : CONFIGURATOR_BUS_VARIANT_KEYS

  const unexpectedKeys = sellableKeys.filter(
    (key) => !(allowlist as readonly string[]).includes(key),
  )
  if (unexpectedKeys.length > 0) {
    issues.push({
      severity: "error",
      stage: "pricing_variant_allowlist",
      category,
      brandKey: template.brand_key,
      brandName: template.brand_name,
      modelFamilyKey: template.model_family_key,
      modelFamilyName: template.model_family_name,
      recordKey: template.record_key,
      generation: template.generation,
      message: `Variants outside allowlist: ${unexpectedKeys.join(", ")}`,
    })
  }

  if (sellableKeys.length === 0) {
    issues.push({
      severity: "error",
      stage: "pricing_no_variants",
      category,
      brandKey: template.brand_key,
      brandName: template.brand_name,
      modelFamilyKey: template.model_family_key,
      modelFamilyName: template.model_family_name,
      recordKey: template.record_key,
      generation: template.generation,
      message: "No sellable variants after filterSellableVariantKeys",
    })
    return issues
  }

  const variantByKey = new Map(
    bundle.variants.map((variant) => [variant.variant_key, variant]),
  )
  const matType = bundle.category.pricing_model === "single_price" ? "single" : "3d-with-rims"

  let pricedCount = 0
  for (const variantKey of sellableKeys) {
    const override = selectPricingOverride(
      overrides.map((row) => ({
        templateRecordKey: row.template_record_key,
        brandKey: row.brand_key,
        modelFamilyKey: row.model_family_key,
        yearFrom: row.year_from,
        yearTo: row.year_to,
        variantKey: row.variant_key,
        row,
      })),
      {
        recordKey: template.record_key,
        brandKey: template.brand_key,
        modelFamilyKey: template.model_family_key,
        year,
        variantKey,
      },
    )

    const overrideRow = override?.row as PricingOverrideRow | undefined
    const overrideSlug = overrideRow?.override_category_slug
    const pricingBundle =
      overrideSlug != null ? bundles.get(overrideSlug) ?? bundle : bundle
    const pricingMatType =
      pricingBundle.category.pricing_model === "single_price" ? "single" : matType

    const variant =
      variantByKey.get(variantKey) ??
      pricingBundle.variants.find((item) => item.variant_key === variantKey)

    const matrix = variant
      ? pricingBundle.matrices.find(
          (row) =>
            row.variant_id === variant.id && row.mat_type === pricingMatType,
        )
      : undefined

    const hasPrice =
      overrideRow?.fixed_base_price_pln != null ||
      (matrix != null && Number(matrix.base_price_pln) > 0)

    if (hasPrice) pricedCount += 1
  }

  if (pricedCount === 0) {
    issues.push({
      severity: "error",
      stage: "pricing_no_matrix",
      category,
      brandKey: template.brand_key,
      brandName: template.brand_name,
      modelFamilyKey: template.model_family_key,
      modelFamilyName: template.model_family_name,
      recordKey: template.record_key,
      generation: template.generation,
      message: `No priced variants among ${sellableKeys.length} sellable keys`,
    })
  }

  return issues
}

const KNOWN_OVERRIDE_SPOT_CHECKS: Array<{
  brandKey: string
  modelFamilyKey: string
  variantKey: string
  expectedCategory: string
  minBasePrice?: number
}> = [
  {
    brandKey: "Citroen",
    modelFamilyKey: "C8 1 gen",
    variantKey: "front",
    expectedCategory: "bus",
    minBasePrice: 850,
  },
  {
    brandKey: "Peugeot",
    modelFamilyKey: "807(MT) 1 gen",
    variantKey: "front",
    expectedCategory: "bus",
    minBasePrice: 850,
  },
  {
    brandKey: "Mercedes-Benz",
    modelFamilyKey: "Vito 3 gen (W447)",
    variantKey: "front",
    expectedCategory: "passenger_car",
    minBasePrice: 550,
  },
  {
    brandKey: "Mercedes-Benz",
    modelFamilyKey: "Viano 2 gen (W639)",
    variantKey: "front",
    expectedCategory: "minivan",
    minBasePrice: 550,
  },
]

const runSpotChecks = (
  templates: TemplateRow[],
  overrides: PricingOverrideRow[],
  bundles: Map<string, CategoryPricingBundle>,
): AuditIssue[] => {
  const issues: AuditIssue[] = []

  for (const check of KNOWN_OVERRIDE_SPOT_CHECKS) {
    const template = templates.find(
      (row) =>
        row.brand_key === check.brandKey &&
        row.model_family_key === check.modelFamilyKey,
    )
    if (!template) {
      issues.push({
        severity: "warn",
        stage: "spot_check_missing_template",
        category: "unknown",
        brandKey: check.brandKey,
        brandName: check.brandKey,
        modelFamilyKey: check.modelFamilyKey,
        modelFamilyName: check.modelFamilyKey,
        message: "Spot-check template not found in DB",
      })
      continue
    }

    const year = pickSampleYear(template)
    if (year == null) continue

    const override = selectPricingOverride(
      overrides.map((row) => ({
        templateRecordKey: row.template_record_key,
        brandKey: row.brand_key,
        modelFamilyKey: row.model_family_key,
        yearFrom: row.year_from,
        yearTo: row.year_to,
        variantKey: row.variant_key,
        row,
      })),
      {
        recordKey: template.record_key,
        brandKey: template.brand_key,
        modelFamilyKey: template.model_family_key,
        year,
        variantKey: check.variantKey,
      },
    )

    const overrideRow = override?.row as PricingOverrideRow | undefined
    const effectiveCategory =
      overrideRow?.override_category_slug ?? template.dealer_pricing_category_key

    if (effectiveCategory !== check.expectedCategory) {
      issues.push({
        severity: "error",
        stage: "spot_check_category",
        category: template.dealer_pricing_category_key,
        brandKey: template.brand_key,
        brandName: template.brand_name,
        modelFamilyKey: template.model_family_key,
        modelFamilyName: template.model_family_name,
        recordKey: template.record_key,
        generation: template.generation,
        message: `Expected pricing category ${check.expectedCategory}, got ${effectiveCategory}`,
      })
    }

    if (
      check.minBasePrice != null &&
      overrideRow?.fixed_base_price_pln != null &&
      Number(overrideRow.fixed_base_price_pln) < check.minBasePrice
    ) {
      issues.push({
        severity: "error",
        stage: "spot_check_price",
        category: template.dealer_pricing_category_key,
        brandKey: template.brand_key,
        brandName: template.brand_name,
        modelFamilyKey: template.model_family_key,
        modelFamilyName: template.model_family_name,
        recordKey: template.record_key,
        generation: template.generation,
        message: `Override base price ${overrideRow.fixed_base_price_pln} < ${check.minBasePrice}`,
      })
    }
  }

  return issues
}

const main = async () => {
  const allRows = await fetchAllTemplates()
  const targetRows = allRows.filter((row) =>
    TARGET_CATEGORIES.includes(row.dealer_pricing_category_key as TargetCategory),
  )

  const catalogBrands: CatalogBrand[] = uniqueByKey(
    allRows.map((row) => ({ key: row.brand_key, name: row.brand_name })),
  )

  const families = new Map<
    string,
    {
      brandKey: string
      brandName: string
      modelFamilyKey: string
      modelFamilyName: string
      category: string
    }
  >()

  targetRows.forEach((row) => {
    const key = `${row.brand_key}|${row.model_family_key}`
    if (families.has(key)) return
    families.set(key, {
      brandKey: row.brand_key,
      brandName: row.brand_name,
      modelFamilyKey: row.model_family_key,
      modelFamilyName: row.model_family_name,
      category: row.dealer_pricing_category_key,
    })
  })

  const { data: catalog, error: catalogError } = await supabase
    .from("pricing_catalog_versions")
    .select("id,code")
    .eq("is_active", true)
    .single()
  if (catalogError || !catalog) {
    throw new Error(catalogError?.message ?? "Active pricing catalog not found")
  }

  const bundles = await loadPricingBundles(catalog.id)
  const { data: rawOverrides, error: overrideError } = await supabase
    .from("pricing_template_overrides")
    .select(
      "template_record_key,brand_key,model_family_key,year_from,year_to,variant_key,override_category_slug,fixed_base_price_pln,surcharge_pln",
    )
    .eq("catalog_version_id", catalog.id)
    .eq("is_active", true)
  if (overrideError) throw new Error(overrideError.message)

  const overrides = (rawOverrides ?? []) as PricingOverrideRow[]

  const issues: AuditIssue[] = []
  let mappingOk = 0

  for (const family of families.values()) {
    const result = simulateMapping(
      allRows,
      catalogBrands,
      family.brandKey,
      family.brandName,
      family.modelFamilyKey,
      family.modelFamilyName,
      family.category,
    )
    const errors = result.filter((issue) => issue.severity === "error")
    if (errors.length === 0) mappingOk += 1
    issues.push(...result)
  }

  let pricingOk = 0
  for (const template of targetRows) {
    const result = simulateTemplatePricing(template, bundles, overrides)
    const errors = result.filter((issue) => issue.severity === "error")
    if (errors.length === 0) pricingOk += 1
    issues.push(...result)
  }

  issues.push(...runSpotChecks(targetRows, overrides, bundles))

  const errors = issues.filter((issue) => issue.severity === "error")
  const warnings = issues.filter((issue) => issue.severity === "warn")

  const byCategory = {
    minivan: {
      templates: targetRows.filter((row) => row.dealer_pricing_category_key === "minivan")
        .length,
      families: [...families.values()].filter((family) => family.category === "minivan")
        .length,
    },
    bus: {
      templates: targetRows.filter((row) => row.dealer_pricing_category_key === "bus")
        .length,
      families: [...families.values()].filter((family) => family.category === "bus")
        .length,
    },
  }

  const byStage = issues.reduce<Record<string, number>>((acc, issue) => {
    acc[issue.stage] = (acc[issue.stage] ?? 0) + 1
    return acc
  }, {})

  const minivanBundle = bundles.get("minivan")
  const busBundle = bundles.get("bus")

  const report = {
    generatedAt: new Date().toISOString(),
    catalogCode: catalog.code,
    totals: {
      targetTemplates: targetRows.length,
      targetFamilies: families.size,
      mappingPassed: mappingOk,
      mappingFailed: families.size - mappingOk,
      pricingPassed: pricingOk,
      pricingFailed: targetRows.length - pricingOk,
      errors: errors.length,
      warnings: warnings.length,
    },
    byCategory,
    pricingCatalog: {
      minivan: {
        variantKeys: minivanBundle?.variants.map((variant) => variant.variant_key) ?? [],
        sellableKeys: minivanBundle
          ? filterSellableVariantKeys(
              minivanBundle.variants.map((variant) => variant.variant_key),
              minivanBundle.category.pricing_model,
              "minivan",
            )
          : [],
        matrixRows: minivanBundle?.matrices.length ?? 0,
      },
      bus: {
        variantKeys: busBundle?.variants.map((variant) => variant.variant_key) ?? [],
        sellableKeys: busBundle
          ? filterSellableVariantKeys(
              busBundle.variants.map((variant) => variant.variant_key),
              busBundle.category.pricing_model,
              "bus",
            )
          : [],
        matrixRows: busBundle?.matrices.length ?? 0,
      },
      activeOverrides: overrides.length,
    },
    byStage,
    sampleErrors: errors.slice(0, 30),
    sampleWarnings: warnings.slice(0, 20),
  }

  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(
    path.join(outputDir, "configurator-minivan-bus-report.json"),
    JSON.stringify(report, null, 2),
    "utf8",
  )

  if (issues.length > 0) {
    const csv = [
      "severity,stage,category,brand_key,model_family_key,record_key,generation,message",
      ...issues.map((issue) =>
        [
          issue.severity,
          issue.stage,
          issue.category,
          issue.brandKey,
          issue.modelFamilyKey,
          issue.recordKey ?? "",
          issue.generation ?? "",
          issue.message,
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n")
    fs.writeFileSync(
      path.join(outputDir, "configurator-minivan-bus-issues.csv"),
      csv,
      "utf8",
    )
  }

  console.log(JSON.stringify(report, null, 2))
  process.exit(errors.length > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
