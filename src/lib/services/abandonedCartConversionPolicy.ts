import type { Order } from '@/lib/types/order-new'

export type ConvertAbandonedCartsOnPaidInput = {
  email: string
  orderId: string
  orderNumber: string
  order: Order
}

export type ConvertAbandonedCartsOnPaidResult = {
  convertedCount: number
  promotedDealIds: string[]
  failedDealIds: string[]
}

export const resolvePaidOrderDealStageId = (): string => 'UC_DMBNNJ'
