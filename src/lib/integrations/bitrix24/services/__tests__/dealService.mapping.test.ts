import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/integrations/bitrix24/services/ContactService', () => ({
  contactService: {
    createOrFindContactFromAbandonedCart: vi.fn(async () => ({ id: null, created: false })),
  },
}))

import { DealService } from '@/lib/integrations/bitrix24/services/DealService'
import { stageMappingService } from '@/lib/integrations/bitrix24/services/StageMappingService'

describe('DealService mapping → Porzucone Koszyki (Leady z Reklam)', () => {
  const mockClient: any = {
    get: vi.fn(),
    post: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(stageMappingService as unknown as { cache: Record<string, unknown> }).cache = {}
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
  })

  it('creates deal with CATEGORY_ID and STAGE_ID resolved by names', async () => {
    let sentFields: any = null
    mockClient.post.mockImplementation(async (method: string, data: any) => {
      if (method === 'crm.status.list') {
        return {
          result: [
            { NAME: 'Porzucone Koszyki', STATUS_ID: 'UC_PORZ' },
            { NAME: 'Nowy', STATUS_ID: 'NEW' },
          ],
        }
      }
      if (method === 'crm.deal.add') {
        sentFields = data?.fields
        return { result: 'D123' }
      }
      return { result: {} }
    })

    const svc = new DealService(mockClient)
    const cart: any = {
      id: 'cart-1',
      session_id: 'sess-abc-12345678',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
      expire_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      utm: { source: 'ads' },
      contact: { email: 'user@example.com', phone: '+48123123123' },
      car: { make: 'BMW', model: 'X5', year: 2020 },
      configuration: { variant: 1, setType: 2, cellShape: 3, materialColor: 4, trimColor: 5 },
      items: [],
      currency: 'PLN',
      total_amount: 219,
    }

    const result = await svc.createDealForAbandonedCart(cart)

    expect(result.success).toBe(true)
    expect(result.id).toBe('D123')
    expect(mockClient.post).toHaveBeenCalledWith('crm.deal.add', expect.any(Object))
    expect(sentFields).toBeTruthy()
    expect(sentFields.CATEGORY_ID).toBe(7)
    expect(sentFields.STAGE_ID).toBe('UC_PORZ')
    expect(sentFields.TITLE).toMatch(/^\[Porzucony koszyk\]/)
  })
})
