import { readFileSync } from "node:fs"

const lhr = JSON.parse(readFileSync(process.argv[2], "utf8"))
for (const id of [
  "lcp-breakdown-insight",
  "lcp-discovery-insight",
  "image-delivery-insight",
  "render-blocking-insight",
  "third-parties-insight",
  "layout-shifts",
]) {
  const audit = lhr.audits[id]
  if (!audit) continue
  console.log("\n##", id, audit.score, audit.displayValue || "")
  console.log(JSON.stringify(audit.details, null, 2).slice(0, 3500))
}
