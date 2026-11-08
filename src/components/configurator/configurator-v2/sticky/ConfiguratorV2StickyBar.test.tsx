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
  it("moves forward when the current stage is complete", () => {
    const onForward = vi.fn()

    render(
      <ConfiguratorV2StickyBar
        priceBreakdown={baseBreakdown}
        isConfigComplete
        showBack={false}
        onBack={vi.fn()}
        showForward
        forwardDisabled={false}
        onForward={onForward}
      />,
    )

    expect(screen.getByText(/549/)).toBeInTheDocument()
    const forward = screen.getByRole("button", { name: "Dalej" })
    expect(forward).toBeEnabled()
    fireEvent.click(forward)
    expect(onForward).toHaveBeenCalledOnce()
    expect(screen.queryByRole("button", { name: "Wstecz" })).not.toBeInTheDocument()
  })

  it("explains why Dalej is unavailable", () => {
    render(
      <ConfiguratorV2StickyBar
        priceBreakdown={{
          basePrice: 0,
          discount: 0,
          priceAfterDiscount: 0,
          totalPrice: 0,
        }}
        isConfigComplete={false}
        showBack={false}
        onBack={vi.fn()}
        showForward
        forwardDisabled
        forwardDisabledReason="Aby przejść dalej, wybierz: rok produkcji."
        onForward={vi.fn()}
      />,
    )

    expect(screen.queryByText("Wybierz wariant aby zobaczyć cenę")).not.toBeInTheDocument()
    const forward = screen.getByRole("button", { name: "Dalej" })
    expect(forward).toBeDisabled()
    expect(forward).toHaveAttribute("aria-describedby", "configurator-forward-hint-fixed")
    expect(screen.getByText("Aby przejść dalej, wybierz: rok produkcji.")).toBeInTheDocument()
  })

  it("calls onPriceClick when price area clicked", () => {
    const onPriceClick = vi.fn()

    render(
      <ConfiguratorV2StickyBar
        priceBreakdown={baseBreakdown}
        isConfigComplete
        showBack
        onBack={vi.fn()}
        showForward
        forwardDisabled={false}
        onForward={vi.fn()}
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
        showBack={false}
        onBack={vi.fn()}
        showForward
        forwardDisabled={false}
        onForward={vi.fn()}
      />,
    )

    const price = screen.getByText(/549/)
    const discount = screen.getByText(/Rabat: -51,00 zł/)
    expect(price.className).toContain("text-green-400")
    expect(discount.className).toContain("text-white/45")
    expect(discount.className).not.toMatch(/text-red/)
  })

  it("uses column variant for desktop footer placement", () => {
    const { container } = render(
      <ConfiguratorV2StickyBar
        priceBreakdown={baseBreakdown}
        isConfigComplete
        showBack
        onBack={vi.fn()}
        showForward={false}
        forwardDisabled={false}
        onForward={vi.fn()}
        variant="column"
      />,
    )

    const bar = container.firstChild as HTMLElement
    expect(bar).toHaveAttribute("data-variant", "column")
    expect(bar.className).toContain("relative")
    expect(bar.className).not.toContain("fixed")
  })

  it("shows the current step above back and forward", () => {
    render(
      <ConfiguratorV2StickyBar
        priceBreakdown={baseBreakdown}
        isConfigComplete
        showBack
        onBack={vi.fn()}
        showForward
        forwardDisabled={false}
        onForward={vi.fn()}
        currentStage={2}
      />,
    )

    const progress = screen.getByRole("progressbar", { name: "Krok 2 z 5" })
    expect(progress).toHaveAttribute("aria-valuenow", "2")
    expect(progress).toHaveAttribute("aria-valuemin", "1")
    expect(progress).toHaveAttribute("aria-valuemax", "5")
    const segments = progress.querySelectorAll("[data-progress-segment]")
    expect(segments).toHaveLength(5)
    expect(segments[0]).toHaveAttribute("data-reached", "true")
    expect(segments[1]).toHaveAttribute("data-reached", "true")
    expect(segments[2]).toHaveAttribute("data-reached", "false")
    expect(segments[3]).toHaveAttribute("data-reached", "false")
    expect(segments[0]).toHaveClass("bg-red-600")
    expect(segments[1]).toHaveClass("bg-red-600")
    expect(segments[2]).toHaveClass("bg-white/25")
    expect(segments[2]).not.toHaveClass("bg-red-600")
    expect(
      progress.compareDocumentPosition(screen.getByRole("button", { name: "Wstecz" })),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(
      progress.compareDocumentPosition(screen.getByRole("button", { name: "Dalej" })),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it("renders the desktop header with back and forward actions", () => {
    const onBack = vi.fn()
    render(
      <ConfiguratorV2StickyBar
        priceBreakdown={baseBreakdown}
        isConfigComplete
        showBack
        onBack={onBack}
        showForward
        forwardDisabled={false}
        onForward={vi.fn()}
        variant="header"
      />,
    )

    expect(screen.getByRole("link", { name: "Zmień model" })).toHaveAttribute(
      "href",
      "/modele",
    )
    fireEvent.click(screen.getByRole("button", { name: "Wstecz" }))
    expect(onBack).toHaveBeenCalledOnce()
    const forward = screen.getByRole("button", { name: "Dalej" })
    expect(forward).toBeEnabled()
    expect(forward).toHaveClass("min-w-[9.5rem]", "h-12", "text-[15px]")
    const reached = screen
      .getByRole("progressbar", { name: "Krok 1 z 5" })
      .querySelector("[data-reached='true']")
    expect(reached).toHaveClass("bg-red-600")
    expect(reached).not.toHaveClass("bg-white")
  })
})
