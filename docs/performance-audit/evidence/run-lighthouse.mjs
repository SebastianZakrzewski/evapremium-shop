import { spawn } from "node:child_process"
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)))
const profile = process.argv[2] ?? "local-mobile"
const runs = Number(process.argv[3] ?? "3")

const localPages = [
  ["home", "/"],
  ["modele", "/modele"],
  ["modele-audi", "/modele?brand=audi"],
  ["konfigurator", "/konfigurator?brand=audi&model=a4"],
  ["checkout", "/checkout"],
  ["akcesoria", "/akcesoria"],
  ["galeria", "/galeria"],
  ["dywaniki", "/dywaniki"],
]

const profiles = {
  "local-mobile": {
    base: "http://127.0.0.1:3010",
    pages: localPages,
    extra: ["--form-factor=mobile", "--screenEmulation.mobile", "--throttling-method=simulate"],
  },
  "local-desktop": {
    base: "http://127.0.0.1:3010",
    pages: localPages,
    extra: ["--preset=desktop"],
  },
  "local-mid": {
    base: "http://127.0.0.1:3010",
    pages: [
      ["home", "/"],
      ["modele", "/modele"],
      ["konfigurator", "/konfigurator?brand=audi&model=a4"],
    ],
    extra: [
      "--form-factor=mobile",
      "--screenEmulation.mobile",
      "--screenEmulation.width=412",
      "--screenEmulation.height=823",
      "--screenEmulation.deviceScaleFactor=2.625",
      "--throttling-method=simulate",
      "--throttling.rttMs=60",
      "--throttling.throughputKbps=9000",
      "--throttling.cpuSlowdownMultiplier=4",
    ],
  },
  "local-warm": {
    base: "http://127.0.0.1:3010",
    pages: [
      ["home", "/"],
      ["modele", "/modele"],
      ["konfigurator", "/konfigurator?brand=audi&model=a4"],
    ],
    extra: [
      "--form-factor=mobile",
      "--screenEmulation.mobile",
      "--throttling-method=simulate",
      "--disable-storage-reset",
    ],
  },
  "phase-h-mobile": {
    base: "http://127.0.0.1:3010",
    pages: [
      ["home", "/"],
      ["modele", "/modele"],
      ["konfigurator", "/konfigurator?brand=audi&model=a4"],
      ["dywaniki", "/dywaniki"],
    ],
    extra: ["--form-factor=mobile", "--screenEmulation.mobile", "--throttling-method=simulate"],
  },
  "phase-h-desktop": {
    base: "http://127.0.0.1:3010",
    pages: [["home", "/"]],
    extra: ["--preset=desktop"],
  },
  "phase-g-mobile": {
    base: "http://127.0.0.1:3010",
    pages: [
      ["home", "/"],
      ["modele", "/modele"],
      ["konfigurator", "/konfigurator?brand=audi&model=a4"],
    ],
    extra: ["--form-factor=mobile", "--screenEmulation.mobile", "--throttling-method=simulate"],
  },
  "phase-g-desktop": {
    base: "http://127.0.0.1:3010",
    pages: [["home", "/"]],
    extra: ["--preset=desktop"],
  },
  "phase-f-mobile": {
    base: "http://127.0.0.1:3010",
    pages: [
      ["home", "/"],
      ["modele", "/modele"],
      ["konfigurator", "/konfigurator?brand=audi&model=a4"],
      ["dywaniki", "/dywaniki"],
    ],
    extra: ["--form-factor=mobile", "--screenEmulation.mobile", "--throttling-method=simulate"],
  },
  "phase-f-desktop": {
    base: "http://127.0.0.1:3010",
    pages: [["home", "/"]],
    extra: ["--preset=desktop"],
  },
  "phase-e-mobile": {
    base: "http://127.0.0.1:3010",
    pages: [
      ["home", "/"],
      ["modele", "/modele"],
      ["konfigurator", "/konfigurator?brand=audi&model=a4"],
      ["dywaniki", "/dywaniki"],
    ],
    extra: ["--form-factor=mobile", "--screenEmulation.mobile", "--throttling-method=simulate"],
  },
  "phase-e-desktop": {
    base: "http://127.0.0.1:3010",
    pages: [["home", "/"]],
    extra: ["--preset=desktop"],
  },
  "phase-d-mobile": {
    base: "http://127.0.0.1:3010",
    pages: [
      ["home", "/"],
      ["modele", "/modele"],
      ["konfigurator", "/konfigurator?brand=audi&model=a4"],
      ["dywaniki", "/dywaniki"],
    ],
    extra: ["--form-factor=mobile", "--screenEmulation.mobile", "--throttling-method=simulate"],
  },
  "phase-d-desktop": {
    base: "http://127.0.0.1:3010",
    pages: [["home", "/"]],
    extra: ["--preset=desktop"],
  },
  "phase-c-mobile": {
    base: "http://127.0.0.1:3010",
    pages: [
      ["home", "/"],
      ["modele", "/modele"],
      ["konfigurator", "/konfigurator?brand=audi&model=a4"],
      ["dywaniki", "/dywaniki"],
    ],
    extra: ["--form-factor=mobile", "--screenEmulation.mobile", "--throttling-method=simulate"],
  },
  "phase-c-desktop": {
    base: "http://127.0.0.1:3010",
    pages: [
      ["home", "/"],
      ["modele", "/modele"],
    ],
    extra: ["--preset=desktop"],
  },
  "phase-b-mobile": {
    base: "http://127.0.0.1:3010",
    pages: [
      ["home", "/"],
      ["modele", "/modele"],
      ["konfigurator", "/konfigurator?brand=audi&model=a4"],
    ],
    extra: ["--form-factor=mobile", "--screenEmulation.mobile", "--throttling-method=simulate"],
  },
  "phase-b-desktop": {
    base: "http://127.0.0.1:3010",
    pages: [
      ["home", "/"],
      ["modele", "/modele"],
    ],
    extra: ["--preset=desktop"],
  },
  "prod-mobile": {
    base: "https://www.evapremium.pl",
    pages: [
      ["home", "/"],
      ["modele", "/modele"],
      ["konfigurator", "/konfigurator?brand=audi&model=a4"],
    ],
    extra: ["--form-factor=mobile", "--screenEmulation.mobile", "--throttling-method=simulate"],
  },
}

const selected = profiles[profile]
if (!selected) {
  console.error("Unknown profile", profile)
  process.exit(1)
}

const only = process.argv[4]
if (only) {
  selected.pages = selected.pages.filter(([id]) => id === only)
  if (selected.pages.length === 0) {
    console.error("Unknown page", only)
    process.exit(1)
  }
}

const outDir = join(root, "lighthouse", profile)
mkdirSync(outDir, { recursive: true })
const summaryPath = join(outDir, "summary.jsonl")

const numeric = (lhr, id) => lhr.audits?.[id]?.numericValue ?? null

const summarize = (lhr) => {
  const requests = lhr.audits?.["network-requests"]?.details?.items ?? []
  const bytes = requests.reduce((sum, item) => sum + (item.transferSize || 0), 0)
  const byType = {}
  for (const item of requests) {
    const type = item.resourceType || "Other"
    byType[type] = byType[type] || { count: 0, bytes: 0 }
    byType[type].count += 1
    byType[type].bytes += item.transferSize || 0
  }
  const largest = [...requests]
    .sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0))
    .slice(0, 8)
    .map((item) => ({
      url: item.url,
      bytes: item.transferSize || 0,
      type: item.resourceType,
    }))
  const lcpNode = lhr.audits?.["largest-contentful-paint-element"]?.details?.items?.[0]?.node?.snippet ?? null
  const longTasks = lhr.audits?.["long-tasks"]?.details?.items ?? []
  const mainThread = lhr.audits?.["mainthread-work-breakdown"]?.numericValue ?? null
  const bootup = lhr.audits?.["bootup-time"]?.numericValue ?? null
  return {
    score: lhr.categories?.performance?.score ?? null,
    lcp: numeric(lhr, "largest-contentful-paint"),
    fcp: numeric(lhr, "first-contentful-paint"),
    tbt: numeric(lhr, "total-blocking-time"),
    cls: numeric(lhr, "cumulative-layout-shift"),
    tti: numeric(lhr, "interactive"),
    si: numeric(lhr, "speed-index"),
    ttfb: numeric(lhr, "server-response-time"),
    inp: numeric(lhr, "interaction-to-next-paint"),
    bytes,
    requests: requests.length,
    byType,
    largest,
    lcpNode,
    mainThread,
    bootup,
    longTaskCount: longTasks.length,
    longTaskMs: longTasks.reduce((sum, item) => sum + (item.duration || 0), 0),
    lighthouseVersion: lhr.lighthouseVersion,
    fetchTime: lhr.fetchTime,
    requestedUrl: lhr.requestedUrl,
    finalUrl: lhr.finalDisplayedUrl || lhr.finalUrl,
  }
}

const runOnce = (url, outputPath) =>
  new Promise((resolve) => {
    const args = [
      "--yes",
      "lighthouse",
      `"${url}"`,
      "--only-categories=performance",
      "--output=json",
      `--output-path=${outputPath}`,
      "--quiet",
      "--chrome-flags=--headless=new --disable-extensions",
      ...selected.extra,
    ]
    const child = spawn("npx.cmd", args, { shell: true, stdio: ["ignore", "pipe", "pipe"] })
    let stderr = ""
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString()
    })
    child.on("exit", (code) => resolve({ code, stderr }))
  })

for (const [id, path] of selected.pages) {
  for (let run = 1; run <= runs; run += 1) {
    const url = selected.base + path
    const outputPath = join(outDir, `${id}-run${run}.json`)
    const started = Date.now()
    console.log("RUN", profile, id, run, url)
    const result = await runOnce(url, outputPath)
    const elapsed = Date.now() - started
    if (result.code !== 0) {
      const row = { profile, id, run, url, ok: false, elapsed, error: result.stderr.slice(-800) }
      appendFileSync(summaryPath, JSON.stringify(row) + "\n")
      console.log("FAIL", id, run, result.code)
      continue
    }
    const lhr = JSON.parse(readFileSync(outputPath, "utf8"))
    const row = { profile, id, run, url, ok: true, elapsed, ...summarize(lhr) }
    appendFileSync(summaryPath, JSON.stringify(row) + "\n")
    console.log(
      "OK",
      id,
      run,
      "score",
      row.score,
      "lcp",
      Math.round(row.lcp || 0),
      "tbt",
      Math.round(row.tbt || 0),
      "cls",
      row.cls,
      "kb",
      Math.round((row.bytes || 0) / 1024),
    )
  }
}

writeFileSync(join(outDir, "done.txt"), new Date().toISOString())
