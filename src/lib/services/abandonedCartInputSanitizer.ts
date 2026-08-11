const isValidEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const sanitizeOptionalString = (
  value: unknown,
  minLength: number,
  maxLength: number
): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (trimmed.length < minLength || trimmed.length > maxLength) return undefined
  return trimmed
}

const sanitizeContact = (contact: unknown): Record<string, string> | undefined => {
  if (!contact || typeof contact !== 'object') return undefined

  const raw = contact as Record<string, unknown>
  const sanitized: Record<string, string> = {}

  const email = typeof raw.email === 'string' && isValidEmail(raw.email.trim())
    ? raw.email.trim()
    : undefined
  if (email) sanitized.email = email

  const phone = sanitizeOptionalString(raw.phone, 5, 32)
  if (phone) sanitized.phone = phone

  const firstName = sanitizeOptionalString(raw.firstName, 2, 64)
  if (firstName) sanitized.firstName = firstName

  const lastName = sanitizeOptionalString(raw.lastName, 2, 64)
  if (lastName) sanitized.lastName = lastName

  const taxId = sanitizeOptionalString(raw.taxId, 1, 16)
  if (taxId) sanitized.taxId = taxId

  return Object.keys(sanitized).length > 0 ? sanitized : undefined
}

const sanitizeAddress = (address: unknown): Record<string, string> | undefined => {
  if (!address || typeof address !== 'object') return undefined

  const raw = address as Record<string, unknown>
  const sanitized: Record<string, string> = {}

  const street = sanitizeOptionalString(raw.street, 1, 255)
  if (street) sanitized.street = street

  const city = sanitizeOptionalString(raw.city, 2, 100)
  if (city) sanitized.city = city

  const postalCode = sanitizeOptionalString(raw.postalCode, 2, 20)
  if (postalCode) sanitized.postalCode = postalCode

  const country = sanitizeOptionalString(raw.country, 2, 100)
  if (country) sanitized.country = country

  return Object.keys(sanitized).length > 0 ? sanitized : undefined
}

/**
 * Strips partially filled checkout fields before Zod validation.
 * Heartbeat payloads often contain invalid-in-progress form values.
 */
export const sanitizeAbandonedCartRawInput = (raw: unknown): unknown => {
  if (!raw || typeof raw !== 'object') return raw

  const input = { ...(raw as Record<string, unknown>) }
  input.contact = sanitizeContact(input.contact)
  input.address = sanitizeAddress(input.address)

  return input
}
