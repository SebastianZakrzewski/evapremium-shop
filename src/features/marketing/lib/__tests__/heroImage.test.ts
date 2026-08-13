import { describe, expect, it } from 'vitest'
import {
  HERO_PROMO_IMAGE_SRC,
  HERO_PROMO_MOBILE_IMAGE_SRC,
  HERO_PROMO_MOBILE_NATIVE_HEIGHT,
  HERO_PROMO_MOBILE_NATIVE_WIDTH,
  HERO_PROMO_NATIVE_HEIGHT,
  HERO_PROMO_NATIVE_WIDTH,
  heroPromoImageProps,
} from '../heroImage'

describe('heroPromoImageProps', () => {
  it('uses optimized Next.js delivery with balanced quality', () => {
    expect(heroPromoImageProps.unoptimized).toBeUndefined()
    expect(heroPromoImageProps.quality).toBe(80)
  })

  it('matches native banner dimensions and webp sources', () => {
    expect(HERO_PROMO_IMAGE_SRC).toBe('/hero_letnia_promocja_1234x413.webp')
    expect(HERO_PROMO_MOBILE_IMAGE_SRC).toBe('/hero4_mobile.webp')
    expect(HERO_PROMO_NATIVE_WIDTH).toBe(1234)
    expect(HERO_PROMO_NATIVE_HEIGHT).toBe(413)
    expect(HERO_PROMO_MOBILE_NATIVE_WIDTH).toBe(941)
    expect(HERO_PROMO_MOBILE_NATIVE_HEIGHT).toBe(1672)
  })
})
