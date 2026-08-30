import { z } from 'zod';

export const SHOP_AGENT_ID = 'agent';
export const DEFAULT_SHOP_ID = 'default';
export const SHOP_VISITOR_HEADER = 'x-shop-visitor';

export const shopPageContextSchema = z.object({
  url: z.string().max(2000).optional(),
  locale: z.string().max(16).optional(),
  pageType: z.enum(['home', 'product', 'cart', 'checkout', 'other']).optional(),
  productId: z.string().max(128).optional(),
  cartId: z.string().max(128).optional(),
});

export const shopIdSchema = z
  .string()
  .regex(/^[a-zA-Z0-9_-]{1,64}$/)
  .optional();

export const createConversationBodySchema = z.object({
  shopId: shopIdSchema,
  context: shopPageContextSchema.optional(),
});

export const sendMessageBodySchema = z.object({
  content: z.string().min(1).max(8000),
  shopId: shopIdSchema,
  context: shopPageContextSchema.optional(),
});

export type ShopPageContext = z.infer<typeof shopPageContextSchema>;

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  shopId: string;
  createdAt: string;
};

export type ErrorBody = {
  error: {
    code:
      | 'unauthorized'
      | 'forbidden'
      | 'not_found'
      | 'validation'
      | 'rate_limited'
      | 'agent_failed';
    message: string;
  };
};

export type ShopStreamEvent =
  | { type: 'start'; runId: string }
  | { type: 'text-delta'; text: string }
  | { type: 'done'; message: ChatMessage }
  | { type: 'error'; code: string; message: string };
