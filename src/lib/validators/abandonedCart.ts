import { z } from 'zod';

export const abandonedCartStatusSchema = z.enum(['pending', 'processing', 'exported', 'converted', 'discarded']);

export const abandonedCartContactSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(5).max(32).optional(),
  firstName: z.string().max(64).optional(),
  lastName: z.string().max(64).optional(),
}).strict().partial();

export const abandonedCartCarSchema = z.object({
  make: z.string().max(64).optional(),
  model: z.string().max(64).optional(),
  year: z.union([z.string(), z.number()]).optional(),
  bodyType: z.string().max(64).optional(),
}).strict().partial();

export const abandonedCartConfigurationSchema = z.object({
  variant: z.union([z.number(), z.string()]).optional(),
  setType: z.union([z.number(), z.string()]).optional(),
  cellShape: z.union([z.number(), z.string()]).optional(),
  materialColor: z.union([z.number(), z.string()]).optional(),
  trimColor: z.union([z.number(), z.string()]).optional(),
}).strict().partial();

export const abandonedCartItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().optional(),
  productType: z.string().optional(),
  quantity: z.number().int().min(1).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().max(8).optional(),
  configuration: z.any().optional(), // JSONB for mat configuration
}).strict();

export const abandonedCartAddressSchema = z.object({
  street: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
}).strict().partial();

export const abandonedCartUpsertInputSchema = z.object({
  sessionId: z.string().min(8),
  stage: z.enum(['checkout_step2', 'checkout_step3']),
  cartHasItems: z.boolean(),
  utm: z.record(z.unknown()).optional(),
  contact: abandonedCartContactSchema.optional(),
  address: abandonedCartAddressSchema.optional(),
  car: abandonedCartCarSchema.optional(),
  configuration: abandonedCartConfigurationSchema.optional(),
  items: z.array(abandonedCartItemSchema).optional(),
  currency: z.string().max(8).optional(),
  totalAmount: z.number().min(0).optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
}).strict();

export const abandonedCartRecordSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string(),
  status: abandonedCartStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
  last_activity_at: z.string(),
  expire_at: z.string(),
  utm: z.record(z.unknown()),
  contact: abandonedCartContactSchema.default({}).catch({}),
  address: abandonedCartAddressSchema.default({}).catch({}).optional(),
  car: abandonedCartCarSchema.default({}).catch({}),
  configuration: abandonedCartConfigurationSchema.default({}).catch({}),
  items: z.array(abandonedCartItemSchema).default([]).catch([]),
  currency: z.string(),
  total_amount: z.number(),
  ip: z.string().nullish(),
  user_agent: z.string().nullish(),
  metadata: z.record(z.unknown()).default({}).catch({}),
  bitrix_deal_id: z.string().nullish(),
  bitrix_category_id: z.number().int().nullish(),
  bitrix_stage_id: z.string().nullish(),
}).strict();

export type AbandonedCartUpsertInput = z.infer<typeof abandonedCartUpsertInputSchema>;


