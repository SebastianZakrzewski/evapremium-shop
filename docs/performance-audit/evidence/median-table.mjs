import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("./lighthouse/", import.meta.url))

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

const profiles = readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

for (const profile of profiles) {
  const file = join(root, profile, "summary.jsonl")
  let text
  try {
    text = readFileSync(file, "utf8")
  } catch {
    continue
  }
  const rows = text.trim().split(/\n/).filter(Boolean).map((line) => JSON.parse(line)).filter((row) => row.ok)
  const ids = [...new Set(rows.map((row) => row.id))]
  console.log("\n# " + profile)
  for (const id of ids) {
    const group = rows.filter((row) => row.id === id)
    const lcpMed = median(group.map((row) => row.lcp))
    const nearest = group.reduce((best, row) =>
      Math.abs(row.lcp - lcpMed) < Math.abs(best.lcp - lcpMed) ? row : best,
    )
    console.log(
      [
        id,
        "n=" + group.length,
        "score=" + median(group.map((row) => row.score)).toFixed(2),
        "lcp=" + Math.round(lcpMed),
        "fcp=" + Math.round(median(group.map((row) => row.fcp))),
        "tbt=" + Math.round(median(group.map((row) => row.tbt))),
        "cls=" + median(group.map((row) => row.cls)).toFixed(3),
        "ttfb=" + Math.round(median(group.map((row) => row.ttfb || 0))),
        "tti=" + Math.round(median(group.map((row) => row.tti || 0))),
        "kb=" + Math.round(median(group.map((row) => row.bytes)) / 1024),
        "req=" + median(group.map((row) => row.requests)),
        "main=" + Math.round(nearest.mainThread || 0),
        "long=" + nearest.longTaskCount,
      ].join(" "),
    )
  }
}

