import { writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const base = process.argv[2] ?? "http://127.0.0.1:3010"
const paths = [
  "/",
  "/modele",
  "/modele?brand=audi",
  "/konfigurator?brand=audi&model=a4",
  "/checkout",
  "/akcesoria",
  "/galeria",
  "/dywaniki",
]

const summarize = (html) => {
  const scripts = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map((match) => match[1])
  const inline = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)]
  const images = [...html.matchAll(/<img\b[^>]*>/g)].map((match) => match[0])
  const sources = [...html.matchAll(/<source\b[^>]*>/g)].map((match) => match[0])
  const preload = [...html.matchAll(/<link[^>]+rel="(?:preload|prefetch)"[^>]*>/g)].map((match) => match[0])
  return {
    bytes: Buffer.byteLength(html),
    externalScripts: scripts.length,
    inlineScriptChars: inline.reduce((sum, match) => sum + match[1].length, 0),
    images: images.length,
    sources: sources.length,
    preloads: preload.length,
    imageSample: images.slice(0, 4).map((tag) => tag.slice(0, 280)),
    sourceSample: sources.slice(0, 6).map((tag) => tag.slice(0, 300)),
    preloadSample: preload.slice(0, 8).map((tag) => tag.slice(0, 300)),
    scripts,
  }
}

const report = []
for (const path of paths) {
  const response = await fetch(base + path)
  const html = await response.text()
  report.push({ path, status: response.status, ...summarize(html) })
}

const out = join(tmpdir(), "eva-html-summary.json")
writeFileSync(out, JSON.stringify(report, null, 2))
console.log(out)
for (const page of report) {
  console.log(
    page.status,
    String(page.bytes).padStart(7),
    "scripts",
    page.externalScripts,
    "inline",
    page.inlineScriptChars,
    "img",
    page.images,
    "source",
    page.sources,
    "preload",
    page.preloads,
    page.path,
  )
}
