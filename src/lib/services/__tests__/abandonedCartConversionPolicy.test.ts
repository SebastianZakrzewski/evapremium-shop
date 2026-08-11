import { describe, expect, it } from 'vitest'
import { resolveAbandonedDealLoseStageId } from '../abandonedCartConversionPolicy'

describe('resolveAbandonedDealLoseStageId', () => {
  it('uses LOSE for default/category 0 deals', () => {
    expect(resolveAbandonedDealLoseStageId(undefined)).toBe('LOSE')
    expect(resolveAbandonedDealLoseStageId(null)).toBe('LOSE')
    expect(resolveAbandonedDealLoseStageId(0)).toBe('LOSE')
  })

  it('uses category-prefixed LOSE for abandoned pipeline (cat 2)', () => {
    expect(resolveAbandonedDealLoseStageId(2)).toBe('C2:LOSE')
  })
})
