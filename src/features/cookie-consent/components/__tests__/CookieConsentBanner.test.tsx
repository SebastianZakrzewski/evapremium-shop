import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CookieConsentBanner } from '../CookieConsentBanner'

vi.mock('@/lib/tracking/ga4/consent', () => ({
  applyStoredConsentToGtag: vi.fn(),
}))

const clearConsentCookie = () => {
  document.cookie = 'CookieConsent=; Max-Age=0; Path=/'
}

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    clearConsentCookie()
    delete window.Cookiebot
  })

  it('renders accept and reject with equal button roles when no choice is stored', () => {
    render(<CookieConsentBanner />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Cenimy Twoją prywatność')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Polityka prywatności' })).toHaveAttribute(
      'href',
      '/polityka-prywatnosci'
    )
    expect(screen.getByRole('button', { name: 'Akceptuję i przechodzę dalej' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Odrzuć' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Zarządzaj preferencjami' })).toBeInTheDocument()
  })

  it('hides the banner and stores full consent when accept is clicked', () => {
    render(<CookieConsentBanner />)

    fireEvent.click(screen.getByRole('button', { name: 'Akceptuję i przechodzę dalej' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.cookie).toContain('CookieConsent=')
    expect(decodeURIComponent(document.cookie)).toContain('statistics:true')
    expect(decodeURIComponent(document.cookie)).toContain('marketing:true')
  })

  it('hides the banner and stores a denied choice when reject is clicked', () => {
    render(<CookieConsentBanner />)

    fireEvent.click(screen.getByRole('button', { name: 'Odrzuć' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(decodeURIComponent(document.cookie)).toContain('statistics:false')
    expect(decodeURIComponent(document.cookie)).toContain('marketing:false')
  })

  it('lets the visitor grant statistics without marketing', () => {
    render(<CookieConsentBanner />)

    fireEvent.click(screen.getByRole('button', { name: 'Zarządzaj preferencjami' }))
    fireEvent.click(screen.getByLabelText(/Statystyka/))
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz wybór' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const value = decodeURIComponent(document.cookie)
    expect(value).toContain('statistics:true')
    expect(value).toContain('marketing:false')
  })

  it('does not render when a previous decision is stored', () => {
    document.cookie =
      "CookieConsent={stamp:'x',necessary:true,preferences:false,statistics:false,marketing:false,method:'explicit'}"

    render(<CookieConsentBanner />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
