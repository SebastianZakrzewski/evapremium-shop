import { describe, expect, it } from "vitest"
import { buildRealizationPreviewCaption } from "./buildRealizationPreviewCaption"

describe("buildRealizationPreviewCaption", () => {
  it("builds caption for 3D z rantami with brand model generation", () => {
    expect(
      buildRealizationPreviewCaption({
        matType: "3d-with-rims",
        brand: "Nissan",
        model: "Qashqai(J12) III gen",
        generation: "2021-2028",
      }),
    ).toBe(
      "Są to realne zdjęcia realizacji dywaników 3D z rantami do Nissan Qashqai(J12) III gen 2021-2028",
    )
  })

  it("builds caption for 3D bez rantów", () => {
    expect(
      buildRealizationPreviewCaption({
        matType: "classic",
        brand: "Nissan",
        model: "Qashqai(J12) III gen",
        generation: "2021-2028",
      }),
    ).toBe(
      "Są to realne zdjęcia realizacji dywaników 3D bez rantów do Nissan Qashqai(J12) III gen 2021-2028",
    )
  })

  it("skips generation when already present in model label", () => {
    expect(
      buildRealizationPreviewCaption({
        matType: "3d-with-rims",
        brand: "BMW",
        model: "3 Compact 1990-2000",
        generation: "1990-2000",
      }),
    ).toBe(
      "Są to realne zdjęcia realizacji dywaników 3D z rantami do BMW 3 Compact 1990-2000",
    )
  })

  it("returns null when vehicle identity is incomplete", () => {
    expect(
      buildRealizationPreviewCaption({
        matType: "3d-with-rims",
        brand: "Nissan",
        model: "",
      }),
    ).toBeNull()
  })
})
