import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('@/config/env', () => ({ env: { features: { p24Enabled: false } } }))

vi.mock('@/lib/services/OrderService', () => {
  return {
    OrderService: vi.fn().mockImplementation(() => ({
      getOrderById: vi.fn(),
      updateOrderP24Data: vi.fn(),
      getOrderBySessionId: vi.fn(),
      repository: { supabase: {}, mapOrderFromDB: vi.fn() },
    })),
  }
})

// SUT
import * as route from '../register/route'

function makeRequest(body: any): NextRequest {
  return { json: async () => body } as unknown as NextRequest
}

describe('POST /api/payments/p24/register (disabled)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 503 when P24 is disabled', async () => {
    const res: any = await route.POST(makeRequest({ orderId: 'ORD-1' }))
    const json = await res.json()
    expect(res.status).toBe(503)
    expect(json.error).toMatch(/P24 disabled/i)
  })
})


