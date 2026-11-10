import { mkdirSync, readdirSync, statSync } from "node:fs"
import path from "node:path"
import sharp from "sharp"

await sharp("public/zimowa_mobile_hero.png")
  .avif({ quality: 62, effort: 6 })
  .toFile("public/zimowa_mobile_hero.avif")

await sharp("public/zimowa_mobile_hero.png")
  .webp({ quality: 84 })
  .toFile("public/zimowa_mobile_hero.webp")

const sourceDir = "public/modele"
const outputDir = "public/modele/display"
mkdirSync(outputDir, { recursive: true })

const files = readdirSync(sourceDir).filter((file) => /\.(png|jpe?g|webp|avif)$/i.test(file))
for (const file of files) {
  const base = file.replace(/\.[^.]+$/, "")
  await sharp(path.join(sourceDir, file))
    .rotate()
    .resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(path.join(outputDir, `${base}.webp`))
}

console.log(
  "hero avif",
  statSync("public/zimowa_mobile_hero.avif").size,
  "hero webp",
  statSync("public/zimowa_mobile_hero.webp").size,
  "brands",
  files.length,
)
