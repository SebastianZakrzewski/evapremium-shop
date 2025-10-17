import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

// Client for client-side operations (uses anon key)
export const supabase = createClient(env.supabase.url, env.supabase.anonKey);

// Service role client for server-side operations (admin privileges)
export const supabaseAdmin = createClient(env.supabase.url, env.supabase.serviceRoleKey);

// Database table names
export const TABLES = {
  MATS: 'CarMat',
  CAR_BRANDS: 'car_brands',
  CAR_MODELS: 'car_models',
  ORDERS: 'orders'
} as const;
