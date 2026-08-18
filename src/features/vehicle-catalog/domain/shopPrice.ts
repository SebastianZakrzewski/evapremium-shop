export type ShopMatrixPrice = {
  base_price_pln: number | string | null
  price_after_discount_pln: number | string | null
  discount_excluded?: boolean | null
}

const roundMoney = (value: number): number => Math.round(value * 100) / 100

export const applyShopBasePrice = (
  shopBase: number,
  matrix: ShopMatrixPrice | undefined,
  catalogDiscount: (base: number) => number,
): { basePrice: number; priceAfterDiscount: number; discount: number } => {
  const basePrice = roundMoney(shopBase)
  if (matrix?.discount_excluded) {
    return { basePrice, priceAfterDiscount: basePrice, discount: 0 }
  }

  const matrixBase = matrix?.base_price_pln == null ? null : Number(matrix.base_price_pln)
  const matrixAfter =
    matrix?.price_after_discount_pln == null
      ? null
      : Number(matrix.price_after_discount_pln)

  const priceAfterDiscount =
    matrixBase != null &&
    matrixAfter != null &&
    Math.abs(basePrice - matrixBase) < 0.05
      ? roundMoney(matrixAfter)
      : catalogDiscount(basePrice)

  return {
    basePrice,
    priceAfterDiscount,
    discount: Math.max(0, roundMoney(basePrice - priceAfterDiscount)),
  }
}
