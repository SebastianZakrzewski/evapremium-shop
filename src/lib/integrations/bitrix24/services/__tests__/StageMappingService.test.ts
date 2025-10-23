import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StageMappingService } from '@/lib/integrations/bitrix24/services/StageMappingService';

describe('StageMappingService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    delete (process as any).env.BITRIX24_ABANDONED_CATEGORY_ID;
    delete (process as any).env.BITRIX24_ABANDONED_STAGE_ID;
  });

  function makeClientMock() {
    return {
      get: vi.fn(),
      post: vi.fn(),
    } as any;
  }

  it('abandoned_cart: returns env values when provided', async () => {
    (process as any).env.BITRIX24_ABANDONED_CATEGORY_ID = '2';
    (process as any).env.BITRIX24_ABANDONED_STAGE_ID = 'C2:UC_SNZYJF';

    const svc = new StageMappingService(makeClientMock());
    const res = await svc.resolveStage({ type: 'abandoned_cart' });
    expect(res.categoryId).toBe(2);
    expect(res.stageId).toBe('C2:UC_SNZYJF');
  });

  it('abandoned_cart: auto-resolves by name when env missing', async () => {
    const mock = makeClientMock();
    mock.get.mockResolvedValueOnce({ result: [ { ID: 2, NAME: 'Leady z Reklam' } ] });
    mock.post.mockResolvedValueOnce({ result: [ { NAME: 'Porzucone Koszyki', STATUS_ID: 'C2:UC_SNZYJF' } ] });

    const svc = new StageMappingService(mock);
    const res = await svc.resolveStage({ type: 'abandoned_cart' });
    expect(res.categoryId).toBe(2);
    expect(res.stageId).toBe('C2:UC_SNZYJF');
  });

  it('order: maps paid + delivered -> WON', () => {
    const svc = new StageMappingService(makeClientMock());
    const res = svc['resolveOrderStage']('delivered', 'paid');
    expect(res.stageId).toBe('WON');
  });

  it('order: maps paid + pending -> UC_DMBNNJ', () => {
    const svc = new StageMappingService(makeClientMock());
    const res = svc['resolveOrderStage']('pending', 'paid');
    expect(res.stageId).toBe('UC_DMBNNJ');
  });

  it('order: maps failed/refunded -> LOSE', () => {
    const svc = new StageMappingService(makeClientMock());
    expect(svc['resolveOrderStage']('confirmed', 'failed').stageId).toBe('LOSE');
    expect(svc['resolveOrderStage']('processing', 'refunded').stageId).toBe('LOSE');
  });

  it('order: maps pending (not paid) -> NEW', () => {
    const svc = new StageMappingService(makeClientMock());
    expect(svc['resolveOrderStage']('pending', 'pending').stageId).toBe('NEW');
  });

  it('order: maps confirmed/processing/shipped (not paid) -> UC_DMBNNJ', () => {
    const svc = new StageMappingService(makeClientMock());
    expect(svc['resolveOrderStage']('confirmed', 'pending').stageId).toBe('UC_DMBNNJ');
    expect(svc['resolveOrderStage']('processing', 'pending').stageId).toBe('UC_DMBNNJ');
    expect(svc['resolveOrderStage']('shipped', 'pending').stageId).toBe('UC_DMBNNJ');
  });
});


