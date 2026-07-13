import { describe, expect, it } from "vitest";
import {
  getConfigUpdatesFromUrl,
  mergeStoredConfig,
  resolveBrandFromParam,
  type ConfiguratorState,
} from "../configuratorState";
import type { Brand } from "@/entities/car";

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
  variant: "front",
  structure: "diamonds",
  color: "black",
  edgeColor: "black",
  heelPad: false,
  selectedPodpietka: undefined,
  podpietkaColor: undefined,
};

describe("resolveBrandFromParam", () => {
  const brands: Brand[] = [
    { id: 1, name: "BMW", logo: "/bmw.png" },
    { id: 2, name: "Audi", logo: "/audi.png" },
  ];

  it("uses matching brand name from list", () => {
    expect(resolveBrandFromParam("bmw", brands)).toBe("BMW");
  });

  it("capitalizes when brand is not in list", () => {
    expect(resolveBrandFromParam("volvo", brands)).toBe("Volvo");
  });
});

describe("getConfigUpdatesFromUrl", () => {
  it("does not oscillate model casing between URL slug and API canonical name", () => {
    const previous: ConfiguratorState = {
      ...baseConfig,
      brand: "Kia",
      model: "Ceed",
    };

    const updates = getConfigUpdatesFromUrl({
      previous,
      urlParams: { modelParam: "ceed" },
      brands: [],
    });

    expect(updates).toEqual({});
  });

  it("clears year when URL model changes on locked entry", () => {
    const previous: ConfiguratorState = {
      ...baseConfig,
      brand: "BMW",
      model: "3 G20",
      year: "2022",
      bodyType: "sedan",
    };

    const updates = getConfigUpdatesFromUrl({
      previous,
      urlParams: { brandParam: "bmw", modelParam: "3 E-46" },
      brands: [],
    });

    expect(updates).toMatchObject({
      model: "3 E-46",
      year: "",
      bodyType: "",
    });
  });

  it("ignores year param when model is in URL", () => {
    const previous: ConfiguratorState = {
      ...baseConfig,
      brand: "BMW",
      model: "3 G20",
      year: "",
    };

    const updates = getConfigUpdatesFromUrl({
      previous,
      urlParams: {
        brandParam: "bmw",
        modelParam: "3 G20",
        yearParam: "2020",
      },
      brands: [{ id: 1, name: "BMW", logo: "/bmw.png" }],
    });

    expect(updates.year).toBeUndefined();
  });
});

describe("mergeStoredConfig", () => {
  it("keeps URL brand and overrides model/bodyType from URL", () => {
    const previous: ConfiguratorState = {
      ...baseConfig,
      brand: "BMW",
      model: "3-series",
      bodyType: "sedan",
    };

    const stored: ConfiguratorState = {
      ...baseConfig,
      brand: "Audi",
      model: "A4",
      bodyType: "wagon",
      matType: "classic",
    };

    const merged = mergeStoredConfig({
      previous,
      stored,
      urlParams: {
        brandParam: "bmw",
        modelParam: "3-series",
        bodyTypeParam: "sedan",
      },
    });

    expect(merged.brand).toBe("BMW");
    expect(merged.model).toBe("3-series");
    expect(merged.bodyType).toBe("sedan");
    expect(merged.matType).toBe("classic");
  });

  it("preserves canonical model casing when URL slug differs only by case", () => {
    const previous: ConfiguratorState = {
      ...baseConfig,
      brand: "Kia",
      model: "Ceed",
      bodyType: "Hatchback",
    };

    const merged = mergeStoredConfig({
      previous,
      stored: { ...baseConfig, model: "ceed", bodyType: "hatchback" },
      urlParams: {
        brandParam: "kia",
        modelParam: "ceed",
        bodyTypeParam: "hatchback",
      },
    });

    expect(merged.model).toBe("Ceed");
    expect(merged.bodyType).toBe("Hatchback");
  });

  it("does not restore year from localStorage on locked product entry", () => {
    const previous: ConfiguratorState = {
      ...baseConfig,
      brand: "BMW",
      model: "3 G20",
      year: "",
      bodyType: "sedan",
    };

    const merged = mergeStoredConfig({
      previous,
      stored: { ...baseConfig, year: "2020", bodyType: "kombi" },
      urlParams: {
        brandParam: "bmw",
        modelParam: "3 G20",
        bodyTypeParam: "sedan",
      },
    });

    expect(merged.year).toBe("");
    expect(merged.bodyType).toBe("sedan");
  });

  it("clears stale brandKey from localStorage on locked product entry", () => {
    const merged = mergeStoredConfig({
      previous: baseConfig,
      stored: { ...baseConfig, brandKey: "Renault", modelFamilyKey: "espace" },
      urlParams: {
        brandParam: "renault",
        modelParam: "espace",
        bodyTypeParam: "minivan",
      },
    })

    expect(merged.brandKey).toBe("")
    expect(merged.modelFamilyKey).toBe("")
    expect(merged.recordKey).toBe("")
    expect(merged.bodyTypeKey).toBe("")
  })

  it("clears stale year and bodyType when URL model changes", () => {
    const previous: ConfiguratorState = {
      ...baseConfig,
      brand: "BMW",
      model: "3 E-46",
      year: "",
      bodyType: "",
    };

    const merged = mergeStoredConfig({
      previous,
      stored: {
        ...baseConfig,
        model: "3 G20",
        year: "2020",
        bodyType: "sedan",
      },
      urlParams: {
        brandParam: "bmw",
        modelParam: "3 E-46",
      },
    });

    expect(merged.model).toBe("3 E-46");
    expect(merged.year).toBe("");
    expect(merged.bodyType).toBe("");
  });
});
