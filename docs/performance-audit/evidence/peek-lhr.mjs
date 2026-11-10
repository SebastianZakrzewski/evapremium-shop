import { readFileSync } from "node:fs"

const file = process.argv[2]
const lhr = JSON.parse(readFileSync(file, "utf8"))
const keys = Object.keys(lhr.audits).filter((key) =>
  /contentful|lcp|layout-shift|bootup|mainthread|render-blocking|unused|third|font|image|priorit/i.test(key),
)
console.log(keys.join("\n"))
const lcp = lhr.audits["lcp-lazy-loaded"] || lhr.audits["largest-contentful-paint-element"]
console.log("lcp keys present", Boolean(lhr.audits["largest-contentful-paint-element"]))
const requests = lhr.audits["network-requests"].details.items
const interesting = requests.filter((item) =>
  /hero|jesien|zimowa|chat-icon|comparison|gtm|gtag|font|woff/i.test(item.url),
)
for (const item of interesting) {
  const url = item.url.replace("http://127.0.0.1:3010", "")
  console.log(
    String(Math.round((item.transferSize || 0) / 1024)).padStart(6) + "KB",
    String(Math.round(item.networkEndTime || 0)).padStart(6) + "ms",
    item.resourceType,
    url.slice(0, 140),
  )
}
const breakdown = lhr.audits["mainthread-work-breakdown"]
if (breakdown?.details?.items) {
  console.log("mainthread")
  for (const item of breakdown.details.items) {
    console.log(Math.round(item.duration), item.groupLabel || item.group)
  }
}
