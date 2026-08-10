import { describe, expect, it } from "vitest"
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"
import { resolveVehiclePreviewContext } from "./resolveVehiclePreviewContext"

const baseConfig: ConfiguratorState = {
  brand: "",
  brandKey: "",
  model: "",
  modelFamilyKey: "",
  modelKey: "",
  generation: "",
  templateId: "",
  recordKey: "",
  year: "",
  bodyType: "",
  bodyTypeKey: "",
  pricingCategoryKey: "",
  catalogVersionCode: "",
  matType: "3d-with-rims",
  variant: "",
  structure: "diamonds",
  color: "black",
  edgeColor: "black",
  heelPad: false,
}

describe("resolveVehiclePreviewContext", () => {
  it("uses URL params on locked entry before config is hydrated", () => {
    const result = resolveVehiclePreviewContext(baseConfig, {
      isLocked: true,
      brandParam: "audi",
      modelParam: "80",
      bodyTypeParam: "sedan",
      generationParam: "3 gen",
    })

    expect(result.isVehiclePreviewReady).toBe(true)
    expect(result.bodyType).toBe("sedan")
  })

  it("requires generation (modelKey) when entry is not locked", () => {
    const result = resolveVehiclePreviewContext(
      {
        ...baseConfig,
        brand: "Audi",
        model: "80",
        bodyType: "sedan",
      },
      {
        isLocked: false,
        brandParam: null,
        modelParam: null,
        bodyTypeParam: null,
        generationParam: null,
      },
    )

    expect(result.isVehiclePreviewReady).toBe(false)
  })

  it("is ready after generation without year", () => {
    const result = resolveVehiclePreviewContext(
      {
        ...baseConfig,
        brand: "Nissan",
        model: "Qashqai(J12) III gen",
        modelKey: "Qashqai(J12) III gen",
        generation: "2021-2028",
      },
      {
        isLocked: false,
        brandParam: null,
        modelParam: null,
        bodyTypeParam: null,
        generationParam: null,
      },
    )

    expect(result.isVehiclePreviewReady).toBe(true)
  })
})
