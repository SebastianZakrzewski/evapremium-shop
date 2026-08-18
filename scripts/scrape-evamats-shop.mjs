/**
 * Scrapes evamats.pl Shopify catalog (products + collections).
 *
 * Usage:
 *   node scripts/scrape-evamats-shop.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { normalizeShopProduct } from "./lib/evamats-normalization.mjs"
import {
  flattenCatalogRowsForCsv,
  mapShopProductToCatalogRows,
  nestCatalogByBrandAndModel,
  toCsv,
} from "./lib/evamats-shop-catalog-map.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const outputDir = path.join(root, "output")

const BASE_URL = "https://evamats.pl"
const PAGE_LIMIT = Number.parseInt(process.env.SCRAPE_PAGE_LIMIT ?? "250", 10)
const REQUEST_DELAY_MS = Number.parseInt(process.env.SCRAPE_DELAY_MS ?? "400", 10)
const INITIAL_COOLDOWN_MS = Number.parseInt(process.env.SCRAPE_COOLDOWN_MS ?? "0", 10)
const MAX_RETRIES = 10
const PRODUCTS_ONLY = process.argv.includes("--products-only")
const SKIP_COLLECTIONS = PRODUCTS_ONLY || process.argv.includes("--skip-collections")
const CHECKPOINT_FILE = path.join(outputDir, ".evamats-shop-scrape-checkpoint.json")

const EXCLUDED_COLLECTION_PATTERNS = [
  /^akcesoria$/i,
  /^outlet/i,
  /^bestseller/i,
  /^blog/i,
  /^uniwersalne/i,
  /^karta-podarunkowa/i,
  /^organizer/i,
  /^pokrowc/i,
  /^mata-do-baga/i,
  /^dywaniki-samochodowe$/i,
  /^dywaniki-z-ekoskory$/i,
  /^dywaniki-gumowe$/i,
  /^dywaniki-welurowe$/i,
  /^na-wymiar/i,
  /^realizac/i,
  /^galeria/i,
  /^zdjecia/i,
  /^5-os-teslas$/i,
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const fetchJson = async (url, attempt = 1) => {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "eva-website-catalog-audit/1.0",
      },
    })

    if (response.status === 429) {
      const retryAfter = Number.parseInt(response.headers.get("retry-after") ?? "0", 10)
      const backoff = retryAfter > 0 ? retryAfter * 1000 : Math.min(60000, 5000 * attempt)
      console.warn(`Rate limited (429), waiting ${backoff}ms before retry ${attempt}/${MAX_RETRIES}`)
      await sleep(backoff)
      if (attempt >= MAX_RETRIES) throw new Error(`HTTP 429 for ${url}`)
      return fetchJson(url, attempt + 1)
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`)
    }

    return await response.json()
  } catch (error) {
    if (attempt >= MAX_RETRIES) throw error
    const backoff = Math.min(60000, REQUEST_DELAY_MS * attempt * 4)
    console.warn(`Retry ${attempt}/${MAX_RETRIES} for ${url}: ${error.message}`)
    await sleep(backoff)
    return fetchJson(url, attempt + 1)
  }
}

const loadCheckpoint = () => {
  if (!fs.existsSync(CHECKPOINT_FILE)) return null
  try {
    return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, "utf8"))
  } catch {
    return null
  }
}

const saveCheckpoint = (checkpoint) => {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2))
}

const paginate = async (buildUrl, { resumeKey, startPage = 1, initialItems = [] } = {}) => {
  const items = [...initialItems]
  let page = startPage

  while (true) {
    const url = buildUrl(page)
    const payload = await fetchJson(url)
    const key = Object.keys(payload).find((entry) => Array.isArray(payload[entry]))
    const pageItems = key ? payload[key] : []
    items.push(...pageItems)
    console.log(`  page ${page}: +${pageItems.length} (total ${items.length})`)

    if (resumeKey) {
      saveCheckpoint({
        resumeKey,
        nextPage: page + 1,
        itemCount: items.length,
        updatedAt: new Date().toISOString(),
      })
      fs.writeFileSync(
        path.join(outputDir, `${resumeKey}-partial.json`),
        JSON.stringify(items),
      )
    }

    if (pageItems.length < PAGE_LIMIT) break
    page += 1
    await sleep(REQUEST_DELAY_MS)
  }

  return items
}

const classifyCollection = (collection) => {
  const handle = collection.handle ?? ""
  const title = collection.title ?? ""

  if (EXCLUDED_COLLECTION_PATTERNS.some((pattern) => pattern.test(handle))) {
    return "excluded"
  }

  if (/jakie wybra|jaki wybra|jak wybra/i.test(title)) {
    return "brand"
  }

  if (/^dywanik/i.test(title) && collection.products_count > 0) {
    return "brand"
  }

  if (/^[a-z0-9-]+$/i.test(handle) && !handle.includes("-") && collection.products_count > 5) {
    return "brand"
  }

  if (collection.products_count > 0 && /^[a-z]+-[a-z0-9-]+$/i.test(handle)) {
    return "model"
  }

  return "other"
}

const main = async () => {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  if (INITIAL_COOLDOWN_MS > 0) {
    console.log(`Cooldown ${INITIAL_COOLDOWN_MS}ms before requests...`)
    await sleep(INITIAL_COOLDOWN_MS)
  }

  let collections = []
  let classifiedCollections = []
  let brandCollections = []

  if (!SKIP_COLLECTIONS) {
    console.log("Fetching collections...")
    collections = await paginate(
      (page) => `${BASE_URL}/collections.json?limit=${PAGE_LIMIT}&page=${page}`,
      { resumeKey: "collections" },
    )
    await sleep(REQUEST_DELAY_MS)

    classifiedCollections = collections.map((collection) => ({
      id: collection.id,
      handle: collection.handle,
      title: collection.title,
      productsCount: collection.products_count,
      type: classifyCollection(collection),
    }))

    brandCollections = classifiedCollections.filter((item) => item.type === "brand")
    console.log(
      `Collections: ${collections.length} total, ${brandCollections.length} brand-like`,
    )
  } else {
    console.log("Skipping collections fetch")
  }

  console.log("Fetching products...")
  const checkpoint = loadCheckpoint()
  const productsPartialFile = path.join(outputDir, "products-partial.json")
  let productStartPage = 1
  let productInitialItems = []

  if (checkpoint?.resumeKey === "products" && fs.existsSync(productsPartialFile)) {
    productStartPage = checkpoint.nextPage ?? 1
    productInitialItems = JSON.parse(fs.readFileSync(productsPartialFile, "utf8"))
    console.log(
      `Resuming products from page ${productStartPage} (${productInitialItems.length} already fetched)`,
    )
  }

  const products = await paginate(
    (page) => `${BASE_URL}/products.json?limit=${PAGE_LIMIT}&page=${page}`,
    {
      resumeKey: "products",
      startPage: productStartPage,
      initialItems: productInitialItems,
    },
  )

  const normalized = products.map(normalizeShopProduct)
  const catalogRows = products.map(mapShopProductToCatalogRows)
  const parsedOk = normalized.filter((item) => item.parseStatus === "ok")
  const parsedFailed = normalized.filter((item) => item.parseStatus === "failed")
  const outlet = parsedOk.filter((item) => item.isOutlet)
  const catalog = parsedOk.filter((item) => !item.isOutlet)
  const catalogRowsOk = catalogRows.filter(
    (item) =>
      item.parseStatus !== "failed" &&
      !item.isOutlet &&
      item.brandKey &&
      !item.brandKey.startsWith("_wf") &&
      /dywanik/i.test(item.shopTitle ?? ""),
  )
  const nestedCatalog = nestCatalogByBrandAndModel(catalogRowsOk)
  const csvRows = flattenCatalogRowsForCsv(catalogRowsOk)

  const brandSet = new Set(catalog.map((item) => item.brandKey).filter(Boolean))
  const familySet = new Set(
    catalog.map((item) => `${item.brandKey}|${item.modelFamilyKey}`).filter(Boolean),
  )

  const rawOutput = {
    scrapedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    stats: {
      collections: collections.length,
      brandCollections: brandCollections.length,
      products: products.length,
      parsedOk: parsedOk.length,
      parsedFailed: parsedFailed.length,
      outletProducts: outlet.length,
      catalogProducts: catalog.length,
      uniqueBrands: brandSet.size,
      uniqueBrandFamilies: familySet.size,
      catalogVariantRows: csvRows.length,
    },
    collections: classifiedCollections,
    products,
  }

  const normalizedOutput = {
    scrapedAt: rawOutput.scrapedAt,
    stats: rawOutput.stats,
    brandCollections,
    catalog,
    outlet,
    parseFailures: parsedFailed,
  }

  fs.writeFileSync(
    path.join(outputDir, "evamats-shop-raw.json"),
    JSON.stringify(rawOutput),
  )
  fs.writeFileSync(
    path.join(outputDir, "evamats-shop-catalog.normalized.json"),
    JSON.stringify(normalizedOutput, null, 2),
  )
  fs.writeFileSync(
    path.join(outputDir, "evamats-brand-model-variants.json"),
    JSON.stringify(
      {
        scrapedAt: rawOutput.scrapedAt,
        stats: {
          brands: nestedCatalog.length,
          models: catalogRowsOk.length,
          variants: csvRows.length,
        },
        brands: nestedCatalog,
      },
      null,
      2,
    ),
  )
  fs.writeFileSync(
    path.join(outputDir, "evamats-brand-model-variants.csv"),
    toCsv(csvRows),
  )

  if (fs.existsSync(CHECKPOINT_FILE)) fs.unlinkSync(CHECKPOINT_FILE)
  if (fs.existsSync(path.join(outputDir, "products-partial.json"))) {
    fs.unlinkSync(path.join(outputDir, "products-partial.json"))
  }

  console.log("\nDone.")
  console.log(JSON.stringify(rawOutput.stats, null, 2))
  console.log("Wrote output/evamats-shop-raw.json")
  console.log("Wrote output/evamats-shop-catalog.normalized.json")
  console.log("Wrote output/evamats-brand-model-variants.json")
  console.log("Wrote output/evamats-brand-model-variants.csv")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
