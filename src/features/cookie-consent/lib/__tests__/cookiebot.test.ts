import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  acceptAllCookieConsent,
  isFullCookieConsentGranted,
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

  it('uses native dialog submitConsent for full allow-all when available', () => {
    const onComplete = vi.fn()

    acceptAllCookieConsent(onComplete)

    expect(submitConsentMock).toHaveBeenCalledTimes(1)
    expect(submitCustomConsentMock).not.toHaveBeenCalled()
    expect(runScriptsMock).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('falls back to submitCustomConsent with all categories enabled', () => {
    window.Cookiebot = {
      ...createCookiebotMock(),
      dialog: undefined,
    }

    acceptAllCookieConsent()

    expect(submitCustomConsentMock).toHaveBeenCalledWith(true, true, true)
    expect(isFullCookieConsentGranted()).toBe(true)
  })
})
