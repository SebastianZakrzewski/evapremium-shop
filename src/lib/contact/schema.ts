import { z } from 'zod'

const httpUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => {
    if (!value) {
      return true
    }

    try {
      const url = new URL(value)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }, 'Nieprawidłowy adres strony')

export const contactFormSchema = z.object({
  firstName: z.string().trim().min(1, 'Podaj imię').max(80, 'Imię jest za długie'),
  email: z.string().trim().email('Podaj prawidłowy email').max(200),
  subject: z.string().trim().min(1, 'Podaj temat').max(150, 'Temat jest za długi'),
  message: z.string().trim().min(1, 'Napisz wiadomość').max(5000, 'Wiadomość jest za długa'),
  pageUrl: httpUrl.optional().default(''),
  companyWebsite: z.string().max(200).optional().default(''),
})

export type ContactFormInput = z.infer<typeof contactFormSchema>

export const CONTACT_EMAIL_TO_DEFAULT = 'evapremium.kontakt@gmail.com'
export const CONTACT_EMAIL_FROM_DEFAULT = 'EvaPremium <onboarding@resend.dev>'

const emailAddressPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/
const fromHeaderPattern = /^(?:[^<>\r\n]+ <)?[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>?$/

export const stripHeaderBreaks = (value: string): string => value.replace(/[\r\n]+/g, ' ').trim()

export const getContactEmailConfig = (): { to: string; from: string; apiKey: string } => {
  const to = stripHeaderBreaks(process.env.CONTACT_EMAIL_TO?.trim() || CONTACT_EMAIL_TO_DEFAULT)
  const from = stripHeaderBreaks(process.env.CONTACT_EMAIL_FROM?.trim() || CONTACT_EMAIL_FROM_DEFAULT)
  const apiKey = process.env.RESEND_API_KEY?.trim() || ''

  if (!emailAddressPattern.test(to) || !fromHeaderPattern.test(from)) {
    return { to: CONTACT_EMAIL_TO_DEFAULT, from: CONTACT_EMAIL_FROM_DEFAULT, apiKey }
  }

  return { to, from, apiKey }
}

export const formatContactTimestamp = (receivedAt: Date): string => {
  const formatted = new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Warsaw',
  }).format(receivedAt)

  return `${formatted} (${receivedAt.toISOString()})`
}

export type ContactEmail = {
  from: string
  to: string[]
  reply_to: string
  subject: string
  text: string
}

export const buildContactEmail = (input: ContactFormInput, receivedAt: Date): ContactEmail => {
  const { to, from } = getContactEmailConfig()
  const pageUrl = input.pageUrl || 'nie podano'
  const subject = stripHeaderBreaks(`[Kontakt] ${input.subject}`).slice(0, 180)
  const replyTo = stripHeaderBreaks(input.email)

  const text = [
    `Imię: ${input.firstName}`,
    `Email: ${input.email}`,
    `Temat: ${input.subject}`,
    `Strona: ${pageUrl}`,
    `Czas: ${formatContactTimestamp(receivedAt)}`,
    '',
    input.message,
  ].join('\n')

  return {
    from,
    to: [to],
    reply_to: replyTo,
    subject,
    text,
  }
}
