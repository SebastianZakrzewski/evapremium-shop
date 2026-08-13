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
  it("shows summary CTA when configuration is complete", () => {
    const onGoToSummary = vi.fn()

    render(
      <ConfiguratorV2StickyBar
        priceBreakdown={baseBreakdown}
        isConfigComplete
        showSummaryCta
        onGoToSummary={onGoToSummary}
      />,
    )

    expect(screen.getByText(/549/)).toBeInTheDocument()
    const summaryButton = screen.getByRole("button", {
      name: "Podsumowanie zamówienia",
    })
    expect(summaryButton).toBeEnabled()
    fireEvent.click(summaryButton)
    expect(onGoToSummary).toHaveBeenCalledOnce()
  })

  it("shows disabled summary CTA before configuration is complete", () => {
    render(
      <ConfiguratorV2StickyBar
        priceBreakdown={{
          basePrice: 0,
          discount: 0,
          priceAfterDiscount: 0,
          totalPrice: 0,
        }}
        isConfigComplete={false}
        showSummaryCta
        onGoToSummary={vi.fn()}
      />,
    )

    expect(
      screen.getByText("Wybierz wariant aby zobaczyć cenę"),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Podsumowanie zamówienia" }),
    ).toBeDisabled()
  })

  it("calls onPriceClick when price area clicked", () => {
    const onPriceClick = vi.fn()

    render(
      <ConfiguratorV2StickyBar
        priceBreakdown={baseBreakdown}
        isConfigComplete
        showSummaryCta
        onGoToSummary={vi.fn()}
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
        isConfigComplete
        showSummaryCta
        onGoToSummary={vi.fn()}
      />,
    )

    expect(screen.getByText(/Rabat: -51,00 zł/)).toBeInTheDocument()
  })

  it("uses column variant for desktop footer placement", () => {
    const { container } = render(
      <ConfiguratorV2StickyBar
        priceBreakdown={baseBreakdown}
        isConfigComplete
        showSummaryCta
        onGoToSummary={vi.fn()}
        variant="column"
      />,
    )

    const bar = container.firstChild as HTMLElement
    expect(bar).toHaveAttribute("data-variant", "column")
    expect(bar.className).toContain("relative")
    expect(bar.className).not.toContain("fixed")
  })
})
