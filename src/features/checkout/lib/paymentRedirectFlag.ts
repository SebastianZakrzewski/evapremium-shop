export const EVA_PAYMENT_REDIRECT_STORAGE_KEY = 'eva_payment_redirect'

export const markPaymentRedirect = (orderId: string): void => {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(
    EVA_PAYMENT_REDIRECT_STORAGE_KEY,
    JSON.stringify({ orderId, at: Date.now() })
  )
}

export const hasPaymentRedirectFlag = (): boolean => {
  if (typeof window === 'undefined') return false
  return Boolean(window.sessionStorage.getItem(EVA_PAYMENT_REDIRECT_STORAGE_KEY))
}

export const clearPaymentRedirectFlag = (): void => {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(EVA_PAYMENT_REDIRECT_STORAGE_KEY)
}
