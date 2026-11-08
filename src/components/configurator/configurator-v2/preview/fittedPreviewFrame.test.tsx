import "@testing-library/jest-dom/vitest"
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ConfiguratorV2MobilePreview } from "../ConfiguratorV2MobilePreview"
import { ConfiguratorV2PreviewPanel } from "../ConfiguratorV2PreviewPanel"
import { MODEL_CARD_FRAME_SIZE } from "./fitPreviewFrame"

vi.mock("../hooks/useFittedPreviewFrame", () => ({
  useImageNaturalSize: (src: string) =>
    src === "/model.webp"
      ? { width: 2954, height: 1620 }
      : { width: 1600, height: 1000 },
  useMobilePreviewMaxHeight: () => 360,
}))

describe("preview frame fitted to the photo", () => {
  it("sizes the mobile window to the photo and fills it", () => {
    render(
      <ConfiguratorV2MobilePreview imageSrc="/mat/1.webp" alt="Podgląd" />,
    )

    const frame = screen.getByRole("button", { name: "Powiększ: Podgląd" })
    expect(frame).toHaveAttribute("data-preview-frame", "fitted")
    expect(frame).toHaveStyle({
      aspectRatio: "1600 / 1000",
      width: "min(100%, calc(360px * 1600 / 1000))",
    })
    expect(frame).not.toHaveClass("h-[180px]")
    expect(screen.getByAltText("Podgląd")).toHaveClass("object-cover")
  })

  it("sizes the mat preview to the model card photo", () => {
    render(
      <ConfiguratorV2MobilePreview
        imageSrc="/dywaniki/mat.webp"
        frameImageSrc="/model.webp"
        alt="Dywanik"
      />,
    )

    const frame = screen.getByRole("button", { name: "Powiększ: Dywanik" })
    expect(frame).toHaveStyle({
      aspectRatio: "2954 / 1620",
      width: "min(100%, calc(360px * 2954 / 1620))",
    })
    expect(screen.getByAltText("Dywanik")).toHaveClass("object-contain")
  })

  it("keeps the mat preview at the model-card size when the brand has no photo", () => {
    render(
      <ConfiguratorV2MobilePreview
        imageSrc="/dywaniki/mat.webp"
        useModelCardFrame
        alt="Dywanik"
      />,
    )

    const frame = screen.getByRole("button", { name: "Powiększ: Dywanik" })
    expect(frame).toHaveStyle({
      aspectRatio: `${MODEL_CARD_FRAME_SIZE.width} / ${MODEL_CARD_FRAME_SIZE.height}`,
    })
    expect(screen.getByAltText("Dywanik")).toHaveClass("object-contain")
  })

  it("sizes the desktop mat preview to the model card photo", () => {
    render(
      <ConfiguratorV2PreviewPanel
        imageSrc="/dywaniki/mat.webp"
        frameImageSrc="/model.webp"
        alt="Dywanik"
      />,
    )

    const frame = document.querySelector("[data-preview-frame]")
    expect(frame).toHaveStyle({
      aspectRatio: "2954 / 1620",
      width: "min(100cqw, calc(100cqh * 2954 / 1620))",
    })
    expect(screen.getByAltText("Dywanik")).toHaveClass("object-contain")
  })

  it("sizes the desktop window to the photo instead of stretching the canvas", () => {
    render(<ConfiguratorV2PreviewPanel imageSrc="/mat/1.webp" alt="Podgląd" />)

    const frame = document.querySelector("[data-preview-frame]")
    expect(frame).toHaveAttribute("data-preview-frame", "fitted")
    expect(frame).toHaveStyle({
      width: "min(100cqw, calc(100cqh * 1600 / 1000))",
    })
    expect(frame).not.toHaveClass("h-full", "w-full")
    expect(screen.getByAltText("Podgląd")).toHaveClass("object-cover")
  })
})
