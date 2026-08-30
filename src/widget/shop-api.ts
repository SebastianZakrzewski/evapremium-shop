import { SHOP_VISITOR_HEADER, type Conversation, type ChatMessage, type ShopPageContext, type ShopStreamEvent } from '../gateway/types'
import { parseSseBuffer } from './parse-sse'

export type ShopClientConfig = {
  apiBase: string;
  shopId?: string;
  visitorId: string;
  getPageContext?: () => ShopPageContext | undefined;
};

export class ShopApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ShopApiError';
    this.status = status;
    this.code = code;
  }
}

function apiOrigin(apiBase: string): string {
  return apiBase.replace(/\/+$/, '');
}

function jsonHeaders(visitorId: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    [SHOP_VISITOR_HEADER]: visitorId,
  };
}

async function readError(response: Response): Promise<ShopApiError> {
  let code = 'agent_failed';
  let message = `Shop request failed (${response.status})`;
  try {
    const body: unknown = await response.json();
    if (
      typeof body === 'object' &&
      body !== null &&
      'error' in body &&
      typeof (body as { error: unknown }).error === 'object' &&
      (body as { error: { code?: unknown; message?: unknown } }).error !== null
    ) {
      const error = (body as { error: { code?: unknown; message?: unknown } }).error;
      if (typeof error.code === 'string') {
        code = error.code;
      }
      if (typeof error.message === 'string') {
        message = error.message;
      }
    }
  } catch {
    // Non-JSON error body — keep defaults.
  }
  return new ShopApiError(response.status, code, message);
}

function conversationPayload(config: ShopClientConfig): Record<string, unknown> {
  const context = config.getPageContext?.();
  return {
    ...(config.shopId ? { shopId: config.shopId } : {}),
    ...(context ? { context } : {}),
  };
}

export type ShopClient = {
  createConversation: () => Promise<Conversation>;
  getConversation: (conversationId: string) => Promise<{ conversation: Conversation; messages: ChatMessage[] }>;
  sendMessage: (
    conversationId: string,
    content: string,
    onEvent: (event: ShopStreamEvent) => void,
    signal?: AbortSignal,
  ) => Promise<void>;
};

export function createShopClient(config: ShopClientConfig): ShopClient {
  const base = apiOrigin(config.apiBase);

  return {
    async createConversation() {
      const response = await fetch(`${base}/shop/conversations`, {
        method: 'POST',
        headers: jsonHeaders(config.visitorId),
        body: JSON.stringify(conversationPayload(config)),
      });
      if (!response.ok) {
        throw await readError(response);
      }
      const body = (await response.json()) as { conversation: Conversation };
      return body.conversation;
    },

    async getConversation(conversationId: string) {
      const params = new URLSearchParams();
      if (config.shopId) {
        params.set('shopId', config.shopId);
      }
      const query = params.size > 0 ? `?${params.toString()}` : '';
      const response = await fetch(`${base}/shop/conversations/${encodeURIComponent(conversationId)}${query}`, {
        method: 'GET',
        headers: jsonHeaders(config.visitorId),
      });
      if (!response.ok) {
        throw await readError(response);
      }
      return (await response.json()) as { conversation: Conversation; messages: ChatMessage[] };
    },

    async sendMessage(conversationId, content, onEvent, signal) {
      const response = await fetch(
        `${base}/shop/conversations/${encodeURIComponent(conversationId)}/messages`,
        {
          method: 'POST',
          headers: jsonHeaders(config.visitorId),
          body: JSON.stringify({
            content,
            ...conversationPayload(config),
          }),
          signal,
        },
      );
      if (!response.ok) {
        throw await readError(response);
      }
      if (!response.body) {
        throw new ShopApiError(500, 'agent_failed', 'Shop stream had no body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const parsed = parseSseBuffer(buffer);
        buffer = parsed.rest;
        for (const event of parsed.events) {
          onEvent(event);
        }
      }
    },
  };
}
