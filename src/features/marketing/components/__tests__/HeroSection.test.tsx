import "@testing-library/jest-dom/vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import HeroSection from "../HeroSection"

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    priority: _priority,
    quality: _quality,
    unoptimized: _unoptimized,
    ...props
  }: {
    src: string | { src: string }
    alt?: string
    fill?: boolean
    priority?: boolean
    quality?: number
    unoptimized?: boolean
  }) => {
    const imageSrc = typeof src === "string" ? src : src.src

    return <img src={imageSrc} alt={alt ?? ""} {...props} />
  },
}))

const mockMatchMedia = (isMobile: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === "(max-width: 767px)" ? isMobile : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe("HeroSection", () => {
  beforeEach(() => {
    mockMatchMedia(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("renders one responsive promo image without intro video", () => {
    render(<HeroSection />)

    expect(screen.getByTestId("hero-promo")).toBeInTheDocument()
    expect(screen.queryByTestId("hero-desktop-carousel")).not.toBeInTheDocument()
    expect(screen.queryByTestId("hero-mobile-static")).not.toBeInTheDocument()
    expect(screen.queryByTestId("hero-video-1")).not.toBeInTheDocument()
    expect(screen.getByTestId("hero-promo-cta-hit-area")).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "+48 793 993 430" })).not.toBeInTheDocument()
    const image = screen.getByAltText(
      "Jesienna promocja dywaników samochodowych EVA Premium do -30%"
    )
    expect(image).toHaveAttribute("src", "/jesien_hero.png?v=2168")
    expect(document.querySelector('source[media="(max-width: 767px)"]')).toHaveAttribute(
      "srcset",
      "/zimowa_mobile_hero.png?v=577",
    )
    expect(screen.getByTestId("hero-mobile-promo-cta-button")).toHaveTextContent(
      "Skonfiguruj dywaniki do swojego auta",
    )
    expect(screen.getByTestId("hero-mobile-promo-cta-button")).toHaveClass("md:hidden")
  })

  it("keeps the same promo markup on a mobile viewport", () => {
    mockMatchMedia(true)
    render(<HeroSection />)

    expect(screen.getByTestId("hero-promo")).toBeInTheDocument()
    expect(screen.queryByTestId("hero-video-1")).not.toBeInTheDocument()
    expect(screen.getByTestId("hero-promo-cta-hit-area")).toBeInTheDocument()
  })

  it("scrolls to dywaniki section when promo CTA overlay is clicked", () => {
    const target = document.createElement("section")
    target.id = "products"
    const scrollIntoView = vi.fn()
    target.scrollIntoView = scrollIntoView
    document.body.appendChild(target)

    render(<HeroSection />)

    fireEvent.click(screen.getByTestId("hero-promo-cta-hit-area"))

    expect(scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "smooth", block: "start" })
    )

    fireEvent.click(screen.getByTestId("hero-mobile-promo-cta-button"))

    expect(scrollIntoView).toHaveBeenCalledTimes(2)

    target.remove()
  })
})
