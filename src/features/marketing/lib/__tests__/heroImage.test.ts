import { describe, expect, it } from "vitest"
import {
  HERO_PROMO_IMAGE_ALT,
  HERO_PROMO_IMAGE_SRC,
  HERO_PROMO_NATIVE_HEIGHT,
  HERO_PROMO_NATIVE_WIDTH,
} from "../heroImage"

describe("heroImage", () => {
  it("points the desktop hero at the winter promo graphic", () => {
    expect(HERO_PROMO_IMAGE_SRC).toBe("/images/hero/zimowa-promo.png")
    expect(HERO_PROMO_IMAGE_ALT).toBe(
      "Zimowa promocja dywaników samochodowych EVA Premium do -30%",
    )
    expect(HERO_PROMO_NATIVE_WIDTH).toBe(1920)
    expect(HERO_PROMO_NATIVE_HEIGHT).toBe(1646)
  })
})
