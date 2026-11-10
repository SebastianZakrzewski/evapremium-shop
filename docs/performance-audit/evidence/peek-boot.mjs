import { readFileSync } from "node:fs"

const lhr = JSON.parse(readFileSync(process.argv[2], "utf8"))
console.log("lcp", lhr.audits["largest-contentful-paint"].displayValue)
console.log("fcp", lhr.audits["first-contentful-paint"].displayValue)
console.log("si", lhr.audits["speed-index"].displayValue)
console.log("tbt", lhr.audits["total-blocking-time"].displayValue)
const boot = lhr.audits["bootup-time"]
console.log("boot", boot?.displayValue)
for (const item of boot?.details?.items || []) {
  console.log(
    String(Math.round(item.total || 0)).padStart(6),
    String(item.url || "").replace("http://127.0.0.1:3010", "").slice(0, 90),
  )
}
