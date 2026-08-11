export type AbandonedExportSkipReason = 'order_already_paid' | 'order_in_payment'

export const isAmountWithinTolerance = (
  orderTotal: number,
  cartTotal: number,
  toleranceRatio = 0.1
): boolean => {
  const difference = Math.abs(orderTotal - cartTotal)
  const tolerance = Math.max(orderTotal, cartTotal) * toleranceRatio
  return difference <= tolerance
}

export const resolveAbandonedExportSkipReason = (
  paymentStatus: string
): AbandonedExportSkipReason => {
  if (paymentStatus === 'paid') return 'order_already_paid'
  return 'order_in_payment'
}
