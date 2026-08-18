import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { indexShopModels, matchShopModel } from "../src/features/vehicle-catalog/domain/joinShopTemplate"
import { buildShopTemplateOffer } from "../src/features/vehicle-catalog/domain/shopTemplateOffer"
import type { ShopRawVariant } from "../src/features/vehicle-catalog/domain/shopSetMapping"

type ShopJsonModel = {
  modelKey: string
  modelName: string
  modelFamilyName?: string | null
  yearRange?: string | null
  shopHandle?: string | null
  variants?: ShopRawVariant[] | null
}

type ShopJsonBrand = {
  brandKey: string
  brandName: string
  models: ShopJsonModel[]
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const shopPath = resolve(root, "output/evamats-brand-model-variants.json")
const csvPath = resolve(root, "output/mat_templates_seat_rows.csv")
const outPath = resolve(root, "src/data/shop-template-offers.json")

const parseCsv = (text: string): Record<string, string>[] => {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean)
  const headers = splitCsvLine(lines[0])
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line)
    return Object.fromEntries(headers.map((header, idx) => [header, cells[idx] ?? ""]))
  })
}

const splitCsvLine = (line: string): string[] => {
  const cells: string[] = []
  let current = ""
  let quoted = false
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else if (ch === '"') {
        quoted = false
      } else {
        current += ch
      }
      continue
    }
    if (ch === '"') {
      quoted = true
      continue
    }
    if (ch === ",") {
      cells.push(current)
      current = ""
      continue
    }
    current += ch
  }
  cells.push(current)
  return cells
}

const main = () => {
  const shop = JSON.parse(readFileSync(shopPath, "utf8")) as { brands: ShopJsonBrand[] }
  const templates = parseCsv(readFileSync(csvPath, "utf8"))
  const flat = shop.brands.flatMap((brand) =>
    brand.models.map((model) => ({
      brandKey: brand.brandKey,
      brandName: brand.brandName,
      modelKey: model.modelKey,
      modelName: model.modelName,
      modelFamilyName: model.modelFamilyName,
      yearRange: model.yearRange,
      shopHandle: model.shopHandle,
      variants: model.variants,
    })),
  )
  const index = indexShopModels(flat)
  const offers: Record<string, ReturnType<typeof buildShopTemplateOffer>> = {}
  let matched = 0
  for (const template of templates) {
    const hit = matchShopModel(index, {
      recordKey: template.record_key,
      brandName: template.brand_name,
      modelName: template.model_name,
      generation: template.generation,
    })
    if (!hit) continue
    const product = flat[index.models.indexOf(hit)]
    const offer = buildShopTemplateOffer(template.record_key, product)
    if (!offer) continue
    offers[template.record_key] = offer
    matched += 1
  }

  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, `${JSON.stringify(offers)}\n`, "utf8")
  process.stdout.write(`shop-template-offers: ${matched}/${templates.length} -> ${outPath}\n`)
}

main()
