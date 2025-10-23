import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DealService } from '@/lib/integrations/bitrix24/services/DealService';

const mockClient = {
  get: vi.fn(),
  post: vi.fn(),
};

describe('DealService - Abandoned carts', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('resolves category/stage by name and creates deal', async () => {
    // crm.dealcategory.list
    mockClient.get.mockResolvedValueOnce({
      result: [
        { ID: 0, NAME: 'Deale' },
        { ID: 7, NAME: 'Leady z Reklam' },
      ],
    });
    // crm.dealcategory.stage.list
    mockClient.get.mockResolvedValueOnce({
      result: [
        { CATEGORY_ID: 7, STATUS_ID: 'UC_ABC', NAME: 'Porzucone Koszyki' },
      ],
    });
    // crm.deal.add
    mockClient.post = vi.fn().mockResolvedValue({ result: '12345' });

    const svc = new DealService(mockClient as any);
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
    };

    const result = await svc.createDealForAbandonedCart(cart);
    expect(result.success).toBe(true);
    expect(result.id).toBe('12345');
    expect(mockClient.post).toHaveBeenCalled();
  });
});


