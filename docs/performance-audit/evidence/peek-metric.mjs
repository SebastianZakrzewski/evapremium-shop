import { readFileSync } from "node:fs"

const lhr = JSON.parse(readFileSync(process.argv[2], "utf8"))
const lcp = lhr.audits["largest-contentful-paint"]
console.log(lcp.displayValue, lcp.score)
console.log(JSON.stringify(lcp.details, null, 2).slice(0, 2000))
const boot = lhr.audits["bootup-time"]
console.log("boot", boot.displayValue)
for (const item of (boot.details?.items || []).slice(0, 8)) {
  console.log(Math.round(item.total), item.url?.replace("http://127.0.0.1:3010", "").slice(0, 80))
}
