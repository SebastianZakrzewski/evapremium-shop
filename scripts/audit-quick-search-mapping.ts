#!/usr/bin/env npx tsx
/**
 * Audits QuickSearchBar → configurator URL → template + pricing variant resolution
 * for every sellable brand + model family in mat_templates.
 *
 * Usage:
 *   npx tsx scripts/audit-quick-search-mapping.ts
 *   npx tsx scripts/audit-quick-search-mapping.ts --json
 */
import fs from "node:fs"
import path from "node:path"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
import { buildConfiguratorEntryUrl } from "../src/features/car-configurator/utils/buildConfiguratorEntryUrl"
import { getProductEntryLock } from "../src/features/car-configurator/utils/productEntryContext"
import {
  bodyTypeMatchesParam,
  resolveCatalogBrandKey,
  resolveModelFamiliesFromParam,
} from "../src/features/vehicle-catalog/domain/catalogKeys"
import { enrichCarContextFromTemplates } from "../src/features/vehicle-catalog/utils/enrichCarContextFromTemplates"
import { filterSellableVariantKeys } from "../src/features/vehicle-catalog/domain/pricingRules"
import { SELLABLE_PRICING_CATEGORIES } from "../src/features/vehicle-catalog/model/schemas"
import {
  toCatalogBrand,
  toModelFamily,
  toTemplateOption,
} from "../src/features/vehicle-catalog/server/catalogMappers"
import type { MatTemplateDbRow } from "../src/features/vehicle-catalog/server/repository"
import { resolveBrandDisplayNameFromDbName } from "../src/shared/brands/brandMapper"

dotenv.config({ path: path.join(process.cwd(), ".env") })

const outputDir = path.join(process.cwd(), "output", "audit")
const writeJson = process.argv.includes("--json")

type CatalogBrand = { key: string; name: string }
type CatalogModelFamily = { key: string; name: string }

type AuditIssue = {
  severity: "error" | "warn"
  stage: string
  brandKey: string
  brandName: string
  modelFamilyKey: string
  modelFamilyName: string
  configuratorUrl?: string
  recordKey?: string
  message: string
}

type PricingCategory = {
  id: string
  slug: string
  pricing_model: string
}

type PricingVariant = {
  id: string
  variant_key: string
}

type PricingMatrixRow = {
  variant_id: string
  mat_type: string
  base_price_pln: number
  price_after_discount_pln: number | null
  discount_excluded: boolean | null
}

type CategoryPricingBundle = {
  category: PricingCategory
  variants: PricingVariant[]
  matrices: PricingMatrixRow[]
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
  db: { schema: "evapremium_shop" },
})

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

const fetchTemplates = async (): Promise<MatTemplateDbRow[]> => {
  const rows: MatTemplateDbRow[] = []
  const pageSize = 1000

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("mat_templates")
      .select(TEMPLATE_SELECT)
      .eq("is_active", true)
      .in("dealer_pricing_category_key", [...SELLABLE_PRICING_CATEGORIES])
      .order("brand_key")
      .order("model_family_key")
      .range(offset, offset + pageSize - 1)

    if (error) throw new Error(error.message)
    if (!data?.length) break
    rows.push(...(data as MatTemplateDbRow[]))
    if (data.length < pageSize) break
  }

  return rows
}

const uniqueByKey = <T extends { key: string }>(items: T[]): T[] =>
  [...new Map(items.map((item) => [item.key, item])).values()]

const normalizeToken = (value: string): string =>
  value.toLowerCase().replace(/[\s_-]+/g, "")

const yearsInRange = (from: number | null, to: number | null): number[] => {
  if (from == null) return []
  const end = Math.min(to ?? new Date().getFullYear() + 1, 2100)
  return Array.from({ length: end - from + 1 }, (_, index) => from + index).reverse()
}

const getModelFamiliesForBrand = (
  brandKey: string,
  rows: MatTemplateDbRow[],
): CatalogModelFamily[] =>
  uniqueByKey(
    rows
      .filter((row) => row.brand_key === brandKey)
      .map((row) => ({
        key: row.model_family_key,
        name: row.model_family_name,
      })),
  )

const loadTemplatesForResolution = (
  rows: MatTemplateDbRow[],
  brandKey: string,
  modelResolution: ReturnType<typeof resolveModelFamiliesFromParam>,
): ReturnType<typeof toTemplateOption>[] => {
  if (modelResolution.mode === "none") return []

  const templateRows =
    modelResolution.mode === "prefix"
      ? rows.filter(
          (row) =>
            row.brand_key === brandKey &&
            (row.model_family_key === modelResolution.prefix ||
              row.model_family_key.startsWith(modelResolution.prefix) ||
              row.model_family_key
                .toLowerCase()
                .includes(modelResolution.prefix.toLowerCase())),
        )
      : rows.filter(
          (row) =>
            row.brand_key === brandKey &&
            row.model_family_key === modelResolution.family.key,
        )

  return templateRows.map(toTemplateOption)
}

const simulateQuickSearchFlow = (
  rows: MatTemplateDbRow[],
  catalogBrands: CatalogBrand[],
  brandKey: string,
  brandName: string,
  modelFamilyKey: string,
  modelFamilyName: string,
  representativeRow: MatTemplateDbRow,
): { issues: AuditIssue[]; recordKey: string | null } => {
  const issues: AuditIssue[] = []

  const brandDisplayName = resolveBrandDisplayNameFromDbName(brandName)
  const modelFamily = toModelFamily(representativeRow)
  const selectedModelFamilyKey = modelFamily.key
  const selectedModelCatalogName = modelFamily.name

  if (selectedModelFamilyKey !== modelFamilyKey) {
    issues.push({
      severity: "error",
      stage: "quick_search_model_key",
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      message: `Dropdown key mismatch: expected ${modelFamilyKey}, got ${selectedModelFamilyKey}`,
    })
    return { issues, recordKey: null }
  }

  const quickSearchTemplates = rows
    .filter(
      (row) =>
        row.brand_key === brandKey && row.model_family_key === modelFamilyKey,
    )
    .map(toTemplateOption)

  if (quickSearchTemplates.length === 0) {
    issues.push({
      severity: "error",
      stage: "quick_search_templates",
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      message: "Quick search catalog returned no templates",
    })
    return { issues, recordKey: null }
  }

  const enrichment = enrichCarContextFromTemplates(quickSearchTemplates)
  const configuratorUrl = buildConfiguratorEntryUrl({
    brand: brandDisplayName,
    model: selectedModelCatalogName,
    generation: enrichment.generation,
    bodyType: enrichment.bodyType,
  })

  const productEntry = getProductEntryLock(
    new URLSearchParams(configuratorUrl.split("?")[1] ?? ""),
  )

  if (!productEntry.isLocked || !productEntry.brandParam || !productEntry.modelParam) {
    issues.push({
      severity: "error",
      stage: "configurator_url",
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      configuratorUrl,
      message: "Configurator URL missing brand/model lock params",
    })
    return { issues, recordKey: null }
  }

  const resolvedBrandKey = resolveCatalogBrandKey(
    productEntry.brandParam,
    null,
    catalogBrands,
  )

  if (resolvedBrandKey.trim().toLowerCase() !== brandKey.trim().toLowerCase()) {
    issues.push({
      severity: "error",
      stage: "brand_resolve",
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      configuratorUrl,
      message: `Brand mismatch: expected ${brandKey}, got ${resolvedBrandKey || "(empty)"}`,
    })
    return { issues, recordKey: null }
  }

  const models = getModelFamiliesForBrand(resolvedBrandKey, rows)
  const modelResolution = resolveModelFamiliesFromParam(
    productEntry.modelParam,
    models,
  )

  if (modelResolution.mode === "none") {
    issues.push({
      severity: "error",
      stage: "model_resolve",
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      configuratorUrl,
      message: `Model param "${productEntry.modelParam}" did not resolve`,
    })
    return { issues, recordKey: null }
  }

  const templates = loadTemplatesForResolution(rows, resolvedBrandKey, modelResolution)
  if (templates.length === 0) {
    issues.push({
      severity: "error",
      stage: "templates_load",
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      configuratorUrl,
      message: `No templates after model resolution (mode=${modelResolution.mode})`,
    })
    return { issues, recordKey: null }
  }

  let generations = templates.map((template) => ({
    modelKey: template.modelKey,
    generation: template.generation,
    yearFrom: template.yearFrom,
    yearTo: template.yearTo,
  }))

  if (productEntry.generationParam) {
    const generationToken = normalizeToken(productEntry.generationParam)
    generations = generations.filter(
      (item) =>
        normalizeToken(item.generation).includes(generationToken) ||
        generationToken.includes(normalizeToken(item.generation)),
    )
  }

  const uniqueGenerations = [
    ...new Map(
      generations.map((item) => [`${item.modelKey}|${item.generation}`, item]),
    ).values(),
  ]

  if (uniqueGenerations.length === 0) {
    issues.push({
      severity: "error",
      stage: "generation_filter",
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      configuratorUrl,
      message: `Generation param "${productEntry.generationParam}" filtered out all templates`,
    })
    return { issues, recordKey: null }
  }

  const resolvedGeneration = uniqueGenerations[0]
  const availableYears = yearsInRange(
    resolvedGeneration.yearFrom,
    resolvedGeneration.yearTo,
  )

  if (availableYears.length === 0) {
    issues.push({
      severity: "error",
      stage: "year_range",
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      configuratorUrl,
      message: "No years available for resolved generation",
    })
    return { issues, recordKey: null }
  }

  const selectedYear = availableYears[0]
  const matchingTemplates = templates.filter((template) => {
    if (productEntry.generationParam && resolvedGeneration.modelKey) {
      if (template.modelKey !== resolvedGeneration.modelKey) return false
    }
    return (
      (template.yearFrom == null || selectedYear >= template.yearFrom) &&
      (template.yearTo == null || selectedYear <= template.yearTo)
    )
  })

  if (matchingTemplates.length === 0) {
    issues.push({
      severity: "error",
      stage: "year_match",
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      configuratorUrl,
      message: `No templates match selected year ${selectedYear}`,
    })
    return { issues, recordKey: null }
  }

  const bodyOptions = matchingTemplates.flatMap((template) =>
    template.bodyTypes.map((bodyType) => ({
      template,
      bodyType,
    })),
  )

  if (bodyOptions.length === 0) {
    issues.push({
      severity: "error",
      stage: "body_options",
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      configuratorUrl,
      message: "No body type options for matched templates",
    })
    return { issues, recordKey: null }
  }

  let resolvedBody = productEntry.bodyTypeParam
    ? bodyOptions.find((option) =>
        bodyTypeMatchesParam(option.bodyType, productEntry.bodyTypeParam!),
      )
    : undefined

  if (!resolvedBody && productEntry.bodyTypeParam) {
    resolvedBody = bodyOptions.find(
      (option) =>
        option.bodyType.label.toLowerCase() ===
        productEntry.bodyTypeParam?.toLowerCase(),
    )
  }

  if (!resolvedBody && bodyOptions.length === 1) {
    resolvedBody = bodyOptions[0]
  }

  if (!resolvedBody) {
    issues.push({
      severity: "warn",
      stage: "body_type_manual",
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      configuratorUrl,
      message: productEntry.bodyTypeParam
        ? `Body type "${productEntry.bodyTypeParam}" did not resolve (${bodyOptions.length} options)`
        : `User must pick body type manually (${bodyOptions.length} options)`,
    })
    return {
      issues,
      recordKey: bodyOptions[0]?.template.recordKey ?? null,
    }
  }

  if (
    modelResolution.mode === "single" &&
    modelResolution.family.key !== modelFamilyKey
  ) {
    issues.push({
      severity: "warn",
      stage: "model_key_drift",
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      configuratorUrl,
      recordKey: resolvedBody.template.recordKey,
      message: `Resolved different family key: ${modelResolution.family.key}`,
    })
  }

  return { issues, recordKey: resolvedBody.template.recordKey }
}

const loadPricingBundles = async (
  catalogId: string,
): Promise<Map<string, CategoryPricingBundle>> => {
  const { data: categories, error: catError } = await supabase
    .from("pricing_vehicle_categories")
    .select("id,slug,pricing_model")
    .eq("is_active", true)
    .in("slug", [...SELLABLE_PRICING_CATEGORIES])

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
          .select("id,variant_key")
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

const verifyPricingVariants = (
  row: MatTemplateDbRow,
  bundles: Map<string, CategoryPricingBundle>,
): AuditIssue | null => {
  const categoryKey = row.dealer_pricing_category_key
  const bundle = bundles.get(categoryKey)
  if (!bundle) {
    return {
      severity: "error",
      stage: "pricing_category",
      brandKey: row.brand_key,
      brandName: row.brand_name,
      modelFamilyKey: row.model_family_key,
      modelFamilyName: row.model_family_name,
      recordKey: row.record_key,
      message: `Missing pricing bundle for category ${categoryKey}`,
    }
  }

  const variantKeys = bundle.variants.map((variant) => variant.variant_key)
  const sellableKeys = filterSellableVariantKeys(
    variantKeys,
    bundle.category.pricing_model,
    bundle.category.slug,
    undefined,
    { seatRows: row.seat_rows },
  )

  const matrixVariantIds = new Set(bundle.matrices.map((entry) => entry.variant_id))
  const sellableWithMatrix = bundle.variants.filter(
    (variant) =>
      sellableKeys.includes(variant.variant_key) &&
      matrixVariantIds.has(variant.id),
  )

  if (sellableWithMatrix.length === 0) {
    return {
      severity: "error",
      stage: "pricing_variants",
      brandKey: row.brand_key,
      brandName: row.brand_name,
      modelFamilyKey: row.model_family_key,
      modelFamilyName: row.model_family_name,
      recordKey: row.record_key,
      message: `No sellable pricing variants for category ${categoryKey}`,
    }
  }

  return null
}

const main = async () => {
  const rows = await fetchTemplates()

  const { data: catalog, error: catalogError } = await supabase
    .from("pricing_catalog_versions")
    .select("id,code")
    .eq("is_active", true)
    .single()
  if (catalogError || !catalog) {
    throw new Error(catalogError?.message ?? "Active pricing catalog not found")
  }

  const pricingBundles = await loadPricingBundles(catalog.id)

  const catalogBrands: CatalogBrand[] = uniqueByKey(
    rows.map((row) => {
      const brand = toCatalogBrand(row)
      return { key: brand.key, name: brand.displayName }
    }),
  )

  const families = new Map<
    string,
    {
      brandKey: string
      brandName: string
      modelFamilyKey: string
      modelFamilyName: string
      representativeRow: MatTemplateDbRow
    }
  >()

  rows.forEach((row) => {
    const key = `${row.brand_key}|${row.model_family_key}`
    if (families.has(key)) return
    families.set(key, {
      brandKey: row.brand_key,
      brandName: row.brand_name,
      modelFamilyKey: row.model_family_key,
      modelFamilyName: row.model_family_name,
      representativeRow: row,
    })
  })

  const issues: AuditIssue[] = []
  let mappingOk = 0
  let fullOk = 0

  for (const family of families.values()) {
    const flowResult = simulateQuickSearchFlow(
      rows,
      catalogBrands,
      family.brandKey,
      family.brandName,
      family.modelFamilyKey,
      family.modelFamilyName,
      family.representativeRow,
    )

    const flowErrors = flowResult.issues.filter((issue) => issue.severity === "error")
    if (flowErrors.length > 0) {
      issues.push(...flowResult.issues)
      continue
    }

    issues.push(...flowResult.issues.filter((issue) => issue.severity === "warn"))
    mappingOk += 1

    const resolvedRow =
      rows.find((row) => row.record_key === flowResult.recordKey) ??
      family.representativeRow

    const pricingIssue = verifyPricingVariants(resolvedRow, pricingBundles)
    if (pricingIssue) {
      issues.push(pricingIssue)
      continue
    }

    fullOk += 1
  }

  const errors = issues.filter((issue) => issue.severity === "error")
  const warnings = issues.filter((issue) => issue.severity === "warn")

  const byStage = issues.reduce<Record<string, number>>((acc, issue) => {
    acc[issue.stage] = (acc[issue.stage] ?? 0) + 1
    return acc
  }, {})

  const byBrand = issues.reduce<Record<string, number>>((acc, issue) => {
    acc[issue.brandKey] = (acc[issue.brandKey] ?? 0) + 1
    return acc
  }, {})

  const report = {
    generatedAt: new Date().toISOString(),
    audit: "quick-search-bar",
    templates: rows.length,
    brands: catalogBrands.length,
    modelFamilies: families.size,
    mappingPassed: mappingOk,
    mappingFailed: families.size - mappingOk,
    fullPassed: fullOk,
    fullFailed: families.size - fullOk,
    passed: fullOk,
    failed: families.size - fullOk,
    errors: errors.length,
    warnings: warnings.length,
    byStage,
    byBrand: Object.fromEntries(
      Object.entries(byBrand).sort((left, right) => right[1] - left[1]).slice(0, 30),
    ),
    sampleErrors: errors.slice(0, 30),
    sampleWarnings: warnings.slice(0, 15),
  }

  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(
    path.join(outputDir, "quick-search-mapping-report.json"),
    JSON.stringify(report, null, 2),
    "utf8",
  )

  if (issues.length > 0) {
    const csv = [
      "severity,stage,brand_key,brand_name,model_family_key,model_family_name,record_key,configurator_url,message",
      ...issues.map((issue) =>
        [
          issue.severity,
          issue.stage,
          issue.brandKey,
          issue.brandName,
          issue.modelFamilyKey,
          issue.modelFamilyName,
          issue.recordKey ?? "",
          issue.configuratorUrl ?? "",
          issue.message,
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n")
    fs.writeFileSync(
      path.join(outputDir, "quick-search-mapping-issues.csv"),
      csv,
      "utf8",
    )
  }

  console.log(JSON.stringify(report, null, 2))

  if (writeJson) return

  process.exit(errors.length > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
