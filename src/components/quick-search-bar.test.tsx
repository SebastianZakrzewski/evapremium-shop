import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import QuickSearchBar from "./quick-search-bar"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock("@/features/brands/hooks/useBrands", () => ({
  useBrands: () => ({ brands: [], isLoading: false }),
}))

vi.mock("@/features/vehicle-catalog/hooks/useQuickSearchCatalog", () => ({
  useQuickSearchCatalog: () => ({ models: [], templates: [], isLoading: false }),
}))

describe("QuickSearchBar glow", () => {
  it("renders a bottom glow that can fade out below the card", () => {
    const { container } = render(<QuickSearchBar />)

    const glow = container.querySelector(".quick-search-glow")
    expect(glow).toBeInTheDocument()
    expect(glow).toHaveAttribute("aria-hidden", "true")
    expect(screen.getByRole("region", { name: /Wyszukiwarka dywaników/ })).toHaveClass("pb-14")
  })
})
