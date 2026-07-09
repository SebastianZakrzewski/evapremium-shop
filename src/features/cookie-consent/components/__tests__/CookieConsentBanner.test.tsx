import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CookieConsentBanner } from '../CookieConsentBanner'

const hideMock = vi.fn()
const renewMock = vi.fn()
const submitCustomConsentMock = vi.fn()

const createCookiebotMock = (hasResponse = false) => ({
  consent: {
    necessary: true,
    preferences: false,
    statistics: false,
    marketing: false,
    method: null,
  },
  consented: hasResponse,
  declined: false,
  hasResponse,
  hide: hideMock,
  show: vi.fn(),
  renew: renewMock,
  submitCustomConsent: submitCustomConsentMock,
})

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    hideMock.mockClear()
    renewMock.mockClear()
    submitCustomConsentMock.mockClear()
    window.Cookiebot = createCookiebotMock(false)
  })

  it('renders minimal consent copy when user has not responded yet', () => {
    render(<CookieConsentBanner />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Cenimy Twoją prywatność')).toBeInTheDocument()
    expect(
      screen.getByText(/Aby zapewnić Ci najlepsze wrażenia na naszej stronie, używamy plików cookie\./)
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Polityce prywatności' })).toHaveAttribute(
      'href',
      '/polityka-prywatnosci'
    )
    expect(screen.getByRole('button', { name: 'Akceptuję pliki cookie i przechodzę dalej' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Zarządzaj preferencjami plików cookie' })).toBeInTheDocument()
    expect(hideMock).toHaveBeenCalled()
  })

  it('does not render when Cookiebot already has a stored response', () => {
    window.Cookiebot = createCookiebotMock(true)

    render(<CookieConsentBanner />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('submits full consent to Cookiebot when accept button is clicked', () => {
    render(<CookieConsentBanner />)

    fireEvent.click(screen.getByRole('button', { name: 'Akceptuję pliki cookie i przechodzę dalej' }))

    expect(submitCustomConsentMock).toHaveBeenCalledWith(true, true, true)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens Cookiebot preferences when manage preferences is clicked', () => {
    render(<CookieConsentBanner />)

    fireEvent.click(screen.getByRole('button', { name: 'Zarządzaj preferencjami plików cookie' }))

    expect(renewMock).toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
