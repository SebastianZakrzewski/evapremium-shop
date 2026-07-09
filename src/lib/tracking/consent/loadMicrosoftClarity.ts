const CLARITY_PROJECT_ID = 'ubkouhtkbb'

let clarityLoaded = false

type ClarityStub = ((...args: unknown[]) => void) & { q?: unknown[][] }

declare global {
  interface Window {
    clarity?: ClarityStub
  }
}

export const loadMicrosoftClarity = (
  projectId: string = CLARITY_PROJECT_ID
): void => {
  if (typeof window === 'undefined' || clarityLoaded) {
    return
  }

  if (window.clarity) {
    clarityLoaded = true
    return
  }

  const clarityFn: ClarityStub = (...args: unknown[]) => {
    const queue = clarityFn.q ?? []
    queue.push(args)
    clarityFn.q = queue
  }

  window.clarity = clarityFn

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.clarity.ms/tag/${projectId}`
  const firstScript = document.getElementsByTagName('script')[0]
  firstScript?.parentNode?.insertBefore(script, firstScript)

  clarityLoaded = true
}

export const resetMicrosoftClarityForTests = (): void => {
  clarityLoaded = false
}
