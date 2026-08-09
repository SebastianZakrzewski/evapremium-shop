import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const publicDir = path.join(process.cwd(), 'public')
const srcPath = path.join(publicDir, 'Logo svg .svg')

let fullSvg = fs.readFileSync(srcPath, 'utf8')
fullSvg = fullSvg
  .replace(/height="1024\.0pt"/g, 'height="1024"')
  .replace(/width="1024\.0pt"/g, 'width="1024"')

// Favicon mark: crop to the car silhouette only.
// Full logo text ("EVA PREMIUM" / "CAR MATS") turns into a blurry smear below ~64px.
const carMarkSvg = fullSvg
  .replace(/viewBox="[^"]*"/, 'viewBox="95 160 820 370"')
  .replace(/width="1024"/, 'width="820"')
  .replace(/height="1024"/, 'height="370"')

const carMarkBuf = Buffer.from(carMarkSvg)

const renderPng = async (size) => {
  // ~8% padding so the mark stays clear inside Google's circular crop
  // without shrinking the car into a soft speck
  const inner = Math.max(1, Math.round(size * 0.86))

  const resized = await sharp(carMarkBuf, {
    density: 384,
    limitInputPixels: false,
  })
    .resize(inner, inner, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
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
    .composite([{ input: resized, gravity: 'centre' }])
    .png()
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

const [png16, png32, png48, png64] = await Promise.all([
  renderPng(16),
  renderPng(32),
  renderPng(48),
  renderPng(64),
])

fs.writeFileSync(
  path.join(publicDir, 'favicon.ico'),
  makeIco([png16, png32, png48, png64]),
)
console.log('wrote favicon.ico')

// Crisp vector favicon for modern browsers
const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" fill="#000000"/>
  <svg x="7" y="7" width="86" height="86" viewBox="95 160 820 370" preserveAspectRatio="xMidYMid meet">
${carMarkSvg.match(/<g[\s\S]*<\/g>/)?.[0] ?? ''}
  </svg>
</svg>
`

fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSvg)
console.log('wrote icon.svg')

// Keep full brand mark for schema / general use
fs.writeFileSync(path.join(publicDir, 'logo.svg'), fullSvg)
console.log('wrote logo.svg')
