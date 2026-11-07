import http from "node:http"
import { request as httpRequest } from "node:http"
import { brands, catalogModels, pricingVariants, vehicleTemplate } from "./fixtures.mjs"

const TARGET = process.env.NEXT_PORT || "3460"
const PROXY_PORT = process.env.PROXY_PORT || "3456"
const HOST = process.env.HARNESS_HOST || "127.0.0.1"

const blockedWrite = (res) => {
  res.writeHead(403, { "content-type": "application/json" })
  res.end(JSON.stringify({ error: "local harness blocked a write" }))
}

const send = (res, body, status = 200) => {
  res.writeHead(status, {
    "content-type": "application/json",
    "cache-control": "no-store",
  })
  res.end(JSON.stringify(body))
}

const isBlockedWrite = (method, path) =>
  method !== "GET" &&
  method !== "HEAD" &&
  (
    path.startsWith("/api/orders") ||
    path.startsWith("/api/payments") ||
    path.startsWith("/api/bitrix") ||
    path.startsWith("/api/abandoned-carts") ||
    path.startsWith("/api/cart")
  )

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${HOST}`)
  const path = url.pathname
  const method = req.method || "GET"

  if (isBlockedWrite(method, path)) {
    blockedWrite(res)
    return
  }

  if (path === "/api/models" && method === "GET") {
    const brand = (url.searchParams.get("brand") || "").toLowerCase()
    send(res, catalogModels[brand] || [])
    return
  }

  if (path === "/api/car-brands" && method === "GET") {
    send(res, brands.map((brand, index) => ({
      id: index + 1,
      key: brand.key,
      name: brand.displayName,
      logo: brand.key === "bmw" ? "/modele/bmw.png" : "/modele/hyundai.webp",
      description: `Dywaniki dla ${brand.displayName}`,
    })))
    return
  }

  if (path === "/api/search" && method === "GET") {
    const q = (url.searchParams.get("q") || "").toLowerCase()
    const models = Object.values(catalogModels).flat().filter((model) =>
      model.model.toLowerCase().includes(q) || model.brand.toLowerCase().includes(q)
    ).map((model) => ({
      brand: model.brand,
      model: model.model,
      modelFamilyKey: model.modelFamilyKey,
      displayLabel: `${model.brand} ${model.model}`,
      generation: model.generations[0].generation,
      bodyType: model.generations[0].bodyType,
      bodyTypeDisplay: model.generations[0].bodyTypeDisplay,
      bodyTypes: model.bodyTypes,
      isCurrentlyProduced: true,
    }))
    send(res, { brands: [], models, products: [] })
    return
  }

  if (path === "/api/vehicle-catalog" && method === "GET") {
    const brandKey = (url.searchParams.get("brandKey") || "").toLowerCase()
    const family = url.searchParams.get("modelFamilyKey") || ""
    const prefix = url.searchParams.get("modelFamilyPrefix") || ""
    if (!brandKey) {
      send(res, { level: "brands", brands })
      return
    }
    if (!family && !prefix) {
      const models = (catalogModels[brandKey] || []).map((model) => ({
        key: model.modelFamilyKey,
        name: model.model,
        displayName: model.model,
      }))
      send(res, { level: "models", brandKey, models })
      return
    }
    const found = (catalogModels[brandKey] || []).find((model) =>
      model.modelFamilyKey === (family || prefix)
    )
    send(res, {
      level: "templates",
      brandKey,
      modelFamilyKey: family || undefined,
      modelFamilyPrefix: prefix || undefined,
      templates: found
        ? [vehicleTemplate(brandKey, found.modelFamilyKey, found.model, found.generations[0].bodyType, found.generations[0].bodyTypeDisplay)]
        : [],
    })
    return
  }

  if (path.startsWith("/api/mat-model-previews") || path.startsWith("/api/mat-realization-photos")) {
    send(res, { previews: [], count: 0, photos: [] })
    return
  }

  if (path.startsWith("/api/accessories") || path.startsWith("/api/mat-product-images")) {
    send(res, [])
    return
  }

  if (path === "/api/pricing/resolve" && method === "POST") {
    const chunks = []
    req.on("data", (chunk) => chunks.push(chunk))
    req.on("end", () => {
      let input = {}
      try { input = JSON.parse(Buffer.concat(chunks).toString() || "{}") } catch { input = {} }
      send(res, {
        recordKey: input.recordKey || "fixture",
        templateId: "fixture-template",
        pricingCategoryKey: "passenger_car",
        catalogVersionCode: "local-fixture",
        availableMatTypes: ["classic", "3d-with-rims"],
        matType: input.matType || "classic",
        variants: pricingVariants,
        selectedVariant: pricingVariants.find((item) => item.key === input.variantKey) || null,
      })
    })
    return
  }

  const headers = { ...req.headers, host: `${HOST}:${TARGET}` }
  const upstream = httpRequest({
    hostname: HOST,
    port: TARGET,
    path: req.url,
    method,
    headers,
  }, (up) => {
    res.writeHead(up.statusCode || 502, up.headers)
    up.pipe(res)
  })
  upstream.on("error", () => {
    res.writeHead(502)
    res.end("upstream down")
  })
  req.pipe(upstream)
})

server.listen(Number(PROXY_PORT), HOST, () => {
  console.log(`harness proxy http://${HOST}:${PROXY_PORT} -> next ${TARGET}`)
})
