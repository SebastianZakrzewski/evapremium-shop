import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

// SUT
import * as route from '../webhook/route';

// Mocks
vi.mock('@supabase/supabase-js', () => {
  const records: any[] = [];

  const makeQuery = () => {
    let table = '';
    let selectCols = '*';
    const filters: Array<(row: any) => boolean> = [];
    let _limit = Infinity;
    let orderDesc = false;

    const api: any = {
      from: (t: string) => { table = t; return api; },
      select: (cols: string) => { selectCols = cols; return api; },
      eq: (col: string, val: any) => { filters.push((r) => r[col] === val); return api; },
      is: (col: string, val: any) => { filters.push((r) => (val === null ? r[col] == null : r[col] === val)); return api; },
      contains: (_col: string, _val: any) => { return api; },
      order: (_col: string, opts: { ascending: boolean }) => { orderDesc = !opts.ascending; return api; },
      limit: (n: number) => { _limit = n; return api; },
      single: () => api,
      // Reads
      then: undefined,
      async execSelect() {
        if (table !== 'abandoned_carts') return { data: [], error: null };
        let data = records.filter((r) => filters.every((f) => f(r)));
        if (orderDesc) data = data.reverse();
        if (Number.isFinite(_limit)) data = data.slice(0, _limit);
        if (selectCols === 'id') data = data.map((r) => ({ id: r.id }));
        return { data, error: null };
      },
      async execSelectSingle() {
        const { data, error } = await api.execSelect();
        return { data: data[0] ?? null, error };
      },
      async insert(payload: any) {
        const row = { id: `rec_${records.length + 1}`, ...payload };
        records.push(row);
        return { data: row, error: null };
      },
      async update(payload: any) {
        // simplistic update by last filter eq('id', id)
        const byId = filters.findLast?.((f: any) => f) || (() => true);
        const idx = records.findIndex((r) => byId(r));
        if (idx >= 0) {
          records[idx] = { ...records[idx], ...payload };
          return { data: records[idx], error: null };
        }
        return { data: null, error: { message: 'not found' } } as any;
      },
    };

    return api;
  };

  return {
    createClient: vi.fn(() => ({
      from: (_: string) => makeQuery(),
    })),
  };
});

vi.mock('@/config/env', () => ({ env: { supabase: { url: 'url', serviceRoleKey: 'key' }, nodeEnv: 'test' } }));

vi.mock('@/lib/integrations/bitrix24/services/DealService', () => {
  return {
    dealService: {
      createDealForAbandonedCart: vi.fn(async () => ({ success: true, id: 'D999' })),
    },
  };
});

function makeRequest(body: any): NextRequest {
  // minimal shim
  return {
    json: async () => body,
  } as unknown as NextRequest;
}

describe('POST /api/abandoned-carts/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    };

    const res = await route.POST(makeRequest(payload));
    const json: any = await (res as any).json();

    expect(json.success).toBe(true);
    expect(json.dealId).toBe('D999');
    expect(json.recordId).toMatch(/^rec_/);
  });

  it('rejects when not eligible (wrong stage)', async () => {
    const payload = { sessionId: 'sess_12345678', stage: 'checkout_step1', cartHasItems: true };
    const res: any = await route.POST(makeRequest(payload));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });
});


