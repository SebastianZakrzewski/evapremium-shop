import { describe, expect, it } from 'vitest'
import { PricingService } from '../PricingService'

describe('PricingService.validateDiscountCode', () => {
  it('applies PREMIUM5 as 5 percent of the cart subtotal', () => {
    const result = PricingService.validateDiscountCode('PREMIUM5', 200)

    expect(result.isValid).toBe(true)
    expect(result.discountAmount).toBe(10)
  })

  it('accepts PREMIUM5 regardless of letter case', () => {
    const result = PricingService.validateDiscountCode('premium5', 349)

    expect(result.isValid).toBe(true)
    expect(result.discountAmount).toBe(17.45)
  })

  it('rejects unknown discount codes', () => {
    const result = PricingService.validateDiscountCode('UNKNOWN', 200)

    expect(result.isValid).toBe(false)
    expect(result.discountAmount).toBe(0)
    expect(result.message).toBe('Nieprawidłowy kod rabatowy')
  })
})
