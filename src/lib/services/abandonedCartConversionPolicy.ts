export const resolveAbandonedDealLoseStageId = (categoryId?: number | null): string => {
  if (categoryId == null || categoryId === 0) {
    return 'LOSE'
  }

  return `C${categoryId}:LOSE`
}

export type ConvertAbandonedCartsOnPaidInput = {
  email: string
  orderId: string
  orderNumber: string
}

export type ConvertAbandonedCartsOnPaidResult = {
  convertedCount: number
  closedDealIds: string[]
  failedDealIds: string[]
}
