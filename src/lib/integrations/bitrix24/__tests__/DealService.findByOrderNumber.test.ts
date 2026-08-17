import { describe, expect, it, vi } from 'vitest'
import { DealService } from '../services/DealService'
import type { Bitrix24Client } from '../client'

describe('DealService.findByOrderNumber', () => {
  it('returns null only when Bitrix returns an empty list', async () => {
    const client = {
      get: vi.fn(async () => ({ result: [] })),
    }
    const service = new DealService(client as unknown as Bitrix24Client)

    await expect(service.findByOrderNumber('ORD-2026-000259')).resolves.toBeNull()
  })

  it('does not treat API failures as a missing deal', async () => {
    const client = {
      get: vi.fn(async () => {
        throw new Error('HTTP 400: Bad Request')
      }),
    }
    const service = new DealService(client as unknown as Bitrix24Client)

    await expect(service.findByOrderNumber('ORD-2026-000259')).rejects.toThrow(
      'HTTP 400: Bad Request'
    )
  })
})
