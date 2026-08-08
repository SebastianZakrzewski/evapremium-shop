import { describe, expect, it } from "vitest"
import {
  computeLockedCarAvailableYears,
  isCatalogResolving,
  resolveLockedCarGeneration,
} from "../lockedCarContextLogic"

const civicTemplates = [
  {
    modelKey: "civic_8_gen_coupe",
    generation: "2005-2012",
    yearFrom: 2005,
    yearTo: 2012,
  },
  {
    modelKey: "civic_8_gen_hatchback",
    generation: "2005-2012",
    yearFrom: 2005,
    yearTo: 2012,
  },
]

describe("isCatalogResolving", () => {
  it("does not block UI when cached models exist during background refetch", () => {
    expect(
      isCatalogResolving({
        isModelsQueryLoading: true,
        modelsCount: 12,
        isTemplatesQueryLoading: false,
        templatesCount: 0,
        hasTemplateQuery: false,
      }),
    ).toBe(false)
  })

  it("blocks UI only when models are loading and cache is empty", () => {
    expect(
      isCatalogResolving({
        isModelsQueryLoading: true,
        modelsCount: 0,
        isTemplatesQueryLoading: false,
        templatesCount: 0,
        hasTemplateQuery: false,
      }),
    ).toBe(true)
  })
})

describe("resolveLockedCarGeneration", () => {
  it("resolves generation when generation param matches a single entry", () => {
    const resolved = resolveLockedCarGeneration({
      generations: [civicTemplates[0]],
      selectedGeneration: null,
      modelResolution: {
        mode: "single",
        family: { key: "Civic 8 gen", name: "Civic 8 gen" },
        displayName: "Civic 8 gen",
      },
      modelParam: "Civic 8 gen",
      generationParam: "2005-2012",
    })

    expect(resolved).toEqual(civicTemplates[0])
  })

  it("returns null when multiple generations match the same generation param", () => {
    const resolved = resolveLockedCarGeneration({
      generations: civicTemplates,
      selectedGeneration: null,
      modelResolution: {
        mode: "single",
        family: { key: "Civic 8 gen", name: "Civic 8 gen" },
        displayName: "Civic 8 gen",
      },
      modelParam: "Civic 8 gen",
      generationParam: "2005-2012",
    })

    expect(resolved).toBeNull()
  })
})

describe("computeLockedCarAvailableYears", () => {
  it("returns years from templates when resolvedGeneration is null", () => {
    expect(
      computeLockedCarAvailableYears({
        yearParam: null,
        generationParam: "2005-2012",
        resolvedGeneration: null,
        templates: civicTemplates,
      }),
    ).toEqual([2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005])
  })

  it("falls back to generation param range when templates are not loaded yet", () => {
    expect(
      computeLockedCarAvailableYears({
        yearParam: null,
        generationParam: "2005-2012",
        resolvedGeneration: null,
        templates: [],
      }),
    ).toEqual([2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005])
  })
})
