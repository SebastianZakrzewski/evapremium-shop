import { describe, expect, it } from "vitest"
import {
  MODEL_CARD_FRAME_SIZE,
  mobilePreviewFit,
  mobilePreviewViewportHeight,
  previewFrameStyle,
  resolvePreviewFrame,
  shrinkMobilePreviewFrame,
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

describe("mobilePreviewViewportHeight", () => {
  it("uses the iPhone 16 Pro screen height when Safari chrome shrinks the window", () => {
    expect(
      mobilePreviewViewportHeight({
        innerWidth: 402,
        innerHeight: 745,
        screenWidth: 402,
        screenHeight: 874,
      }),
    ).toBe(874)
  })

  it("keeps a short window on a desktop display", () => {
    expect(
      mobilePreviewViewportHeight({
        innerWidth: 390,
        innerHeight: 640,
        screenWidth: 1920,
        screenHeight: 1080,
      }),
    ).toBe(640)
  })

  it("follows the visible height in landscape", () => {
    expect(
      mobilePreviewViewportHeight({
        innerWidth: 874,
        innerHeight: 380,
        screenWidth: 402,
        screenHeight: 874,
      }),
    ).toBe(380)
  })
})

describe("previewFrameStyle", () => {
  it("keeps a wide photo in a smaller window on every phone", () => {
    expect(previewFrameStyle({ width: 2954, height: 1620 }, "mobile")).toEqual({
      aspectRatio: "2954 / 1620",
      width: "50%",
      height: "calc(50cqw * 1620 / 2954)",
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

  it("keeps a wide model photo at full width instead of shortening it further", () => {
    expect(previewFrameStyle({ width: 2954, height: 1620 }, "mobile", 740)).toEqual({
      aspectRatio: "2954 / 1620",
      width: "50%",
      height: "calc(50cqw * 1620 / 2954)",
    })
  })

  it("shrinks a tall photo to the mat preview height and then stops", () => {
    expect(shrinkMobilePreviewFrame({ width: 1000, height: 1000 })).toEqual(
      MODEL_CARD_FRAME_SIZE,
    )
    expect(previewFrameStyle({ width: 1000, height: 1000 }, "mobile", 640)).toEqual({
      aspectRatio: "2954 / 1620",
      width: "50%",
      height: "calc(50cqw * 1620 / 2954)",
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

  it("frames every other slide with the model photo when one exists", () => {
    expect(
      resolvePreviewFrame(
        [
          { kind: "dynamic", imageUrl: "/dywaniki/mat.webp" },
          { kind: "product-set", imageUrl: "/products/mounts.webp" },
          { kind: "model-template", imageUrl: "/model.webp" },
        ],
        "/products/mounts.webp",
      ),
    ).toEqual({ src: "/model.webp", useModelCardFrame: false })
  })

  it("keeps product photos in the mat preview frame when the model photo is missing", () => {
    expect(
      resolvePreviewFrame(
        [
          { kind: "dynamic", imageUrl: "/dywaniki/mat.webp" },
          { kind: "product-set", imageUrl: "/products/mounts.webp" },
        ],
        "/products/mounts.webp",
      ),
    ).toEqual({ src: null, useModelCardFrame: true })
  })
})
