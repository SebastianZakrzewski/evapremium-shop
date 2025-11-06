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
    let orderBy: { key: string; asc: boolean } | null = null;
    let limitVal: number | null = null;

    const api: any = {
      select: (_: any = '*') => api,
      eq: (key: string, value: any) => { filters.push(['eq', key, value]); return api; },
      is: (key: string, value: any) => { filters.push(['is', key, value]); return api; },
      lte: (key: string, value: any) => { filters.push(['lte', key, value]); return api; },
      contains: (key: string, value: any) => { filters.push(['contains', key, value]); return api; },
      order: (key: string, opts: { ascending: boolean }) => { orderBy = { key, asc: opts.ascending }; return api; },
      limit: (n: number) => { limitVal = n; return api; },
      single: () => {
        const rows = filterRows(db[name as 'abandoned_carts'], filters);
        const ordered = orderBy ? rows.sort((a, b) => (orderBy!.asc ? (a[orderBy!.key] > b[orderBy!.key] ? 1 : -1) : (a[orderBy!.key] < b[orderBy!.key] ? 1 : -1))) : rows;
        const limited = typeof limitVal === 'number' ? ordered.slice(0, limitVal) : ordered;
        return Promise.resolve({ data: limited[0] || null, error: null });
      },
      insert: (payload: any) => {
        const item = { id: String(Date.now()), created_at: new Date().toISOString(), ...payload };
        db[name as 'abandoned_carts'].push(item);
        return { select: () => ({ single: () => Promise.resolve({ data: item, error: null }) }) } as any;
      },
      update: (payload: any) => {
        return {
          eq: (key: string, value: any) => {
            const rows = db[name as 'abandoned_carts'];
            const idx = rows.findIndex((r) => r[key] === value);
            if (idx >= 0) rows[idx] = { ...rows[idx], ...payload };
            const updated = rows[idx] || null;
            return { select: () => ({ single: () => Promise.resolve({ data: updated, error: null }) }) } as any;
          }
        } as any;
      },
      // Listing usage in route under test
      then: undefined,
      from: undefined,
    };
    return api;
  }

  return {
    createClient: () => ({ from: table }),
  };
});

// Import after mocks
import { POST as HeartbeatPOST } from '@/app/api/abandoned-carts/route';

describe('abandoned-carts heartbeat API', () => {
  beforeEach(() => {
    db.abandoned_carts.length = 0;
  });

  it('rejects when stage is not checkout_step2', async () => {
    const req: any = { json: async () => ({ sessionId: 's1', stage: 'x', cartHasItems: true }) };
    const res: any = await HeartbeatPOST(req);
    expect(res.status).toBe(400);
  });

  it('creates record and sets 15m expire for valid payload', async () => {
    const start = Date.now();
    const req: any = { json: async () => ({ sessionId: 's2', stage: 'checkout_step2', cartHasItems: true, totalAmount: 100 }) };
    const res: any = await HeartbeatPOST(req);
    expect(res.status).toBe(200);
    const rec = db.abandoned_carts.find((r) => r.session_id === 's2');
    expect(rec).toBeTruthy();
    const expireTs = new Date(rec.expire_at).getTime();
    expect(expireTs - start).toBeGreaterThanOrEqual(14 * 60 * 1000); // ~15m window
  });
});


