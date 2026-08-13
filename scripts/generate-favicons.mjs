import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const publicDir = path.join(process.cwd(), 'public')
const appDir = path.join(process.cwd(), 'src', 'app')
const srcPath = path.join(publicDir, 'Logo svg .svg')
const logoPngPath = path.join(publicDir, 'logo.png')

let fullSvg = fs.readFileSync(srcPath, 'utf8')
fullSvg = fullSvg
  .replace(/height="1024\.0pt"/g, 'height="1024"')
  .replace(/width="1024\.0pt"/g, 'width="1024"')

// Crop car only from brand logo (no "EVA PREMIUM" / "CAR MATS" text).
// Text in a 16–32px Google circle becomes an unreadable blurry smear.
const CAR_CROP = { left: 120, top: 50, width: 700, height: 430 }
const SVG_VIEWBOX = '120 145 700 390'

const renderPng = async (size) => {
  // ~6% padding keeps the mark inside Google's circular mask without shrinking it
  const inner = Math.max(1, Math.round(size * 0.94))

  const car = await sharp(logoPngPath)
    .extract(CAR_CROP)
    .resize(inner * 4, inner * 4, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 1 },
      kernel: sharp.kernel.lanczos3,
    })
    .resize(inner, inner, {
      fit: 'fill',
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer()

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([{ input: car, gravity: 'centre' }])
    .png({ compressionLevel: 9, palette: false })
    .toBuffer()
}

const sizes = [
  { name: 'icon-48.png', size: 48 },
  { name: 'icon-96.png', size: 96 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
]

for (const { name, size } of sizes) {
  const buf = await renderPng(size)
  fs.writeFileSync(path.join(publicDir, name), buf)
  console.log('wrote', name)
}

const makeIco = (pngBuffers) => {
  const count = pngBuffers.length
  const headerSize = 6 + count * 16
  const header = Buffer.alloc(headerSize)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(count, 4)

  let o = 6
  let dataOffset = headerSize
  const parts = [header]

  for (const buf of pngBuffers) {
    const w = buf.readUInt32BE(16)
    const h = buf.readUInt32BE(20)
    header.writeUInt8(w >= 256 ? 0 : w, o)
    header.writeUInt8(h >= 256 ? 0 : h, o + 1)
    header.writeUInt8(0, o + 2)
    header.writeUInt8(0, o + 3)
    header.writeUInt16LE(1, o + 4)
    header.writeUInt16LE(32, o + 6)
    header.writeUInt32LE(buf.length, o + 8)
    header.writeUInt32LE(dataOffset, o + 12)
    o += 16
    dataOffset += buf.length
    parts.push(buf)
  }

  return Buffer.concat(parts)
}

const [png32, png48, png64, png128] = await Promise.all([
  renderPng(32),
  renderPng(48),
  renderPng(64),
  renderPng(128),
])

fs.writeFileSync(
  path.join(publicDir, 'favicon.ico'),
  makeIco([png32, png48, png64, png128]),
)
console.log('wrote favicon.ico')

const carMarkSvg = fullSvg
  .replace(/viewBox="[^"]*"/, `viewBox="${SVG_VIEWBOX}"`)
  .replace(/width="1024"/, 'width="700"')
  .replace(/height="1024"/, 'height="390"')

const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" fill="#000000"/>
  <svg x="3" y="3" width="94" height="94" viewBox="${SVG_VIEWBOX}" preserveAspectRatio="xMidYMid meet">
${carMarkSvg.match(/<g[\s\S]*<\/g>/)?.[0] ?? ''}
  </svg>
</svg>
`

fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSvg)
console.log('wrote icon.svg')

fs.writeFileSync(path.join(publicDir, 'logo.svg'), fullSvg)
console.log('wrote logo.svg')

for (const [from, to] of [
  ['icon.png', 'icon.png'],
  ['apple-touch-icon.png', 'apple-icon.png'],
  ['favicon.ico', 'favicon.ico'],
]) {
  fs.copyFileSync(path.join(publicDir, from), path.join(appDir, to))
  console.log('wrote src/app/' + to)
}

for (const f of fs.readdirSync(publicDir)) {
  if (
    f.startsWith('_cand-') ||
    f.startsWith('_preview-') ||
    f.startsWith('_check') ||
    f.startsWith('_favicon-') ||
    f.startsWith('_car-crop')
  ) {
    fs.unlinkSync(path.join(publicDir, f))
  }
}
