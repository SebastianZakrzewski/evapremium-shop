import { describe, expect, it } from 'vitest'
import {
  HERO_PROMO_IMAGE_SRC,
  HERO_PROMO_MOBILE_IMAGE_SRC,
  HERO_PROMO_MOBILE_NATIVE_HEIGHT,
  HERO_PROMO_MOBILE_NATIVE_WIDTH,
  HERO_PROMO_DISPLAY_MAX_WIDTH,
  HERO_PROMO_NATIVE_HEIGHT,
  HERO_PROMO_NATIVE_WIDTH,
  heroPromoDesktopImageProps,
  heroPromoImageProps,
} from '../heroImage'

describe('heroPromoImageProps', () => {
  it('serves the desktop PNG without Next.js compression', () => {
    expect(heroPromoDesktopImageProps.unoptimized).toBe(true)
  })

  it('serves the mobile PNG without Next.js compression', () => {
    expect(heroPromoImageProps.unoptimized).toBe(true)
  })

  it('matches native banner dimensions and sources', () => {
    expect(HERO_PROMO_IMAGE_SRC).toBe('/jesien_hero.png?v=2168')
    expect(HERO_PROMO_MOBILE_IMAGE_SRC).toBe('/jesien_mobile_hero.png?v=941')
    expect(HERO_PROMO_NATIVE_WIDTH).toBe(2168)
    expect(HERO_PROMO_NATIVE_HEIGHT).toBe(725)
    expect(HERO_PROMO_DISPLAY_MAX_WIDTH).toBe(1234)
    expect(HERO_PROMO_MOBILE_NATIVE_WIDTH).toBe(941)
    expect(HERO_PROMO_MOBILE_NATIVE_HEIGHT).toBe(1672)
  })
})
