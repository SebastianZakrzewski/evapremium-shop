import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

import * as route from '../route';

const getAvailableMats = vi.fn();

vi.mock('@/lib/services/MatService', () => {
  return {
    MatService: vi.fn(() => ({
      getAvailableMats,
    })),
  };
});

function makeRequest(query: string): NextRequest {
  return {
    url: `http://localhost/api/mats${query}`,
  } as unknown as NextRequest;
}

describe('GET /api/mats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAvailableMats.mockResolvedValue([]);
  });

  it('returns mats with parsed filters', async () => {
    const res = (await route.GET(makeRequest('?brandSlug=audi&isActive=true'))) as any;
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(getAvailableMats).toHaveBeenCalledWith({
      carBrandSlug: 'audi',
      isActive: true,
    });
  });

  it('returns 400 for invalid numeric parameters', async () => {
    const res = (await route.GET(makeRequest('?yearFrom=abc'))) as any;
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('returns empty array safely when service returns nothing', async () => {
    getAvailableMats.mockResolvedValueOnce([]);
    const res = (await route.GET(makeRequest('?brandSlug=unknown'))) as any;
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });
});








