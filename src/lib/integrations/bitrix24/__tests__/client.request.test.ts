import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../config', () => ({
  getBitrix24Config: () => ({
    enabled: true,
    webhookUrl: 'https://example.bitrix24.pl/rest/1/secret/',
    autoSyncOrders: true,
    autoSyncLeads: true,
    abandoned: {},
    rateLimit: { maxRequests: 1000, timeWindow: 1 },
    retry: { maxAttempts: 1, baseDelay: 1 },
  }),
  getBitrix24ApiUrl: (method: string) => `https://example.bitrix24.pl/rest/1/secret/${method}`,
}))

import { Bitrix24Client } from '../client'

describe('Bitrix24Client request shape', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends crm.deal.list as POST JSON body instead of GET query filter', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ result: [{ ID: '50716' }] }),
    }))
    vi.stubGlobal('fetch', fetchMock)

    const client = new Bitrix24Client()
    const response = await client.get('crm.deal.list', {
      filter: { ORIGIN_ID: 'ORD-2026-000259', CATEGORY_ID: 0 },
      select: ['ID', 'STAGE_ID'],
      start: 0,
    })

    expect(response.result?.[0]?.ID).toBe('50716')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://example.bitrix24.pl/rest/1/secret/crm.deal.list')
    expect(url).not.toContain('filter=')
    expect(options.method).toBe('POST')
    expect(JSON.parse(String(options.body))).toEqual({
      filter: { ORIGIN_ID: 'ORD-2026-000259', CATEGORY_ID: 0 },
      select: ['ID', 'STAGE_ID'],
      start: 0,
    })
  })

  it('testConnection uses crm.deal.list rather than user.current', async () => {
    const fetchMock = vi.fn(async (url: string) => ({
      ok: true,
      json: async () => ({ result: [{ ID: '1' }] }),
    }))
    vi.stubGlobal('fetch', fetchMock)

    const client = new Bitrix24Client()
    const result = await client.testConnection()

    expect(result.success).toBe(true)
    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toContain('crm.deal.list')
    expect(url).not.toContain('user.current')
  })
})
