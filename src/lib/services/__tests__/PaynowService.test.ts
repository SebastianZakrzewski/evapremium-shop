import { describe, it, expect, vi, beforeEach } from 'vitest'
import crypto from 'crypto'
import { buildSignaturePayload, calculateHmacBase64 } from '../PaynowService'

vi.mock('@/lib/config/paynow', () => ({
  getPaynowConfig: vi.fn(() => ({
    apiKey: '97a55694-5478-43b5-b406-fb49ebfdd2b5',
    signatureKey: 'b305b996-bca5-4404-a0b7-2ccea3d2b64b',
    environment: 'sandbox',
    urlReturn: 'https://example.com/payment/success',
    urlNotification: 'https://example.com/api/payments/paynow/webhook',
    apiUrl: 'https://api.sandbox.paynow.pl',
  })),
}))

import { PaynowService } from '../PaynowService'

describe('PaynowService', () => {
  let service: PaynowService

  beforeEach(() => {
    service = new PaynowService()
    vi.restoreAllMocks()
  })

  it('calculates request signature from Paynow documentation example', () => {
    const payload = buildSignaturePayload(
      {
        'Api-Key': '97a55694-5478-43b5-b406-fb49ebfdd2b5',
        'Idempotency-Key': 'd243fdb3-c287-484a-bb9c-58536f2794c1',
      },
      ''
    )

    const signature = calculateHmacBase64(payload, 'b305b996-bca5-4404-a0b7-2ccea3d2b64b')
    expect(signature).toBe('fXwLZRwo0WiGll90PPl5oULX9VKA0gpFA/3+E+NRp5E=')
  })

  it('verifies webhook notification signature against raw request body', () => {
    const rawBody =
      '{"paymentId":"NOLV-8F9-08K-WGD","externalId":"12345","status":"CONFIRMED","modifiedAt":"2018-12-12T13:24:52"}'
    const expectedSignature = calculateHmacBase64(
      rawBody,
      'b305b996-bca5-4404-a0b7-2ccea3d2b64b'
    )

    expect(service.verifyNotificationSignature(rawBody, expectedSignature)).toBe(true)
    expect(service.verifyNotificationSignature(rawBody, 'invalid-signature')).toBe(false)
  })

  it('creates payment and returns redirect URL', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          redirectUrl: 'https://paywall.sandbox.paynow.pl/TEST?token=abc',
          paymentId: 'NOLV-TEST-123',
          status: 'NEW',
        }),
        { status: 201 }
      )
    )

    const result = await service.createPayment(
      {
        amount: 100,
        externalId: 'order-123',
        description: 'Test transaction',
        buyer: { email: 'test@example.com' },
      },
      'test-idempotency-key'
    )

    expect(result.success).toBe(true)
    expect(result.redirectUrl).toContain('paywall.sandbox.paynow.pl')
    expect(result.paymentId).toBe('NOLV-TEST-123')
    expect(fetchMock).toHaveBeenCalledOnce()

    const [, requestInit] = fetchMock.mock.calls[0]
    expect(requestInit?.method).toBe('POST')
    expect((requestInit?.headers as Record<string, string>)['Idempotency-Key']).toBe(
      'test-idempotency-key'
    )
  })

  it('returns error when Paynow API responds with failure', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Invalid request' }), { status: 400 })
    )

    const result = await service.createPayment(
      {
        amount: 100,
        externalId: 'order-123',
        description: 'Test transaction',
        buyer: { email: 'test@example.com' },
      },
      'test-idempotency-key'
    )

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid request')
  })
})
