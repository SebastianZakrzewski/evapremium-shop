import "@testing-library/jest-dom/vitest"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { ConfiguratorV2MatPreviewLightbox } from "./ConfiguratorV2MatPreviewLightbox"

vi.mock("react-dom", async () => {
  const actual = await vi.importActual<typeof import("react-dom")>("react-dom")
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  }
})

describe("ConfiguratorV2MatPreviewLightbox", () => {
  const onClose = vi.fn()

  beforeEach(() => {
    onClose.mockReset()
  })

  it("renders fullscreen preview when open", () => {
    render(
      <ConfiguratorV2MatPreviewLightbox
        isOpen
        imageSrc="/dywaniki/test.png"
        alt="Podgląd dywanika"
        onClose={onClose}
      />,
    )

    expect(
      screen.getByRole("dialog", { name: /Powiększony podgląd: Podgląd dywanika/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Podgląd dywanika" })).toBeInTheDocument()
  })

  it("closes when close button is clicked", () => {
    render(
      <ConfiguratorV2MatPreviewLightbox
        isOpen
        imageSrc="/dywaniki/test.png"
        alt="Podgląd dywanika"
        onClose={onClose}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "Zamknij podgląd" }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("closes on Escape key", () => {
    render(
      <ConfiguratorV2MatPreviewLightbox
        isOpen
        imageSrc="/dywaniki/test.png"
        alt="Podgląd dywanika"
        onClose={onClose}
      />,
    )

    fireEvent.keyDown(window, { key: "Escape" })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("navigates gallery with arrow keys when multiple images are provided", () => {
    const onGalleryIndexChange = vi.fn()

    render(
      <ConfiguratorV2MatPreviewLightbox
        isOpen
        imageSrc="/dywaniki/test.png"
        alt="Podgląd dywanika"
        onClose={onClose}
        galleryImages={["/dywaniki/test.png", "/mat/1.webp"]}
        initialIndex={0}
        onGalleryIndexChange={onGalleryIndexChange}
      />,
    )

    fireEvent.keyDown(window, { key: "ArrowRight" })
    expect(onGalleryIndexChange).toHaveBeenCalledWith(1)
  })

  it("does not render when closed", () => {
    render(
      <ConfiguratorV2MatPreviewLightbox
        isOpen={false}
        imageSrc="/dywaniki/test.png"
        alt="Podgląd dywanika"
        onClose={onClose}
      />,
    )

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})
