import { describe, expect, it } from "vitest";
import {
  PRICING,
  calculatePriceBreakdown,
  calculateVariantBasePrice,
  calculateVariantPrice,
  getBasePrice,
  resolveOverridePrice,
} from "../pricing";

describe("car-configurator pricing", () => {
  it("returns base prices from matrix", () => {
    expect(getBasePrice("classic", "front")).toBe(290);
    expect(getBasePrice("3d-with-rims", "basic")).toBe(910);
  });

  it("calculates discount tiers correctly", () => {
    expect(PRICING.getDiscount(909)).toBe(0.2);
    expect(PRICING.getDiscount(910)).toBe(0.3);
  });

  it("calculates variant base price without shipping", () => {
    expect(calculateVariantBasePrice("classic", "front")).toBe(232);
    expect(calculateVariantBasePrice("3d-with-rims", "premium")).toBe(847);
  });

  it("includes shipping only for front variant", () => {
    expect(calculateVariantPrice("classic", "front")).toBe(259);
    expect(calculateVariantPrice("classic", "basic")).toBe(408);
  });

  it("returns full price breakdown", () => {
    const breakdown = calculatePriceBreakdown("3d-with-rims", "basic");

    expect(breakdown).toEqual({
      basePrice: 910,
      discount: 273,
      priceAfterDiscount: 637,
      shippingCost: 0,
      totalPrice: 637,
    });
  });

  it("prefers override pricing by specificity", () => {
    const overrides = {
      byBodyType: {
        van: { classic: { front: 400 } },
      },
      byBodyTypeSubType: {
        "van:bus": { classic: { front: 420 } },
      },
      byBrand: {
        ford: { classic: { front: 430 } },
      },
      byBrandModel: {
        "ford:transit": { classic: { front: 450 } },
      },
      byBrandModelBodyType: {
        "ford:transit:van": { classic: { front: 470 } },
      },
      byBrandModelBodyTypeSubType: {
        "ford:transit:van:bus": { classic: { front: 490 } },
      },
    };

    const price = resolveOverridePrice(
      {
        brand: "Ford",
        model: "Transit",
        bodyType: "Van",
        bodySubType: "Bus",
      },
      "classic",
      "front",
      overrides
    );

    expect(price).toBe(490);
  });
});
