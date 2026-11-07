import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ConfiguratorV2SectionShell } from "./ConfiguratorV2SectionShell"
import {
  CONFIGURATOR_V2_INITIALLY_OPEN_SECTION_IDS,
  ConfiguratorV2OptionsProvider,
} from "../option-search/ConfiguratorV2OptionsProvider"

const readiness = { isComplete: false, isDisabled: false }

describe("ConfiguratorV2SectionShell", () => {
  it("starts open outside the configurator provider and collapses on the header", () => {
    render(
      <ConfiguratorV2SectionShell
        id="section-variant"
        title="Wariant zestawu"
        readiness={readiness}
      >
        <p>Opcje wariantu</p>
      </ConfiguratorV2SectionShell>,
    )

    expect(screen.getByText("Opcje wariantu")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Wariant zestawu" }))
    expect(screen.getByRole("button", { name: "Wariant zestawu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    )
    expect(document.getElementById("section-variant-panel")).toHaveAttribute("hidden")
  })

  it("opens only the first available section and filters by header", () => {
    render(
      <ConfiguratorV2OptionsProvider
        query="kolor"
        initiallyOpenSectionIds={CONFIGURATOR_V2_INITIALLY_OPEN_SECTION_IDS}
      >
        <ConfiguratorV2SectionShell
          id="section-vehicle"
          title="Wybór samochodu"
          readiness={readiness}
        >
          <p>Pola pojazdu</p>
        </ConfiguratorV2SectionShell>
        <ConfiguratorV2SectionShell
          id="section-color"
          title="Kolor materiału"
          readiness={readiness}
        >
          <p>Próbki koloru</p>
        </ConfiguratorV2SectionShell>
      </ConfiguratorV2OptionsProvider>,
    )

    expect(document.getElementById("section-vehicle")).toHaveAttribute("hidden")
    expect(screen.getByRole("button", { name: "Kolor materiału" })).toHaveAttribute(
      "aria-expanded",
      "true",
    )
    expect(screen.getByText("Próbki koloru")).toBeInTheDocument()
  })

  it("opens collapsed sections on a phone without a click", () => {
    const originalMatchMedia = window.matchMedia
    window.matchMedia = ((query: string) => ({
      matches: query === "(max-width: 1023px)",
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia

    render(
      <ConfiguratorV2OptionsProvider
        query=""
        initiallyOpenSectionIds={CONFIGURATOR_V2_INITIALLY_OPEN_SECTION_IDS}
      >
        <ConfiguratorV2SectionShell
          id="section-matType"
          title="Typ dywanika"
          readiness={readiness}
        >
          <p>Warianty dywanika</p>
        </ConfiguratorV2SectionShell>
      </ConfiguratorV2OptionsProvider>,
    )

    expect(screen.getByRole("button", { name: "Typ dywanika" })).toHaveAttribute(
      "aria-expanded",
      "true",
    )
    expect(screen.getByText("Warianty dywanika")).toBeVisible()
    expect(document.getElementById("section-matType-panel")).not.toHaveAttribute("hidden")

    window.matchMedia = originalMatchMedia
  })
})
