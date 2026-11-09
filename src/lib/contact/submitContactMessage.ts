import { buildContactEmail, contactFormSchema, getContactEmailConfig } from './schema'
import { isContactRateLimited } from './rateLimit'

export type ContactSubmitResult = {
  status: number
  body: {
    ok: boolean
    delivered?: boolean
    error?: string
  }
}

const validationError = 'Sprawdź pola formularza i spróbuj ponownie.'
const rateLimitError = 'Zbyt wiele wiadomości. Spróbuj ponownie za kilka minut.'
const unavailableError = 'Wysyłka wiadomości jest chwilowo niedostępna. Napisz na evapremium.kontakt@gmail.com.'
const deliveryError = 'Nie udało się wysłać wiadomości. Spróbuj ponownie lub napisz na evapremium.kontakt@gmail.com.'

export const sendContactEmail = async (
  email: ReturnType<typeof buildContactEmail>,
  apiKey: string,
  fetchImpl: typeof fetch
): Promise<void> => {
  const response = await fetchImpl('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(email),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Resend ${response.status}: ${detail.slice(0, 300)}`)
  }
}

export const submitContactMessage = async (input: {
  body: unknown
  ip: string
  now?: Date
  fetchImpl?: typeof fetch
}): Promise<ContactSubmitResult> => {
  const parsed = contactFormSchema.safeParse(input.body)

  if (!parsed.success) {
    return { status: 400, body: { ok: false, error: validationError } }
  }

  if (isContactRateLimited(input.ip || 'unknown', (input.now ?? new Date()).getTime())) {
    return { status: 429, body: { ok: false, error: rateLimitError } }
  }

  if (parsed.data.companyWebsite.trim()) {
    return { status: 200, body: { ok: true, delivered: false } }
  }

  const { apiKey } = getContactEmailConfig()

  if (!apiKey) {
    return { status: 503, body: { ok: false, error: unavailableError } }
  }

  const receivedAt = input.now ?? new Date()
  const email = buildContactEmail(parsed.data, receivedAt)

  try {
    await sendContactEmail(email, apiKey, input.fetchImpl ?? fetch)
  } catch (error) {
    console.error('[contact] Email delivery failed', error instanceof Error ? error.message : error)
    return { status: 502, body: { ok: false, error: deliveryError } }
  }

  return { status: 200, body: { ok: true, delivered: true } }
}
