/**
 * Extracts MARKA and MODEL from Evamats template xlsx — 1:1, no normalization.
 *
 * Usage:
 *   npx xlsx-cli "<path>/NEW Baza szablonów Evamats (2).xlsx" --sheet "Nowa baza szablonów" -J -o output/evamats-templates-raw.json
 *   node scripts/extract-marka-model-raw.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const outputDir = path.join(root, "output")
const RAW_FILE = path.join(outputDir, "evamats-templates-raw.json")

const csvEscape = (value) => {
  const text = String(value ?? "")
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

const main = () => {
  if (!fs.existsSync(RAW_FILE)) {
    console.error(`Missing ${RAW_FILE}`)
    console.error('Export first: npx xlsx-cli "<xlsx>" --sheet "Nowa baza szablonów" -J -o output/evamats-templates-raw.json')
    process.exit(1)
  }

  const raw = JSON.parse(fs.readFileSync(RAW_FILE, "utf8"))
  const rows = raw
    .filter((row) => row.MARKA != null && String(row.MARKA).trim() !== "")
    .map((row) => ({
      MARKA: String(row.MARKA),
      MODEL: row.MODEL == null ? "" : String(row.MODEL),
    }))

  const unique = []
  const seen = new Set()
  for (const row of rows) {
    const key = `${row.MARKA}\0${row.MODEL}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(row)
  }

  const brands = [...new Set(rows.map((row) => row.MARKA))].sort((a, b) =>
    a.localeCompare(b, "pl"),
  )

  const byBrand = {}
  for (const brand of brands) {
    byBrand[brand] = [
      ...new Set(rows.filter((row) => row.MARKA === brand).map((row) => row.MODEL)),
    ].sort((a, b) => a.localeCompare(b, "pl"))
  }

  fs.mkdirSync(outputDir, { recursive: true })

  const files = {
    "evamats-marka-model-all.json": rows,
    "evamats-marka-model-unique.json": unique,
    "evamats-marka-model-by-brand.json": byBrand,
  }

  for (const [name, data] of Object.entries(files)) {
    fs.writeFileSync(path.join(outputDir, name), JSON.stringify(data, null, 2), "utf8")
  }

  const csv = [
    "MARKA,MODEL",
    ...unique.map((row) => `${csvEscape(row.MARKA)},${csvEscape(row.MODEL)}`),
  ].join("\n")
  fs.writeFileSync(path.join(outputDir, "evamats-marka-model-unique.csv"), csv, "utf8")

  console.log(
    JSON.stringify(
      {
        source: RAW_FILE,
        totalRows: rows.length,
        uniquePairs: unique.length,
        uniqueBrands: brands.length,
        outputs: Object.keys(files).concat(["evamats-marka-model-unique.csv"]),
      },
      null,
      2,
    ),
  )
}

main()
