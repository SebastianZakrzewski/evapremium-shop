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

  it("renders the desktop split with copy, search and the winter graphic", () => {
    render(<HeroSection />)

    expect(screen.getByRole("heading", { name: "Dywaniki samochodowe EVA Premium" })).toBeInTheDocument()
    expect(
      screen.getByText("Wodoodporne, łatwe w czyszczeniu i precyzyjnie dopasowane do Twojego auta."),
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Wybierz markę samochodu")).toBeInTheDocument()
    expect(screen.getByLabelText("Wybierz model samochodu")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Szukaj dywaników dla wybranego samochodu" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Przeglądaj wszystkie marki" })).toHaveAttribute("href", "/dywaniki")
    expect(screen.getByTestId("hero-promo-image")).toHaveAttribute("src", "/images/hero/zimowa-promo.png")
    expect(screen.getByRole("region", { name: "Sekcja promocyjna - dywaniki samochodowe" })).toHaveClass("bg-[#FDFDFD]")
    expect(document.querySelector("video")).not.toBeInTheDocument()
    expect(screen.queryByText("Failed to fetch")).not.toBeInTheDocument()
  })

  it("shows the same winter graphic on a mobile viewport, without video", () => {
    mockMatchMedia(true)
    render(<HeroSection />)

    const image = screen.getByTestId("hero-promo-image")
    expect(image).toHaveAttribute("src", "/images/hero/zimowa-promo.png")
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
