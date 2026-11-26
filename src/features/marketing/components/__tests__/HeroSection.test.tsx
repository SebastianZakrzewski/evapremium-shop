import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import HeroSection from "../HeroSection"

const { push } = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}))

vi.mock("@/features/brands/hooks/useBrands", () => ({
  useBrands: () => ({
    brands: [{ id: 1, name: "Audi", key: "audi" }],
    isLoading: false,
    error: null,
  }),
}))

vi.mock("@/features/vehicle-catalog/hooks/useQuickSearchCatalog", () => ({
  useQuickSearchCatalog: () => ({
    models: [{ key: "a4", name: "A4", displayName: "A4" }],
    templates: [],
    isLoading: false,
  }),
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
    push.mockReset()
    mockMatchMedia(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("renders the desktop split with copy, search and the Black Friday graphic", () => {
    render(<HeroSection />)

    expect(screen.getByRole("heading", { name: "Dywaniki samochodowe EVA Premium" })).toBeInTheDocument()
    expect(
      screen.getByText("Wodoodporne, łatwe w czyszczeniu i precyzyjnie dopasowane do Twojego auta."),
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Wybierz markę samochodu")).toBeInTheDocument()
    expect(screen.getByLabelText("Wybierz model samochodu")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Szukaj dywaników dla wybranego samochodu" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Przeglądaj wszystkie marki" })).toHaveAttribute("href", "/dywaniki")
    const image = screen.getByTestId("hero-promo-image")
    expect(image).toHaveAttribute(
      "src",
      "/images/hero/evapremium-hero-blackfriday-v2-desktop-1920x1646.png",
    )
    expect(image).toHaveAttribute("fetchpriority", "high")
    const sources = image.closest("picture")?.querySelectorAll("source")
    expect(sources?.[2]).toHaveAttribute("type", "image/webp")
    expect(sources?.[2]?.getAttribute("srcset")).toContain("960x823.webp 960w")
    expect(sources?.[2]?.getAttribute("srcset")).toContain("1920x1646.webp 1920w")
    expect(sources?.[2]).toHaveAttribute("sizes", "50vw")
    expect(screen.getByRole("region", { name: "Sekcja promocyjna - dywaniki samochodowe" })).toHaveClass("bg-[#FFFFFF]")
    expect(document.querySelector("video")).not.toBeInTheDocument()
    expect(screen.queryByText("Failed to fetch")).not.toBeInTheDocument()
  })

  it("keeps search ahead of the mobile Black Friday creative, without video", () => {
    mockMatchMedia(true)
    render(<HeroSection />)

    const image = screen.getByTestId("hero-promo-image")
    const mobileSource = image.closest("picture")?.querySelector("source")
    expect(mobileSource).toHaveAttribute("media", "(max-width: 767px)")
    expect(mobileSource).toHaveAttribute(
      "srcset",
      "/images/hero/evapremium-hero-blackfriday-v2-mobile-768x1365.webp",
    )
    expect(mobileSource).toHaveAttribute("width", "768")
    expect(mobileSource).toHaveAttribute("height", "1365")
    expect(document.querySelector("video")).not.toBeInTheDocument()
    expect(screen.getByTestId("hero-vehicle-search").compareDocumentPosition(image)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })

  it("opens the configurator for the selected brand", () => {
    render(<HeroSection />)

    fireEvent.change(screen.getByLabelText("Wybierz markę samochodu"), {
      target: { value: "Audi" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Szukaj dywaników dla wybranego samochodu" }))

    expect(push).toHaveBeenCalledWith("/konfigurator?brand=audi")
  })
})
