import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { VariantTunnelBonusNotice } from "./VariantTunnelBonusNotice"
import { VARIANT_TUNNEL_BONUS_ALT, VARIANT_TUNNEL_BONUS_LABEL } from "./variantTunnelBonus"

describe("VariantTunnelBonusNotice", () => {
  it("renders tunnel bonus information", () => {
    render(<VariantTunnelBonusNotice />)

    expect(screen.getByText(VARIANT_TUNNEL_BONUS_LABEL)).toBeInTheDocument()
    expect(
      screen.getByText(
        "Pokrycie tunelu środkowego jest zawsze w komplecie — bez dodatkowej opłaty.",
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole("img", { name: VARIANT_TUNNEL_BONUS_ALT })).toBeInTheDocument()
  })
})
