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

const baseConfig: ConfiguratorState = {
  brand: "BMW",
  brandKey: "bmw",
  model: "Seria 3",
  modelFamilyKey: "seria-3",
  modelKey: "seria-3",
  generation: "G20",
  year: "2020",
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
    expect(screen.getByRole("button", { name: /Przejdź do koszyka/i })).toBeInTheDocument()
    expect(screen.getByTestId("summary-mobile-actions")).toBeInTheDocument()
  })
})
