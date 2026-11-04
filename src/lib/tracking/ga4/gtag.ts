declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const installGtagStub = (): void => {
  window.dataLayer = window.dataLayer || []

  if (typeof window.gtag === 'function') {
    return
  }

  window.gtag = function gtag() {
    window.dataLayer = window.dataLayer || []
    // gtag.js reads the Arguments object, same contract as the inline stub.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments as unknown)
  }
}

export const pushGtag = (...args: unknown[]): void => {
  if (typeof window === 'undefined') {
    return
  }

  installGtagStub()
  window.gtag?.(...args)
}
