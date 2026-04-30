import "@testing-library/jest-dom/vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
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

describe("HeroSection", () => {
  it("renders the spring promotion image as the active hero media", () => {
    render(<HeroSection />)

    const promotionImages = screen.getAllByAltText(
      "Wiosenna promocja dywaników samochodowych EVA Premium"
    )

    const srcs = promotionImages.map((img) => img.getAttribute("src"))

    expect(srcs).toContain("/images/zalety/hero_mobile.png")
    expect(srcs).toContain("/images/hero/wiosenna-zalety-hero2.png")
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

    target.remove()
  })
})
