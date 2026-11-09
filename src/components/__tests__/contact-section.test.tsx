import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ContactSection from '../contact-section'

const trackGaGenerateLead = vi.hoisted(() => vi.fn())

vi.mock('@/lib/tracking/ga4/events', () => ({
  trackGaGenerateLead,
}))

const fillForm = () => {
  fireEvent.change(screen.getByLabelText('Imię'), { target: { value: 'Anna' } })
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'anna@example.com' } })
  fireEvent.change(screen.getByLabelText('Temat'), { target: { value: 'Wycena' } })
  fireEvent.change(screen.getByLabelText('Wiadomość'), { target: { value: 'Poproszę o kontakt.' } })
}

describe('ContactSection', () => {
  beforeEach(() => {
    trackGaGenerateLead.mockClear()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('keeps the typed data and skips generate_lead when sending fails', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: false, error: 'Nie udało się wysłać wiadomości.' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    render(<ContactSection />)
    fillForm()
    fireEvent.click(screen.getByRole('button', { name: /Wyślij Wiadomość/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Nie udało się wysłać wiadomości.')
    expect(screen.getByLabelText('Imię')).toHaveValue('Anna')
    expect(screen.getByLabelText('Wiadomość')).toHaveValue('Poproszę o kontakt.')
    expect(trackGaGenerateLead).not.toHaveBeenCalled()
  })

  it('fires generate_lead only after the server confirms delivery', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true, delivered: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    render(<ContactSection />)
    fillForm()
    fireEvent.click(screen.getByRole('button', { name: /Wyślij Wiadomość/ }))

    expect(await screen.findByText('Wysłano Pomyślnie')).toBeInTheDocument()
    await waitFor(() => {
      expect(trackGaGenerateLead).toHaveBeenCalledTimes(1)
    })
    expect(trackGaGenerateLead).toHaveBeenCalledWith('contact_form')
  })
})
