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
    expect(screen.getByRole("complementary", { name: "Podgląd produktu" })).toBeInTheDocument()
    expect(screen.getByText("Etapy").parentElement?.parentElement).toHaveClass(
      "hidden",
      "lg:block",
    )
  })

  it("keeps the desktop summary in the configurator card beside the preview", () => {
    render(
      <ConfiguratorV2Layout
        topBar={<div>Góra</div>}
        stageNav={<div>Etapy</div>}
        specsBar={<div>Parametry</div>}
        previewPanel={<div>Podgląd</div>}
        mobilePreview={<div>Podgląd mobile</div>}
        optionPanel={<div>Podsumowanie zamówienia</div>}
        stickyBarMobile={<div>Pasek</div>}
        fullScreen
      />,
    )

    const panel = document.querySelector("[data-configurator-panel]")
    expect(panel).toHaveAttribute("data-content-layout", "full")
    expect(panel).toHaveClass("max-lg:min-h-full")
    expect(panel).not.toHaveClass("min-h-full")
    expect(screen.getByRole("complementary", { name: "Podgląd produktu" })).toBeInTheDocument()
    expect(screen.queryByText("Podgląd mobile")).not.toBeInTheDocument()
    expect(screen.getByText("Podsumowanie zamówienia")).toBeInTheDocument()
  })
})
