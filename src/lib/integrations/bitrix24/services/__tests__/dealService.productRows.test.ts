import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DealService } from '@/lib/integrations/bitrix24/services/DealService'

const mockClient = {
  post: vi.fn(),
  get: vi.fn(),
  batch: vi.fn(),
}

describe('DealService.addProductsToDeal', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('sets all product rows in a single productrows.set call', async () => {
    mockClient.post.mockResolvedValue({ result: true })

    const service = new DealService(mockClient as any)
    const result = await service.addProductsToDeal('deal-1', [
      {
        PRODUCT_NAME: 'Dywaniki Toyota Yaris 4 gen',
        QUANTITY: 1,
        PRICE: 637,
      },
      {
        PRODUCT_NAME: 'Podpietka plastikowa',
        QUANTITY: 1,
        PRICE: 50,
      },
    ])

    expect(result.success).toBe(true)
    expect(mockClient.post).toHaveBeenCalledTimes(1)
    expect(mockClient.post).toHaveBeenCalledWith('crm.deal.productrows.set', {
      id: 'deal-1',
      rows: [
        {
          PRODUCT_NAME: 'Dywaniki Toyota Yaris 4 gen',
          QUANTITY: 1,
          PRICE: 637,
        },
        {
          PRODUCT_NAME: 'Podpietka plastikowa',
          QUANTITY: 1,
          PRICE: 50,
        },
      ],
    })
    expect(mockClient.batch).not.toHaveBeenCalled()
  })
})

describe('DealService.updateDealStage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('appends stage comment without replacing existing deal comments', async () => {
    mockClient.get
      .mockResolvedValueOnce({
        result: {
          ID: 'deal-1',
          TITLE: 'Zamówienie ORD-1',
          STAGE_ID: 'NEW',
          OPPORTUNITY: 637,
          CURRENCY_ID: 'PLN',
          COMMENTS: 'Klient: Jan\nEmail: jan@example.com',
        },
      })
      .mockResolvedValueOnce({
        result: {
          ID: 'deal-1',
          TITLE: 'Zamówienie ORD-1',
          STAGE_ID: 'UC_DMBNNJ',
          OPPORTUNITY: 637,
          CURRENCY_ID: 'PLN',
          COMMENTS: 'Klient: Jan\nEmail: jan@example.com\n\nStatus: paid',
        },
      })
    mockClient.post.mockResolvedValue({ result: true })

    const service = new DealService(mockClient as any)
    const result = await service.updateDealStage('deal-1', {
      stageId: 'UC_DMBNNJ',
      comment: 'Status: paid',
    })

    expect(result.success).toBe(true)
    expect(mockClient.post).toHaveBeenCalledWith('crm.deal.update', {
      id: 'deal-1',
      fields: {
        STAGE_ID: 'UC_DMBNNJ',
        COMMENTS: 'Klient: Jan\nEmail: jan@example.com\n\nStatus: paid',
      },
    })
  })
})
