import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ProductVideoCarouselSection from "./ProductVideoCarouselSection"
import { productVideos } from "../data/productVideos"

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    priority: _priority,
    quality: _quality,
    ...props
  }: {
    src: string | { src: string }
    alt?: string
    fill?: boolean
    priority?: boolean
    quality?: number
  }) => {
    const imageSrc = typeof src === "string" ? src : src.src
    return <img src={imageSrc} alt={alt ?? ""} {...props} />
  },
}))

vi.mock("swiper/react", () => ({
  Swiper: ({ children }: { children: ReactNode }) => (
    <div data-testid="swiper">{children}</div>
  ),
  SwiperSlide: ({ children }: { children: ReactNode }) => (
    <div data-testid="swiper-slide">{children}</div>
  ),
}))

vi.mock("swiper/modules", () => ({
  Navigation: {},
  Pagination: {},
}))

vi.mock("swiper/css", () => ({}))
vi.mock("swiper/css/navigation", () => ({}))
vi.mock("swiper/css/pagination", () => ({}))

const mockMatchMedia = (matches = false) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
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

describe("ProductVideoCarouselSection", () => {
  beforeEach(() => {
    mockMatchMedia(false)
    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      writable: true,
      value: vi.fn().mockResolvedValue(undefined),
    })
    Object.defineProperty(HTMLMediaElement.prototype, "pause", {
      configurable: true,
      writable: true,
      value: vi.fn(),
    })
    class MockIntersectionObserver {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
      takeRecords = vi.fn().mockReturnValue([])
      root = null
      rootMargin = ""
      thresholds = []
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)
  })

  it("renders a region labeled Premium w akcji", () => {
    render(<ProductVideoCarouselSection />)

    expect(
      screen.getByRole("region", { name: /premium w akcji/i })
    ).toBeInTheDocument()
  })

  it("renders heading with highlighted akcji", () => {
    render(<ProductVideoCarouselSection />)

    const heading = screen.getByRole("heading", { level: 2 })
    expect(heading).toHaveTextContent("Premium w akcji")
    expect(heading.querySelector(".text-red-500")).toHaveTextContent("akcji")
  })

  it("renders one video card per product video entry", () => {
    render(<ProductVideoCarouselSection />)

    const slides = screen.getAllByTestId("product-video-card")
    expect(slides).toHaveLength(productVideos.length)
  })

  it("keeps video sources unloaded until the section becomes visible", () => {
    render(<ProductVideoCarouselSection />)

    expect(document.querySelectorAll("video")).toHaveLength(0)
    expect(
      screen.getAllByTestId("product-video-card")[0].querySelector("img")
    ).toHaveAttribute("src", productVideos[0].poster)
  })

  it("links CTA to /dywaniki", () => {
    render(<ProductVideoCarouselSection />)

    const cta = screen.getByRole("link", {
      name: /sprawdź dostępność dywaników dla twojego auta/i,
    })
    expect(cta).toHaveAttribute("href", "/dywaniki")
  })

  it("opens enlarged lightbox when a video card is clicked", () => {
    render(<ProductVideoCarouselSection />)

    const firstCard = screen.getAllByTestId("product-video-card")[0]
    fireEvent.pointerDown(firstCard, { clientX: 10, clientY: 10 })
    fireEvent.pointerUp(firstCard, { clientX: 10, clientY: 10 })

    expect(screen.getByTestId("product-video-lightbox")).toBeInTheDocument()
    expect(
      screen.getByRole("dialog", { name: /powiększony film/i })
    ).toBeInTheDocument()
  })
})
