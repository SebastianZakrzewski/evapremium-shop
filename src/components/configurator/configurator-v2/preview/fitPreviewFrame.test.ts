import { describe, expect, it } from "vitest"
import {
  MODEL_CARD_FRAME_SIZE,
  mobilePreviewFit,
  previewFrameStyle,
  resolvePreviewFrame,
} from "./fitPreviewFrame"

describe("mobilePreviewFit", () => {
  it("keeps the full photo on an iPhone 16 Pro height", () => {
    expect(mobilePreviewFit(874)).toEqual({ kind: "full", scale: 1 })
  })

  it("keeps the full photo from 840px upward", () => {
    expect(mobilePreviewFit(844)).toEqual({ kind: "full", scale: 1 })
    expect(mobilePreviewFit(800).kind).toBe("scaled")
  })

  it("shrinks the frame height as the phone gets shorter", () => {
    expect(mobilePreviewFit(800)).toEqual({ kind: "scaled", scale: 0.797 })
    expect(mobilePreviewFit(740)).toEqual({ kind: "scaled", scale: 0.493 })
    expect(mobilePreviewFit(700)).toEqual({ kind: "scaled", scale: 0.29 })
  })

  it("uses a short cropped strip on the smallest phones", () => {
    expect(mobilePreviewFit(667)).toEqual({ kind: "compact", scale: 1, frameHeight: 96 })
    expect(mobilePreviewFit(640)).toEqual({ kind: "compact", scale: 1, frameHeight: 72 })
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

  it("shrinks the mobile frame height on a mid-height phone", () => {
    expect(previewFrameStyle({ width: 1600, height: 1000 }, "mobile", 740)).toEqual({
      aspectRatio: "1600 / 1000",
      width: "100%",
      height: "calc(0.493 * 100cqw * 1000 / 1600)",
    })
  })

  it("crops the mobile frame to a short strip on a very small phone", () => {
    expect(previewFrameStyle({ width: 1600, height: 1000 }, "mobile", 640)).toEqual({
      aspectRatio: "1600 / 1000",
      width: "100%",
      height: "72px",
    })
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
