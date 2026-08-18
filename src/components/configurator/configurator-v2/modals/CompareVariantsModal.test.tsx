import "@testing-library/jest-dom/vitest"
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { CompareVariantsModal } from "./CompareVariantsModal"

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    ...props
  }: {
    src: string
    alt?: string
    fill?: boolean
  }) => <img src={src} alt={alt ?? ""} {...props} />,
}))

const mockVariants = [
  {
    key: "front",
    label: "Starter",
    basePrice: 400,
    priceAfterDiscount: 360,
    discount: 40,
  },
  {
    key: "premium",
    label: "Premium",
    basePrice: 600,
    priceAfterDiscount: 549,
    discount: 51,
  },
]

describe("CompareVariantsModal", () => {
  it("renders variant cards when open", () => {
    render(
      <CompareVariantsModal
        isOpen
        onClose={vi.fn()}
        pricingVariants={mockVariants}
        pricingCategoryKey="passenger_car"
      />,
    )

    expect(screen.getByText("Porównaj warianty zestawu")).toBeInTheDocument()
    expect(screen.getByText("Przód")).toBeInTheDocument()
    expect(screen.getByText("Przód + tył + bagażnik")).toBeInTheDocument()
  })

  it("does not render when closed", () => {
    render(
      <CompareVariantsModal
        isOpen={false}
        onClose={vi.fn()}
        pricingVariants={mockVariants}
      />,
    )

    expect(screen.queryByText("Porównaj warianty zestawu")).not.toBeInTheDocument()
  })
})
