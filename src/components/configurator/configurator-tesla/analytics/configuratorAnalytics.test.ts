import { beforeEach, describe, expect, it } from "vitest"
import {
  CONFIGURATOR_STEP_BY_SECTION,
  SECTION_VIEW_EVENT,
  STEP_COMPLETE_EVENT,
  trackConfiguratorSectionView,
  trackConfiguratorStepComplete,
} from "./configuratorAnalytics"

describe("configurator analytics", () => {
  beforeEach(() => {
    window.dataLayer = []
    window.sessionStorage.clear()
  })

  it("keeps the old etap numbers on the new sections", () => {
    expect(CONFIGURATOR_STEP_BY_SECTION.vehicle.etap).toBe(1)
    expect(CONFIGURATOR_STEP_BY_SECTION.variant.etap).toBe(2)
    expect(CONFIGURATOR_STEP_BY_SECTION.appearance.etap).toBe(3)
    expect(CONFIGURATOR_STEP_BY_SECTION.accessories.etap).toBe(4)
    expect(CONFIGURATOR_STEP_BY_SECTION.summary.etap).toBe(5)
  })

  it("fires a section view once per session", () => {
    trackConfiguratorSectionView({
      sectionId: "section-zestaw",
      sectionName: "Zestaw",
      etap: 2,
    })
    trackConfiguratorSectionView({
      sectionId: "section-zestaw",
      sectionName: "Zestaw",
      etap: 2,
    })
    const events = (window.dataLayer ?? [])
      .map((entry) => Array.from(entry as ArrayLike<unknown>))
      .filter((entry) => entry[1] === SECTION_VIEW_EVENT)
    expect(events).toHaveLength(1)
  })

  it("fires step completion with the legacy step name", () => {
    trackConfiguratorStepComplete("variant")
    const event = (window.dataLayer ?? [])
      .map((entry) => Array.from(entry as ArrayLike<unknown>))
      .find((entry) => entry[1] === STEP_COMPLETE_EVENT)
    expect(event).toEqual([
      "event",
      STEP_COMPLETE_EVENT,
      {
        etap: 2,
        step_name: "Dywaniki i zestaw",
        section_id: "section-zestaw",
      },
    ])
  })
})
