import { describe, expect, it } from 'vitest'
import {
  resolveBitrixDealSyncAction,
  resolveBitrixPaymentSyncDecision,
} from '../bitrixPaymentSyncPolicy'

describe('resolveBitrixPaymentSyncDecision', () => {
  it('creates or updates deal on paid', () => {
    expect(resolveBitrixPaymentSyncDecision('paid')).toEqual({
      shouldSync: true,
      createIfMissing: true,
    })
  })

  it('updates existing deal only on failed/refunded', () => {
    expect(resolveBitrixPaymentSyncDecision('failed')).toEqual({
      shouldSync: true,
      createIfMissing: false,
    })
    expect(resolveBitrixPaymentSyncDecision('refunded')).toEqual({
      shouldSync: true,
      createIfMissing: false,
    })
  })

  it('skips Bitrix sync on pending', () => {
    expect(resolveBitrixPaymentSyncDecision('pending')).toEqual({
      shouldSync: false,
      createIfMissing: false,
    })
  })

  it('never allows createIfMissing outside paid', () => {
    const statuses = ['pending', 'failed', 'refunded'] as const
    for (const status of statuses) {
      expect(resolveBitrixPaymentSyncDecision(status).createIfMissing).toBe(false)
    }
  })
})

describe('resolveBitrixDealSyncAction', () => {
  it('skips deal create for REJECTED when deal does not exist (ORD-236 regression)', () => {
    expect(resolveBitrixDealSyncAction('failed', false)).toBe('skip')
  })

  it('creates deal for CONFIRMED when deal does not exist', () => {
    expect(resolveBitrixDealSyncAction('paid', false)).toBe('create')
  })

  it('updates existing deal on failed/refunded', () => {
    expect(resolveBitrixDealSyncAction('failed', true)).toBe('update')
    expect(resolveBitrixDealSyncAction('refunded', true)).toBe('update')
  })

  it('updates existing deal on paid', () => {
    expect(resolveBitrixDealSyncAction('paid', true)).toBe('update')
  })

  it('skips pending regardless of existing deal', () => {
    expect(resolveBitrixDealSyncAction('pending', false)).toBe('skip')
    expect(resolveBitrixDealSyncAction('pending', true)).toBe('skip')
  })
})
