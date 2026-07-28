import { describe, it, expect } from 'vitest'
import type { PaynowProviderStatus } from '@/lib/types/paynow'

const mapProviderStatusToOrderPaymentStatus = (
  providerStatus: PaynowProviderStatus
): 'pending' | 'paid' | 'failed' | null => {
  switch (providerStatus) {
    case 'CONFIRMED':
      return 'paid'
    case 'REJECTED':
    case 'ERROR':
    case 'EXPIRED':
      return 'failed'
    case 'NEW':
    case 'PENDING':
    case 'ABANDONED':
      return 'pending'
    default:
      return null
  }
}

describe('Paynow status mapping', () => {
  it('maps CONFIRMED to paid', () => {
    expect(mapProviderStatusToOrderPaymentStatus('CONFIRMED')).toBe('paid')
  })

  it('maps failure statuses to failed', () => {
    expect(mapProviderStatusToOrderPaymentStatus('REJECTED')).toBe('failed')
    expect(mapProviderStatusToOrderPaymentStatus('ERROR')).toBe('failed')
    expect(mapProviderStatusToOrderPaymentStatus('EXPIRED')).toBe('failed')
  })

  it('maps in-progress statuses to pending', () => {
    expect(mapProviderStatusToOrderPaymentStatus('NEW')).toBe('pending')
    expect(mapProviderStatusToOrderPaymentStatus('PENDING')).toBe('pending')
  })
})

describe('Paynow webhook dedupe key', () => {
  it('builds stable dedupe key', () => {
    const dedupeKey = `paynow:NOLV-8F9-08K-WGD:CONFIRMED:2018-12-12T13:24:52`
    expect(dedupeKey).toBe('paynow:NOLV-8F9-08K-WGD:CONFIRMED:2018-12-12T13:24:52')
  })
})
