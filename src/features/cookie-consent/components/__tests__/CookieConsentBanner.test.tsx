import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CookieConsentBanner } from '../CookieConsentBanner'

const hideMock = vi.fn()
const renewMock = vi.fn()
const submitCustomConsentMock = vi.fn()
const submitConsentMock = vi.fn()
const runScriptsMock = vi.fn()

const createCookiebotMock = (hasResponse = false) => ({
  consent: {
    necessary: true,
    preferences: hasResponse,
    statistics: hasResponse,
    marketing: hasResponse,
    method: hasResponse ? 'explicit' : null,
  },
  consented: hasResponse,
  declined: false,
  hasResponse,
  hide: hideMock,
  show: vi.fn(),
  renew: renewMock,
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

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    hideMock.mockClear()
    renewMock.mockClear()
    submitCustomConsentMock.mockClear()
    submitConsentMock.mockClear()
    runScriptsMock.mockClear()
    document.cookie = 'CookieConsent=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    window.Cookiebot = createCookiebotMock(false)
  })

  it('renders minimal consent copy when user has not responded yet', () => {
    render(<CookieConsentBanner />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Cenimy Twoją prywatność')).toBeInTheDocument()
    expect(
      screen.getByText(/Aby zapewnić Ci najlepsze wrażenia na naszej stronie, używamy plików cookie\./)
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Polityka prywatności' })).toHaveAttribute(
      'href',
      '/polityka-prywatnosci'
    )
    expect(screen.getByRole('button', { name: 'Akceptuję pliki cookie i przechodzę dalej' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Zarządzaj preferencjami plików cookie' })).toBeInTheDocument()
    expect(hideMock).toHaveBeenCalled()
  })

  it('does not render when user has active optional consent', () => {
    window.Cookiebot = createCookiebotMock(true)
    document.cookie =
      "CookieConsent={stamp:'x',necessary:true,preferences:true,statistics:true,marketing:true,method:'explicit'}"

    render(<CookieConsentBanner />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders again when consent was withdrawn or declined', () => {
    window.Cookiebot = {
      ...createCookiebotMock(false),
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

    render(<CookieConsentBanner />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render when CookieConsent cookie includes optional consent', () => {
    document.cookie =
      "CookieConsent={stamp:'x',necessary:true,preferences:true,statistics:false,marketing:false,method:'explicit'}"

    render(<CookieConsentBanner />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('submits full consent to Cookiebot when accept button is clicked', async () => {
    render(<CookieConsentBanner />)

    fireEvent.click(screen.getByRole('button', { name: 'Akceptuję pliki cookie i przechodzę dalej' }))

    expect(submitCustomConsentMock).toHaveBeenCalledWith(true, true, true)
    expect(runScriptsMock).toHaveBeenCalledTimes(1)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('opens Cookiebot preferences when manage preferences is clicked', () => {
    render(<CookieConsentBanner />)

    fireEvent.click(screen.getByRole('button', { name: 'Zarządzaj preferencjami plików cookie' }))

    expect(renewMock).toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
