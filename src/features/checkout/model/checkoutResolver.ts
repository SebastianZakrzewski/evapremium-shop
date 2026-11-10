import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldErrors, Resolver } from 'react-hook-form'
import type { ZodIssue } from 'zod'
import { checkoutSchema, type CheckoutFormData } from './checkoutSchema'

const stepTwoFields = new Set([
  'street',
  'postalCode',
  'city',
  'country',
  'nip',
  'sameAsShipping',
  'billingStreet',
  'billingPostalCode',
  'billingCity',
  'billingCountry',
])

const stepThreeFields = new Set([
  'paymentMethod',
  'termsAccepted',
  'marketingAccepted',
  'notes',
  'discountCode',
])

export const checkoutFieldStep = (field: string): 1 | 2 | 3 => {
  if (stepTwoFields.has(field)) return 2
  if (stepThreeFields.has(field)) return 3
  return 1
}

const toFieldErrors = (issues: ZodIssue[]): FieldErrors<CheckoutFormData> => {
  const errors: Record<string, { type: string; message: string }> = {}

  for (const issue of issues) {
    const field = issue.path[0]
    if (typeof field !== 'string' || errors[field]) continue
    errors[field] = { type: issue.code, message: issue.message }
  }

  return errors as FieldErrors<CheckoutFormData>
}

const readIssues = (error: unknown): ZodIssue[] | null => {
  if (!error || typeof error !== 'object' || !('issues' in error)) return null
  const issues = (error as { issues?: unknown }).issues
  return Array.isArray(issues) ? (issues as ZodIssue[]) : null
}

/**
 * @hookform/resolvers treats only errors with an `.errors` array as Zod failures.
 * Zod 4 exposes `.issues` instead, so an invalid checkout throws and the submit
 * handler never runs. Map those issues back into field errors.
 */
export const checkoutFormResolver: Resolver<CheckoutFormData> = async (values, context, options) => {
  try {
    return await zodResolver(checkoutSchema)(values, context, options)
  } catch (error) {
    const issues = readIssues(error)
    if (!issues) throw error

    return {
      values: {},
      errors: toFieldErrors(issues),
    }
  }
}
