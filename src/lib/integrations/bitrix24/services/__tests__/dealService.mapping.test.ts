import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DealService } from '@/lib/integrations/bitrix24/services/DealService';

describe('DealService mapping → Porzucone Koszyki (Leady z Reklam)', () => {
  const mockClient: any = {
    get: vi.fn(),
    post: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('creates deal with CATEGORY_ID and STAGE_ID resolved by names', async () => {
    // Arrange: categories and stages
    mockClient.get
      // crm.dealcategory.list
      .mockResolvedValueOnce({
        result: [
          { ID: 0, NAME: 'Deale' },
          { ID: 7, NAME: 'Leady z Reklam' },
        ],
      })
      // crm.dealcategory.stage.list
      .mockResolvedValueOnce({
        result: [
          { CATEGORY_ID: 7, STATUS_ID: 'UC_PORZ', NAME: 'Porzucone Koszyki' },
          { CATEGORY_ID: 7, STATUS_ID: 'NEW', NAME: 'Nowy' },
        ],
      });

    let sentFields: any = null;
    mockClient.post.mockImplementation(async (method: string, data: any) => {
      if (method === 'crm.deal.add') {
        sentFields = data?.fields;
        return { result: 'D123' };
      }
      return { result: {} };
    });

    const svc = new DealService(mockClient);

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
    };

    // Act
    const result = await svc.createDealForAbandonedCart(cart);

    // Assert
    expect(result.success).toBe(true);
    expect(result.id).toBe('D123');
    expect(mockClient.post).toHaveBeenCalledWith('crm.deal.add', expect.any(Object));
    expect(sentFields).toBeTruthy();
    expect(sentFields.CATEGORY_ID).toBe(7);
    expect(sentFields.STAGE_ID).toBe('UC_PORZ');
    expect(sentFields.TITLE).toMatch(/^\[Porzucony koszyk\]/);
  });
});


