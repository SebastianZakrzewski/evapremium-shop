import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

type Row = Record<string, unknown> & { id: string }

const rows: Row[] = []

function memoryFrom() {
  const filters: Array<(row: Row) => boolean> = []
  let op: 'select' | 'insert' | 'update' = 'select'
  let payload: Record<string, unknown> | null = null

  const api = {
    select() { return api },
    eq(key: string, value: unknown) {
      filters.push((row) => row[key] === value)
      return api
    },
    in(key: string, values: unknown[]) {
      filters.push((row) => values.includes(row[key]))
      return api
    },
    is(key: string, value: unknown) {
      filters.push((row) => (value == null ? row[key] == null : row[key] === value))
      return api
    },
    order() { return api },
    limit() { return api },
    insert(next: Record<string, unknown>) {
      op = 'insert'
      payload = next
      return api
    },
    update(next: Record<string, unknown>) {
      op = 'update'
      payload = next
      return api
    },
    single() { return api },
    then(resolve: (value: { data: unknown; error: null }) => void, reject?: (reason: unknown) => void) {
      try {
        if (op === 'insert') {
          const row = { id: `rec_${rows.length + 1}`, ...(payload || {}) }
          rows.push(row)
          resolve({ data: row, error: null })
          return
        }
        if (op === 'update') {
          const index = rows.findIndex((row) => filters.every((filter) => filter(row)))
          if (index >= 0) rows[index] = { ...rows[index], ...(payload || {}) }
          resolve({ data: rows[index] || null, error: null })
          return
        }
        resolve({ data: rows.filter((row) => filters.every((filter) => filter(row))), error: null })
      } catch (error) {
        reject?.(error)
      }
    },
  }
  return api
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: () => memoryFrom() }),
}))

vi.mock('@/lib/services/abandonedCartExportGuard', () => ({
  findRecentBlockingOrderForHeartbeat: vi.fn(async () => null),
  findRecentBlockingOrderForBitrixExport: vi.fn(async () => null),
}))

vi.mock('@/lib/integrations/bitrix24/services/DealService', () => ({
  dealService: {
    createDealForAbandonedCart: vi.fn(async () => ({ success: true, id: 'D999' })),
    findByOriginId: vi.fn(async () => null),
  },
}))

import * as route from '../webhook/route'

function makeRequest(body: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest
}

describe('POST /api/abandoned-carts/webhook', () => {
  beforeEach(() => {
    rows.length = 0
    vi.clearAllMocks()
  })

  it('upserts record and creates Bitrix24 deal on pagehide event', async () => {
    const payload = {
      sessionId: 'sess_12345678',
      stage: 'checkout_step2',
      cartHasItems: true,
      utm: { source: 'ads' },
      contact: { email: 'user@example.com' },
      car: { make: 'BMW', model: 'X5' },
      configuration: { variant: 1 },
      items: [{ productId: 'p1', quantity: 1, price: 100, currency: 'PLN' }],
      currency: 'PLN',
      totalAmount: 100,
      event: 'pagehide',
    }

    const res = await route.POST(makeRequest(payload))
    const json = await res.json()

    expect(json.success).toBe(true)
    expect(json.dealId).toBe('D999')
    expect(json.recordId).toMatch(/^rec_/)
  })

  it('rejects when not eligible (wrong stage)', async () => {
    const payload = { sessionId: 'sess_12345678', stage: 'checkout_step1', cartHasItems: true }
    const res = await route.POST(makeRequest(payload))
    const json = await res.json()
    expect(res.status).toBe(400)
    expect(json.success).toBe(false)
  })
})
