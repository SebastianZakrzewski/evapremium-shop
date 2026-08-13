import { describe, expect, it } from 'vitest'
import {
  isAmountWithinTolerance,
  resolveAbandonedExportSkipReason,
  shouldBlockAbandonedCartBitrixExport,
  shouldBlockAbandonedCartHeartbeat,
} from '../abandonedCartExportGuardPolicy'

describe('abandonedCartExportGuard', () => {
  it('maps paid to order_already_paid and pending to order_in_payment', () => {
    expect(resolveAbandonedExportSkipReason('paid')).toBe('order_already_paid')
    expect(resolveAbandonedExportSkipReason('pending')).toBe('order_in_payment')
  })

  it('blocks heartbeat only for paid orders', () => {
    expect(shouldBlockAbandonedCartHeartbeat('paid')).toBe(true)
    expect(shouldBlockAbandonedCartHeartbeat('pending')).toBe(false)
  })

  it('blocks Bitrix export for pending and paid orders', () => {
    expect(shouldBlockAbandonedCartBitrixExport('paid')).toBe(true)
    expect(shouldBlockAbandonedCartBitrixExport('pending')).toBe(true)
    expect(shouldBlockAbandonedCartBitrixExport('failed')).toBe(false)
  })

  it('accepts amounts within 10% tolerance', () => {
    expect(isAmountWithinTolerance(259, 259)).toBe(true)
    expect(isAmountWithinTolerance(259, 250)).toBe(true)
    expect(isAmountWithinTolerance(100, 50)).toBe(false)
  })
})
