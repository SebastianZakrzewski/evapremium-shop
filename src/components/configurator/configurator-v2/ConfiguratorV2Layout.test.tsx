import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ConfiguratorV2Layout } from "./ConfiguratorV2Layout"

describe("ConfiguratorV2Layout", () => {
  it("keeps the stage content in a rounded panel inset from the frame", () => {
    render(
      <ConfiguratorV2Layout
        topBar={<div>Góra</div>}
        stageNav={<div>Etapy</div>}
        specsBar={<div>Parametry</div>}
        previewPanel={<div>Podgląd</div>}
        optionPanel={<button type="button">Marka</button>}
        stickyBarMobile={<div>Pasek</div>}
      />,
    )

    const panel = document.querySelector("[data-configurator-panel]")
    expect(panel).toHaveClass("rounded-2xl", "bg-[#FDFDFD]", "px-3", "flex")
    expect(panel).not.toHaveClass("overflow-hidden")
    expect(panel?.parentElement).toHaveClass("px-3", "bg-[#E6E6E6]")
    expect(screen.getByRole("button", { name: "Marka" })).toBeInTheDocument()
  })
})
