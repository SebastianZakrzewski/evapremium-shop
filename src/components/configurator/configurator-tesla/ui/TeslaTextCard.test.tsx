import "@testing-library/jest-dom/vitest"
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { TeslaTextCard } from "./TeslaTextCard"

describe("TeslaTextCard", () => {
  it("shows the list price struck through and marks the sale price as after discount", () => {
    render(
      <TeslaTextCard
        selected={false}
        title="Przód + tył"
        priceLabel="568 zł"
        comparePriceLabel="710 zł"
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByText("710 zł")).toHaveClass("line-through")
    expect(screen.getByText("568 zł")).toBeInTheDocument()
    expect(screen.getByText("po rabacie")).toBeInTheDocument()
  })

  it("keeps a single price when there is no discount", () => {
    render(
      <TeslaTextCard
        selected
        title="Kolor"
        priceLabel="W zestawie"
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByText("W zestawie")).toBeInTheDocument()
    expect(screen.queryByText("po rabacie")).not.toBeInTheDocument()
  })
})
