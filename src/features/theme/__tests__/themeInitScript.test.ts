import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { themeInitScript } from "../themeInitScript"

const contrast = (foreground: string, background: string): number => {
  const channel = (hex: string, start: number): number => {
    const value = Number.parseInt(hex.slice(start, start + 2), 16) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  const luminance = (hex: string): number => {
    const normalized = hex.replace("#", "")
    const red = channel(normalized, 0)
    const green = channel(normalized, 2)
    const blue = channel(normalized, 4)
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue
  }
  const lighter = Math.max(luminance(foreground), luminance(background))
  const darker = Math.min(luminance(foreground), luminance(background))
  return (lighter + 0.05) / (darker + 0.05)
}

const readBlock = (css: string, marker: string): Record<string, string> => {
  const start = css.indexOf(marker)
  const body = css.slice(start, css.indexOf("}", start))
  const tokens: Record<string, string> = {}
  for (const match of body.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    tokens[match[1]] = match[2].toLowerCase()
  }
  return tokens
}

describe("themeInitScript", () => {
  it("follows the system and a saved choice without touching analytics", () => {
    expect(themeInitScript).toContain('localStorage.getItem("theme")')
    expect(themeInitScript).toContain("prefers-color-scheme: dark")
    expect(themeInitScript).toContain('classList.add(dark?"dark":"light")')
    expect(themeInitScript).not.toContain("dataLayer")
  })
})

describe("shop theme contrast", () => {
  const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8")
  const light = readBlock(css, "/* shop-theme-light */")
  const dark = readBlock(css, "/* shop-theme-dark */")

  it("keeps light surfaces on the current white and ink", () => {
    expect(light["--shop-bg"]).toBe("#ffffff")
    expect(light["--shop-ink-strong"]).toBe("#171717")
    expect(light["--shop-ink-body"]).toBe("#404040")
    expect(light["--shop-ink-muted"]).toBe("#525252")
    expect(light["--tesla-text"]).toBe("#171a20")
    expect(light["--tesla-page"]).toBe("#ffffff")
  })

  it("meets WCAG AA for text and UI in both themes", () => {
    for (const palette of [light, dark]) {
      expect(contrast(palette["--shop-ink-strong"], palette["--shop-bg"])).toBeGreaterThanOrEqual(4.5)
      expect(contrast(palette["--shop-ink-body"], palette["--shop-bg"])).toBeGreaterThanOrEqual(4.5)
      expect(contrast(palette["--shop-ink-muted"], palette["--shop-bg"])).toBeGreaterThanOrEqual(4.5)
      expect(contrast(palette["--shop-brand-text"], palette["--shop-bg"])).toBeGreaterThanOrEqual(4.5)
      expect(contrast(palette["--shop-danger"], palette["--shop-bg"])).toBeGreaterThanOrEqual(4.5)
      expect(contrast(palette["--shop-on-inverse"], palette["--shop-inverse"])).toBeGreaterThanOrEqual(4.5)
      expect(contrast(palette["--tesla-text"], palette["--tesla-page"])).toBeGreaterThanOrEqual(4.5)
      expect(contrast(palette["--tesla-muted"], palette["--tesla-page"])).toBeGreaterThanOrEqual(4.5)
    }
    expect(contrast(dark["--shop-line"], dark["--shop-bg"])).toBeGreaterThanOrEqual(3)
    expect(contrast(dark["--tesla-border"], dark["--tesla-page"])).toBeGreaterThanOrEqual(3)
    expect(light["--shop-line"]).toBe("#e5e5e5")
    expect(light["--tesla-border"]).toBe("#d0d1d2")
    expect(contrast("#ffffff", "#d00328")).toBeGreaterThanOrEqual(4.5)
    expect(contrast("#ffffff", "#e10600")).toBeGreaterThanOrEqual(4.5)
  })
})
