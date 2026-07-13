const GENERATION_SUFFIX = /_(?:\d+|[ivxlcdm]+)_gen(?:_.*)?$/i

export const normalizeText = (value) => {
  if (value === null || value === undefined) return null
  const trimmed = String(value).trim()
  return trimmed || null
}

export const normalizeKey = (value) => {
  const text = normalizeText(value)
  if (!text) return null
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s\-–—/]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
}

export const deriveModelFamily = (modelKey) => {
  const normalizedKey = normalizeKey(modelKey)
  if (!normalizedKey) return { key: null, name: null }

  const familyKey =
    normalizedKey.replace(GENERATION_SUFFIX, "") || normalizedKey
  const name = familyKey
    .split("_")
    .filter(Boolean)
    .map((token) => {
      if (/^\d+[a-z]$/i.test(token) || /^[a-z]\d+$/i.test(token)) {
        return token.toUpperCase()
      }
      if (token.length <= 2 && /^[a-z]+$/i.test(token)) return token.toUpperCase()
      return `${token.charAt(0).toUpperCase()}${token.slice(1)}`
    })
    .join(" ")

  return { key: familyKey, name }
}

export const normalizeBodyTypeKey = (bodyType) => {
  const text = normalizeText(bodyType)
  if (!text) return null

  const normalized = text.toLowerCase()

  if (normalized.includes("hatchback") || normalized.includes("hatch")) return "hatchback"
  if (normalized.includes("suv") || normalized.includes("off-roader") || normalized.includes("off_roader")) {
    return "suv"
  }
  if (normalized.includes("sedan")) return "sedan"
  if (normalized.includes("kombi") || normalized.includes("wagon") || normalized.includes("estate")) {
    return "wagon"
  }
  if (normalized.includes("minivan") || normalized.includes("mpv") || normalized.includes("microvan")) {
    return "minivan"
  }
  if (
    normalized.includes("van") ||
    normalized.includes("delivery") ||
    normalized.includes("combo_van") ||
    normalized.includes("panel_van")
  ) {
    return "van"
  }
  if (normalized.includes("coupe")) return "coupe"
  if (normalized.includes("cabrio") || normalized.includes("convertible") || normalized.includes("kabriolet")) {
    return "convertible"
  }
  if (normalized.includes("roadster")) return "roadster"
  if (normalized.includes("fastback")) return "fastback"
  if (normalized.includes("liftback")) return "liftback"
  if (normalized.includes("pick-up") || normalized.includes("pickup")) return "pickup"
  if (normalized.includes("bus")) return "bus"
  if (normalized.includes("truck") || normalized.includes("semi_truck") || normalized.includes("ciagnik")) {
    return "truck"
  }
  if (normalized.includes("tractor")) return "tractor"
  if (normalized.includes("kamper") || normalized.includes("camper")) return "camper"

  return normalizeKey(text)
}

export const parseYearRange = (value) => {
  const label = normalizeText(value)
  if (!label) {
    return { yearRange: null, yearFrom: null, yearTo: null, isOpenEnded: false }
  }

  const normalized = label.replace(/\s+/g, "")
  const rangeMatch = normalized.match(/^(\d{4})-(\d{4})$/)
  if (rangeMatch) {
    return {
      yearRange: `${rangeMatch[1]}-${rangeMatch[2]}`,
      yearFrom: Number.parseInt(rangeMatch[1], 10),
      yearTo: Number.parseInt(rangeMatch[2], 10),
      isOpenEnded: false,
    }
  }

  const openMatch = normalized.match(/^(\d{4})\+$/)
  if (openMatch) {
    return {
      yearRange: `${openMatch[1]}+`,
      yearFrom: Number.parseInt(openMatch[1], 10),
      yearTo: null,
      isOpenEnded: true,
    }
  }

  const singleYear = normalized.match(/^(\d{4})$/)
  if (singleYear) {
    return {
      yearRange: singleYear[1],
      yearFrom: Number.parseInt(singleYear[1], 10),
      yearTo: Number.parseInt(singleYear[1], 10),
      isOpenEnded: false,
    }
  }

  return { yearRange: normalizeKey(label), yearFrom: null, yearTo: null, isOpenEnded: false }
}

export const buildModelKey = (brandDisplay, modelDisplay, generationNumber) => {
  const modelBase = normalizeText(modelDisplay)
  if (!modelBase) return null

  const genSuffix = normalizeText(generationNumber)
  if (genSuffix) {
    const genNum = genSuffix.replace(/\s*gen\s*/i, "").trim()
    if (genNum) {
      return normalizeKey(`${modelBase} ${genNum} gen`)
    }
  }

  return normalizeKey(modelBase)
}

export const buildMatchKey = (brandKey, modelKey, yearRange, bodyTypeKey) =>
  [brandKey, modelKey, yearRange, bodyTypeKey].filter(Boolean).join("|")

export const buildFamilyMatchKey = (brandKey, modelFamilyKey, yearRange, bodyTypeKey) =>
  [brandKey, modelFamilyKey, yearRange, bodyTypeKey].filter(Boolean).join("|")

export const parseProductBodyHtml = (html) => {
  if (!html) return null

  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")

  const brand = text.match(/Marka:\s*([^:]+?)(?:\s+Generacja:|\s+Model:|\s+Lata|$)/i)?.[1]?.trim()
  const generationNumber = text.match(/Generacja:\s*([^:]+?)(?:\s+Model:|\s+Lata|$)/i)?.[1]?.trim()
  const model = text.match(/Model:\s*([^:]+?)(?:\s+Lata|$)/i)?.[1]?.trim()
  const years = text.match(/Lata produkcji:\s*([0-9\-+]+)/i)?.[1]?.trim()

  if (!brand && !model) return null

  return {
    brandDisplay: brand ?? null,
    generationNumber: generationNumber ? `${generationNumber} gen` : null,
    modelDisplay: model ?? null,
    ...parseYearRange(years),
    source: "body_html",
  }
}

export const parseProductTitle = (title) => {
  const text = normalizeText(title)
  if (!text) return null

  const afterDo = text.match(/\bdo\s+(.+)$/i)?.[1]
  if (!afterDo) return null

  const match = afterDo.match(
    /^(.+?)\s+(\d+\s+gen)?\s*(\d{4})(?:\s*-\s*(\d{4}))?\s+rok\s+([A-Za-zÀ-ž]+)/i,
  )
  if (!match) return null

  const [, vehiclePart, genPart, yearFrom, yearTo, bodyType] = match
  const vehicleTokens = vehiclePart.trim().split(/\s+/)
  const brandDisplay = vehicleTokens[0] ?? null
  const modelDisplay = vehicleTokens.slice(1).join(" ") || null
  const yearRange = yearTo ? `${yearFrom}-${yearTo}` : yearFrom

  return {
    brandDisplay,
    modelDisplay,
    generationNumber: genPart?.trim() ?? null,
    yearRange,
    yearFrom: Number.parseInt(yearFrom, 10),
    yearTo: yearTo ? Number.parseInt(yearTo, 10) : null,
    bodyTypeDisplay: bodyType,
    source: "title",
  }
}

export const normalizeShopProduct = (product) => {
  const tags = Array.isArray(product.tags)
    ? product.tags
    : String(product.tags ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)

  const isOutlet = tags.some((tag) => tag.toLowerCase().includes("outlet"))
  const fromHtml = parseProductBodyHtml(product.body_html)
  const fromTitle = parseProductTitle(product.title)
  const parsed = fromHtml ?? fromTitle

  if (!parsed?.brandDisplay) {
    return {
      shopProductId: product.id,
      shopHandle: product.handle,
      shopTitle: product.title,
      parseStatus: "failed",
      isOutlet,
      tags,
      source: null,
    }
  }

  const brandKey = normalizeKey(parsed.brandDisplay)
  const modelDisplay = parsed.modelDisplay
    ? parsed.generationNumber
      ? `${parsed.modelDisplay} ${parsed.generationNumber}`.trim()
      : parsed.modelDisplay
    : null
  const modelKey = buildModelKey(parsed.brandDisplay, parsed.modelDisplay, parsed.generationNumber)
  const modelFamily = deriveModelFamily(modelKey ?? normalizeKey(parsed.modelDisplay))
  const bodyTypeDisplay = parsed.bodyTypeDisplay ?? null
  const bodyTypeKey = normalizeBodyTypeKey(bodyTypeDisplay)
  const yearRange =
    parsed.yearRange ??
    (parsed.yearFrom && parsed.yearTo
      ? `${parsed.yearFrom}-${parsed.yearTo}`
      : parsed.yearFrom
        ? `${parsed.yearFrom}+`
        : null)

  return {
    shopProductId: product.id,
    shopHandle: product.handle,
    shopTitle: product.title,
    parseStatus: "ok",
    isOutlet,
    tags,
    source: parsed.source,
    brandDisplay: parsed.brandDisplay,
    brandKey,
    modelFamilyDisplay: modelFamily.name,
    modelFamilyKey: modelFamily.key,
    modelDisplay,
    modelKey,
    generationNumber: parsed.generationNumber ?? null,
    yearRange,
    yearFrom: parsed.yearFrom ?? null,
    yearTo: parsed.yearTo ?? null,
    bodyTypeDisplay,
    bodyTypeKey,
    exactMatchKey: buildMatchKey(brandKey, modelKey, yearRange, bodyTypeKey),
    familyMatchKey: buildFamilyMatchKey(brandKey, modelFamily.key, yearRange, bodyTypeKey),
  }
}

export const normalizeDbRecord = (row) => {
  const brandKey = row.brand_key ?? normalizeKey(row.brand_name)
  const modelKey = row.model_key ?? normalizeKey(row.model_name)
  const modelFamilyKey = row.model_family_key ?? deriveModelFamily(modelKey).key
  const yearRange = row.generation ?? null
  const bodyTypes = [
    row.body_type_1_key ?? row.body_type_1,
    row.body_type_2_key ?? row.body_type_2,
    row.body_type_3_key ?? row.body_type_3,
    row.body_type_key ?? row.body_type,
  ].filter(Boolean)

  const primaryBodyTypeKey = normalizeBodyTypeKey(bodyTypes[0] ?? "")

  return {
    recordKey: row.record_key ?? null,
    brandKey,
    brandName: row.brand_name,
    modelFamilyKey,
    modelFamilyName: row.model_family_name,
    modelKey,
    modelName: row.model_name,
    generation: yearRange,
    yearFrom: row.year_from ?? null,
    yearTo: row.year_to ?? null,
    bodyTypeKeys: [...new Set(bodyTypes.map((bt) => normalizeBodyTypeKey(bt)).filter(Boolean))],
    primaryBodyTypeKey,
    exactMatchKey: buildMatchKey(brandKey, modelKey, yearRange, primaryBodyTypeKey),
    familyMatchKey: buildFamilyMatchKey(brandKey, modelFamilyKey, yearRange, primaryBodyTypeKey),
  }
}
