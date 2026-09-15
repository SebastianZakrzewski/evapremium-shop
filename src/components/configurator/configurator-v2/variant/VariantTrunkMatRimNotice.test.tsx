import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { VariantTrunkMatRimNotice } from "./VariantTrunkMatRimNotice"
import {
  VARIANT_TRUNK_MAT_RIM_NOTICE_ALT,
  VARIANT_TRUNK_MAT_RIM_NOTICE_BODY,
  VARIANT_TRUNK_MAT_RIM_NOTICE_ICON_SRC,
  VARIANT_TRUNK_MAT_RIM_NOTICE_LABEL,
} from "./trunkMatRimNotice"

describe("VariantTrunkMatRimNotice", () => {
  it("renders trunk mat rim clarification", () => {
    render(<VariantTrunkMatRimNotice />)

    expect(
      screen.getByText(VARIANT_TRUNK_MAT_RIM_NOTICE_LABEL),
    ).toBeInTheDocument()
    expect(
      screen.getByText(VARIANT_TRUNK_MAT_RIM_NOTICE_BODY),
    ).toBeInTheDocument()
    const image = screen.getByRole("img", {
      name: VARIANT_TRUNK_MAT_RIM_NOTICE_ALT,
    })
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute("src", expect.stringContaining("mata-bagaznika-produkt"))
  })
})
