import { describe, expect, it } from "vitest"
import {
  MAT_DYNAMIC_PREVIEW_CANVAS_BG,
  getMatPreviewCanvasClass,
  getMatPreviewCanvasColor,
} from "./matPreviewCanvas"

describe("matPreviewCanvas", () => {
  it("uses sampled gray for dynamic dywanik renders", () => {
    const src = "/dywaniki/3d/diamonds/black/5os-3d-diamonds-black-black.webp"
    expect(getMatPreviewCanvasClass(src)).toBe("bg-[#dcdcdc]")
    expect(getMatPreviewCanvasColor(src)).toBe(MAT_DYNAMIC_PREVIEW_CANVAS_BG)
  })

  it("uses white for product gallery shots", () => {
    expect(getMatPreviewCanvasClass("/bezrantowprodukt/5-_4_red.webp")).toBe(
      "bg-white",
    )
  })

  it("uses dark canvas for vehicle product photos", () => {
    expect(getMatPreviewCanvasClass("https://cdn.example/car.jpg")).toBe(
      "bg-[#111]",
    )
  })
})
