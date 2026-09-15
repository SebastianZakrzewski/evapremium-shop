import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { VariantSection } from "./VariantSection"
import { VARIANT_TRUNK_MAT_RIM_NOTICE_LABEL } from "../variant/trunkMatRimNotice"

const completeVariant = {
  key: "complete",
  label: "Mata do bagażnika",
  basePrice: 350,
  priceAfterDiscount: 280,
  discount: 70,
}

const readiness = {
  isComplete: true,
  isDisabled: false,
}

describe("VariantSection", () => {
  it("shows trunk mat rim notice after selecting mata with 3D z rantami", () => {
    render(
      <VariantSection
        config={{ variant: "complete", matType: "3d-with-rims" }}
        pricingVariants={[completeVariant]}
        readiness={readiness}
        onUpdate={vi.fn()}
      />,
    )

    expect(
      screen.getByText(VARIANT_TRUNK_MAT_RIM_NOTICE_LABEL),
    ).toBeInTheDocument()
  })

  it("hides trunk mat rim notice until a trunk set is selected", () => {
    render(
      <VariantSection
        config={{ variant: "front", matType: "3d-with-rims" }}
        pricingVariants={[
          {
            key: "front",
            label: "Przód",
            basePrice: 290,
            priceAfterDiscount: 232,
            discount: 58,
          },
          completeVariant,
        ]}
        readiness={readiness}
        onUpdate={vi.fn()}
      />,
    )

    expect(
      screen.queryByText(VARIANT_TRUNK_MAT_RIM_NOTICE_LABEL),
    ).not.toBeInTheDocument()
  })
})
