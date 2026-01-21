import { describe, expect, it } from "vitest";
import {
  mergeStoredConfig,
  resolveBrandFromParam,
  type ConfiguratorState,
} from "../configuratorState";
import type { Brand } from "@/entities/car";

const baseConfig: ConfiguratorState = {
  brand: "",
  model: "",
  year: "",
  bodyType: "",
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
});
