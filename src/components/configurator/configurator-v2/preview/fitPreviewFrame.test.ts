import { describe, expect, it } from "vitest"
import {
  MODEL_CARD_FRAME_SIZE,
  mobilePreviewMaxHeight,
  previewFrameStyle,
  resolvePreviewFrame,
} from "./fitPreviewFrame"

describe("mobilePreviewMaxHeight", () => {
  it("keeps the tall cap on a desktop-height window", () => {
    expect(mobilePreviewMaxHeight(900)).toBe(150)
  })

  it("shrinks the preview on a short window so the first field stays below the stages", () => {
    expect(mobilePreviewMaxHeight(520)).toBe(120)
  })
})

describe("previewFrameStyle", () => {
  it("fills the mobile preview width and keeps the photo ratio", () => {
    expect(previewFrameStyle({ width: 1600, height: 1000 }, "mobile")).toEqual({
      aspectRatio: "1600 / 1000",
      width: "100%",
      height: "calc(100cqw * 1000 / 1600)",
    })
  })

  it("fits the desktop window to the largest photo that stays inside the panel", () => {
    expect(previewFrameStyle({ width: 1600, height: 1000 }, "desktop")).toEqual({
      aspectRatio: "1600 / 1000",
      width: "min(100cqw, calc(100cqh * 1600 / 1000))",
      height: "auto",
      maxWidth: "100%",
      maxHeight: "100%",
    })
  })

  it("keeps the previous window until the photo size is known", () => {
    expect(previewFrameStyle(null, "mobile")).toBeUndefined()
  })
})

describe("resolvePreviewFrame", () => {
  it("sizes the mat preview to the model card photo", () => {
    expect(
      resolvePreviewFrame(
        [
          { kind: "dynamic", imageUrl: "/dywaniki/mat.webp" },
          { kind: "model-template", imageUrl: "/model.webp" },
        ],
        "/dywaniki/mat.webp",
      ),
    ).toEqual({ src: "/model.webp", useModelCardFrame: false })
  })

  it("uses the same model-card size when the brand has no model photo", () => {
    expect(
      resolvePreviewFrame(
        [{ kind: "dynamic", imageUrl: "/dywaniki/mat.webp" }],
        "/dywaniki/mat.webp",
      ),
    ).toEqual({ src: null, useModelCardFrame: true })
    expect(MODEL_CARD_FRAME_SIZE).toEqual({ width: 2954, height: 1620 })
  })

  it("frames other slides with the model photo when one exists", () => {
    expect(
      resolvePreviewFrame(
        [
          { kind: "dynamic", imageUrl: "/dywaniki/mat.webp" },
          { kind: "model-template", imageUrl: "/model.webp" },
        ],
        "/model.webp",
      ).src,
    ).toBe("/model.webp")
  })
})
