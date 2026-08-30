import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { encodeSse } from '../gateway/shop-stream.ts';
import type { ShopStreamEvent } from '../gateway/types.ts';
import { createShopClient, ShopApiError } from './shop-api.ts';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('createShopClient', () => {
  it('creates a conversation with visitor header', async () => {
    const fetchMock = mock.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(input, init);
      assert.equal(request.method, 'POST');
      assert.equal(request.url, 'http://agents.test/shop/conversations');
      assert.equal(request.headers.get('x-shop-visitor'), 'abc123');
      const payload = (await request.json()) as { shopId?: string };
      assert.equal(payload.shopId, 'default');
      return jsonResponse(201, {
        conversation: { id: 'c1', shopId: 'default', createdAt: '2026-01-01T00:00:00.000Z' },
      });
    });
    mock.method(globalThis, 'fetch', fetchMock);

    const client = createShopClient({
      apiBase: 'http://agents.test/',
      shopId: 'default',
      visitorId: 'abc123',
    });
    const conversation = await client.createConversation();
    assert.equal(conversation.id, 'c1');
    assert.equal(fetchMock.mock.callCount(), 1);
  });

  it('maps JSON error bodies to ShopApiError', async () => {
    mock.method(globalThis, 'fetch', async () =>
      jsonResponse(404, { error: { code: 'not_found', message: 'Conversation not found' } }),
    );

    const client = createShopClient({ apiBase: 'http://agents.test', visitorId: 'abc123' });
    await assert.rejects(
      () => client.getConversation('missing'),
      (error: unknown) => {
        assert.equal(error instanceof ShopApiError, true);
        if (error instanceof ShopApiError) {
          assert.equal(error.status, 404);
          assert.equal(error.code, 'not_found');
        }
        return true;
      },
    );
  });

  it('reads SSE frames from sendMessage', async () => {
    const stream =
      encodeSse({ type: 'start', runId: 'run-1' }) +
      encodeSse({ type: 'text-delta', text: 'Hi' }) +
      encodeSse({
        type: 'done',
        message: {
          id: 'm1',
          role: 'assistant',
          content: 'Hi',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      });

    mock.method(globalThis, 'fetch', async () => {
      return new Response(stream, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
      });
    });

    const client = createShopClient({ apiBase: 'http://agents.test', visitorId: 'v1' });
    const events: ShopStreamEvent[] = [];
    await client.sendMessage('c1', 'hello', (event) => {
      events.push(event);
    });
    assert.equal(events[0]?.type, 'start');
    assert.equal(events[1]?.type, 'text-delta');
    assert.equal(events[2]?.type, 'done');
  });
});
