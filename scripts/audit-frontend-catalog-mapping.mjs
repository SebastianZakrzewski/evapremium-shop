/**
 * Audits frontend brand/model mapping and display label formatting vs mat_templates.
 *
 * Usage:
 *   node scripts/audit-frontend-catalog-mapping.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { loadCatalogDatabaseClient } from "./lib/catalog-database.mjs"
import { normalizeKey } from "./lib/evamats-normalization.mjs"
import {
  detectFormattingIssues,
  formatModelWithGenerationDisplay,
} from "./lib/display-labels-port.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const outputDir = path.join(root, "output", "audit")
const COMPACT_FILE = path.join(root, "output", "evamats-templates-compact.json")

const BRAND_DEFINITIONS = [
  { slug: "bmw", catalogKey: "bmw", aliases: ["bmw"] },
  { slug: "mercedes", catalogKey: "mercedes_benz", aliases: ["mercedes", "mercedes-benz", "mercedes benz", "mercedes_benz"] },
  { slug: "alfa-romeo", catalogKey: "alfa_romeo", aliases: ["alfa-romeo", "alfa romeo", "alfa_romeo"] },
  { slug: "land-rover", catalogKey: "land_rover", aliases: ["land-rover", "land rover", "land_rover"] },
  { slug: "dacia", catalogKey: "dacia", aliases: ["dacia"] },
  { slug: "ssangyong", catalogKey: "ssangyong", aliases: ["ssangyong", "ssang young", "ssang-young"] },
]

const normalizeBrandValue = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const BRAND_ALIAS_INDEX = new Map()
BRAND_DEFINITIONS.forEach((brand) => {
  const variants = new Set([brand.slug, ...brand.aliases])
  variants.forEach((variant) => {
    const normalized = normalizeBrandValue(variant)
    if (normalized) BRAND_ALIAS_INDEX.set(normalized, brand)
  })
})

const brandParamToCatalogKey = (brandParam) => {
  const trimmed = brandParam.trim()
  if (!trimmed) return ""
  const meta = BRAND_ALIAS_INDEX.get(normalizeBrandValue(trimmed))
  if (meta) return meta.catalogKey ?? meta.slug.replace(/-/g, "_")
  return trimmed
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
}

const normalizeCatalogToken = (value) =>
  value.toLowerCase().replace(/[\s_-]+/g, "")

const csvEscape = (value) => {
  const text = String(value ?? "")
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

const loadDbRecords = async () => {
  try {
    const client = await loadCatalogDatabaseClient(root)
    const result = await client.query(`
      SELECT
        record_key,
        brand_name,
        brand_key,
        model_name,
        model_key,
        model_family_name,
        model_family_key,
        generation,
        year_from,
        year_to,
        body_type_1,
        body_type_1_key,
        dealer_pricing_category_key
      FROM evapremium_shop.mat_templates
      WHERE is_active = true
      ORDER BY brand_key, model_family_key, year_from
    `)
    await client.end()
    console.log(`Loaded ${result.rows.length} rows from Supabase`)
    return result.rows
  } catch (error) {
    console.warn(`Supabase unavailable (${error.message}), using compact JSON`)
    const compact = JSON.parse(fs.readFileSync(COMPACT_FILE, "utf8"))
    return compact.map((row, index) => ({
      record_key: row.record_key ?? `compact|${index}`,
      brand_name: row.brand_name,
      brand_key: normalizeKey(row.brand_name),
      model_name: row.model_name,
      model_key: normalizeKey(row.model_name),
      model_family_name: row.model_family_name,
      model_family_key: row.model_family_key,
      generation: row.generation,
      year_from: row.year_from,
      year_to: row.year_to,
      body_type_1: row.body_type_1,
      body_type_1_key: null,
      dealer_pricing_category_key: row.dealer_pricing_category_key,
    }))
  }
}

const auditBrands = (dbBrands) => {
  const knownSlugs = new Set(BRAND_DEFINITIONS.map((b) => b.slug))
  const knownCatalogKeys = new Set(
    BRAND_DEFINITIONS.map((b) => b.catalogKey ?? b.slug.replace(/-/g, "_")),
  )

  return dbBrands.map((brand) => {
    const slugGuess = brand.brand_key.replace(/_/g, "-")
    const mappedKey = brandParamToCatalogKey(slugGuess)
    const mappedFromKey = brandParamToCatalogKey(brand.brand_key)
    const issues = []

    if (!knownCatalogKeys.has(brand.brand_key) && !knownSlugs.has(slugGuess)) {
      issues.push("unmapped")
    }
    if (mappedKey !== brand.brand_key && mappedFromKey !== brand.brand_key) {
      issues.push("slug_mismatch")
    }

    return {
      brandKey: brand.brand_key,
      brandName: brand.brand_name,
      slugGuess,
      mappedKey,
      mappedFromKey,
      inBrandDefinitions: knownCatalogKeys.has(brand.brand_key),
      issues,
      recordCount: brand.recordCount,
      categories: brand.categories,
    }
  })
}

const auditFormatting = (rows) => {
  const seen = new Set()
  const issues = []

  rows.forEach((row) => {
    const uniqueKey = `${row.brand_key}|${row.model_family_key}|${row.model_key}`
    if (seen.has(uniqueKey)) return
    seen.add(uniqueKey)

    const { display, issues: rowIssues } = detectFormattingIssues({
      model_family_name: row.model_family_name,
      model_family_key: row.model_family_key,
      model_key: row.model_key,
    })

    if (rowIssues.length > 0) {
      issues.push({
        brandKey: row.brand_key,
        modelFamilyKey: row.model_family_key,
        modelKey: row.model_key,
        modelFamilyName: row.model_family_name,
        display,
        issues: rowIssues,
        severity: rowIssues.includes("chassis_no_space") ? "high" : "medium",
      })
    }
  })

  return issues.sort((left, right) => {
    if (left.brandKey !== right.brandKey) return left.brandKey.localeCompare(right.brandKey)
    return left.modelKey.localeCompare(right.modelKey)
  })
}

const auditUrlPaths = (rows) => {
  const sample = rows.filter((row, index) => {
    if (row.brand_key === "bmw") return true
    return index % 10 === 0
  })

  const modelFamiliesByBrand = new Map()
  rows.forEach((row) => {
    const list = modelFamiliesByBrand.get(row.brand_key) ?? []
    if (!list.some((item) => item.key === row.model_family_key)) {
      list.push({
        key: row.model_family_key,
        name: row.model_family_name,
      })
    }
    modelFamiliesByBrand.set(row.brand_key, list)
  })

  return sample.map((row) => {
    const slugGuess = row.brand_key.replace(/_/g, "-")
    const brandKey = brandParamToCatalogKey(slugGuess)
    const families = modelFamiliesByBrand.get(row.brand_key) ?? []
    const modelToken = normalizeCatalogToken(row.model_family_key)
    const modelMatch = families.find(
      (item) =>
        normalizeCatalogToken(item.key) === modelToken ||
        normalizeCatalogToken(item.name) === modelToken,
    )

    return {
      recordKey: row.record_key,
      brandKey: row.brand_key,
      urlBrand: slugGuess,
      resolvedBrandKey: brandKey,
      brandResolved: brandKey === row.brand_key,
      modelFamilyKey: row.model_family_key,
      modelResolved: Boolean(modelMatch),
      generation: row.generation,
      bodyType: row.body_type_1,
      configuratorUrl: `/konfigurator?brand=${slugGuess}&model=${row.model_family_key}&generation=${encodeURIComponent(row.generation)}&bodyType=${row.body_type_1 ?? ""}`,
    }
  })
}

const main = async () => {
  fs.mkdirSync(outputDir, { recursive: true })

  const rows = await loadDbRecords()

  const brandAgg = new Map()
  rows.forEach((row) => {
    const existing = brandAgg.get(row.brand_key) ?? {
      brand_key: row.brand_key,
      brand_name: row.brand_name,
      recordCount: 0,
      categories: new Set(),
    }
    existing.recordCount += 1
    existing.categories.add(row.dealer_pricing_category_key)
    brandAgg.set(row.brand_key, existing)
  })

  const dbBrands = [...brandAgg.values()].map((brand) => ({
    ...brand,
    categories: [...brand.categories],
  }))

  const brandReport = auditBrands(dbBrands)
  const formattingReport = auditFormatting(rows)
  const urlReport = auditUrlPaths(rows)

  const formattingByBrand = formattingReport.reduce((acc, row) => {
    acc[row.brandKey] = (acc[row.brandKey] ?? 0) + 1
    return acc
  }, {})

  const summary = {
    generatedAt: new Date().toISOString(),
    totalRecords: rows.length,
    totalBrands: dbBrands.length,
    brandsInDefinitions: brandReport.filter((b) => b.inBrandDefinitions).length,
    unmappedBrands: brandReport.filter((b) => b.issues.includes("unmapped")).length,
    slugMismatchBrands: brandReport.filter((b) => b.issues.includes("slug_mismatch")).length,
    formattingIssues: formattingReport.length,
    formattingIssuesByType: formattingReport.reduce((acc, row) => {
      row.issues.forEach((issue) => {
        acc[issue] = (acc[issue] ?? 0) + 1
      })
      return acc
    }, {}),
    urlSamples: urlReport.length,
    urlBrandFailures: urlReport.filter((row) => !row.brandResolved).length,
    urlModelFailures: urlReport.filter((row) => !row.modelResolved).length,
    topFormattingBrands: Object.entries(formattingByBrand)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 15)
      .map(([brandKey, count]) => ({ brandKey, count })),
    sampleDisplays: rows
      .filter((row) => row.brand_key === "bmw")
      .slice(0, 8)
      .map((row) => ({
        modelKey: row.model_key,
        display: formatModelWithGenerationDisplay(
          row.model_family_name,
          row.model_key,
          row.model_family_key,
        ),
      })),
  }

  const brandCsv = [
    ["brand_key", "brand_name", "slug_guess", "mapped_key", "in_definitions", "issues", "record_count"].join(","),
    ...brandReport.map((row) =>
      [
        row.brandKey,
        row.brandName,
        row.slugGuess,
        row.mappedKey,
        row.inBrandDefinitions,
        row.issues.join("|"),
        row.recordCount,
      ]
        .map(csvEscape)
        .join(","),
    ),
  ].join("\n")

  const formattingCsv = [
    ["severity", "brand_key", "model_family_key", "model_key", "display", "issues"].join(","),
    ...formattingReport.map((row) =>
      [row.severity, row.brandKey, row.modelFamilyKey, row.modelKey, row.display, row.issues.join("|")]
        .map(csvEscape)
        .join(","),
    ),
  ].join("\n")

  fs.writeFileSync(path.join(outputDir, "brand-mapping-report.json"), JSON.stringify(brandReport, null, 2))
  fs.writeFileSync(path.join(outputDir, "brand-mapping-report.csv"), brandCsv)
  fs.writeFileSync(path.join(outputDir, "model-formatting-report.json"), JSON.stringify(formattingReport, null, 2))
  fs.writeFileSync(path.join(outputDir, "model-formatting-report.csv"), formattingCsv)
  fs.writeFileSync(path.join(outputDir, "url-path-report.json"), JSON.stringify(urlReport, null, 2))
  fs.writeFileSync(
    path.join(outputDir, "summary.md"),
    [
      "# Frontend catalog audit summary",
      "",
      `Generated: ${summary.generatedAt}`,
      "",
      "## Scale",
      `- Records: **${summary.totalRecords}**`,
      `- Brands in DB: **${summary.totalBrands}**`,
      `- Brands in BRAND_DEFINITIONS sample: **${summary.brandsInDefinitions}**`,
      "",
      "## Brand mapping",
      `- Unmapped brands: **${summary.unmappedBrands}**`,
      `- Slug mismatch brands: **${summary.slugMismatchBrands}**`,
      "",
      "## Model formatting",
      `- Models with formatting issues: **${summary.formattingIssues}**`,
      `- Issue breakdown: ${JSON.stringify(summary.formattingIssuesByType)}`,
      "",
      "## URL path samples",
      `- Samples tested: **${summary.urlSamples}**`,
      `- Brand resolution failures: **${summary.urlBrandFailures}**`,
      `- Model resolution failures: **${summary.urlModelFailures}**`,
      "",
      "## BMW sample displays",
      ...summary.sampleDisplays.map((row) => `- \`${row.modelKey}\` → **${row.display}**`),
    ].join("\n"),
  )
  fs.writeFileSync(path.join(outputDir, "summary.json"), JSON.stringify(summary, null, 2))

  console.log("\nAudit complete.")
  console.log(JSON.stringify(summary, null, 2))
  console.log(`Wrote reports to ${outputDir}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
