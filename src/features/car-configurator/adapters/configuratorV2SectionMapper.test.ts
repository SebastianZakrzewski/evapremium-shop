import { describe, expect, it } from "vitest"
import { mapConfiguratorV2Sections } from "./configuratorV2SectionMapper"
import type { ConfiguratorState } from "../utils/configuratorState"

const baseConfig: ConfiguratorState = {
  brand: "Audi",
  brandKey: "audi",
  model: "A4",
  modelFamilyKey: "a4",
  modelKey: "a4-b9",
  generation: "B9",
  templateId: "tpl-1",
  recordKey: "rec-1",
  year: "2020",
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

describe("mapConfiguratorV2Sections", () => {
  it("disables downstream sections until vehicle is complete", () => {
    const result = mapConfiguratorV2Sections({
      config: { ...baseConfig, brand: "", year: "" },
      skipMatTypeStep: false,
      totalPrice: 0,
    })

    expect(result.sections.vehicle.isComplete).toBe(false)
    expect(result.sections.matType.isDisabled).toBe(true)
    expect(result.sections.variant.isDisabled).toBe(true)
    expect(result.isReadyForCart).toBe(false)
  })

  it("cascades disabled state through mat type and variant", () => {
    const result = mapConfiguratorV2Sections({
      config: { ...baseConfig, variant: "" },
      skipMatTypeStep: false,
      totalPrice: 0,
    })

    expect(result.sections.vehicle.isComplete).toBe(true)
    expect(result.sections.matType.isDisabled).toBe(false)
    expect(result.sections.variant.isDisabled).toBe(false)
    expect(result.sections.structure.isDisabled).toBe(true)
    expect(result.isReadyForCart).toBe(false)
  })

  it("requires catalog keys before cart is ready", () => {
    const result = mapConfiguratorV2Sections({
      config: {
        ...baseConfig,
        variant: "premium",
        recordKey: "",
        bodyTypeKey: "",
      },
      skipMatTypeStep: false,
      totalPrice: 549,
    })

    expect(result.isReadyForCart).toBe(false)
  })

  it("marks cart ready when all required fields and price are set", () => {
    const result = mapConfiguratorV2Sections({
      config: { ...baseConfig, variant: "premium" },
      skipMatTypeStep: false,
      totalPrice: 549,
      variantPricingLabel: "Premium",
    })

    expect(result.sections.structure.isDisabled).toBe(false)
    expect(result.sections.color.isComplete).toBe(true)
    expect(result.sections.edgeColor.isComplete).toBe(true)
    expect(result.isReadyForCart).toBe(true)
    expect(result.metrics[2].value).toBe("549,00 zł")
  })

  it("skips mat type section completion when single mat type vehicle", () => {
    const result = mapConfiguratorV2Sections({
      config: { ...baseConfig, matType: "single", variant: "front" },
      skipMatTypeStep: true,
      totalPrice: 399,
    })

    expect(result.sections.matType.isComplete).toBe(true)
    expect(result.isReadyForCart).toBe(true)
  })

  it("builds context line from mat type, variant and structure", () => {
    const result = mapConfiguratorV2Sections({
      config: { ...baseConfig, variant: "premium" },
      skipMatTypeStep: false,
      totalPrice: 549,
      variantPricingLabel: "Premium",
    })

    expect(result.contextLine).toContain("3D z rantami")
    expect(result.contextLine).toContain("Struktura: Romby")
  })
})
