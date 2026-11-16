import "@testing-library/jest-dom/vitest"
import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { TeslaPinnedGallery, type GallerySlide } from "./TeslaPinnedGallery"

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
  }: {
    src: string
    alt?: string
  }) => <img src={src} alt={alt ?? ""} />,
  getImageProps: () => ({ props: { src: "/optimized.png" } }),
}))

const slides: GallerySlide[] = [
  { id: "mat-active", src: "/dywaniki/przod.png", alt: "Podgląd dywaników", group: "mat" },
]

describe("TeslaPinnedGallery", () => {
  it("opens the preview fullscreen after a tap on mobile", () => {
    render(<TeslaPinnedGallery slides={slides} preferredId="mat-active" resetKey="mat" />)

    fireEvent.click(screen.getByRole("button", { name: "Powiększ podgląd" }))

    const dialog = screen.getByRole("dialog", { name: "Powiększony podgląd: Podgląd dywaników" })
    expect(within(dialog).getByRole("img", { name: "Podgląd dywaników" })).toHaveAttribute(
      "src",
      "/dywaniki/przod.png",
    )
  })

  it("closes the enlarged preview from the close button", () => {
    render(<TeslaPinnedGallery slides={slides} preferredId="mat-active" resetKey="mat" />)

    fireEvent.click(screen.getByRole("button", { name: "Powiększ podgląd" }))
    fireEvent.click(screen.getByRole("button", { name: "Zamknij podgląd" }))

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})
