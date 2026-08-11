export const isAbandonedPaymentRedirectEvent = (input: {
  event?: string | null
  metadata?: Record<string, unknown> | null
}): boolean => {
  if (input.event === 'payment_redirect') return true
  return Boolean(input.metadata?.paymentRedirect)
}
