import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ConfiguratorStageStepper } from "./ConfiguratorStageStepper"
import { buildStageSnapshots, stageRequirementsFromSections } from "./configuratorStages"
import { mapConfiguratorV2Sections } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"

const config: ConfiguratorState = {
  brand: "Audi",
  brandKey: "audi",
  model: "A4",
  modelFamilyKey: "a4",
  modelKey: "a4",
  generation: "B9",
  templateId: "tpl",
  recordKey: "rec",
  year: "2020",
  gearbox: "Automatyczna",
  bodyType: "Sedan",
  bodyTypeKey: "sedan",
  pricingCategoryKey: "passenger_car",
  catalogVersionCode: "v1",
  matType: "3d-with-rims",
  variant: "",
  structure: "diamonds",
  color: "black",
  edgeColor: "black",
  heelPad: false,
}

describe("ConfiguratorStageStepper", () => {
  it("shows every stage name and lets a completed stage be edited", () => {
    const onOpen = vi.fn()
    const input = stageRequirementsFromSections(
      mapConfiguratorV2Sections({
        config: { ...config, variant: "premium" },
        skipMatTypeStep: false,
        totalPrice: 549,
      }).sections,
    )

    render(
      <ConfiguratorStageStepper
        stages={buildStageSnapshots(4, input)}
        onOpen={onOpen}
      />,
    )

    expect(screen.getByRole("navigation", { name: "Etapy konfiguracji" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /1\. Samochód, gotowe/ })).toBeEnabled()
    expect(screen.getByRole("button", { name: /4\. Akcesoria, teraz/ })).toHaveAttribute(
      "aria-current",
      "step",
    )

    fireEvent.click(screen.getByRole("button", { name: /1\. Samochód, gotowe/ }))
    expect(onOpen).toHaveBeenCalledWith(1)
  })

  it("does not open a locked stage", () => {
    const onOpen = vi.fn()
    const input = stageRequirementsFromSections(
      mapConfiguratorV2Sections({
        config,
        skipMatTypeStep: false,
        totalPrice: 0,
      }).sections,
    )

    render(
      <ConfiguratorStageStepper
        stages={buildStageSnapshots(2, input)}
        onOpen={onOpen}
      />,
    )

    const locked = screen.getByRole("button", { name: /3\. Wygląd, zablokowany/ })
    expect(locked).toHaveAttribute("aria-disabled", "true")
    fireEvent.click(locked)
    expect(onOpen).not.toHaveBeenCalled()
  })
})
