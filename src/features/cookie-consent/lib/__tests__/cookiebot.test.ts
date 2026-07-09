import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  acceptAllCookieConsent,
  hasOptionalConsentGranted,
  isFullCookieConsentGranted,
  shouldShowCustomBanner,
} from '../cookiebot'

const submitCustomConsentMock = vi.fn()
const submitConsentMock = vi.fn()
const runScriptsMock = vi.fn()

const createCookiebotMock = () => ({
  consent: {
    necessary: true,
    preferences: false,
    statistics: false,
    marketing: false,
    method: null,
  },
  consented: false,
  declined: false,
  hasResponse: false,
  hide: vi.fn(),
  show: vi.fn(),
  renew: vi.fn(),
  runScripts: runScriptsMock,
  dialog: {
    submitConsent: submitConsentMock,
    submitDecline: vi.fn(),
  },
  submitCustomConsent: (...args: [boolean, boolean, boolean]) => {
    submitCustomConsentMock(...args)
    window.Cookiebot!.consent = {
      necessary: true,
      preferences: args[0],
      statistics: args[1],
      marketing: args[2],
      method: 'explicit',
    }
    window.Cookiebot!.hasResponse = true
    window.Cookiebot!.consented = true
  },
})

describe('acceptAllCookieConsent', () => {
  beforeEach(() => {
    submitCustomConsentMock.mockClear()
    submitConsentMock.mockClear()
    runScriptsMock.mockClear()
    document.cookie = 'CookieConsent=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    window.Cookiebot = createCookiebotMock()
  })

  it('submits all optional categories through submitCustomConsent', () => {
    const onComplete = vi.fn()

    acceptAllCookieConsent(onComplete)

    expect(submitCustomConsentMock).toHaveBeenCalledWith(true, true, true)
    expect(runScriptsMock).toHaveBeenCalledTimes(1)
    expect(isFullCookieConsentGranted()).toBe(true)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('waits for Cookiebot before submitting consent', async () => {
    vi.useFakeTimers()
    window.Cookiebot = undefined

    acceptAllCookieConsent()

    expect(submitCustomConsentMock).not.toHaveBeenCalled()

    window.Cookiebot = createCookiebotMock()
    await vi.advanceTimersByTimeAsync(100)

    expect(submitCustomConsentMock).toHaveBeenCalledWith(true, true, true)

    vi.useRealTimers()
  })
})

describe('shouldShowCustomBanner', () => {
  beforeEach(() => {
    document.cookie = 'CookieConsent=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    window.Cookiebot = createCookiebotMock()
  })

  it('returns true when user has not granted optional consent', () => {
    expect(shouldShowCustomBanner()).toBe(true)
  })

  it('returns true after consent withdrawal when only necessary cookies remain', () => {
    window.Cookiebot = {
      ...createCookiebotMock(),
      hasResponse: true,
      declined: true,
      consent: {
        necessary: true,
        preferences: false,
        statistics: false,
        marketing: false,
        method: 'explicit',
      },
    }
    document.cookie =
      "CookieConsent={stamp:'x',necessary:true,preferences:false,statistics:false,marketing:false,method:'explicit'}"

    expect(hasOptionalConsentGranted()).toBe(false)
    expect(shouldShowCustomBanner()).toBe(true)
  })

  it('returns false when optional consent is active until lifecycle expiry', () => {
    window.Cookiebot = {
      ...createCookiebotMock(),
      hasResponse: true,
      consented: true,
      consent: {
        necessary: true,
        preferences: true,
        statistics: true,
        marketing: true,
        method: 'explicit',
      },
    }

    expect(shouldShowCustomBanner()).toBe(false)
  })
})
