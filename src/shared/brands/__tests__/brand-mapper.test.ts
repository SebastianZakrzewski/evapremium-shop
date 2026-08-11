import { describe, expect, it } from "vitest"
import {
  normalizeBrandForClient,
  resolveBrandDisplayNameFromDbName,
  resolveBrandLogo,
} from "@/shared/brands/brandMapper"

describe("resolveBrandDisplayNameFromDbName", () => {
  it("maps Ssang Young from database to SsangYong", () => {
    expect(resolveBrandDisplayNameFromDbName("Ssang Young")).toBe("SsangYong")
  })

  it("maps legacy SSANG YONG to SsangYong", () => {
    expect(resolveBrandDisplayNameFromDbName("SSANG YONG")).toBe("SsangYong")
  })

  it("maps title-cased Ssang Yong to SsangYong", () => {
    expect(resolveBrandDisplayNameFromDbName("Ssang Yong")).toBe("SsangYong")
  })
})

describe("resolveBrandLogo for updated brand photos", () => {
  it("resolves XPeng logo from brand name", () => {
    expect(resolveBrandLogo("Xpeng", null)).toBe("/modele/xpeng.png")
  })

  it("resolves Xiaomi logo from brand name", () => {
    expect(resolveBrandLogo("Xiaomi", null)).toBe("/modele/xiaomi.png")
  })

  it("resolves Forthing logo from brand name", () => {
    expect(resolveBrandLogo("Forthing", null)).toBe("/modele/forthing.webp")
  })

  it("resolves Morris Minor logo from brand name", () => {
    expect(resolveBrandLogo("Morris Minor", null)).toBe("/modele/moris-minor.webp")
  })

  it("resolves Land rover logo from database name", () => {
    expect(resolveBrandLogo("Land rover", null)).toBe("/modele/land_rover.webp")
  })

  it("resolves new brand photos from MODELE_IMAGE_MAP", () => {
    expect(resolveBrandLogo("Aito", null)).toBe("/modele/Aito.jpg")
    expect(resolveBrandLogo("Caselani", null)).toBe("/modele/Caselani.jpg")
    expect(resolveBrandLogo("Changan", null)).toBe("/modele/changan.webp")
    expect(resolveBrandLogo("Denza", null)).toBe("/modele/Denza.jpg")
    expect(resolveBrandLogo("Dr", null)).toBe("/modele/Dr.webp")
    expect(resolveBrandLogo("Futuri", null)).toBe("/modele/Futuri.jpg")
    expect(resolveBrandLogo("Hongqi", null)).toBe("/modele/hONGHI.webp")
    expect(resolveBrandLogo("Jetour", null)).toBe("/modele/Jetour.jpg")
    expect(resolveBrandLogo("Lada", null)).toBe("/modele/Lada.jpg")
    expect(resolveBrandLogo("Leapmotor", null)).toBe("/modele/Leapmotor.jpg")
    expect(resolveBrandLogo("Maybach", null)).toBe("/modele/Maybach.webp")
    expect(resolveBrandLogo("Rover", null)).toBe("/modele/rover.webp")
    expect(resolveBrandLogo("Zaz-968", null)).toBe("/modele/zaz_968.webp")
  })
})

describe("normalizeBrandForClient", () => {
  it("normalizes cached API brand names for display", () => {
    const normalized = normalizeBrandForClient({
      id: 1,
      name: "Ssang Young",
      logo: "/modele/ssangyong.png",
      description: "Dywaniki samochodowe dla marki Ssang Young",
    })

    expect(normalized.name).toBe("SsangYong")
    expect(normalized.logo).toBe("/modele/ssangyong.png")
    expect(normalized.description).toContain("SsangYong")
  })

  it("fixes stale logo path from cached API response", () => {
    const normalized = normalizeBrandForClient({
      id: 2,
      name: "Ssang Young",
      logo: "/modele/ssang_young.jpg",
      description: "Dywaniki samochodowe dla marki Ssang Young",
    })

    expect(normalized.name).toBe("SsangYong")
    expect(normalized.logo).toBe("/modele/ssangyong.png")
  })
})
