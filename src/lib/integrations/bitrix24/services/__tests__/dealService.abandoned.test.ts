import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/integrations/bitrix24/services/ContactService', () => ({
  contactService: {
    createOrFindContactFromAbandonedCart: vi.fn(async () => ({ id: null, created: false })),
  },
}))

import { DealService } from '@/lib/integrations/bitrix24/services/DealService'
import { stageMappingService } from '@/lib/integrations/bitrix24/services/StageMappingService'

const mockClient = {
  get: vi.fn(),
  post: vi.fn(),
}

describe('DealService - Abandoned carts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(stageMappingService as unknown as { cache: Record<string, unknown>; client: unknown }).cache = {}
    ;(stageMappingService as unknown as { client: unknown }).client = mockClient
    delete process.env.BITRIX24_ABANDONED_CATEGORY_ID
    delete process.env.BITRIX24_ABANDONED_STAGE_ID

    mockClient.get.mockImplementation(async (method: string) => {
      if (method === 'crm.dealcategory.list') {
        return {
          result: [
            { ID: 0, NAME: 'Deale' },
            { ID: 7, NAME: 'Leady z Reklam' },
          ],
        }
      }
      if (method === 'crm.deal.list') return { result: [] }
      return { result: [] }
    })
    mockClient.post.mockImplementation(async (method: string) => {
      if (method === 'crm.status.list') {
        return { result: [{ NAME: 'Porzucone Koszyki', STATUS_ID: 'UC_ABC' }] }
      }
      if (method === 'crm.deal.add') return { result: '12345' }
      return { result: {} }
    })
  })

  it('resolves category/stage by name and creates deal', async () => {
    const svc = new DealService(mockClient as never)
    const cart: any = {
      id: 'c1',
      session_id: 'sess',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
      expire_at: new Date().toISOString(),
      utm: {},
      contact: {},
      car: { make: 'BMW', model: 'X5', year: 2020 },
      configuration: { variant: 1, setType: 2, cellShape: 3 },
      items: [],
      currency: 'PLN',
      total_amount: 199,
    }

    const result = await svc.createDealForAbandonedCart(cart)
    expect(result.success).toBe(true)
    expect(result.id).toBe('12345')
    expect(mockClient.post).toHaveBeenCalledWith('crm.deal.add', expect.objectContaining({
      fields: expect.objectContaining({
        CATEGORY_ID: 7,
        STAGE_ID: 'UC_ABC',
      }),
    }))
  })
})
