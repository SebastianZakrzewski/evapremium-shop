import { describe, expect, it } from 'vitest'
import {
  shouldServeBrandImageUnoptimized,
  isBrandPhotoFile,
  isModeleBrandPhoto,
  brandCardImageSrc,
} from '@/shared/brands/brandImage'

describe('shouldServeBrandImageUnoptimized', () => {
  it('returns true for local modele assets', () => {
    expect(shouldServeBrandImageUnoptimized('/modele/ssangyong.avif')).toBe(true)
    expect(shouldServeBrandImageUnoptimized('/modele/bmw.png')).toBe(true)
  })

  it('returns false for remote or other paths', () => {
    expect(shouldServeBrandImageUnoptimized('/images/products/bmw.png')).toBe(false)
  })
})

describe('isBrandPhotoFile', () => {
  it('detects supported raster extensions', () => {
    expect(isBrandPhotoFile('/modele/ssangyong.avif')).toBe(true)
    expect(isBrandPhotoFile('/logo.svg')).toBe(false)
  })
})

describe('brandCardImageSrc', () => {
  it('points modele photos at the display derivative', () => {
    expect(brandCardImageSrc('/modele/mclaren.avif')).toBe('/modele/display/mclaren.webp')
    expect(brandCardImageSrc('/images/products/bmw.png')).toBe('/images/products/bmw.png')
  })
})

describe('isModeleBrandPhoto', () => {
  it('detects modele catalog paths', () => {
    expect(isModeleBrandPhoto('/modele/audi.avif')).toBe(true)
  })
})
