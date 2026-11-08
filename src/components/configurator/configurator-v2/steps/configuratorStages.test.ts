import { describe, expect, it, vi } from "vitest"
import { mapConfiguratorV2Sections } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"
import { buildMatCartPayload } from "./buildMatCartPayload"
import {
  buildStageSnapshots,
  canEnterStage,
  configuratorProgressLabel,
  forwardDisabledReason,
  highestEnterableStage,
  isSectionVisibleForStage,
  parseEtapParam,
  resolveConfiguratorStage,
  stageRequirementsFromSections,
  withEtapParam,
  type StageRequirementInput,
} from "./configuratorStages"
import { explainConfigurationReset } from "./explainConfigurationReset"
import { focusStageHeading } from "./focusStageHeading"

const completeConfig: ConfiguratorState = {
  brand: "Audi",
  brandKey: "audi",
  model: "A4",
  modelFamilyKey: "a4",
  modelKey: "a4-b9",
  generation: "B9",
  templateId: "tpl-1",
  recordKey: "rec-1",
  year: "2020",
  gearbox: "Automatyczna",
  bodyType: "Sedan",
  bodyTypeKey: "sedan",
  pricingCategoryKey: "passenger_car",
  catalogVersionCode: "v1",
  matType: "3d-with-rims",
  variant: "premium",
  structure: "diamonds",
  color: "black",
  edgeColor: "red",
  heelPad: false,
}

const requirementsFor = (
  config: ConfiguratorState,
  totalPrice = 549,
): StageRequirementInput =>
  stageRequirementsFromSections(
    mapConfiguratorV2Sections({
      config,
      skipMatTypeStep: false,
      totalPrice,
      variantPricingLabel: "Premium",
    }).sections,
  )

describe("configurator stages", () => {
  it("keeps later stages locked until the previous stage is valid", () => {
    const input = requirementsFor({ ...completeConfig, variant: "", year: "" })

    expect(canEnterStage(1, input)).toBe(true)
    expect(canEnterStage(2, input)).toBe(false)
    expect(canEnterStage(3, input)).toBe(false)
    expect(canEnterStage(4, input)).toBe(false)
    expect(canEnterStage(5, input)).toBe(false)
    expect(highestEnterableStage(input)).toBe(1)
    expect(forwardDisabledReason(1, { ...completeConfig, variant: "", year: "" }, input)).toBe(
      "Aby przejść dalej, wybierz: rok produkcji.",
    )
  })

  it("unlocks the mat stage only after the catalog vehicle fields are complete", () => {
    const input = requirementsFor({ ...completeConfig, variant: "" })
    const snapshots = buildStageSnapshots(1, input)

    expect(snapshots.map((stage) => stage.status)).toEqual([
      "current",
      "available",
      "locked",
      "locked",
      "locked",
    ])
    expect(forwardDisabledReason(2, { ...completeConfig, variant: "" }, input)).toBe(
      "Aby przejść dalej, wybierz: zestaw.",
    )
  })

  it("keeps accessories optional and shows the summary as its own fifth step", () => {
    const input = requirementsFor(completeConfig)
    const snapshots = buildStageSnapshots(5, input)

    expect(snapshots).toHaveLength(5)
    expect(snapshots[3]).toMatchObject({ name: "Akcesoria", status: "completed" })
    expect(snapshots[4]).toMatchObject({ name: "Podsumowanie", status: "current" })
    expect(forwardDisabledReason(4, completeConfig, input)).toBeNull()
    expect(forwardDisabledReason(5, completeConfig, input)).toBeNull()
    expect(isSectionVisibleForStage({
      section: "accessories",
      stage: 4,
      searchActive: false,
      input,
    })).toBe(true)
    expect(isSectionVisibleForStage({
      section: "summary",
      stage: 4,
      searchActive: false,
      input,
    })).toBe(false)
    expect(isSectionVisibleForStage({
      section: "summary",
      stage: 5,
      searchActive: false,
      input,
    })).toBe(true)
  })

  it("reopens a completed stage without dropping a still-valid later choice", () => {
    const input = requirementsFor(completeConfig)

    expect(resolveConfiguratorStage(4, input)).toBe(4)
    expect(resolveConfiguratorStage(1, input)).toBe(1)
    expect(resolveConfiguratorStage(4, input)).toBe(4)
    expect(completeConfig.color).toBe("black")
    expect(completeConfig.edgeColor).toBe("red")
  })

  it("clamps a restored partial configuration instead of showing a later step", () => {
    const partial = requirementsFor({
      ...completeConfig,
      variant: "",
      structure: "honey",
      color: "black",
      edgeColor: "red",
    })

    expect(parseEtapParam("4")).toBe(4)
    expect(resolveConfiguratorStage(4, partial)).toBe(2)
    expect(isSectionVisibleForStage({
      section: "summary",
      stage: 2,
      searchActive: false,
      input: partial,
    })).toBe(false)
  })

  it("restores a complete configuration on its saved step", () => {
    const input = requirementsFor(completeConfig)

    expect(resolveConfiguratorStage(parseEtapParam("3"), input)).toBe(3)
    expect(resolveConfiguratorStage(parseEtapParam("4"), input)).toBe(4)
    expect(resolveConfiguratorStage(parseEtapParam("5"), input)).toBe(5)
  })

  it("relocks dependent stages when an earlier change clears the variant", () => {
    const next = { ...completeConfig, year: "2021", variant: "" }
    const input = requirementsFor(next)

    expect(explainConfigurationReset(completeConfig, next)).toBe(
      "Wariant zestawu został zresetowany, ponieważ nie pasuje do zmienionego wyboru. Zachowano: strukturę komórek, kolor materiału, kolor obszycia.",
    )
    expect(resolveConfiguratorStage(4, input)).toBe(2)
    expect(canEnterStage(3, input)).toBe(false)
    expect(next.structure).toBe("diamonds")
    expect(next.color).toBe("black")
  })

  it("keeps a compatible variant when only appearance changes", () => {
    const next = { ...completeConfig, color: "grey" }

    expect(explainConfigurationReset(completeConfig, next)).toBeNull()
    expect(resolveConfiguratorStage(3, requirementsFor(next))).toBe(3)
    expect(next.variant).toBe("premium")
  })

  it("stays quiet when a new brand and model clear the whole configuration", () => {
    const next = {
      ...completeConfig,
      brand: "BMW",
      model: "X5",
      year: "",
      variant: "",
      matType: "classic" as const,
    }

    expect(explainConfigurationReset(completeConfig, next)).toBeNull()
  })

  it("explains a mat type change that also clears the variant", () => {
    const next = { ...completeConfig, matType: "classic" as const, variant: "" }

    expect(explainConfigurationReset(completeConfig, next)).toContain("Typ dywanika i wariant zestawu")
    expect(explainConfigurationReset(completeConfig, next)).toContain("Zachowano")
  })

  it("preserves the year query when the step is written to the URL", () => {
    const next = withEtapParam("brand=audi&model=a4&year=2020", 2)
    const params = new URLSearchParams(next)

    expect(params.get("year")).toBe("2020")
    expect(params.get("brand")).toBe("audi")
    expect(params.get("etap")).toBe("2")
    expect(parseEtapParam("9")).toBeNull()
  })

  it("shows searchable sections from unlocked stages and hides a locked one", () => {
    const input = requirementsFor({ ...completeConfig, variant: "" })

    expect(isSectionVisibleForStage({
      section: "vehicle",
      stage: 2,
      searchActive: true,
      input,
    })).toBe(true)
    expect(isSectionVisibleForStage({
      section: "color",
      stage: 2,
      searchActive: true,
      input,
    })).toBe(false)
    expect(isSectionVisibleForStage({
      section: "variant",
      stage: 2,
      searchActive: false,
      input,
    })).toBe(true)
  })

  it("returns to review after an edit with the same basket configuration", () => {
    const input = requirementsFor(completeConfig)
    expect(resolveConfiguratorStage(4, input)).toBe(4)
    expect(resolveConfiguratorStage(3, input)).toBe(3)

    const payload = buildMatCartPayload({
      config: completeConfig,
      price: { basePrice: 600, priceAfterDiscount: 549, totalPrice: 549 },
      productId: "11111111-1111-1111-1111-111111111111",
      productImage: "/images/mat.webp",
      setVariantLabel: "Premium",
    })

    expect(resolveConfiguratorStage(4, input)).toBe(4)
    expect(payload).toEqual({
      productType: "mat",
      productId: "11111111-1111-1111-1111-111111111111",
      quantity: 1,
      unitPrice: 549,
      productName: "Dywaniki Audi A4",
      productSku: "MAT-AUDI-A4",
      productImage: "/images/mat.webp",
      configuration: {
        carDetails: {
          brand: "Audi",
          brandKey: "audi",
          model: "A4",
          modelFamilyKey: "a4",
          modelKey: "a4-b9",
          generation: "B9",
          year: "2020",
          gearbox: "Automatyczna",
          bodyType: "Sedan",
          bodyTypeKey: "sedan",
          recordKey: "rec-1",
          templateId: "tpl-1",
        },
        pricing: {
          pricingCategoryKey: "passenger_car",
          catalogVersionCode: "v1",
          basePrice: 600,
          priceAfterDiscount: 549,
          totalPrice: 549,
        },
        setType: "3d-with-rims",
        setVariant: "premium",
        setVariantLabel: "Premium",
        cellType: "diamonds",
        materialColor: "black",
        edgeColor: "red",
      },
    })
  })

  it("names the current step without treating it as field completion", () => {
    const complete = requirementsFor(completeConfig)
    const partial = requirementsFor({ ...completeConfig, variant: "" })

    expect(configuratorProgressLabel(1)).toBe("Krok 1 z 5")
    expect(configuratorProgressLabel(resolveConfiguratorStage(2, complete))).toBe("Krok 2 z 5")
    expect(configuratorProgressLabel(resolveConfiguratorStage(1, complete))).toBe("Krok 1 z 5")
    expect(configuratorProgressLabel(resolveConfiguratorStage(4, complete))).toBe("Krok 4 z 5")
    expect(configuratorProgressLabel(resolveConfiguratorStage(5, complete))).toBe("Krok 5 z 5")
    expect(configuratorProgressLabel(resolveConfiguratorStage(5, partial))).toBe("Krok 2 z 5")
    expect(configuratorProgressLabel(resolveConfiguratorStage(3, partial))).toBe("Krok 2 z 5")
  })

  it("moves focus to the stage heading without scrolling the window", () => {
    const scroller = document.createElement("main")
    scroller.setAttribute("data-configurator-options", "")
    const heading = document.createElement("h2")
    heading.tabIndex = -1
    scroller.appendChild(heading)
    document.body.appendChild(scroller)

    const focus = vi.spyOn(heading, "focus").mockImplementation(() => undefined)
    heading.getBoundingClientRect = () =>
      ({ top: 180, bottom: 220, left: 0, right: 100, width: 100, height: 40, x: 0, y: 180, toJSON: () => ({}) })
    scroller.getBoundingClientRect = () =>
      ({ top: 80, bottom: 400, left: 0, right: 100, width: 100, height: 320, x: 0, y: 80, toJSON: () => ({}) })

    focusStageHeading(heading)

    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
    expect(scroller.scrollTop).toBe(100)
    expect(window.scrollY).toBe(0)
    scroller.remove()
  })
})
