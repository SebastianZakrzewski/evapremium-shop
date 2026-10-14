import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

// Client for client-side operations (uses anon key)
export const supabase = createClient(env.supabase.url, env.supabase.anonKey);

// Service role client for server-side operations (admin privileges)
export const supabaseAdmin = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export const SHOP_SCHEMA = 'evapremium_shop';

/** PostgREST client scoped to evapremium_shop (orders, order_items, catalog, payments). */
export const shopDb = () => supabaseAdmin.schema(SHOP_SCHEMA);

// Database table names
export const TABLES = {
  MATS: 'CarMat',
  CAR_BRANDS: 'car_brands',
  CAR_MODELS: 'car_models',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
} as const;
