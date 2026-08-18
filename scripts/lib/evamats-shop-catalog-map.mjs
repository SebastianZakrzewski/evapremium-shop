import {
  buildModelKey,
  deriveModelFamily,
  normalizeKey,
  normalizeShopProduct,
} from "./evamats-normalization.mjs"

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null
  const parsed = Number.parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : null
}

export const mapShopVariant = (variant) => {
  return {
    variantId: variant.id ?? null,
    name: variant.title ?? "Default Title",
    price: toNumberOrNull(variant.price),
    compareAtPrice: toNumberOrNull(variant.compare_at_price),
    available: Boolean(variant.available),
    inventoryQuantity:
      variant.inventory_quantity === undefined || variant.inventory_quantity === null
        ? null
        : toNumberOrNull(variant.inventory_quantity),
    sku: variant.sku || null,
    option1: variant.option1 ?? null,
    option2: variant.option2 ?? null,
    option3: variant.option3 ?? null,
    matType: variant.option1 ?? null,
    setName: variant.option2 ?? null,
  }
}

export const mapShopProductToCatalogRows = (product) => {
  const parsed = normalizeShopProduct(product)
  const variants = Array.isArray(product.variants)
    ? product.variants.map((variant) => mapShopVariant(variant))
    : []

  const tags = Array.isArray(product.tags)
    ? product.tags
    : String(product.tags ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)

  const vehicleTags = tags.filter(
    (tag) => !/outlet|newforfeed|akcesoria/i.test(tag),
  )

  let brandName = parsed.brandDisplay ?? null
  let brandKey = parsed.brandKey ?? null
  let modelName = parsed.modelDisplay ?? null
  let modelKey = parsed.modelKey ?? null
  let modelFamilyName = parsed.modelFamilyDisplay ?? null
  let parseStatus = parsed.parseStatus
  let yearRange = parsed.yearRange ?? null
  let bodyType = parsed.bodyTypeDisplay ?? null

  if (parseStatus !== "ok" && vehicleTags[0]) {
    brandName = vehicleTags[0]
    brandKey = normalizeKey(brandName)
    const modelTag = vehicleTags[1] ?? null
    modelName = modelTag
      ? modelTag.replace(new RegExp(`^${brandName}\\s+`, "i"), "").trim()
      : product.title
    modelKey = buildModelKey(brandName, modelName, null)
    modelFamilyName = deriveModelFamily(modelKey ?? normalizeKey(modelName)).name
    parseStatus = "fallback"
  }

  if (parseStatus !== "ok") {
    const afterDo = String(product.title ?? "").match(/\bdo\s+(.+)$/i)?.[1]
    const yearMatch = afterDo?.match(/(\d{4})\s*[-–]\s*(\d{4})/)
    if (afterDo && yearMatch) {
      const vehiclePart = afterDo.slice(0, yearMatch.index).replace(/\s+\d+\s+gen\b/i, "").trim()
      const tokens = vehiclePart.split(/\s+/).filter(Boolean)
      if (tokens.length >= 2) {
        const twoTokenBrand = `${tokens[0]} ${tokens[1]}`
        const knownTwoToken = /^(mercedes-benz|land rover|alfa romeo|rolls-royce)$/i.test(
          twoTokenBrand,
        )
        brandName = knownTwoToken ? twoTokenBrand : tokens[0]
        modelName = knownTwoToken ? tokens.slice(2).join(" ") : tokens.slice(1).join(" ")
        brandKey = normalizeKey(brandName)
        modelKey = buildModelKey(brandName, modelName, null)
        modelFamilyName = deriveModelFamily(modelKey ?? normalizeKey(modelName)).name
        yearRange = `${yearMatch[1]}-${yearMatch[2]}`
        parseStatus = "fallback"
      }
    }
  }

  return {
    shopProductId: product.id,
    shopHandle: product.handle,
    shopTitle: product.title,
    shopUrl: product.handle ? `https://evamats.pl/products/${product.handle}` : null,
    parseStatus,
    isOutlet: parsed.isOutlet,
    brandName: brandName ?? product.vendor ?? null,
    brandKey,
    modelName: modelName ?? product.title ?? null,
    modelKey,
    modelFamilyName,
    yearRange,
    bodyType,
    variantCount: variants.length,
    variants,
  }
}

export const nestCatalogByBrandAndModel = (rows) => {
  const brands = new Map()

  for (const row of rows) {
    const brandKey = row.brandKey ?? "unknown"
    const brandName = row.brandName ?? "Unknown"
    if (!brands.has(brandKey)) {
      brands.set(brandKey, {
        brandKey,
        brandName,
        modelCount: 0,
        variantCount: 0,
        models: [],
      })
    }

    const brand = brands.get(brandKey)
    brand.models.push({
      modelKey: row.modelKey,
      modelName: row.modelName,
      modelFamilyName: row.modelFamilyName,
      yearRange: row.yearRange,
      bodyType: row.bodyType,
      shopTitle: row.shopTitle,
      shopHandle: row.shopHandle,
      shopUrl: row.shopUrl,
      parseStatus: row.parseStatus,
      isOutlet: row.isOutlet,
      variantCount: row.variantCount,
      variants: row.variants.map((variant) => ({
        name: variant.name,
        matType: variant.matType,
        setName: variant.setName,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        available: variant.available,
        inventoryQuantity: variant.inventoryQuantity,
        sku: variant.sku,
      })),
    })
    brand.modelCount += 1
    brand.variantCount += row.variantCount
  }

  return [...brands.values()].sort((left, right) =>
    left.brandName.localeCompare(right.brandName, "pl"),
  )
}

export const flattenCatalogRowsForCsv = (rows) => {
  const csvRows = []

  for (const row of rows) {
    if (!row.variants.length) {
      csvRows.push({
        brand_name: row.brandName,
        model_name: row.modelName,
        year_range: row.yearRange,
        body_type: row.bodyType,
        product_title: row.shopTitle,
        product_handle: row.shopHandle,
        product_url: row.shopUrl,
        variant_name: null,
        mat_type: null,
        set_name: null,
        price: null,
        available: null,
        inventory_quantity: null,
        sku: null,
      })
      continue
    }

    for (const variant of row.variants) {
      csvRows.push({
        brand_name: row.brandName,
        model_name: row.modelName,
        year_range: row.yearRange,
        body_type: row.bodyType,
        product_title: row.shopTitle,
        product_handle: row.shopHandle,
        product_url: row.shopUrl,
        variant_name: variant.name,
        mat_type: variant.matType,
        set_name: variant.setName,
        price: variant.price,
        available: variant.available,
        inventory_quantity: variant.inventoryQuantity,
        sku: variant.sku,
      })
    }
  }

  return csvRows
}

export const toCsv = (rows) => {
  if (!rows.length) return ""
  const headers = Object.keys(rows[0])
  const escapeCell = (value) => {
    if (value === null || value === undefined) return ""
    const text = String(value)
    if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
    return text
  }

  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(",")),
  ].join("\n")
}
