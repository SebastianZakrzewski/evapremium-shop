import { readFileSync } from "node:fs"

const file = process.argv[2]
const lhr = JSON.parse(readFileSync(file, "utf8"))
const items = lhr.audits["network-requests"].details.items
const ranked = [...items].sort((a, b) => (a.networkRequestTime || 0) - (b.networkRequestTime || 0))
for (const item of ranked) {
  const url = item.url.replace("http://127.0.0.1:3010", "").replace("https://www.evapremium.pl", "")
  console.log(
    String(Math.round(item.networkRequestTime || 0)).padStart(6),
    String(Math.round((item.transferSize || 0) / 1024)).padStart(5) + "KB",
    (item.priority || item.resourceType || "").slice(0, 12).padEnd(12),
    url.slice(0, 110),
  )
}
