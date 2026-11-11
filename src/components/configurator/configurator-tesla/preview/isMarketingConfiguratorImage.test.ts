import { describe, expect, it } from "vitest"
import { isMarketingConfiguratorImage } from "./isMarketingConfiguratorImage"

describe("isMarketingConfiguratorImage", () => {
  it("keeps promo frames and generic set diagrams out of the gallery", () => {
    expect(isMarketingConfiguratorImage("/zrantamiprodukt/5_-_1.webp")).toBe(true)
    expect(isMarketingConfiguratorImage("/konfigurator/zestaw/2rzedy/przod-tyl.png")).toBe(true)
    expect(isMarketingConfiguratorImage("/dywaniki/3d/diamonds/black/5os-3d-diamonds-black-black.webp")).toBe(false)
  })
})
