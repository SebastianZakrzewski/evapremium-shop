#!/usr/bin/env npx tsx
/**
 * Audits configurator brand/model URL mapping and template matching for every
 * sellable brand + model family in mat_templates.
 *
 * Usage:
 *   npx tsx scripts/audit-configurator-mapping.ts
 *   npx tsx scripts/audit-configurator-mapping.ts --json
 */
import fs from "node:fs"
import path from "node:path"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
import { buildConfiguratorEntryUrl } from "../src/features/car-configurator/utils/buildConfiguratorEntryUrl"
import { brandNameToNavigationSlug } from "../src/shared/brands"
import {
  resolveCatalogBrandKey,
  resolveModelFamiliesFromParam,
  normalizeCatalogToken,
} from "../src/features/vehicle-catalog/domain/catalogKeys"
import { SELLABLE_PRICING_CATEGORIES } from "../src/features/vehicle-catalog/model/schemas"

dotenv.config({ path: path.join(process.cwd(), ".env") })

type TemplateRow = {
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
  dealer_pricing_category_key: string
}

type CatalogBrand = { key: string; name: string }
type CatalogModelFamily = { key: string; name: string }

type AuditIssue = {
  severity: "error" | "warn"
  stage: string
  brandKey: string
  brandName: string
  modelFamilyKey: string
  modelFamilyName: string
  brandParam?: string
  modelParam?: string
  configuratorUrl?: string
  message: string
}

const outputDir = path.join(process.cwd(), "output", "audit")
const writeJson = process.argv.includes("--json")

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

const fetchTemplates = async (): Promise<TemplateRow[]> => {
  const rows: TemplateRow[] = []
  const pageSize = 1000

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .schema("evapremium_shop")
      .from("mat_templates")
      .select(
        "brand_name,brand_key,model_name,model_key,model_family_name,model_family_key,generation,year_from,year_to,record_key,body_type,body_type_1,body_type_1_key,dealer_pricing_category_key",
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
  }

  return rows
}

const uniqueByKey = <T extends { key: string }>(items: T[]): T[] =>
  [...new Map(items.map((item) => [item.key, item])).values()]

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

  const slugToken = trimmed.toLowerCase().replace(/[\s_-]+/g, "")
  const slugMatches = brandRows.filter((brand) => {
    const keyToken = brand.key.trim().toLowerCase().replace(/[\s_-]+/g, "")
    const nameToken = brand.name.trim().toLowerCase().replace(/[\s_-]+/g, "")
    return keyToken === slugToken || nameToken === slugToken
  })
  if (slugMatches.length === 1) return slugMatches[0].key

  if (slugMatches.length > 1) {
    const tally = new Map<string, number>()
    rows
      .filter((row) => slugMatches.some((brand) => brand.key === row.brand_key))
      .forEach((row) => {
        tally.set(row.brand_key, (tally.get(row.brand_key) ?? 0) + 1)
      })
    const ranked = [...tally.entries()].sort((left, right) => right[1] - left[1])
    if (ranked[0]) return ranked[0][0]
  }

  const token = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "")
  const fuzzy = brandRows.find((brand) =>
    brand.name.toLowerCase().replace(/[^a-z0-9]/g, "").includes(token),
  )
  return fuzzy?.key ?? null
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

const simulateLockedCarContext = (
  rows: TemplateRow[],
  catalogBrands: CatalogBrand[],
  brandKey: string,
  brandName: string,
  modelFamilyKey: string,
  modelFamilyName: string,
): AuditIssue[] => {
  const issues: AuditIssue[] = []
  const configuratorUrl = buildConfiguratorEntryUrl({
    brand: brandName,
    model: modelFamilyKey,
  })
  const { brandParam, modelParam } = parseConfiguratorUrl(configuratorUrl)

  const resolvedBrandKey = resolveCatalogBrandKey(
    brandParam,
    null,
    catalogBrands,
  )
  const repositoryBrandKey = resolveBrandKeyFromParam(
    brandParam,
    rows,
    modelParam,
  )

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
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      brandParam,
      modelParam,
      configuratorUrl,
      message: `Brand mismatch: expected ${brandKey}, got ${effectiveBrandKey} (catalog=${resolvedBrandKey}, repo=${repositoryBrandKey})`,
    })
    return issues
  }

  const models = getModelFamiliesForBrand(effectiveBrandKey, rows)
  if (models.length === 0) {
    issues.push({
      severity: "error",
      stage: "models_load",
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      brandParam,
      modelParam,
      configuratorUrl,
      message: "No model families for resolved brand",
    })
    return issues
  }

  const modelResolution = resolveModelFamiliesFromParam(modelParam, models)
  if (modelResolution.mode === "none") {
    issues.push({
      severity: "error",
      stage: "model_resolve",
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      brandParam,
      modelParam,
      configuratorUrl,
      message: `Model param "${modelParam}" did not resolve (catalog has ${models.length} families)`,
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
              row.model_family_key.startsWith(templateFamilyKey) ||
              row.model_family_key
                .toLowerCase()
                .includes(templateFamilyKey.toLowerCase())),
        )
      : getTemplatesForFamily(
          effectiveBrandKey,
          modelResolution.family.key,
          rows,
        )

  if (templates.length === 0) {
    issues.push({
      severity: "error",
      stage: "templates_load",
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      brandParam,
      modelParam,
      configuratorUrl,
      message: `No templates after model resolution (mode=${modelResolution.mode}, key=${templateFamilyKey})`,
    })
    return issues
  }

  const sample = templates[0]
  const year = sample.year_from
  if (year == null) {
    issues.push({
      severity: "warn",
      stage: "year_pick",
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      brandParam,
      modelParam,
      configuratorUrl,
      message: "First template has no year_from",
    })
    return issues
  }

  const yearMatches = templates.filter(
    (row) =>
      (row.year_from == null || year >= row.year_from) &&
      (row.year_to == null || year <= row.year_to),
  )

  if (yearMatches.length === 0) {
    issues.push({
      severity: "error",
      stage: "year_match",
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      brandParam,
      modelParam,
      configuratorUrl,
      message: `No templates match year ${year}`,
    })
    return issues
  }

  const hasBodyType = yearMatches.some(
    (row) => row.body_type_1 || row.body_type,
  )
  if (!hasBodyType) {
    issues.push({
      severity: "warn",
      stage: "body_type",
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      brandParam,
      modelParam,
      configuratorUrl,
      message: "Matched templates have no body type labels",
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
      brandKey,
      brandName,
      modelFamilyKey,
      modelFamilyName,
      brandParam,
      modelParam,
      configuratorUrl,
      message: `Resolved different family key: ${modelResolution.family.key}`,
    })
  }

  return issues
}

const main = async () => {
  const rows = await fetchTemplates()
  const catalogBrands: CatalogBrand[] = uniqueByKey(
    rows.map((row) => ({ key: row.brand_key, name: row.brand_name })),
  )

  const families = new Map<
    string,
    {
      brandKey: string
      brandName: string
      modelFamilyKey: string
      modelFamilyName: string
      slug: string
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
      slug: brandNameToNavigationSlug(row.brand_name),
    })
  })

  const issues: AuditIssue[] = []
  let ok = 0

  for (const family of families.values()) {
    const result = simulateLockedCarContext(
      rows,
      catalogBrands,
      family.brandKey,
      family.brandName,
      family.modelFamilyKey,
      family.modelFamilyName,
    )
    if (result.length === 0) {
      ok += 1
    } else {
      issues.push(...result)
    }
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
    templates: rows.length,
    brands: catalogBrands.length,
    modelFamilies: families.size,
    passed: ok,
    failed: families.size - ok,
    errors: errors.length,
    warnings: warnings.length,
    byStage,
    byBrand: Object.fromEntries(
      Object.entries(byBrand).sort((left, right) => right[1] - left[1]).slice(0, 30),
    ),
    sampleErrors: errors.slice(0, 25),
    sampleWarnings: warnings.slice(0, 15),
  }

  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(
    path.join(outputDir, "configurator-mapping-report.json"),
    JSON.stringify(report, null, 2),
    "utf8",
  )

  if (issues.length > 0) {
    const csv = [
      "severity,stage,brand_key,brand_name,model_family_key,model_family_name,brand_param,model_param,configurator_url,message",
      ...issues.map((issue) =>
        [
          issue.severity,
          issue.stage,
          issue.brandKey,
          issue.brandName,
          issue.modelFamilyKey,
          issue.modelFamilyName,
          issue.brandParam ?? "",
          issue.modelParam ?? "",
          issue.configuratorUrl ?? "",
          issue.message,
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n")
    fs.writeFileSync(
      path.join(outputDir, "configurator-mapping-issues.csv"),
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
