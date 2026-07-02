import { describe, expect, it } from "vitest";
import {
  getBrandMetaBySlug,
  mapApiNameToDbName,
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

  it("resolves Ssang Young from database name", () => {
    const meta = getBrandMetaBySlug("Ssang Young");
    expect(meta?.apiName).toBe("SsangYong");
    expect(meta?.displayName).toBe("SsangYong");
    expect(meta?.dbName).toBe("Ssang Young");
  });

  it("resolves ssang-young slug alias", () => {
    const meta = getBrandMetaBySlug("ssang-young");
    expect(meta?.displayName).toBe("SsangYong");
  });

  it("returns null for unknown brands", () => {
    expect(getBrandMetaBySlug("unknown-brand-xyz")).toBeNull();
  });
});

describe("mapApiNameToDbName", () => {
  it("maps Bmw to BMW for database (DB stores uppercase)", () => {
    expect(mapApiNameToDbName("Bmw")).toBe("BMW");
  });

  it("returns apiName when dbName is not set", () => {
    expect(mapApiNameToDbName("Audi")).toBe("Audi");
    expect(mapApiNameToDbName("Mercedes-Benz")).toBe("Mercedes-Benz");
  });

  it("maps Baic to DB format (Baic)", () => {
    expect(mapApiNameToDbName("Baic")).toBe("Baic");
  });

  it("maps Byd to DB format", () => {
    expect(mapApiNameToDbName("Byd")).toBe("Byd");
  });

  it("maps MG to uppercase (DB uses MG)", () => {
    expect(mapApiNameToDbName("MG")).toBe("MG");
  });

  it("maps SsangYong to Ssang Young for database", () => {
    expect(mapApiNameToDbName("SsangYong")).toBe("Ssang Young");
  });

  it("returns null for empty input", () => {
    expect(mapApiNameToDbName("")).toBeNull();
    expect(mapApiNameToDbName(null)).toBeNull();
    expect(mapApiNameToDbName(undefined)).toBeNull();
  });

  it("returns apiName for unknown brand", () => {
    expect(mapApiNameToDbName("UnknownBrand")).toBe("UnknownBrand");
  });
});






















