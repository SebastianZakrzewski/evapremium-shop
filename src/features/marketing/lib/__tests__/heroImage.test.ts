import { describe, expect, it } from "vitest"
import {
  HERO_PROMO_DESKTOP_HEIGHT,
  HERO_PROMO_DESKTOP_PNG_1920,
  HERO_PROMO_DESKTOP_WEBP_1920,
  HERO_PROMO_DESKTOP_WEBP_960,
  HERO_PROMO_IMAGE_ALT,
  HERO_PROMO_IMAGE_SRC,
  HERO_PROMO_MOBILE_HEIGHT,
  HERO_PROMO_MOBILE_PNG,
  HERO_PROMO_MOBILE_WEBP,
  HERO_PROMO_MOBILE_WIDTH,
  HERO_PROMO_NATIVE_HEIGHT,
  HERO_PROMO_NATIVE_WIDTH,
} from "../heroImage"

describe("heroImage", () => {
  it("points the hero at the Black Friday v2 creatives", () => {
    expect(HERO_PROMO_IMAGE_ALT).toBe(
      "Black Friday EVAPREMIUM – dywaniki EVA do -30%: zatrzymują wodę i brud, łatwe do mycia, lekkie i elastyczne, dopasowane do modelu auta",
    )
    expect(HERO_PROMO_MOBILE_WEBP).toBe(
      "/images/hero/evapremium-hero-blackfriday-v2-mobile-768x1365.webp",
    )
    expect(HERO_PROMO_MOBILE_PNG).toBe(
      "/images/hero/evapremium-hero-blackfriday-v2-mobile-768x1365.png",
    )
    expect(HERO_PROMO_MOBILE_WIDTH).toBe(768)
    expect(HERO_PROMO_MOBILE_HEIGHT).toBe(1365)
    expect(HERO_PROMO_DESKTOP_WEBP_960).toContain("960x823.webp")
    expect(HERO_PROMO_DESKTOP_WEBP_1920).toContain("1920x1646.webp")
    expect(HERO_PROMO_DESKTOP_PNG_1920).toContain("1920x1646.png")
    expect(HERO_PROMO_IMAGE_SRC).toBe(HERO_PROMO_DESKTOP_PNG_1920)
    expect(HERO_PROMO_NATIVE_WIDTH).toBe(1920)
    expect(HERO_PROMO_NATIVE_HEIGHT).toBe(1646)
    expect(HERO_PROMO_DESKTOP_HEIGHT).toBe(1646)
  })
})
