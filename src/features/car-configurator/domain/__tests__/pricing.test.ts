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
    expect(getBasePrice("3d-with-rims", "front")).toBe(550);
    expect(getBasePrice("3d-with-rims", "basic")).toBe(910);
  });

  it("calculates discount tiers correctly", () => {
    expect(PRICING.getDiscount(909)).toBe(0.25);
    expect(PRICING.getDiscount(910)).toBe(0.35);
  });

  it("calculates variant base price without shipping", () => {
    expect(calculateVariantBasePrice("classic", "front")).toBe(218);
    expect(calculateVariantBasePrice("3d-with-rims", "premium")).toBe(787);
  });

  it("includes free shipping for starter front so total matches catalog minus discount", () => {
    expect(calculateVariantPrice("classic", "front")).toBe(217.5);
    expect(calculateVariantPrice("3d-with-rims", "front")).toBe(412.5);
    expect(calculateVariantPrice("classic", "basic")).toBe(382.5);
  });

  it("returns full price breakdown", () => {
    const breakdown = calculatePriceBreakdown("3d-with-rims", "basic");

    expect(breakdown).toEqual({
      basePrice: 910,
      discount: 318.5,
      priceAfterDiscount: 591.5,
      shippingCost: 0,
      totalPrice: 591.5,
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
