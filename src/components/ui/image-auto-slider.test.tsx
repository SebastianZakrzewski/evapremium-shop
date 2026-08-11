import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ImageAutoSlider } from "./image-auto-slider"

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string
    alt?: string
  }) => <img src={src} alt={alt ?? ""} {...props} />,
}))

vi.mock("@/components/ui/gallery-lightbox", () => ({
  GalleryLightbox: () => null,
}))

const images = [
  { src: "/galeria/a.webp", alt: "A", title: "A" },
  { src: "/galeria/b.webp", alt: "B", title: "B" },
  { src: "/galeria/c.webp", alt: "C", title: "C" },
]

const mockMatchMedia = (matchesReducedMotion: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion")
        ? matchesReducedMotion
        : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe("ImageAutoSlider", () => {
  beforeEach(() => {
    mockMatchMedia(false)
  })

  it("renders animated track with capped duration for visible motion", () => {
    render(<ImageAutoSlider images={images} speed={150} />)

    const track = screen.getByTestId("product-gallery-motion-track")
    expect(track).toHaveClass("animate-scroll-right-seamless")
    expect(track).toHaveAttribute("data-allow-motion", "true")
    expect(track.style.animationDuration).toBe("60s")
    expect(screen.getAllByRole("button")).toHaveLength(images.length * 2)
  })

  it("falls back to manual horizontal strip when reduced motion is preferred", () => {
    mockMatchMedia(true)
    render(<ImageAutoSlider images={images} speed={40} />)

    expect(screen.getByTestId("product-gallery-manual-strip")).toBeInTheDocument()
    expect(screen.queryByTestId("product-gallery-motion-track")).not.toBeInTheDocument()
    expect(screen.getAllByRole("button")).toHaveLength(images.length)
  })
})
