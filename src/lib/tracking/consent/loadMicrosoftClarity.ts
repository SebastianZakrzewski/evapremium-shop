const CLARITY_PROJECT_ID = 'ubkouhtkbb'

let clarityLoaded = false

declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] }
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

  const clarityFn = function (...args: unknown[]) {
    const queue = clarityFn.q ?? []
    queue.push(args)
    clarityFn.q = queue
  } as Window['clarity']

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
