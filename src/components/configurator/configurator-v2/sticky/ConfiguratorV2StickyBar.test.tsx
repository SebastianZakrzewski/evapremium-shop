import "@testing-library/jest-dom/vitest"
import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { ConfiguratorV2StickyBar } from "./ConfiguratorV2StickyBar"

const baseBreakdown = {
  basePrice: 600,
  discount: 51,
  priceAfterDiscount: 549,
  totalPrice: 549,
}

describe("ConfiguratorV2StickyBar", () => {
  it("shows price and enables cart when ready", () => {
    render(
      <ConfiguratorV2StickyBar
        priceBreakdown={baseBreakdown}
        isReadyForCart
        isAddingToCart={false}
        onAddToCart={vi.fn()}
      />,
    )

    expect(screen.getByText(/549/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Dodaj do koszyka" })).toBeEnabled()
  })

  it("disables cart button when configuration incomplete", () => {
    render(
      <ConfiguratorV2StickyBar
        priceBreakdown={{
          basePrice: 0,
          discount: 0,
          priceAfterDiscount: 0,
          totalPrice: 0,
        }}
        isReadyForCart={false}
        isAddingToCart={false}
        onAddToCart={vi.fn()}
      />,
    )

    expect(
      screen.getByText("Wybierz wariant aby zobaczyć cenę"),
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Dodaj do koszyka" })).toBeDisabled()
  })

  it("calls onPriceClick when price area clicked", () => {
    const onPriceClick = vi.fn()

    render(
      <ConfiguratorV2StickyBar
        priceBreakdown={baseBreakdown}
        isReadyForCart
        isAddingToCart={false}
        onAddToCart={vi.fn()}
        onPriceClick={onPriceClick}
      />,
    )

    fireEvent.click(screen.getByLabelText("Rozbij cenę"))
    expect(onPriceClick).toHaveBeenCalledOnce()
  })

  it("shows discount line when discount present", () => {
    render(
      <ConfiguratorV2StickyBar
        priceBreakdown={baseBreakdown}
        isReadyForCart
        isAddingToCart={false}
        onAddToCart={vi.fn()}
      />,
    )

    expect(screen.getByText(/Rabat: -51,00 zł/)).toBeInTheDocument()
  })
})
