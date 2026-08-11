import { describe, expect, it } from 'vitest'
import { sanitizeAbandonedCartRawInput } from '../abandonedCartInputSanitizer'
import { abandonedCartUpsertInputSchema } from '@/lib/validators/abandonedCart'

describe('abandonedCartInputSanitizer', () => {
  it('strips invalid partial contact fields from heartbeat payloads', () => {
    const sanitized = sanitizeAbandonedCartRawInput({
      sessionId: 'session-1234567890',
      stage: 'checkout_step2',
      cartHasItems: true,
      contact: {
        firstName: 'A',
        lastName: '',
        email: 'not-an-email',
        phone: '123',
      },
    }) as Record<string, unknown>

    expect(sanitized.contact).toBeUndefined()
  })

  it('keeps valid contact fields only', () => {
    const sanitized = sanitizeAbandonedCartRawInput({
      sessionId: 'session-1234567890',
      stage: 'checkout_step2',
      cartHasItems: true,
      contact: {
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: 'jan@example.com',
        phone: '12345',
      },
    }) as Record<string, unknown>

    expect(sanitized.contact).toEqual({
      firstName: 'Jan',
      lastName: 'Kowalski',
      email: 'jan@example.com',
      phone: '12345',
    })
  })
})

describe('abandonedCartUpsertInputSchema with sanitizer', () => {
  it('accepts partially filled checkout form data', () => {
    const parsed = abandonedCartUpsertInputSchema.parse({
      sessionId: 'session-1234567890',
      stage: 'checkout_step2',
      cartHasItems: true,
      contact: {
        firstName: 'A',
        email: 'invalid',
        phone: '12',
      },
      totalAmount: 259,
    })

    expect(parsed.contact).toBeUndefined()
    expect(parsed.stage).toBe('checkout_step2')
  })
})
