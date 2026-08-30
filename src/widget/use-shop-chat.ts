'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMessage, ShopPageContext } from '../gateway/types'
import { createShopClient, ShopApiError, type ShopClient } from './shop-api'
import { CONVERSATION_STORAGE_KEY, ensureVisitorId } from './visitor'

export type UseShopChatOptions = {
  apiBase: string;
  shopId?: string;
  visitorId?: string;
  getPageContext?: () => ShopPageContext | undefined;
};

export type ShopChatStatus = 'idle' | 'loading' | 'ready' | 'streaming' | 'error';

export function useShopChat(options: UseShopChatOptions) {
  const visitorId = useMemo(() => ensureVisitorId(options.visitorId), [options.visitorId]);
  const getPageContextRef = useRef(options.getPageContext);
  getPageContextRef.current = options.getPageContext;

  const client: ShopClient = useMemo(
    () =>
      createShopClient({
        apiBase: options.apiBase,
        shopId: options.shopId,
        visitorId,
        getPageContext: () => getPageContextRef.current?.(),
      }),
    [options.apiBase, options.shopId, visitorId],
  );

  const [status, setStatus] = useState<ShopChatStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const persistConversation = (id: string) => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(CONVERSATION_STORAGE_KEY, id);
    }
  };

  const startConversation = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const stored =
        typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(CONVERSATION_STORAGE_KEY) : null;
      if (stored) {
        try {
          const loaded = await client.getConversation(stored);
          setConversationId(loaded.conversation.id);
          setMessages(loaded.messages);
          setStatus('ready');
          return;
        } catch (cause) {
          if (!(cause instanceof ShopApiError) || cause.status !== 404) {
            throw cause;
          }
        }
      }

      const conversation = await client.createConversation();
      persistConversation(conversation.id);
      setConversationId(conversation.id);
      setMessages([]);
      setStatus('ready');
    } catch (cause) {
      setStatus('error');
      setError(cause instanceof Error ? cause.message : 'Could not start chat');
    }
  }, [client]);

  useEffect(() => {
    void startConversation();
    return () => {
      abortRef.current?.abort();
    };
  }, [startConversation]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || !conversationId || status === 'streaming' || status === 'loading') {
        return;
      }

      const userMessage: ChatMessage = {
        id: `local-${Date.now()}`,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((current) => [...current, userMessage]);
      setDraft('');
      setStatus('streaming');
      setError(null);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await client.sendMessage(
          conversationId,
          content,
          (event) => {
            if (event.type === 'text-delta') {
              setDraft((current) => current + event.text);
            }
            if (event.type === 'done') {
              setDraft('');
              setMessages((current) => [...current, event.message]);
            }
            if (event.type === 'error') {
              setError(event.message);
            }
          },
          controller.signal,
        );
        setStatus('ready');
      } catch (cause) {
        if (cause instanceof Error && cause.name === 'AbortError') {
          setStatus('ready');
          return;
        }
        setStatus('error');
        setError(cause instanceof Error ? cause.message : 'Could not send message');
      }
    },
    [client, conversationId, status],
  );

  return {
    status,
    error,
    messages,
    draft,
    send,
    retry: startConversation,
  };
}
