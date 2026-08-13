import { describe, expect, it } from 'vitest'
import { resolvePaidOrderDealStageId } from '../abandonedCartConversionPolicy'

describe('abandonedCartConversionPolicy', () => {
  it('uses paid website order stage for promoted abandoned deals', () => {
    expect(resolvePaidOrderDealStageId()).toBe('UC_DMBNNJ')
  })
})
