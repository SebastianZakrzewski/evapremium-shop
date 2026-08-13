import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('@/config/env', () => ({ env: { features: { paynowEnabled: false } } }))

vi.mock('@/lib/services/PaymentService', () => ({
  PaymentService: vi.fn().mockImplementation(() => ({
    initiatePayment: vi.fn(),
  })),
}))

import * as registerRoute from '../register/route'
import * as webhookRoute from '../webhook/route'

const makeJsonRequest = (body: unknown): NextRequest =>
  ({ json: async () => body }) as unknown as NextRequest

const makeWebhookRequest = (body: string, signature?: string): NextRequest =>
  ({
    text: async () => body,
    headers: {
      get: (name: string) => (name.toLowerCase() === 'signature' ? signature ?? null : null),
    },
  }) as unknown as NextRequest

describe('Paynow API routes (disabled)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('register returns 503 when Paynow is disabled', async () => {
    const res = await registerRoute.POST(makeJsonRequest({ orderId: 'order-1' }))
    const json = await res.json()

    expect(res.status).toBe(503)
    expect(json.error).toMatch(/Paynow disabled/i)
  })

  it('webhook returns 503 when Paynow is disabled', async () => {
    const res = await webhookRoute.POST(makeWebhookRequest('{}'))
    const json = await res.json()

    expect(res.status).toBe(503)
    expect(json.error).toMatch(/Paynow disabled/i)
  })
})
