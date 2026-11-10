import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_GA_MEASUREMENT_ID, getGaMeasurementId } from '../measurementId'

describe('getGaMeasurementId', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('defaults to the shop measurement id when the env var is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_ID', '')

    expect(getGaMeasurementId()).toBe(DEFAULT_GA_MEASUREMENT_ID)
    expect(DEFAULT_GA_MEASUREMENT_ID).toBe('G-SGHPWGL4P4')
  })

  it('uses a valid NEXT_PUBLIC_GA_ID override', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_ID', 'G-TEST1234')

    expect(getGaMeasurementId()).toBe('G-TEST1234')
  })

  it('trims whitespace and a trailing CRLF from NEXT_PUBLIC_GA_ID', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_ID', 'G-TEST1234\r\n')

    expect(getGaMeasurementId()).toBe('G-TEST1234')
  })

  it('falls back when the override is not a GA4 measurement id', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_ID', 'UA-12345-1')

    expect(getGaMeasurementId()).toBe(DEFAULT_GA_MEASUREMENT_ID)
  })
})
