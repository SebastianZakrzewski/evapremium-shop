import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  EVA_CHAT_GREETING_DELAY_MS,
  EVA_CHAT_GREETING_TEXT,
  EVA_CHAT_TYPE_INTERVAL_MS,
  EVA_CHAT_TYPING_MS,
} from '../../hooks/useEvaChatGreeting'
import { COOKIE_CONSENT_ACCEPTED_EVENT } from '@/features/cookie-consent'
import {
  buildEvaWidgetFrameSrc,
  defaultEvaWidgetPlugin,
  DEFAULT_EVA_WIDGET_ORIGIN,
} from '../../lib/evaWidgetPlugin'
import { EvaChatWidget } from '../EvaChatWidget'

const grantPrivacyConsent = () => {
  document.cookie = 'CookieConsent=necessary:true,preferences:true,statistics:true,marketing:true'
}

const clearPrivacyConsent = () => {
  document.cookie = 'CookieConsent=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
}

const finishGreeting = () => {
  act(() => {
    vi.advanceTimersByTime(EVA_CHAT_GREETING_DELAY_MS)
  })
  act(() => {
    vi.advanceTimersByTime(EVA_CHAT_TYPING_MS)
  })
  for (let index = 0; index < EVA_CHAT_GREETING_TEXT.length; index += 1) {
    act(() => {
      vi.advanceTimersByTime(EVA_CHAT_TYPE_INTERVAL_MS)
    })
  }
}

describe('EvaChatWidget', () => {
  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
    delete window.widgetPlugin
    Reflect.deleteProperty(window, 'matchMedia')
    clearPrivacyConsent()
    vi.useRealTimers()
  })

  it('keeps the greeting hidden until the privacy window is accepted', () => {
    vi.useFakeTimers()
    render(<EvaChatWidget />)

    act(() => {
      vi.advanceTimersByTime(EVA_CHAT_GREETING_DELAY_MS + EVA_CHAT_TYPING_MS)
    })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    act(() => {
      window.dispatchEvent(new Event(COOKIE_CONSENT_ACCEPTED_EVENT))
    })
    act(() => {
      vi.advanceTimersByTime(EVA_CHAT_GREETING_DELAY_MS)
    })

    expect(screen.getByRole('status')).toHaveTextContent('EvaBot pisze')
  })

  it('waits, shows typing, then writes the greeting above the launcher', () => {
    vi.useFakeTimers()
    grantPrivacyConsent()
    render(<EvaChatWidget />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(EVA_CHAT_GREETING_DELAY_MS)
    })

    expect(screen.getByRole('status')).toHaveTextContent('EvaBot pisze')
    expect(screen.queryByText('Cześć!')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(EVA_CHAT_TYPING_MS)
    })
    for (let index = 0; index < EVA_CHAT_GREETING_TEXT.length; index += 1) {
      act(() => {
        vi.advanceTimersByTime(EVA_CHAT_TYPE_INTERVAL_MS)
      })
    }

    const greeting = screen.getByRole('status')
    expect(greeting).toHaveTextContent('Cześć!')
    expect(greeting).toHaveTextContent('Służę pomocą.')

    const launcher = screen.getByRole('button', { name: 'Otwórz czat EvaBot' })
    expect(launcher.compareDocumentPosition(greeting) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(0)
  })

  it('hides the launcher on the production shop', () => {
    const originalLocation = window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, hostname: 'www.evapremium.pl' },
    })

    render(<EvaChatWidget />)

    expect(screen.queryByRole('button', { name: 'Otwórz czat EvaBot' })).not.toBeInTheDocument()

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
  })

  it('opens the chat from the icon', () => {
    vi.useFakeTimers()
    grantPrivacyConsent()
    render(<EvaChatWidget />)
    finishGreeting()

    expect(document.querySelector('iframe[title="EVA Premium czat"]')).toBeNull()
    expect(screen.getByRole('button', { name: 'Otwórz czat EvaBot' }).querySelector('img')).toHaveAttribute(
      'src',
      '/evabot-icon.jpg'
    )

    const slot = document.querySelector('[data-eva-chat-slot]')
    expect(slot).toHaveClass('hidden')

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(max-width: 767px)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    fireEvent.click(screen.getByRole('button', { name: 'Otwórz czat EvaBot' }))

    expect(document.querySelector('iframe[title="EVA Premium czat"]')).toHaveAttribute(
      'src',
      buildEvaWidgetFrameSrc(DEFAULT_EVA_WIDGET_ORIGIN, defaultEvaWidgetPlugin())
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Zamknij czat EvaBot' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    expect(slot).not.toHaveClass('hidden')
    expect(slot?.parentElement).toHaveClass('inset-0', 'h-dvh', 'w-dvw')
    expect(document.querySelector('iframe[title="EVA Premium czat"]')).toHaveClass(
      'max-md:rounded-none'
    )
    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.click(screen.getByRole('button', { name: 'Zamknij czat EvaBot' }))

    expect(document.body.style.overflow).toBe('')
  })
})
