export type SetTypeId = "classic" | "3d-with-rims";
export type SetVariantId = "front" | "basic" | "premium" | "complete";

export type PricingContext = {
  brand?: string;
  model?: string;
  bodyType?: string;
  bodySubType?: string;
};

export type PriceBreakdown = {
  basePrice: number;
  discount: number;
  priceAfterDiscount: number;
  shippingCost: number;
  totalPrice: number;
};

export const PRICING = {
  basePrice: {
    classic: { front: 290, basic: 510, premium: 710, complete: 350 },
    "3d-with-rims": { front: 550, basic: 910, premium: 1210, complete: 350 },
  },
  // Rabat zależny od wartości: -35% dla >=910 zł, -25% dla <910 zł
  getDiscount: (basePrice: number) => (basePrice >= 910 ? 0.35 : 0.25),
  shipping: {
    cost: 27,
    freeForVariants: ["front", "basic", "premium", "complete"] as SetVariantId[],
  },
};

type PriceOverrides = Partial<
  Record<SetTypeId, Partial<Record<SetVariantId, number>>>
>;

type OverridesMap = Record<string, PriceOverrides>;

const PRICE_OVERRIDES = {
  byBodyType: {
    kombivan: {
      classic: { front: 290 * 3, basic: 510 * 3, premium: 710 * 3, complete: 350 * 3 },
      "3d-with-rims": {
        front: 550 * 3,
        basic: 910 * 3,
        premium: 1210 * 3,
        complete: 350 * 3,
      },
    },
  } as OverridesMap,
  byBodyTypeSubType: {} as OverridesMap,
  byBrand: {} as OverridesMap,
  byBrandModel: {} as OverridesMap,
  byBrandModelBodyType: {} as OverridesMap,
  byBrandModelBodyTypeSubType: {} as OverridesMap,
};

const normalizeKey = (value?: string): string =>
  value
    ? value
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "")
    : "";

const getOverridePrice = (
  overrides: OverridesMap,
  key: string,
  setType: SetTypeId,
  setVariant: SetVariantId
): number | undefined => {
  return overrides[key]?.[setType]?.[setVariant];
};

export const resolveOverridePrice = (
  context: PricingContext | undefined,
  setType: SetTypeId,
  setVariant: SetVariantId,
  overrides = PRICE_OVERRIDES
): number | undefined => {
  if (!context) return undefined;

  const brand = normalizeKey(context.brand);
  const model = normalizeKey(context.model);
  const bodyType = normalizeKey(context.bodyType);
  const bodySubType = normalizeKey(context.bodySubType);

  const brandModel = brand && model ? `${brand}:${model}` : "";
  const bodyTypeSubType = bodyType && bodySubType ? `${bodyType}:${bodySubType}` : "";
  const brandModelBodyType =
    brandModel && bodyType ? `${brandModel}:${bodyType}` : "";
  const brandModelBodyTypeSubType =
    brandModel && bodyTypeSubType ? `${brandModel}:${bodyTypeSubType}` : "";

  return (
    (brandModelBodyTypeSubType
      ? getOverridePrice(
          overrides.byBrandModelBodyTypeSubType,
          brandModelBodyTypeSubType,
          setType,
          setVariant
        )
      : undefined) ??
    (brandModelBodyType
      ? getOverridePrice(
          overrides.byBrandModelBodyType,
          brandModelBodyType,
          setType,
          setVariant
        )
      : undefined) ??
    (brandModel
      ? getOverridePrice(overrides.byBrandModel, brandModel, setType, setVariant)
      : undefined) ??
    (bodyTypeSubType
      ? getOverridePrice(
          overrides.byBodyTypeSubType,
          bodyTypeSubType,
          setType,
          setVariant
        )
      : undefined) ??
    (bodyType
      ? getOverridePrice(overrides.byBodyType, bodyType, setType, setVariant)
      : undefined) ??
    (brand
      ? getOverridePrice(overrides.byBrand, brand, setType, setVariant)
      : undefined)
  );
};

export const getBasePrice = (
  setType: SetTypeId,
  setVariant: SetVariantId,
  fallback = 0,
  context?: PricingContext
): number => {
  const override = resolveOverridePrice(context, setType, setVariant);
  if (override !== undefined) {
    return override;
  }
  return PRICING.basePrice[setType]?.[setVariant] ?? fallback;
};

export const calculatePriceBreakdown = (
  setType: SetTypeId,
  setVariant: SetVariantId,
  context?: PricingContext
): PriceBreakdown => {
  const basePrice = getBasePrice(setType, setVariant, 0, context);
  const discountRate = PRICING.getDiscount(basePrice);
  const discountAmount = basePrice * discountRate;
  const priceAfterDiscount = basePrice - discountAmount;
  const shippingCost = PRICING.shipping.freeForVariants.includes(setVariant)
    ? 0
    : PRICING.shipping.cost;
  const totalPrice =
    Math.round((priceAfterDiscount + shippingCost) * 100) / 100;

  return {
    basePrice: Math.round(basePrice),
    discount: Math.round(discountAmount * 100) / 100,
    priceAfterDiscount: Math.round(priceAfterDiscount * 100) / 100,
    shippingCost,
    totalPrice,
  };
};

export const calculateVariantBasePrice = (
  setType: SetTypeId,
  setVariant: SetVariantId,
  context?: PricingContext
): number => {
  const basePrice = getBasePrice(setType, setVariant, 0, context);
  const discount = PRICING.getDiscount(basePrice);
  const priceAfterDiscount = basePrice * (1 - discount);
  return Math.round(priceAfterDiscount);
};

export const calculateVariantPrice = (
  setType: SetTypeId,
  setVariant: SetVariantId,
  context?: PricingContext
): number => {
  return calculatePriceBreakdown(setType, setVariant, context).totalPrice;
};
