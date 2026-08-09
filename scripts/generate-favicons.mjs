import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const publicDir = path.join(process.cwd(), 'public')
const srcPath = path.join(publicDir, 'Logo svg .svg')

let svg = fs.readFileSync(srcPath, 'utf8')
svg = svg
  .replace(/height="1024\.0pt"/g, 'height="1024"')
  .replace(/width="1024\.0pt"/g, 'width="1024"')

const svgBuf = Buffer.from(svg)

const renderPng = async (size) => {
  // Logo is light-on-transparent (designed for dark site UI).
  // Flatten onto black so Google SERP circles stay readable in light & dark mode.
  const resized = await sharp(svgBuf, { density: 72, limitInputPixels: false })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
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

const [png16, png32, png48] = await Promise.all([
  renderPng(16),
  renderPng(32),
  renderPng(48),
])

fs.writeFileSync(
  path.join(publicDir, 'favicon.ico'),
  makeIco([png16, png32, png48]),
)
console.log('wrote favicon.ico')

fs.writeFileSync(path.join(publicDir, 'logo.svg'), svg)
console.log('wrote logo.svg')
