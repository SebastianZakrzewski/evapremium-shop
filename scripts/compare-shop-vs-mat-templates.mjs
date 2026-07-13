/**
 * Compares evamats.pl shop catalog with mat_templates.
 *
 * Usage:
 *   node scripts/compare-shop-vs-mat-templates.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { loadCatalogDatabaseClient } from "./lib/catalog-database.mjs"
import { normalizeDbRecord, normalizeKey } from "./lib/evamats-normalization.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const outputDir = path.join(root, "output")

const SHOP_FILE = path.join(outputDir, "evamats-shop-catalog.normalized.json")
const COMPACT_FILE = path.join(outputDir, "evamats-templates-compact.json")

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
        body_type,
        body_type_key,
        body_type_1,
        body_type_1_key,
        body_type_2,
        body_type_2_key,
        body_type_3,
        body_type_3_key
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
      body_type: row.body_type_1,
      body_type_key: null,
      body_type_1: row.body_type_1,
      body_type_1_key: null,
      body_type_2: row.body_type_2,
      body_type_2_key: null,
      body_type_3: row.body_type_3,
      body_type_3_key: null,
    }))
  }
}

const indexDbRecords = (dbRecords) => {
  const exact = new Map()
  const family = new Map()
  const byBrandFamily = new Map()

  dbRecords.forEach((row) => {
    const normalized = normalizeDbRecord(row)
    if (normalized.exactMatchKey) {
      if (!exact.has(normalized.exactMatchKey)) exact.set(normalized.exactMatchKey, [])
      exact.get(normalized.exactMatchKey).push(normalized)
    }
    if (normalized.familyMatchKey) {
      if (!family.has(normalized.familyMatchKey)) family.set(normalized.familyMatchKey, [])
      family.get(normalized.familyMatchKey).push(normalized)
    }
    const brandFamilyKey = `${normalized.brandKey}|${normalized.modelFamilyKey}`
    if (!byBrandFamily.has(brandFamilyKey)) byBrandFamily.set(brandFamilyKey, [])
    byBrandFamily.get(brandFamilyKey).push(normalized)
  })

  return { exact, family, byBrandFamily, normalized: dbRecords.map(normalizeDbRecord) }
}

const classifyShopRecord = (shop, dbIndex) => {
  if (shop.parseStatus !== "ok") {
    return { category: "parse_failed", dbMatch: null }
  }

  const exactMatches = dbIndex.exact.get(shop.exactMatchKey) ?? []
  if (exactMatches.length > 0) {
    return { category: "matched_exact", dbMatch: exactMatches[0] }
  }

  const familyMatches = dbIndex.family.get(shop.familyMatchKey) ?? []
  if (familyMatches.length > 0) {
    const bodyMismatch = familyMatches.every(
      (row) => !row.bodyTypeKeys.includes(shop.bodyTypeKey),
    )
    if (bodyMismatch) {
      return { category: "body_type_mismatch", dbMatch: familyMatches[0] }
    }
    return { category: "matched_fuzzy", dbMatch: familyMatches[0] }
  }

  const brandFamilyKey = `${shop.brandKey}|${shop.modelFamilyKey}`
  const brandFamilyRows = dbIndex.byBrandFamily.get(brandFamilyKey) ?? []
  if (brandFamilyRows.length > 0) {
    const yearMismatch = brandFamilyRows.some(
      (row) => row.generation === shop.yearRange,
    )
    if (!yearMismatch) {
      return { category: "year_mismatch", dbMatch: brandFamilyRows[0] }
    }
    return { category: "matched_fuzzy", dbMatch: brandFamilyRows[0] }
  }

  const brandRows = dbIndex.normalized.filter((row) => row.brandKey === shop.brandKey)
  if (brandRows.length > 0) {
    return { category: "shop_only", dbMatch: null, note: "brand_exists_db" }
  }

  return { category: "shop_only", dbMatch: null }
}

const buildAliases = (diffRows) => {
  const aliases = new Map()

  diffRows
    .filter((row) => row.category === "matched_fuzzy" || row.category === "year_mismatch")
    .forEach((row) => {
      const shop = row.shop
      const db = row.dbMatch
      if (!shop?.modelFamilyKey || !db?.modelFamilyKey) return
      if (shop.modelFamilyKey === db.modelFamilyKey) return

      const key = `${shop.brandKey}|${normalizeKey(shop.modelFamilyDisplay)}`
      if (!aliases.has(key)) {
        aliases.set(key, {
          brandKey: shop.brandKey,
          shopDisplay: shop.modelFamilyDisplay,
          shopKey: shop.modelFamilyKey,
          dbKey: db.modelFamilyKey,
          dbDisplay: db.modelFamilyName,
          examples: [],
        })
      }
      aliases.get(key).examples.push({
        shopTitle: shop.shopTitle,
        dbModelKey: db.modelKey,
      })
    })

  return [...aliases.values()]
}

const main = async () => {
  if (!fs.existsSync(SHOP_FILE)) {
    throw new Error(`Missing ${SHOP_FILE}. Run scripts/scrape-evamats-shop.mjs first.`)
  }

  const shopData = JSON.parse(fs.readFileSync(SHOP_FILE, "utf8"))
  const shopCatalog = shopData.catalog ?? []
  const dbRows = await loadDbRecords()
  const dbIndex = indexDbRecords(dbRows)

  const diffRows = shopCatalog.map((shop) => {
    const result = classifyShopRecord(shop, dbIndex)
    return {
      category: result.category,
      note: result.note ?? null,
      shop,
      dbMatch: result.dbMatch,
    }
  })

  const matchedExactKeys = new Set(
    diffRows
      .filter((row) => row.category === "matched_exact")
      .map((row) => row.shop.exactMatchKey),
  )

  const dbOnly = dbIndex.normalized.filter((row) => {
    const shopHasFamily = shopCatalog.some(
      (shop) =>
        shop.brandKey === row.brandKey && shop.modelFamilyKey === row.modelFamilyKey,
    )
    return !shopHasFamily
  })

  const counts = diffRows.reduce((acc, row) => {
    acc[row.category] = (acc[row.category] ?? 0) + 1
    return acc
  }, {})

  const brandReport = {}
  diffRows.forEach((row) => {
    const brand = row.shop.brandKey ?? "unknown"
    if (!brandReport[brand]) {
      brandReport[brand] = {
        brandKey: brand,
        brandDisplay: row.shop.brandDisplay,
        total: 0,
        matched_exact: 0,
        matched_fuzzy: 0,
        year_mismatch: 0,
        body_type_mismatch: 0,
        shop_only: 0,
      }
    }
    brandReport[brand].total += 1
    if (brandReport[brand][row.category] !== undefined) {
      brandReport[brand][row.category] += 1
    }
  })

  const aliases = buildAliases(diffRows)

  const summary = {
    generatedAt: new Date().toISOString(),
    shopSource: SHOP_FILE,
    shopStats: shopData.stats,
    dbRecords: dbIndex.normalized.length,
    categories: {
      ...counts,
      db_only: dbOnly.length,
      parse_failed: (shopData.parseFailures ?? []).length,
      outlet_excluded: (shopData.outlet ?? []).length,
    },
    matchRate: {
      exact: counts.matched_exact ?? 0,
      fuzzy: counts.matched_fuzzy ?? 0,
      totalShopCatalog: shopCatalog.length,
      exactPercent: shopCatalog.length
        ? Number((((counts.matched_exact ?? 0) / shopCatalog.length) * 100).toFixed(1))
        : 0,
    },
    topMismatchBrands: Object.values(brandReport)
      .map((brand) => ({
        ...brand,
        mismatchTotal:
          brand.shop_only +
          brand.year_mismatch +
          brand.body_type_mismatch +
          (brand.total - brand.matched_exact - brand.matched_fuzzy - brand.year_mismatch - brand.body_type_mismatch - brand.shop_only),
      }))
      .sort((left, right) => right.mismatchTotal - left.mismatchTotal)
      .slice(0, 25),
  }

  const csvLines = [
    [
      "category",
      "brand",
      "shop_model_family",
      "shop_model_key",
      "shop_year_range",
      "shop_body_type",
      "db_model_family",
      "db_model_key",
      "db_year_range",
      "db_body_type",
      "shop_title",
      "db_record_key",
    ].join(","),
  ]

  diffRows.forEach((row) => {
    csvLines.push(
      [
        row.category,
        row.shop.brandDisplay,
        row.shop.modelFamilyDisplay,
        row.shop.modelKey,
        row.shop.yearRange,
        row.shop.bodyTypeDisplay,
        row.dbMatch?.modelFamilyName ?? "",
        row.dbMatch?.modelKey ?? "",
        row.dbMatch?.generation ?? "",
        row.dbMatch?.primaryBodyTypeKey ?? "",
        row.shop.shopTitle,
        row.dbMatch?.recordKey ?? "",
      ]
        .map(csvEscape)
        .join(","),
    )
  })

  dbOnly.forEach((row) => {
    csvLines.push(
      [
        "db_only",
        row.brandName,
        row.modelFamilyName,
        row.modelKey,
        row.generation,
        row.primaryBodyTypeKey,
        "",
        "",
        "",
        "",
        "",
        row.recordKey,
      ]
        .map(csvEscape)
        .join(","),
    )
  })

  fs.writeFileSync(path.join(outputDir, "shop-vs-db-summary.json"), JSON.stringify(summary, null, 2))
  fs.writeFileSync(path.join(outputDir, "shop-vs-db-brand-report.json"), JSON.stringify(brandReport, null, 2))
  fs.writeFileSync(path.join(outputDir, "shop-vs-db-diff.csv"), csvLines.join("\n"))
  fs.writeFileSync(path.join(outputDir, "model-family-aliases.json"), JSON.stringify(aliases, null, 2))

  console.log("\nComparison complete.")
  console.log(JSON.stringify(summary.categories, null, 2))
  console.log(`Exact match rate: ${summary.matchRate.exactPercent}%`)
  console.log("Wrote output/shop-vs-db-summary.json")
  console.log("Wrote output/shop-vs-db-brand-report.json")
  console.log("Wrote output/shop-vs-db-diff.csv")
  console.log("Wrote output/model-family-aliases.json")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
