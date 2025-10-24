import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('@/config/env', () => ({ env: { features: { p24Enabled: false } } }))

vi.mock('@/lib/services/OrderService', () => {
  return {
    OrderService: vi.fn().mockImplementation(() => ({
      getOrderBySessionId: vi.fn(),
      updatePaymentStatus: vi.fn(),
      repository: { supabase: {}, mapOrderFromDB: vi.fn() },
    })),
  }
})

// SUT
import * as route from '../callback/route'

function makeRequest(body: any): NextRequest {
  // minimal request with text() API
  return { text: async () => JSON.stringify(body) } as unknown as NextRequest
}

describe('POST /api/payments/p24/callback (disabled)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 503 when P24 is disabled', async () => {
    const payload = { sessionId: 'sess', orderId: '1', amount: 100 }
    const res: any = await route.POST(makeRequest(payload))
    const json = await res.json()
    expect(res.status).toBe(503)
    expect(json.error).toMatch(/P24 disabled/i)
  })
})


