export const DEFAULT_GA_MEASUREMENT_ID = 'G-SGHPWGL4P4'

const GA_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/

export const isGaMeasurementId = (value: string): boolean =>
  GA_MEASUREMENT_ID_PATTERN.test(value)

/**
 * NEXT_PUBLIC_GA_ID overrides the shop default. An empty or invalid value
 * falls back so production works without a Vercel env var.
 */
export const getGaMeasurementId = (): string => {
  const configured = process.env.NEXT_PUBLIC_GA_ID?.trim()

  if (configured && isGaMeasurementId(configured)) {
    return configured
  }

  return DEFAULT_GA_MEASUREMENT_ID
}
