import { describe, expect, it } from 'vitest'
import {
  HERO_PROMO_DISPLAY_MAX_WIDTH,
  HERO_PROMO_IMAGE_SIZES,
  HERO_PROMO_IMAGE_SRC,
  HERO_PROMO_MOBILE_IMAGE_SRC,
  HERO_PROMO_NATIVE_HEIGHT,
  HERO_PROMO_NATIVE_WIDTH,
  heroPromoImageProps,
} from '@/features/marketing/lib/heroImage'

describe('heroPromoImageProps', () => {
  it('serves hero banner without Next.js recompression', () => {
    expect(heroPromoImageProps.unoptimized).toBe(true)
    expect(heroPromoImageProps.quality).toBe(100)
  })

  it('matches native banner dimensions', () => {
    expect(HERO_PROMO_IMAGE_SRC).toBe('/hero_letnia_promocja_1234x413.png')
    expect(HERO_PROMO_MOBILE_IMAGE_SRC).toBe('/hero4_mobile.png')
    expect(HERO_PROMO_NATIVE_WIDTH).toBe(1234)
    expect(HERO_PROMO_NATIVE_HEIGHT).toBe(413)
    expect(HERO_PROMO_DISPLAY_MAX_WIDTH).toBe(1234)
    expect(HERO_PROMO_IMAGE_SIZES).toContain('1234px')
  })
})
