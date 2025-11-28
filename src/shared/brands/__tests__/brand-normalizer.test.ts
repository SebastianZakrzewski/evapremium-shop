import { describe, expect, it } from "vitest";
import {
  getBrandMetaBySlug,
  mapSlugToCanonicalBrand,
} from "@/shared/brands/brandNormalizer";

describe("mapSlugToCanonicalBrand", () => {
  const cases: Array<{ input: string; expected: string }> = [
    { input: "mercedes-benz", expected: "Mercedes-Benz" },
    { input: "Mercedes Benz", expected: "Mercedes-Benz" },
    { input: "mercedes_benz", expected: "Mercedes-Benz" },
    { input: "bmw", expected: "Bmw" },
    { input: "BMW", expected: "Bmw" },
    { input: "alfa-romeo", expected: "Alfa Romeo" },
    { input: "alfa_romeo", expected: "Alfa Romeo" },
    { input: "land-rover", expected: "Land Rover" },
    { input: "land_rover", expected: "Land Rover" },
  ];

  cases.forEach(({ input, expected }) => {
    it(`normalizes "${input}" to "${expected}"`, () => {
      expect(mapSlugToCanonicalBrand(input)).toBe(expected);
    });
  });

  it("returns null for empty input", () => {
    expect(mapSlugToCanonicalBrand("")).toBeNull();
    expect(mapSlugToCanonicalBrand(null)).toBeNull();
    expect(mapSlugToCanonicalBrand(undefined)).toBeNull();
  });
});

describe("getBrandMetaBySlug", () => {
  it("returns consistent meta for canonical slug", () => {
    const meta = getBrandMetaBySlug("mercedes-benz");
    expect(meta).not.toBeNull();
    expect(meta?.apiName).toBe("Mercedes-Benz");
    expect(meta?.displayName).toMatch(/Mercedes/i);
  });

  it("handles aliases with underscores", () => {
    const meta = getBrandMetaBySlug("alfa_romeo");
    expect(meta?.apiName).toBe("Alfa Romeo");
    expect(meta?.displayName).toBe("Alfa Romeo");
  });

  it("handles mixed-case inputs", () => {
    const meta = getBrandMetaBySlug("LaNd_RoVer");
    expect(meta?.apiName).toBe("Land Rover");
  });

  it("returns null for unknown brands", () => {
    expect(getBrandMetaBySlug("unknown-brand-xyz")).toBeNull();
  });
});












