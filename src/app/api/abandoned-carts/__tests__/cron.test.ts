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
    const filters: any[] = [];
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
import { dealService } from '@/lib/integrations/bitrix24/services/DealService';

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

  it('does not export carts when preview isolation is missing or active', async () => {
    vi.mocked(dealService.createDealForAbandonedCart).mockClear()
    vi.stubEnv('VERCEL_ENV', 'preview')
    const blocked: any = await CronPOST({} as any)
    expect(blocked.status).toBe(503)
    expect(dealService.createDealForAbandonedCart).not.toHaveBeenCalled()

    vi.stubEnv('SANDBOX_SUPABASE_PROJECT_REF', 'aaaaaaaaaaaaaaaaaaaa')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://aaaaaaaaaaaaaaaaaaaa.supabase.co')
    vi.stubEnv('PAYNOW_ENABLED', 'true')
    vi.stubEnv('PAYNOW_ENVIRONMENT', 'sandbox')
    vi.stubEnv('PAYNOW_API_KEY', 'sandbox-key')
    vi.stubEnv('PAYNOW_SIGNATURE_KEY', 'sandbox-secret')
    vi.stubEnv('PAYNOW_RETURN_URL', 'https://preview.example/payment/success')
    vi.stubEnv('PAYNOW_NOTIFICATION_URL', 'https://preview.example/api/payments/paynow/webhook')
    vi.stubEnv('SANDBOX_PUBLIC_HOST', 'preview.example')
    vi.stubEnv('P24_ENABLED', 'false')
    vi.stubEnv('BITRIX24_WEBHOOK_ENABLED', 'false')
    vi.stubEnv('BITRIX24_WEBHOOK_URL', '')
    vi.stubEnv('BITRIX24_AUTO_SYNC_ORDERS', 'false')

    const skipped: any = await CronPOST({} as any)
    const body = await skipped.json()
    expect(skipped.status).toBe(200)
    expect(body.reason).toBe('sandbox_no_crm')
    expect(dealService.createDealForAbandonedCart).not.toHaveBeenCalled()
    vi.unstubAllEnvs()
  });
});


