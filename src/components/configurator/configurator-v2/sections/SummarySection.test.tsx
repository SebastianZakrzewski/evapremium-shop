import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"
import { SummarySection } from "./SummarySection"

vi.mock("@/features/accessories/hooks/useAccessories", () => ({
  useAccessories: () => ({ accessories: [], isLoading: false }),
}))

vi.mock("@/features/brands/hooks/useBrands", () => ({
  useBrands: () => ({ brands: [], isLoading: false }),
}))

vi.mock("@/features/mat-model-previews", () => ({
  useMatModelPreviews: () => ({
    previews: [],
    isLoading: false,
    error: null,
  }),
}))

const baseConfig: ConfiguratorState = {
  brand: "BMW",
  brandKey: "bmw",
  model: "Seria 3",
  modelFamilyKey: "seria-3",
  modelKey: "seria-3",
  generation: "G20",
  year: "2020",
  gearbox: "Automatyczna",
  bodyType: "Sedan",
  bodyTypeKey: "sedan",
  recordKey: "bmw-seria-3",
  templateId: "",
  matType: "3d-with-rims",
  pricingCategoryKey: "standard",
  catalogVersionCode: "v1",
  variant: "full-set",
  structure: "diamonds",
  color: "black",
  edgeColor: "black",
  heelPad: false,
  selectedPodpietka: undefined,
  podpietkaColor: undefined,
  podpietkaMounting: undefined,
}

describe("SummarySection", () => {
  it("renders order summary content", () => {
    render(
      <SummarySection
        config={baseConfig}
        priceBreakdown={{
          basePrice: 499,
          discount: 50,
          shippingCost: 0,
          totalPrice: 449,
        }}
        isAddingToCart={false}
        onPrevious={vi.fn()}
        onAddToCart={vi.fn()}
      />,
    )

    expect(screen.getByRole("heading", { name: "Podsumowanie zamówienia" })).toBeInTheDocument()
    expect(screen.getByText("Twoja konfiguracja")).toBeInTheDocument()
    expect(screen.getByText("Podsumowanie")).toBeInTheDocument()
    const surface = screen.getByTestId("summary-surface")
    expect(surface).toHaveClass("bg-[#FFFFFF]", "text-neutral-950")
    expect(surface.className).not.toContain("bg-black")
    const priceCard = screen.getByTestId("summary-price-card")
    expect(priceCard).toHaveClass("bg-[#FFFFFF]", "border-neutral-300")
    expect(priceCard.className).not.toContain("bg-[#111]")
    const grid = screen.getByTestId("summary-grid")
    expect(grid).toHaveClass("min-w-0", "grid-cols-[minmax(0,1fr)]")
    expect(screen.getByTestId("summary-config-card")).toHaveClass("min-w-0", "max-w-full")
    const totalPrice = screen.getByText("449,00 zł", { selector: ".text-xl" })
    expect(totalPrice.className).toContain("text-green-600")
    expect(screen.getByRole("button", { name: /Przejdź do koszyka/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Wróć do edycji" })).toBeInTheDocument()
    const row = screen.getByTestId("summary-action-row")
    expect(row.className).toContain("flex-row")
    expect(screen.getByTestId("summary-mobile-actions")).toBeInTheDocument()
  })
})
