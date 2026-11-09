import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetContactRateLimit } from '../rateLimit'
import { submitContactMessage } from '../submitContactMessage'

const validBody = {
  firstName: 'Anna',
  email: 'anna@example.com',
  subject: 'Dywaniki do Audi',
  message: 'Dzień dobry, proszę o wycenę.',
  pageUrl: 'https://evapremium.pl/kontakt',
  companyWebsite: '',
}

const jsonResponse = (status: number, body = '') =>
  new Response(body, { status, headers: { 'Content-Type': 'application/json' } })

describe('submitContactMessage', () => {
  beforeEach(() => {
    resetContactRateLimit()
    vi.stubEnv('RESEND_API_KEY', 're_test_key')
    vi.stubEnv('CONTACT_EMAIL_TO', '')
    vi.stubEnv('CONTACT_EMAIL_FROM', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('rejects an incomplete message', async () => {
    const fetchImpl = vi.fn()
    const result = await submitContactMessage({
      body: { ...validBody, message: '   ' },
      ip: '203.0.113.10',
      fetchImpl,
    })

    expect(result.status).toBe(400)
    expect(result.body.ok).toBe(false)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('sends imię, email, temat, wiadomość, timestamp and page URL with reply-to', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200, '{"id":"email_1"}'))
    const now = new Date('2026-11-04T17:52:00.000Z')

    const result = await submitContactMessage({
      body: { ...validBody, subject: 'Temat\nBcc: spam' },
      ip: '203.0.113.10',
      now,
      fetchImpl,
    })

    expect(result).toEqual({ status: 200, body: { ok: true, delivered: true } })
    expect(fetchImpl).toHaveBeenCalledTimes(1)

    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.resend.com/emails')
    expect(init.headers).toMatchObject({ Authorization: 'Bearer re_test_key' })

    const payload = JSON.parse(String(init.body))
    expect(payload.to).toEqual(['evapremium.kontakt@gmail.com'])
    expect(payload.reply_to).toBe('anna@example.com')
    expect(payload.from).toBe('EvaPremium <onboarding@resend.dev>')
    expect(payload.subject).toBe('[Kontakt] Temat Bcc: spam')
    expect(payload.subject).not.toContain('\n')
    expect(payload.text).toContain('Imię: Anna')
    expect(payload.text).toContain('Email: anna@example.com')
    expect(payload.text).toContain('Temat: Temat\nBcc: spam')
    expect(payload.text).toContain('Strona: https://evapremium.pl/kontakt')
    expect(payload.text).toContain('2026-11-04T17:52:00.000Z')
    expect(payload.text).toContain('Dzień dobry, proszę o wycenę.')
  })

  it('does not send or confirm delivery when the honeypot is filled', async () => {
    const fetchImpl = vi.fn()
    const result = await submitContactMessage({
      body: { ...validBody, companyWebsite: 'https://spam.example' },
      ip: '203.0.113.11',
      fetchImpl,
    })

    expect(result).toEqual({ status: 200, body: { ok: true, delivered: false } })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('rate limits the sixth message from the same IP', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200, '{}'))
    const now = new Date('2026-11-04T12:00:00.000Z')

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const result = await submitContactMessage({
        body: validBody,
        ip: '203.0.113.12',
        now,
        fetchImpl,
      })
      expect(result.status).toBe(200)
    }

    const limited = await submitContactMessage({
      body: validBody,
      ip: '203.0.113.12',
      now,
      fetchImpl,
    })

    expect(limited.status).toBe(429)
    expect(fetchImpl).toHaveBeenCalledTimes(5)
  })

  it('returns 503 when RESEND_API_KEY is missing', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    const fetchImpl = vi.fn()
    const result = await submitContactMessage({
      body: validBody,
      ip: '203.0.113.13',
      fetchImpl,
    })

    expect(result.status).toBe(503)
    expect(result.body.delivered).toBeUndefined()
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('keeps the failure message when Resend rejects the message', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(422, '{"message":"invalid from"}'))
    const result = await submitContactMessage({
      body: validBody,
      ip: '203.0.113.14',
      fetchImpl,
    })

    expect(result.status).toBe(502)
    expect(result.body.ok).toBe(false)
    expect(result.body.error).toContain('Nie udało się wysłać')
  })
})
