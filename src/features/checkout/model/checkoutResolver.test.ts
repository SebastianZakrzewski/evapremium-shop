import { describe, expect, it } from 'vitest'
import { checkoutFieldStep, checkoutFormResolver } from './checkoutResolver'

const validCheckout = {
  firstName: 'Jan',
  lastName: 'Kowalski',
  email: 'jan@example.com',
  phone: '500600700',
  street: 'Prosta 1',
  postalCode: '00-001',
  city: 'Warszawa',
  country: 'Polska',
  sameAsShipping: true,
  paymentMethod: 'paynow',
  termsAccepted: true,
  marketingAccepted: false,
}

const resolve = (values: unknown) =>
  checkoutFormResolver(values as never, undefined, {
    fields: {},
    shouldUseNativeValidation: false,
  } as never)

describe('checkoutFormResolver', () => {
  it('returns values for a complete checkout payload', async () => {
    const result = await resolve(validCheckout)

    expect(result.errors).toEqual({})
    expect(result.values).toMatchObject({
      firstName: 'Jan',
      street: 'Prosta 1',
      paymentMethod: 'paynow',
      termsAccepted: true,
    })
  })

  it('returns the street error instead of throwing when step 2 was too weak', async () => {
    const result = await resolve({ ...validCheckout, street: 'Ul 1' })

    expect(result.values).toEqual({})
    expect(result.errors.street?.message).toBe('Ulica musi mieć minimum 5 znaków')
    expect(checkoutFieldStep('street')).toBe(2)
  })

  it('returns the terms error on the payment step', async () => {
    const result = await resolve({ ...validCheckout, termsAccepted: false })

    expect(result.errors.termsAccepted?.message).toBe('Musisz zaakceptować regulamin')
    expect(checkoutFieldStep('termsAccepted')).toBe(3)
    expect(checkoutFieldStep('phone')).toBe(1)
  })
})
