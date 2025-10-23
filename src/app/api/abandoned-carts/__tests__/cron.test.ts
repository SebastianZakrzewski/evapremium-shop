import { describe, it, expect, beforeEach, vi } from 'vitest';

// In-memory dataset
const db: { abandoned_carts: any[] } = { abandoned_carts: [] };

// Mock supabase client
vi.mock('@supabase/supabase-js', () => {
  function filterRows(rows: any[], filters: any[]) {
    return rows.filter((row) =>
      filters.every((f) => {
        const [type, key, value] = f;
        if (type === 'eq') return row[key] === value;
        if (type === 'is') return (value === null ? row[key] == null : row[key] === value);
        if (type === 'lte') return row[key] <= value;
        if (type === 'contains') {
          const needle = value || {};
          const hay = row[key] || {};
          return Object.keys(needle).every((k) => hay[k] === needle[k]);
        }
        return true;
      })
    );
  }

  function table(name: string) {
    let filters: any[] = [];
    let limitVal: number | null = null;
    const api: any = {
      select: (_: any = '*') => api,
      eq: (key: string, value: any) => { filters.push(['eq', key, value]); return api; },
      is: (key: string, value: any) => { filters.push(['is', key, value]); return api; },
      lte: (key: string, value: any) => { filters.push(['lte', key, value]); return api; },
      contains: (key: string, value: any) => { filters.push(['contains', key, value]); return api; },
      limit: (n: number) => { limitVal = n; return api; },
      then: undefined,
      from: undefined,
      // get rows
    };
    (api as any)._get = () => {
      const rows = filterRows(db[name as 'abandoned_carts'], filters);
      return typeof limitVal === 'number' ? rows.slice(0, limitVal) : rows;
    };
    return api;
  }

  return {
    createClient: () => ({ from: table }),
  };
});

// Mock dealService
vi.mock('@/lib/integrations/bitrix24/services/DealService', () => ({
  dealService: {
    createDealForAbandonedCart: vi.fn(async () => ({ id: 'D1', success: true }))
  }
}));

import { POST as CronPOST } from '@/app/api/abandoned-carts/cron/route';

describe('abandoned-carts cron API', () => {
  beforeEach(() => {
    db.abandoned_carts.length = 0;
    // seed one expired cart
    db.abandoned_carts.push({
      id: '1',
      session_id: 's1',
      status: 'pending',
      bitrix_deal_id: null,
      expire_at: new Date(Date.now() - 1000).toISOString(),
      metadata: { stage: 'checkout_step2' },
      currency: 'PLN',
      total_amount: 100,
    });
  });

  it('exports expired carts and returns success', async () => {
    const req: any = {};
    const res: any = await CronPOST(req as any);
    expect(res.status).toBe(200);
  });
});


