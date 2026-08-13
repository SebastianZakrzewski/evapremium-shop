import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const modeleDir = path.join(root, "public", "modele")
const target = path.join(root, "src", "shared", "brands", "brandNormalizer.ts")
const files = fs.readdirSync(modeleDir)
const byLower = new Map(files.map((file) => [file.toLowerCase(), file]))

const preferWebpFilename = (filename) => {
  if (/\.webp$/i.test(filename) || /\.avif$/i.test(filename)) {
    return filename
  }

  const webpCandidate = filename.replace(/\.(jpe?g|png)$/i, ".webp")
  return byLower.get(webpCandidate.toLowerCase()) ?? filename
}

let source = fs.readFileSync(target, "utf8")
let replacements = 0

source = source.replace(
  /(['`])([^'`]+\.(?:jpe?g|png))\1/gi,
  (full, quote, filename) => {
    if (!filename.includes("/") && !filename.includes("\\")) {
      const next = preferWebpFilename(filename)
      if (next !== filename) {
        replacements += 1
        return `${quote}${next}${quote}`
      }
      return full
    }

    const basename = filename.split("/").pop() ?? filename
    const nextBase = preferWebpFilename(basename)
    if (nextBase === basename) return full
    replacements += 1
    return `${quote}${filename.slice(0, -basename.length)}${nextBase}${quote}`
  },
)

fs.writeFileSync(target, source)
console.log(`Updated ${replacements} brand image references to webp`)
