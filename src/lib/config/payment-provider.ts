/**
 * Client-side payment provider selection.
 * Mirrors server PAYNOW_ENABLED via NEXT_PUBLIC_PAYNOW_ENABLED.
 */

export type ClientPaymentMethod = 'paynow' | 'p24'

export const isPaynowCheckoutEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_PAYNOW_ENABLED === 'true'
}

export const getClientPaymentMethod = (): ClientPaymentMethod => {
  return isPaynowCheckoutEnabled() ? 'paynow' : 'p24'
}

export const getClientPaymentProviderLabel = (): string => {
  return isPaynowCheckoutEnabled() ? 'Paynow (mBank)' : 'Przelewy24'
}
