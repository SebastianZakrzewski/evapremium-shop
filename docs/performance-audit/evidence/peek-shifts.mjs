import { readFileSync } from "node:fs"

const lhr = JSON.parse(readFileSync(process.argv[2], "utf8"))
const shifts = lhr.audits["layout-shifts"]?.details?.items ?? []
console.log("shifts", shifts.length, "cls", lhr.audits["cumulative-layout-shift"].numericValue)
for (const item of shifts) {
  const node = item.node || {}
  console.log("---", item.score, node.nodeLabel || node.snippet)
  console.log((node.selector || "").slice(0, 180))
}
const images = (lhr.audits["network-requests"]?.details?.items ?? [])
  .filter((item) => item.resourceType === "Image")
  .sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0))
console.log("images", images.length, "KB", Math.round(images.reduce((sum, item) => sum + (item.transferSize || 0), 0) / 1024))
for (const item of images.slice(0, 12)) {
  console.log(Math.round((item.transferSize || 0) / 1024) + "KB", item.url.replace("http://127.0.0.1:3010", "").slice(0, 120))
}
